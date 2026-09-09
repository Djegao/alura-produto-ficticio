#!/usr/bin/env node
// =============================================================================
// Chef Caseiro — pipeline de evals (Aula 2 do curso "Evals, observabilidade e
// conformidade").
//
// O que faz, em uma frase: le interacoes REAIS ja logadas no Langfuse, pede pro
// Claude julga-las contra os criterios de `evals/criterios.md`, e grava o
// julgamento de volta como Score no mesmo trace.
//
//   traces (Langfuse)  ->  juiz (Claude, tool_choice forcado)  ->  Scores (Langfuse)
//
// Tres decisoes de desenho que vem direto do resto do projeto:
//
//   1. `tool_choice` FORCADO no juiz (SDD §11.3). Pedir "responda em JSON" no
//      prompt nao e garantia de nada — so o parametro de API e. Mesma licao ja
//      reaplicada em `agent.js` e `nota-fiscal.js`; aqui ela e' ainda mais
//      critica, porque um juiz sem saida estruturada nao agrega score nenhum.
//
//   2. Aritmetica em codigo, julgamento na LLM. O sinal de truncamento por
//      max_tokens (tokens de saida == teto configurado) e calculado AQUI, em
//      JS, e entregue pronto pro juiz. A LLM nunca compara numeros — regra de
//      ouro do produto (SDD §12 / v3-musa-balance.md).
//
//   3. Nada falha em silencio (SDD §11.6). Sem `|| []`, sem catch vazio: todo
//      erro e' desembrulhado com `detalharErro()` (mesma tecnica do PR
//      aula4/fix-diagnostico-telegram — `err.cause` desembrulhado, entao
//      "fetch failed" vira a causa real) e reportado na saida.
//
// ATENCAO AO LAG DO LANGFUSE (achado §11.2 do SDD): existem ~45 SEGUNDOS entre
// o Score ser aceito pela API e ele ficar consultavel/visivel na UI do Langfuse
// Cloud. Isso NAO e bug deste script nem da instrumentacao — e o tempo real de
// ingestao do Langfuse Cloud. Se voce rodar e for olhar a UI imediatamente, o
// Score ainda nao vai estar la. Espere ~1 minuto e recarregue. Na gravacao,
// avise a turma ANTES de abrir o Langfuse.
//
// Uso:
//   node evals/run-evals.js                       # roda o conjunto padrao e GRAVA os scores
//   node evals/run-evals.js --dry-run --limit 3   # julga e mostra, sem gravar nada
//   node evals/run-evals.js --limit 5             # 5 traces por operacao
//   node evals/run-evals.js --operacao ingerir-relato
//   node evals/run-evals.js --operacao sugerir-receita,mediar-cardapio --limit 4
//   node evals/run-evals.js --sem-cor             # desliga ANSI (log/CI)
//
// Env vars necessarias (mesmo .env do produto): LANGFUSE_PUBLIC_KEY,
// LANGFUSE_SECRET_KEY, LANGFUSE_BASE_URL, ANTHROPIC_API_KEY.
// =============================================================================

require('dotenv').config();

const Anthropic = require('@anthropic-ai/sdk');

// -----------------------------------------------------------------------------
// Configuracao
// -----------------------------------------------------------------------------

const MODELO_JUIZ = 'claude-sonnet-5';
const OPERACOES = ['sugerir-receita', 'mediar-cardapio', 'ingerir-relato'];

// Tetos de max_tokens configurados no produto (agent.js e relato-ingestao.js).
// Tokens de saida IGUAIS a um desses e a assinatura de truncamento (SDD §11.4).
const TETOS_MAX_TOKENS = [512, 1024, 2048];

// Quanto de cada campo grande vai pro juiz. O estoque completo passa de 12k
// caracteres num trace real; cortar aqui e' o que mantem o eval barato.
const LIMITE_TEXTO = 3500;

// -----------------------------------------------------------------------------
// Saida no terminal (isto aparece na gravacao — legibilidade e requisito)
// -----------------------------------------------------------------------------

