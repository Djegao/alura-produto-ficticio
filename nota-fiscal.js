// Ingestao de nota fiscal (texto/markdown por enquanto — visao de imagem fica
// pra depois). Usa tool_choice forcado, mesma tecnica do agent.js, pra
// garantir saida estruturada em vez de confiar em o Claude "lembrar" de
// formatar certo.

const Anthropic = require('@anthropic-ai/sdk');
const { startObservation } = require('@langfuse/tracing');
const { supabase, getHouseholdId, marcarCompradoNaLista } = require('./tools');

const anthropic = new Anthropic();

const EXTRACT_TOOL = {
  name: 'extrair_itens_nota',
  description:
    'Registra a lista final de itens de alimentacao/cozinha extraidos da nota fiscal, ja normalizados e categorizados.',
  input_schema: {
    type: 'object',
    properties: {
      itens: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'nome limpo e curto do item, ex: "arroz branco"' },
            quantity: {
              type: 'number',
              description: 'quantidade total normalizada (ex: 2 pacotes de 5kg vira 10, nao 2)',
            },
            unit: { type: 'string', description: 'unidade da quantidade normalizada: kg, g, ml, L, unidade, pacote, duzia, etc' },
            state: { type: 'string', enum: ['base', 'ingrediente', 'preparado'] },
            storage: { type: 'string', enum: ['seco', 'perecivel'] },
          },
          required: ['name', 'quantity', 'unit', 'state', 'storage'],
        },
      },
    },
    required: ['itens'],
  },
};

const SYSTEM_PROMPT = `Voce extrai itens de alimentacao/cozinha de notas fiscais de supermercado em texto.

Regras:
- Ignore produtos que nao sao comida ou bebida para cozinhar (limpeza, higiene,
  embalagens, produtos de casa em geral).
- Normalize a quantidade: se o item vem em pacotes/unidades multiplicados
  (ex: "Arroz 5kg" com Qtd=2), calcule o total (10kg), nao o numero de pacotes.
- state: 'base' = materia-prima crua (arroz, carne crua, frutas, legumes);
  'ingrediente' = ja transformado mas nao e prato pronto (molho pronto, cafe
  moido, pao); 'preparado' = prato ja pronto pra comer.
- storage: 'seco' = fica na despensa em temperatura ambiente (graos, macarrao,
  oleo, cafe, conservas fechadas); 'perecivel' = precisa de geladeira/estraga
  rapido (carnes, laticinios, frutas, verduras, pao fresco).
- Use nomes limpos e curtos (ex: "arroz branco", nao "Arroz branco tipo 1 5kg").

Chame extrair_itens_nota com a lista final.`;

async function ingerirNotaFiscal({ filename, content, model }) {
  const agent = startObservation(
    'ingerir-nota-fiscal',
    { input: { filename, model } },
    { asType: 'agent' }
  );
  const traceId = agent.traceId;

  try {
    const generation = agent.startObservation(
      'extrair-itens',
      { input: content, model },
      { asType: 'generation' }
    );

    const response = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: 'extrair_itens_nota' },
      messages: [{ role: 'user', content: `Nota fiscal (${filename || 'sem nome'}):\n\n${content}` }],
    });

    generation.update({
      output: response.content,
      usageDetails: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    });
    generation.end();

    const block = response.content.find((b) => b.type === 'tool_use' && b.name === 'extrair_itens_nota');
    const itens = block && Array.isArray(block.input.itens) ? block.input.itens : [];

    agent.update({ output: { itemCount: itens.length } });
    return { itens, traceId };
  } catch (err) {
    agent.update({ level: 'ERROR', statusMessage: err.message });
    throw err;
  } finally {
    agent.end();
  }
}

// Persistencia dos itens extraidos (receipt + pantry_items + receipt_items),
// compartilhada pelos caminhos novos (SEFAZ via web e via Telegram). A rota
// antiga /api/notas-fiscais mantem a propria versao inline em server.js de
// proposito — codigo que ja e' conteudo de aula nao se refatora sem motivo.
// De quebra, cada item estocado marca como 'comprado' o item correspondente
// da lista de compras, se houver — a compra fecha o ciclo da falta.
async function estocarItensDaNota({ itens, traceId, model, origem }) {
  const householdId = await getHouseholdId();

  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .insert({
      household_id: householdId,
      image_path: origem,
      status: 'confirmado',
      model_used: model,
      trace_id: traceId,
    })
    .select()
    .single();
  if (receiptError) throw new Error(receiptError.message);

  const itemsAdded = [];
  for (const item of itens) {
    const { data, error } = await supabase
      .from('pantry_items')
      .insert({
        household_id: householdId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        state: item.state,
        storage: item.storage,
        source: 'nota_fiscal',
      })
      .select()
      .single();
    if (!error) itemsAdded.push(data);

    await supabase.from('receipt_items').insert({
      receipt_id: receipt.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      state_guess: item.state,
      confirmed: true,
    });

    await marcarCompradoNaLista(item.name).catch((err) =>
      // Falha aqui nao pode derrubar a ingestao da nota — loga e segue.
      console.warn('Nao consegui cruzar item da nota com a lista de compras:', err.message)
    );
  }

  return { receipt, itemsAdded };
}

module.exports = { ingerirNotaFiscal, estocarItensDaNota };
