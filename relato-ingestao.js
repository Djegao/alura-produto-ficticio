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
        enum: ['relato_refeicao', 'desejo'],
        description:
          '"relato_refeicao" = a pessoa esta contando o que ja comeu/vai comer num dia especifico. "desejo" = a pessoa esta pedindo/sugerindo algo pra decisao futura (ex: "poderiamos comer lasanha no fim de semana?").',
      },
      data: {
        type: 'string',
        description:
          'Somente se tipo=relato_refeicao. Data no formato YYYY-MM-DD, resolvida a partir de referencias relativas ("ontem", "hoje") usando a data de referencia fornecida.',
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
    },
    required: ['tipo', 'descricao'],
  },
};

const SYSTEM_PROMPT = `Voce classifica mensagens de um casal sobre comida, dentro do produto Chef
Caseiro. Nao calcule nem estime calorias ou custo — so preencha esses campos
se o texto trouxer um numero explicito. Resolva datas relativas ("ontem",
"hoje") usando a data de referencia fornecida na mensagem do usuario. Chame
registrar_intencao exatamente uma vez com a classificacao final.`;

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