const semCor = process.argv.includes('--sem-cor') || !!process.env.NO_COLOR;
const ESC = String.fromCharCode(27);
const c = (codigo) => (t) => (semCor ? String(t) : ESC + '[' + codigo + 'm' + t + ESC + '[0m');
const cinza = c('90');
const negrito = c('1');
const verde = c('32');
const amarelo = c('33');
const vermelho = c('31');
const ciano = c('36');

function corDoValor(v) {
  if (v >= 0.8) return verde;
  if (v >= 0.5) return amarelo;
  return vermelho;
}
function simbolo(v) {
  if (v >= 0.8) return 'OK ';
  if (v >= 0.5) return ' ~ ';
  return 'X  ';
}
function barra(v, largura = 10) {
  const cheias = Math.round(v * largura);
  return '#'.repeat(cheias) + '.'.repeat(largura - cheias);
}
function linha(char = '─', n = 78) {
  return char.repeat(n);
}
function encurtar(txt, max) {
  if (txt == null) return '';
  const s = typeof txt === 'string' ? txt : JSON.stringify(txt);
  return s.length <= max ? s : s.slice(0, max) + `\n[...cortado, ${s.length - max} caracteres a mais...]`;
}

// -----------------------------------------------------------------------------
// Erros: nada em silencio. Desembrulha err.cause ate o fundo.
// -----------------------------------------------------------------------------

function detalharErro(err) {
  const partes = [];
  let atual = err;
  let nivel = 0;
  while (atual && nivel < 6) {
    const nome = atual.name || 'Error';
    const msg = atual.message || String(atual);
    const extra = [];
    if (atual.code) extra.push(`code=${atual.code}`);
    if (atual.errno) extra.push(`errno=${atual.errno}`);
    if (atual.status) extra.push(`status=${atual.status}`);
    if (atual.hostname) extra.push(`host=${atual.hostname}`);
    partes.push(`${nivel > 0 ? 'causado por: ' : ''}${nome}: ${msg}${extra.length ? ` (${extra.join(', ')})` : ''}`);
    atual = atual.cause;
    nivel++;
  }
  return partes.join('\n    ');
}

// -----------------------------------------------------------------------------
// Cliente da API publica do Langfuse (fetch nativo, Basic Auth public:secret)
// -----------------------------------------------------------------------------

function configLangfuse() {
  const pub = process.env.LANGFUSE_PUBLIC_KEY;
  const sec = process.env.LANGFUSE_SECRET_KEY;
  const base = (process.env.LANGFUSE_BASE_URL || '').replace(/\/+$/, '');
  const faltando = [];
  if (!pub) faltando.push('LANGFUSE_PUBLIC_KEY');
  if (!sec) faltando.push('LANGFUSE_SECRET_KEY');
  if (!base) faltando.push('LANGFUSE_BASE_URL');
  if (faltando.length) {
    throw new Error(
      `Faltam variaveis de ambiente: ${faltando.join(', ')}. ` +
        'Recrie o .env a partir do .env.example (ver CLAUDE.md, secao "Segredos").'
    );
  }
  return { base, auth: 'Basic ' + Buffer.from(`${pub}:${sec}`).toString('base64') };
}

async function langfuse(metodo, caminho, corpo) {
  const { base, auth } = configLangfuse();
  const url = base + caminho;
  let resposta;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch (err) {
    // "fetch failed" sozinho nao diz nada — desembrulha a causa real.
    throw new Error(`${metodo} ${url} nao completou:\n    ${detalharErro(err)}`);
  }

  const texto = await resposta.text();
  if (!resposta.ok) {
    throw new Error(
      `${metodo} ${url} respondeu ${resposta.status} ${resposta.statusText}\n    corpo: ${texto.slice(0, 600)}`
    );
  }
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch (err) {
    throw new Error(`${metodo} ${url} respondeu 200 mas o corpo nao e JSON:\n    ${texto.slice(0, 300)}`);
  }
}

