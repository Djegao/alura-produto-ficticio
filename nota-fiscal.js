// Ingestao de nota fiscal (texto/markdown por enquanto — visao de imagem fica
// pra depois). Usa tool_choice forcado, mesma tecnica do agent.js, pra
// garantir saida estruturada em vez de confiar em o Claude "lembrar" de
// formatar certo.

const Anthropic = require('@anthropic-ai/sdk');
const { startObservation } = require('@langfuse/tracing');

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

module.exports = { ingerirNotaFiscal };
