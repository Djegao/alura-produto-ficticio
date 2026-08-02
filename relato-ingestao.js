// v3 "Musa Balance": Agente de Ingestao/Transcricao. Recebe texto livre de
// qualquer canal (web ou Telegram, ja atribuido a um ator conhecido pelo
// chamador — este agente nao adivinha quem falou) e classifica em relato de
// refeicao ja comida vs. desejo pra decisao futura. Passagem unica,
// tool_choice forcado — mesma tecnica de nota-fiscal.js, nao reinventada.
//
// Interpretar "ontem"/"hoje" em cima da data de referencia e trabalho de
// linguagem (a LLM pode fazer isso). Calorias/custo, quando o texto nao
// informar um numero explicito, ficam null aqui — a regra de ouro do
// v3-musa-balance.md e a LLM nunca estimar matematica/financeiro por conta
// propria; se o casal nao disse, o campo fica vazio, nao adivinhado.

const Anthropic = require('@anthropic-ai/sdk');
const { startObservation } = require('@langfuse/tracing');

const anthropic = new Anthropic();

const REGISTRAR_INTENCAO_TOOL = {
  name: 'registrar_intencao',
  description:
    'Classifica a mensagem e registra a intencao estruturada por tras dela.',
  input_schema: {
    type: 'object',
    properties: {
      tipo: {
        type: 'string',
        enum: ['relato_refeicao', 'desejo', 'aquisicao'],
        description:
          '"relato_refeicao" = a pessoa esta contando o que ja comeu/vai comer num dia especifico. "desejo" = a pessoa esta pedindo/sugerindo algo pra decisao futura (ex: "poderiamos comer lasanha no fim de semana?"). "aquisicao" = a pessoa esta reportando uma compra/aquisicao de item(ns) pro estoque (ex: "comprei 2kg de arroz").',
      },
      data: {
        type: 'string',
        description:
          'Somente se tipo=relato_refeicao ou aquisicao. Data no formato YYYY-MM-DD, resolvida a partir de referencias relativas ("ontem", "hoje") usando a data de referencia fornecida.',
      },
      descricao: { type: 'string', description: 'O que foi dito, limpo e direto.' },
      calorias: {
        type: 'number',
        description: 'Somente se o texto informar um numero explicito de calorias. Nao estime.',
      },
      custo: {
        type: 'number',
        description: 'Somente se o texto informar um valor explicito em reais. Nao estime.',
      },
      item_nome: {
        type: 'string',
        description: 'Somente se tipo=aquisicao. Nome limpo e curto do item comprado (ex: "arroz branco").',
      },
      item_quantidade: {
        type: 'number',
        description: 'Somente se tipo=aquisicao. Quantidade normalizada (ex: "2 pacotes de 5kg" vira 10, nao 2).',
      },
      item_unidade: {
        type: 'string',
        description: 'Somente se tipo=aquisicao. Unidade da quantidade normalizada: kg, g, ml, L, unidade, pacote, duzia, etc.',
      },
      item_state: {
        type: 'string',
        enum: ['base', 'ingrediente', 'preparado'],
        description:
          'Somente se tipo=aquisicao. \'base\' = materia-prima crua; \'ingrediente\' = ja transformado mas nao e prato pronto; \'preparado\' = prato ja pronto pra comer.',
      },
      item_storage: {
        type: 'string',
        enum: ['seco', 'perecivel'],
        description:
          'Somente se tipo=aquisicao. \'seco\' = despensa, temperatura ambiente; \'perecivel\' = precisa de geladeira/estraga rapido.',
      },
      budget_categoria: {
        type: 'string',
        enum: ['tr_diego', 'tr_esposa', 'credito_familia'],
        description:
          'Somente se tipo=aquisicao E o texto disser explicitamente de qual orcamento saiu (ex: "paguei com o TR", "foi no credito da familia"). Se a pessoa nao disse, deixe de fora — nunca adivinhe.',
      },
    },
    required: ['tipo', 'descricao'],
  },
};

const SYSTEM_PROMPT = `Voce classifica mensagens de um casal sobre comida, dentro do produto Chef
Caseiro / Musa Balance. Nao calcule nem estime calorias, custo ou de qual
orcamento saiu um gasto — so preencha esses campos se o texto trouxer a
informacao explicita. Resolva datas relativas ("ontem", "hoje") usando a
data de referencia fornecida na mensagem do usuario. Chame registrar_intencao
exatamente uma vez com a classificacao final.

Quando tipo=aquisicao, preencha tambem item_nome/item_quantidade/item_unidade/
item_state/item_storage (mesmas regras de categorizacao de estoque: state
descreve o quao transformado o alimento esta, storage descreve onde ele mora
fisicamente). So preencha budget_categoria se a pessoa disser explicitamente
de qual das 3 carteiras (TR Diego, TR Esposa, Credito Familia) saiu o gasto —
caso contrario deixe de fora, o sistema vai perguntar depois.`;

async function ingerirRelato({ texto, dataReferencia, model, canal }) {
  const agent = startObservation(
    'ingerir-relato',
    { input: { texto, canal, model } },
    { asType: 'agent' }
  );
  const traceId = agent.traceId;

  try {
    const generation = agent.startObservation(
      'classificar-intencao',
      { input: texto, model },
      { asType: 'generation' }
    );

    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [REGISTRAR_INTENCAO_TOOL],
      tool_choice: { type: 'tool', name: 'registrar_intencao' },
      messages: [
        {
          role: 'user',
          content: `Data de referencia (hoje): ${dataReferencia}\n\nMensagem:\n${texto}`,
        },
      ],
    });

    generation.update({
      output: response.content,
      usageDetails: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    });
    generation.end();

    const block = response.content.find((b) => b.type === 'tool_use' && b.name === 'registrar_intencao');
    const intencao = block ? block.input : { tipo: 'desejo', descricao: texto };

    agent.update({ output: intencao });
    return { intencao, traceId };
  } catch (err) {
    agent.update({ level: 'ERROR', statusMessage: err.message });
    throw err;
  } finally {
    agent.end();
  }
}

module.exports = { ingerirRelato };