async function buscarTraces(operacao, limite) {
  const q = new URLSearchParams({ limit: String(limite), page: '1', name: operacao });
  const r = await langfuse('GET', `/api/public/traces?${q}`);
  return r?.data ?? [];
}

async function buscarTraceCompleto(id) {
  // Este endpoint ja devolve o array `observations` inteiro — nao precisa de
  // uma segunda chamada em /api/public/observations.
  return langfuse('GET', `/api/public/traces/${id}`);
}

async function gravarScore({ traceId, nome, valor, comentario, tipo }) {
  return langfuse('POST', '/api/public/scores', {
    traceId,
    name: nome,
    value: valor,
    comment: comentario,
    dataType: tipo, // 'NUMERIC' ou 'BOOLEAN'
  });
}

// -----------------------------------------------------------------------------
// Material de julgamento: o que o juiz ve de cada trace.
//
// Tudo que e' FATO (quais tools foram chamadas, quantos tokens sairam, se
// bateu no teto, se alguma observacao ficou em ERROR) e apurado aqui, em
// codigo. O juiz recebe isso pronto e so julga o que nao e' apuravel.
// -----------------------------------------------------------------------------

function montarMaterial(trace) {
  const observacoes = Array.isArray(trace.observations) ? trace.observations : [];

  const ferramentasChamadas = observacoes
    .filter((o) => o.type === 'TOOL')
    .map((o) => o.name);

  const geracoes = observacoes
    .filter((o) => o.type === 'GENERATION')
    .map((o) => {
      const saida = o.usage?.output ?? o.usageDetails?.output ?? 0;
      return {
        nome: o.name,
        modelo: o.model ?? null,
        tokens_entrada: o.usage?.input ?? o.usageDetails?.input ?? 0,
        tokens_saida: saida,
        bateu_no_teto_de_max_tokens: TETOS_MAX_TOKENS.includes(saida),
      };
    });

  const observacoesComErro = observacoes
    .filter((o) => o.level === 'ERROR')
    .map((o) => ({ nome: o.name, tipo: o.type, mensagem: o.statusMessage ?? null }));

  const saidaFinal = trace.output;
  const saidaVazia =
    saidaFinal == null ||
    saidaFinal === '' ||
    (typeof saidaFinal === 'object' && Object.keys(saidaFinal).length === 0);

  // Sinais deterministicos: calculados em JS, NUNCA pela LLM.
  const sinais = {
    truncamento_por_max_tokens: geracoes.some((g) => g.bateu_no_teto_de_max_tokens),
    houve_observacao_em_erro: observacoesComErro.length > 0,
    saida_final_vazia: saidaVazia,
    total_de_tool_calls: ferramentasChamadas.length,
    registrou_consumo: ferramentasChamadas.includes('registrar_itens_usados'),
    registrou_decisao_cardapio: ferramentasChamadas.includes('registrar_decisao_cardapio'),
    verificou_disponibilidade: ferramentasChamadas.includes('verificar_disponibilidade'),
    registrou_lista_compras: ferramentasChamadas.includes('registrar_lista_compras'),
  };

  const retornosDeFerramenta = observacoes
    .filter((o) => o.type === 'TOOL')
    .map((o) => ({
      ferramenta: o.name,
      entrada: encurtar(o.input, 800),
      retorno: encurtar(o.output, LIMITE_TEXTO),
      erro: o.level === 'ERROR' ? o.statusMessage : undefined,
    }));

  return {
    operacao: trace.name,
    trace_id: trace.id,
    quando: trace.timestamp,
    entrada_do_usuario: encurtar(trace.input, 2000),
    saida_final: encurtar(saidaFinal, LIMITE_TEXTO),
    ferramentas_chamadas: ferramentasChamadas,
    retornos_de_ferramenta: retornosDeFerramenta,
    chamadas_ao_modelo: geracoes,
    sinais_apurados_em_codigo: sinais,
  };
}

// -----------------------------------------------------------------------------
// Os criterios, como schema de tool. Um schema por operacao — os campos SAO os
// criterios de `evals/criterios.md`, com a descricao servindo de rubrica.
// -----------------------------------------------------------------------------

