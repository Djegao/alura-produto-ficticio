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
        enum: ['relato_refeicao', 'desejo', 'aquisicao', 'desperdicio', 'branqueamento', 'porcionamento'],
        description:
          '"relato_refeicao" = a pessoa esta contando o que ja comeu/vai comer num dia especifico. "desejo" = a pessoa esta pedindo/sugerindo algo pra decisao futura (ex: "poderiamos comer lasanha no fim de semana?"). "aquisicao" = a pessoa esta reportando uma compra/aquisicao de item(ns) pro estoque (ex: "comprei 2kg de arroz"). "desperdicio" = a pessoa esta reportando que jogou fora um prato/item que nao foi consumido a tempo (ex: "joguei fora o resto da lasanha"). "branqueamento" = a pessoa branqueou/escaldou um vegetal pra conservar (ex: "branqueei o brocolis"). "porcionamento" = a pessoa terminou de cozinhar um prato e o dividiu em porcoes (ex: "porcionei a lasanha em 8", "a feijoada rendeu 6 marmitas").',
      },
      data: {
        type: 'string',
        description:
          'Somente se tipo=relato_refeicao, aquisicao ou desperdicio. Data no formato YYYY-MM-DD, resolvida a partir de referencias relativas ("ontem", "hoje") usando a data de referencia fornecida.',
      },
      fonte_refeicao: {
        type: 'string',
        enum: ['caseira', 'delivery', 'restaurante'],
        description:
          'Somente se tipo=relato_refeicao. De onde veio a comida — caseira (feita em casa), delivery (pedido entregue) ou restaurante (comeu fora). So classifique se der pra inferir do texto; nao force se for ambiguo.',
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
        description: 'Se tipo=aquisicao, desperdicio, branqueamento ou porcionamento: nome limpo e curto do item (ex: "arroz branco", "lasanha", "brocolis"). Se tipo=relato_refeicao com fonte_refeicao=caseira E o texto mencionar um prato especifico ja pronto (ex: "comi a lasanha do freezer"): o nome do prato — e isso que baixa a porcao no estoque.',
      },
      item_quantidade: {
        type: 'number',
        description: 'Se tipo=aquisicao ou desperdicio: quantidade normalizada (ex: "2 pacotes de 5kg" vira 10, nao 2; "1/10 da lasanha" vira a fracao/porcao mencionada). Se tipo=porcionamento: o numero de porcoes que a pessoa DISSE que o prato rendeu — nunca estime; se nao disse, deixe de fora (o sistema pergunta). Se tipo=relato_refeicao caseira: quantas porcoes foram comidas, SOMENTE se o texto disser (ex: "comi 2 porcoes"); se nao disser, deixe de fora.',
      },
      item_unidade: {
        type: 'string',
        description: 'Se tipo=aquisicao ou desperdicio. Unidade da quantidade normalizada: kg, g, ml, L, unidade, pacote, porcao, duzia, etc.',
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
caso contrario deixe de fora, o sistema vai perguntar depois.

Quando tipo=relato_refeicao de comida caseira que mencione um prato
especifico (ex: "almocei a lasanha de ontem"), preencha item_nome com o
prato — o sistema usa isso pra baixar a porcao correspondente no estoque.
Nao preencha item_nome se a refeicao foi delivery/restaurante ou se o texto
nao nomear um prato.

Quando tipo=desperdicio, preencha item_nome/item_quantidade/item_unidade com
o que foi jogado fora. Nao calcule ha quantos dias o prato foi preparado —
isso e' resolvido em codigo, cruzando com o registro do item, nao por voce.

Quando tipo=branqueamento, preencha item_nome com o vegetal branqueado.

Quando tipo=porcionamento, preencha item_nome com o prato e item_quantidade
com o numero de porcoes SOMENTE se a pessoa disse o numero — o rendimento
real so quem cozinhou sabe, nunca estime. Sem numero dito, deixe
item_quantidade de fora que o sistema pergunta.`;

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