const CRITERIO_INTEGRIDADE = {
  nome: 'execucao_integra',
  tipo: 'BOOLEAN',
  descricao:
    'A operacao terminou inteira? 1 = terminou sem erro estrutural, sem saida vazia e sem truncamento. ' +
    '0 = ha erro no trace, saida vazia, ou sinais_apurados_em_codigo.truncamento_por_max_tokens = true ' +
    '(tokens de saida iguais ao teto configurado e a assinatura de truncamento, SDD §11.4). ' +
    'Use os sinais ja apurados em codigo — nao recalcule nada.',
};

const CRITERIOS = {
  'sugerir-receita': [
    CRITERIO_INTEGRIDADE,
    {
      nome: 'fidelidade_ao_estoque',
      tipo: 'NUMERIC',
      descricao:
        'De 0 a 1: a sugestao usa apenas itens que apareceram no retorno de consultar_estoque, nas quantidades ' +
        'que existem? 1.0 = todos os ingredientes principais vieram do estoque real; 0.5 = a maioria veio, mas ' +
        'ha um ou dois itens assumidos como "todo mundo tem" sem estarem la; 0.0 = a receita foi escrita de ' +
        'cabeca e o estoque foi decorativo (inclusive quando consultar_estoque nem foi chamado).',
    },
    {
      nome: 'respeito_as_restricoes',
      tipo: 'BOOLEAN',
      descricao:
        '1 se a sugestao respeita TODAS as restricoes/preferencias retornadas por consultar_preferencias; ' +
        '0 se viola alguma. Restricao alimentar pode ser alergia — nao existe meio-termo. Se as preferencias ' +
        'nao foram consultadas e a resposta afirma respeitar restricoes, isso e violacao (0).',
    },
    {
      nome: 'consumo_registrado',
      tipo: 'BOOLEAN',
      descricao:
        '1 se o consumo do estoque foi registrado quando devia (achado SDD §11.3). Use ' +
        'sinais_apurados_em_codigo.registrou_consumo. Se o estoque foi consultado e a receita proposta consome ' +
        'itens, mas registrou_consumo = false, o valor e 0 — o estado do estoque depende desse registro. ' +
        'Se a interacao nao propos receita que consome estoque, 1 (nao havia o que registrar) e diga isso na ' +
        'justificativa.',
    },
  ],
  'mediar-cardapio': [
    CRITERIO_INTEGRIDADE,
    {
      nome: 'trade_off_com_numeros',
      tipo: 'NUMERIC',
      descricao:
        'De 0 a 1: a mediacao expoe o custo real de cada opcao com numeros concretos (reais, dias de validade, ' +
        'porcoes)? 1.0 = cada opcao vem com o peso quantificado; 0.5 = ha numeros, mas soltos, sem ligar a ' +
        'escolha; 0.0 = so recomendacao vaga.',
    },
    {
      nome: 'numeros_de_tool',
      tipo: 'BOOLEAN',
      descricao:
        '1 se todos os numeros citados na resposta (saldo de orcamento, dias ate vencer, porcoes) aparecem nos ' +
        'retornos_de_ferramenta; 0 se algum numero foi calculado ou estimado pelo proprio modelo. Regra de ouro ' +
        'do produto: a LLM nunca calcula prazo, decaimento ou matematica financeira. Um numero inventado que ' +
        'parece certo contamina a mediacao inteira.',
    },
    {
      nome: 'mediou_sem_decidir',
      tipo: 'BOOLEAN',
      descricao:
        '1 se o agente apresentou o conflito e deixou a escolha explicita para o casal; 0 se proibiu, julgou, ' +
        'moralizou ou decidiu sozinho o que a casa vai comer. O produto e mediador, nao juiz.',
    },
    {
      nome: 'falta_virou_trade_off',
      tipo: 'BOOLEAN',
      descricao:
        '1 se, havendo ingrediente faltante, o agente ofereceu substituicao com itens reais do estoque e/ou ' +
        'mandou o item pra lista de compras (ver sinais registrou_lista_compras / verificou_disponibilidade); ' +
        '0 se a falta simplesmente cancelou a proposta. Se nao faltou nada, 1 e explique na justificativa.',
    },
  ],
  'ingerir-relato': [
    CRITERIO_INTEGRIDADE,
    {
      nome: 'tipo_correto',
      tipo: 'BOOLEAN',
      descricao:
        '1 se o campo "tipo" da saida (relato_refeicao | desejo | aquisicao | desperdicio | branqueamento | ' +
        'porcionamento) e o que a mensagem realmente quer dizer; 0 caso contrario. Cada tipo dispara um efeito ' +
        'diferente no estoque e no feed — classificar errado corrompe os dois de uma vez.',
    },
    {
      nome: 'sem_invencao_numerica',
      tipo: 'BOOLEAN',
      descricao:
        '1 se os campos numericos (calorias, custo, item_quantidade) so foram preenchidos quando a pessoa disse ' +
        'o numero explicitamente na mensagem; 0 se algum foi estimado. Campo nao dito deve ficar VAZIO — o ' +
        'sistema pergunta depois, nunca chuta. Somar numeros ditos ("4 porcoes + 1 extra" -> 5) e caso de ' +
        'fronteira: aceite, mas registre na justificativa.',
    },
    {
      nome: 'ancoragem_no_texto',
      tipo: 'NUMERIC',
      descricao:
        'De 0 a 1: os campos extraidos (principalmente item_nome e descricao) sao fieis ao que a mensagem diz? ' +
        '1.0 = tudo ancorado literalmente no texto; 0.5 = descricao enfeitada ou nome normalizado alem do ' +
        'necessario; 0.0 = campo inventado sem origem na mensagem. ATENCAO: manter a grafia da pessoa ' +
        '(ex.: "lasagna") e ancoragem CORRETA, nota 1.0 — se o casamento com o estoque falha depois, o erro e ' +
        'do codigo deterministico, nao da classificacao (achado de 22/08).',
    },
  ],
};

function ferramentaDoJuiz(operacao) {
  const criterios = CRITERIOS[operacao];
  const properties = {};
  const required = [];
  for (const cr of criterios) {
    properties[cr.nome] = {
      type: 'object',
      description: cr.descricao,
      properties: {
        valor: {
          type: 'number',
          description:
            cr.tipo === 'BOOLEAN'
              ? 'Exatamente 0 ou 1.'
              : 'Numero entre 0 e 1 (pode ser fracionario, ex.: 0.5).',
        },
        justificativa: {
          type: 'string',
          description:
            'Uma ou duas frases, em portugues, citando a EVIDENCIA concreta do material (trecho da resposta, ' +
            'nome de ferramenta, numero) que sustenta a nota. Sem evidencia, a nota nao vale nada.',
        },
      },
      required: ['valor', 'justificativa'],
    };
    required.push(cr.nome);
  }
  return {
    name: 'registrar_avaliacao',
    description: `Registra a avaliacao da interacao "${operacao}" contra os criterios de evals/criterios.md.`,
    input_schema: { type: 'object', properties, required },
  };
}

const SYSTEM_JUIZ = `Voce e o avaliador de qualidade do Chef Caseiro — um produto que sugere o que
cozinhar com base no estoque real da casa e medeia o cardapio entre duas
pessoas com objetivos diferentes.

Voce recebe o material completo de UMA interacao ja acontecida em producao:
a entrada do usuario, a saida final, quais ferramentas foram chamadas, o que
cada ferramenta retornou, e um bloco de "sinais_apurados_em_codigo".

Regras do julgamento:

1. Julgue SO com base no material. Nao suponha nada que nao esteja ali.
2. O bloco "sinais_apurados_em_codigo" e FATO ja apurado deterministicamente
   (contagem de tokens, tools chamadas, erro no trace). Use-o como verdade e
   nao refaca conta nenhuma — aritmetica e trabalho de codigo, nao seu.
3. Toda nota precisa de evidencia citavel do material. Justificativa generica
   ("a resposta foi boa") e uma justificativa invalida.
4. Seja severo com falha silenciosa: um estado que ficou errado sem ninguem
   perceber e pior que um erro barulhento.
5. Chame registrar_avaliacao exatamente uma vez, com todos os criterios.`;

// -----------------------------------------------------------------------------
// O juiz
// -----------------------------------------------------------------------------

const anthropic = new Anthropic(); // le ANTHROPIC_API_KEY do ambiente

async function julgar(material) {
  const tool = ferramentaDoJuiz(material.operacao);

  let resposta;
  try {
    resposta = await chamarJuiz(tool, material);
  } catch (err) {
    if (err.status === 401) {
      // Diagnostico explicito em vez de repassar o 401 cru: em 28/08/2026 a
      // chave do projeto foi revogada e o sintoma era exatamente este.
      throw new Error(
        'A Anthropic recusou a chave (401 authentication_error). A ANTHROPIC_API_KEY do .env esta ' +
          'invalida ou revogada — gere uma nova em console.anthropic.com > API Keys e atualize o .env ' +
          '(e o Railway, se producao usar a mesma).\n    ' +
          detalharErro(err)
      );
    }
    throw err;
  }

  const bloco = resposta.content.find((b) => b.type === 'tool_use' && b.name === 'registrar_avaliacao');
  if (!bloco) {
    // Com tool_choice forcado isso nao deveria acontecer nunca. Se acontecer,
    // e' um sinal de verdade — nao engula.
    throw new Error(
      `O juiz nao chamou registrar_avaliacao mesmo com tool_choice forcado. ` +
        `stop_reason=${resposta.stop_reason}, blocos=${resposta.content.map((b) => b.type).join(',')}`
    );
  }

  return {
    avaliacao: bloco.input,
    tokens: { entrada: resposta.usage.input_tokens, saida: resposta.usage.output_tokens },
  };
}

async function chamarJuiz(tool, material) {
  return anthropic.messages.create({
    model: MODELO_JUIZ,
    max_tokens: 2048,
    system: SYSTEM_JUIZ,
    tools: [tool],
    // Garantia ESTRUTURAL, nao pedido no prompt (SDD §11.3). Sem isso, o juiz
    // as vezes responde em prosa e nao sobra score nenhum pra agregar.
    tool_choice: { type: 'tool', name: 'registrar_avaliacao' },
    messages: [
      {
        role: 'user',
        content:
          `Avalie esta interacao da operacao "${material.operacao}".\n\n` +
          '```json\n' +
          JSON.stringify(material, null, 2) +
          '\n```',
      },
    ],
  });
}

// -----------------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------------

function lerArgs(argv) {
  const args = { limite: 4, operacoes: OPERACOES, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--sem-cor') continue;
    else if (a === '--limit' || a === '--limite') args.limite = Number(argv[++i]);
    else if (a === '--operacao' || a === '--operacoes') {
      const pedidas = String(argv[++i]).split(',').map((s) => s.trim());
      const invalidas = pedidas.filter((p) => !OPERACOES.includes(p));
      if (invalidas.length) {
        throw new Error(
          `Operacao desconhecida: ${invalidas.join(', ')}. Validas: ${OPERACOES.join(', ')}.`
        );
      }
      args.operacoes = pedidas;
    } else if (a === '--help' || a === '-h') args.ajuda = true;
    else throw new Error(`Argumento desconhecido: ${a}. Use --help.`);
  }
  if (!Number.isFinite(args.limite) || args.limite < 1) {
    throw new Error('--limit precisa ser um numero inteiro >= 1.');
  }
  return args;
}

const AJUDA = `
Chef Caseiro — pipeline de evals (Claude-as-judge -> Langfuse Scores)

  node evals/run-evals.js [opcoes]

  --limit N            traces por operacao (padrao: 4)
  --operacao A[,B]     ${OPERACOES.join(' | ')}
  --dry-run            julga e mostra, mas NAO grava Score no Langfuse
  --sem-cor            saida sem ANSI
  --help

Lembrete: o Langfuse Cloud leva ~45s pra tornar o Score consultavel na UI
(achado SDD §11.2). Se o Score nao aparecer na hora, nao e bug — e o lag.
`;

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  const args = lerArgs(process.argv);
  if (args.ajuda) {
    console.log(AJUDA);
    return;
  }

  const { base } = configLangfuse();
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Falta ANTHROPIC_API_KEY no ambiente — o juiz nao roda sem ela.');
  }

  console.log('');
  console.log(negrito('  Chef Caseiro — pipeline de evals'));
  console.log(cinza(`  interacoes reais do Langfuse -> juiz (${MODELO_JUIZ}) -> Scores de volta no trace`));
  console.log('');
  console.log(
    cinza('  Langfuse: ') + base +
    cinza('   modo: ') + (args.dryRun ? amarelo('DRY-RUN (nao grava)') : verde('GRAVANDO SCORES'))
  );
  console.log(
    cinza('  Operacoes: ') + args.operacoes.join(', ') +
    cinza('   limite: ') + args.limite + cinza(' por operacao')
  );
  console.log('  ' + cinza(linha()));

  const resultados = [];
  const falhas = [];
  let scoresGravados = 0;

  for (const operacao of args.operacoes) {
    console.log('');
    console.log('  ' + negrito(ciano(operacao)));

    let traces;
    try {
      traces = await buscarTraces(operacao, args.limite);
    } catch (err) {
      falhas.push({ operacao, etapa: 'buscar traces', detalhe: detalharErro(err) });
      console.log('  ' + vermelho('! nao consegui buscar traces:') + '\n    ' + detalharErro(err));
      continue;
    }

    if (!traces.length) {
      console.log('  ' + amarelo(`sem traces com o nome "${operacao}" no projeto — nada a avaliar.`));
      continue;
    }

    for (let i = 0; i < traces.length; i++) {
      const resumo = traces[i];
      const rotulo = `[${i + 1}/${traces.length}] ${resumo.id.slice(0, 12)}...`;
      const quando = new Date(resumo.timestamp).toISOString().replace('T', ' ').slice(0, 16);

      try {
        const completo = await buscarTraceCompleto(resumo.id);
        const material = montarMaterial(completo);
        const { avaliacao, tokens } = await julgar(material);

        console.log('');
        console.log('  ' + negrito(rotulo) + cinza(`  ${quando} UTC`));
        console.log(
          cinza('        pedido: ') +
            encurtar(String(material.entrada_do_usuario).replace(/\s+/g, ' '), 92)
        );
        if (material.sinais_apurados_em_codigo.truncamento_por_max_tokens) {
          console.log('        ' + vermelho('! sinal em codigo: truncamento por max_tokens (tokens de saida == teto)'));
        }
        if (material.sinais_apurados_em_codigo.houve_observacao_em_erro) {
          console.log('        ' + vermelho('! sinal em codigo: ha observacao em nivel ERROR neste trace'));
        }

        const criterios = CRITERIOS[operacao];
        const linhaResultado = { operacao, traceId: resumo.id, scores: {} };

        for (const cr of criterios) {
          const item = avaliacao[cr.nome];
          if (!item || typeof item.valor !== 'number') {
            throw new Error(`O juiz nao devolveu o criterio "${cr.nome}" (ou devolveu sem valor numerico).`);
          }
          const valor = Math.max(0, Math.min(1, item.valor));
          const pinta = corDoValor(valor);
          linhaResultado.scores[cr.nome] = valor;

          console.log(
            '        ' +
              pinta(simbolo(valor)) +
              cr.nome.padEnd(24) +
              pinta(valor.toFixed(2)) +
              '  ' +
              cinza(barra(valor)) +
              '  ' +
              cinza(encurtar(item.justificativa.replace(/\s+/g, ' '), 300))
          );

          if (!args.dryRun) {
            await gravarScore({
              traceId: resumo.id,
              nome: cr.nome,
              valor,
              comentario: `[juiz ${MODELO_JUIZ}] ${item.justificativa}`,
              tipo: cr.tipo,
            });
            scoresGravados++;
          }
        }

        console.log(cinza(`        juiz: ${tokens.entrada} tokens entrada / ${tokens.saida} saida`));
        resultados.push(linhaResultado);
      } catch (err) {
        falhas.push({ operacao, traceId: resumo.id, etapa: 'julgar/gravar', detalhe: detalharErro(err) });
        console.log('');
        console.log('  ' + negrito(rotulo) + '  ' + vermelho('FALHOU'));
        console.log('    ' + detalharErro(err));
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Resumo agregado
  // ---------------------------------------------------------------------------

  console.log('');
  console.log('  ' + cinza(linha('=')));
  console.log('  ' + negrito('RESUMO'));
  console.log('  ' + cinza(linha('=')));

  if (!resultados.length) {
    console.log('  ' + vermelho('nenhum trace foi julgado com sucesso.'));
  } else {
    for (const operacao of args.operacoes) {
      const doGrupo = resultados.filter((r) => r.operacao === operacao);
      if (!doGrupo.length) continue;
      console.log('');
      console.log('  ' + negrito(ciano(operacao)) + cinza(`  (${doGrupo.length} interacoes julgadas)`));
      for (const cr of CRITERIOS[operacao]) {
        const valores = doGrupo.map((r) => r.scores[cr.nome]).filter((v) => typeof v === 'number');
        if (!valores.length) continue;
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const reprovados = valores.filter((v) => v < 0.5).length;
        console.log(
          '    ' +
            cr.nome.padEnd(24) +
            corDoValor(media)(media.toFixed(2)) +
            '  ' +
            corDoValor(media)(barra(media, 20)) +
            '  ' +
            cinza(`${cr.tipo === 'BOOLEAN' ? 'binario' : '0-1'}${reprovados ? ` · ${reprovados} reprovado(s)` : ''}`)
        );
      }
    }

    // Media geral do conjunto — util pra Aula 3 ("qualidade ao longo do tempo").
    const todos = resultados.flatMap((r) => Object.values(r.scores));
    const geral = todos.reduce((a, b) => a + b, 0) / todos.length;
    console.log('');
    console.log(
      '  ' + negrito('media geral do conjunto: ') + corDoValor(geral)(geral.toFixed(2)) +
      cinza(`  (${todos.length} scores em ${resultados.length} interacoes)`)
    );
  }

  console.log('');
  if (args.dryRun) {
    console.log('  ' + amarelo('DRY-RUN: nenhum Score foi gravado no Langfuse.'));
  } else {
    console.log('  ' + verde(`${scoresGravados} Scores enviados ao Langfuse.`));
    console.log(
      '  ' + amarelo('Lembrete (SDD §11.2): o Langfuse Cloud leva ~45s pra tornar o Score')
    );
    console.log('  ' + amarelo('consultavel. Se voce abrir a UI agora, ele ainda nao esta la — nao e bug.'));
  }

  if (falhas.length) {
    console.log('');
    console.log('  ' + vermelho(negrito(`${falhas.length} falha(s) — nada foi engolido em silencio:`)));
    for (const f of falhas) {
      console.log(
        '   - ' + vermelho(`${f.operacao}${f.traceId ? ` / ${f.traceId.slice(0, 12)}...` : ''} (${f.etapa})`)
      );
      console.log('     ' + f.detalhe);
    }
    console.log('');
    process.exitCode = 1;
  }
  console.log('');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('');
    console.error('  ' + vermelho(negrito('O pipeline de evals parou:')));
    console.error('    ' + detalharErro(err));
    console.error('');
    process.exit(1);
  });
}

// Exportado pra inspecao/teste manual: da pra montar o material de um trace e
// olhar os sinais apurados em codigo sem gastar uma chamada ao juiz.
module.exports = { montarMaterial, detalharErro, julgar, CRITERIOS, buscarTraceCompleto };
