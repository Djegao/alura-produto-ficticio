#!/usr/bin/env node
// =============================================================================
// Eval de UM criterio — `repeticao_justificada_pelo_estoque` — pra operacao
// `receita-premium-semanal` (receita-premium.js).
//
// Decisao registrada em evals/draft-repeticao-justificada-pelo-estoque.md:
// este eval e' deliberadamente estreito. "Saiu no prazo?" e "pulou alguma
// semana?" sao aritmetica de data (regra de ouro do projeto: LLM nao faz
// aritmetica) e ficaram de fora de proposito — nao viram Claude-as-judge.
//
//   traces "receita-premium-semanal" (Langfuse)
//     -> sinal de repeticao apurado em codigo (Supabase: premium_suggestions)
//     -> se houve repeticao: juiz (Claude, tool_choice forcado) avalia a justificativa
//     -> Score de volta no trace
//
// Traces sem repeticao NAO geram Score (decisao registrada no draft: 1.0
// "automatico" pra "nao se aplica" diluiria a media e esconderia o problema
// nas semanas em que ele pode de fato ocorrer).
//
// Uso:
//   node evals/run-eval-receita-premium.js                     # roda e GRAVA scores
//   node evals/run-eval-receita-premium.js --dry-run --limit 5 # julga e mostra, sem gravar
//   node evals/run-eval-receita-premium.js --sem-cor
//
// Env vars: mesmas do resto do projeto (.env) — LANGFUSE_*, ANTHROPIC_API_KEY,
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (precisa do Supabase pra reconstruir
// o historico de semanas — diferente de run-evals.js, que so le Langfuse).
// =============================================================================

require('dotenv').config();

const Anthropic = require('@anthropic-ai/sdk');
const { supabase, getHouseholdId } = require('../tools');

const MODELO_JUIZ = 'claude-sonnet-5';
const OPERACAO = 'receita-premium-semanal';

// -----------------------------------------------------------------------------
// Saida no terminal (mesmo estilo de run-evals.js — legibilidade e requisito)
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
// Erros: nada em silencio (mesma convencao de run-evals.js / SDD §11.6)
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
    if (atual.status) extra.push(`status=${atual.status}`);
    partes.push(`${nivel > 0 ? 'causado por: ' : ''}${nome}: ${msg}${extra.length ? ` (${extra.join(', ')})` : ''}`);
    atual = atual.cause;
    nivel++;
  }
  return partes.join('\n    ');
}

// -----------------------------------------------------------------------------
// Langfuse (mesmo cliente HTTP minimo de run-evals.js)
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
    throw new Error(`Faltam variaveis de ambiente: ${faltando.join(', ')}.`);
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
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch (err) {
    throw new Error(`${metodo} ${url} nao completou:\n    ${detalharErro(err)}`);
  }
  const texto = await resposta.text();
  if (!resposta.ok) {
    throw new Error(`${metodo} ${url} respondeu ${resposta.status} ${resposta.statusText}\n    corpo: ${texto.slice(0, 600)}`);
  }
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch (err) {
    throw new Error(`${metodo} ${url} respondeu 200 mas o corpo nao e JSON:\n    ${texto.slice(0, 300)}`);
  }
}

async function buscarTraces(limite) {
  const q = new URLSearchParams({ limit: String(limite), page: '1', name: OPERACAO });
  const r = await langfuse('GET', `/api/public/traces?${q}`);
  return r?.data ?? [];
}

async function buscarTraceCompleto(id) {
  return langfuse('GET', `/api/public/traces/${id}`);
}

async function gravarScore({ traceId, valor, comentario }) {
  return langfuse('POST', '/api/public/scores', {
    traceId,
    name: 'repeticao_justificada_pelo_estoque',
    value: valor,
    comment: comentario,
    dataType: 'NUMERIC',
  });
}

// -----------------------------------------------------------------------------
// Sinal apurado em codigo: o video escolhido ja foi sugerido antes pra essa
// casa? (regra de ouro: comparar strings e datas e' aritmetica, nao julgamento)
// -----------------------------------------------------------------------------

async function apurarSinalRepeticao({ householdId, weekStart, videoUrlEscolhido }) {
  const { data: anteriores, error } = await supabase
    .from('premium_suggestions')
    .select('week_start, video_title, video_url')
    .eq('household_id', householdId)
    .lt('week_start', weekStart)
    .order('week_start', { ascending: true });
  if (error) throw new Error(error.message);

  const ocorrenciaAnterior = anteriores.find((s) => s.video_url === videoUrlEscolhido);
  if (!ocorrenciaAnterior) {
    return { video_ja_sugerido_antes: false, semana_da_ocorrencia_anterior: null, semanas_desde_ultima_vez: null };
  }
  const semanas = Math.round(
    (new Date(weekStart) - new Date(ocorrenciaAnterior.week_start)) / (7 * 24 * 3600 * 1000)
  );
  return {
    video_ja_sugerido_antes: true,
    semana_da_ocorrencia_anterior: ocorrenciaAnterior.week_start,
    semanas_desde_ultima_vez: semanas,
  };
}

// -----------------------------------------------------------------------------
// Material de julgamento — extrai da observacao GENERATION "escolher-video"
// -----------------------------------------------------------------------------

function montarMaterial(trace, householdId) {
  const observacoes = Array.isArray(trace.observations) ? trace.observations : [];
  const geracao = observacoes.find((o) => o.type === 'GENERATION' && o.name === 'escolher-video');
  if (!geracao) {
    throw new Error(`trace nao tem a observacao "escolher-video" esperada (formato inesperado).`);
  }

  const escolha = (Array.isArray(geracao.output) ? geracao.output : []).find(
    (b) => b.type === 'tool_use' && b.name === 'escolher_receita_premium'
  );
  if (!escolha) {
    throw new Error(`observacao "escolher-video" nao tem o tool_use de escolher_receita_premium.`);
  }

  const input = geracao.input || {};
  const feedCompletoDisponivel = Array.isArray(input.videosDisponiveis);

  return {
    trace_id: trace.id,
    week_start: trace.input?.weekStart ?? null,
    video_escolhido: { titulo: escolha.input.video_titulo, url: escolha.input.video_url },
    justificativa_do_modelo: escolha.input.justificativa,
    itens_provaveis_faltantes: escolha.input.itens_provaveis_faltantes ?? [],
    estoque_no_momento_da_escolha: feedCompletoDisponivel ? input.estoqueResumo : null,
    preferencias_no_momento_da_escolha: feedCompletoDisponivel ? input.preferencias : null,
    videos_do_feed_naquela_rodada: feedCompletoDisponivel ? input.videosDisponiveis : null,
    feed_completo_disponivel: feedCompletoDisponivel,
    householdId,
  };
}

// -----------------------------------------------------------------------------
// O criterio, como schema de tool (mesmo padrao de run-evals.js)
// -----------------------------------------------------------------------------

const TOOL_JUIZ = {
  name: 'registrar_avaliacao_repeticao',
  description: 'Registra a avaliacao de repeticao_justificada_pelo_estoque para esta interacao.',
  input_schema: {
    type: 'object',
    properties: {
      valor: {
        type: 'number',
        description:
          'De 0 a 1 (pode ser fracionario). 1.0 = repetiu por falta real de alternativa relevante no feed, ou ' +
          'o estoque/preferencias favorecem fortemente repetir, e a justificativa do modelo menciona isso. ' +
          '0.5 = repetiu havendo alternativa razoavel no feed, sem justificativa forte. ' +
          '0.0 = repetiu com alternativa claramente melhor disponivel no feed e sem mencionar isso na ' +
          'justificativa — sinal de que o modelo nao esta de fato olhando o feed.',
      },
      justificativa: {
        type: 'string',
        description:
          'Uma ou duas frases citando a EVIDENCIA concreta (o que havia no feed, o que a justificativa do ' +
          'modelo disse ou deixou de dizer) que sustenta a nota. Se videos_do_feed_naquela_rodada for null, ' +
          'diga isso explicitamente e julgue so pela justificativa do modelo e pelo estoque.',
      },
    },
    required: ['valor', 'justificativa'],
  },
};

const SYSTEM_JUIZ = `Voce avalia UMA decisao ja tomada pelo agente "receita premium semanal" do Musa
Balance: ele escolheu, entre os videos recentes do canal de um chef, UM video
para repetir numa semana em que ESSE MESMO VIDEO ja havia sido escolhido
antes para a mesma casa (fato ja confirmado em codigo — voce nao precisa
reconfirmar isso).

Sua unica pergunta: essa repeticao fez sentido dado o estoque, as
preferencias da casa, e os videos novos que estavam disponiveis no feed
naquela rodada (se essa lista estiver disponivel no material)?

Regras:
1. Julgue SO com base no material fornecido. Nao suponha video, ingrediente
   ou preferencia que nao esteja ali.
2. Se "videos_do_feed_naquela_rodada" for null, o trace e anterior a uma
   correcao de instrumentacao — julgue apenas pela justificativa do modelo e
   pelo estoque/preferencias disponiveis, e diga isso na sua justificativa.
3. Uma justificativa do modelo que so descreve a receita (sabor, praticidade)
   sem mencionar por que repetir agora faz sentido NAO conta como razao real.
4. Chame registrar_avaliacao_repeticao exatamente uma vez.`;

const anthropic = new Anthropic();

async function julgar(material) {
  const resposta = await anthropic.messages.create({
    model: MODELO_JUIZ,
    max_tokens: 1024,
    system: SYSTEM_JUIZ,
    tools: [TOOL_JUIZ],
    tool_choice: { type: 'tool', name: 'registrar_avaliacao_repeticao' },
    messages: [
      {
        role: 'user',
        content: `Avalie esta decisao de repeticao da operacao "${OPERACAO}".\n\n` + '```json\n' + JSON.stringify(material, null, 2) + '\n```',
      },
    ],
  });
  const bloco = resposta.content.find((b) => b.type === 'tool_use' && b.name === 'registrar_avaliacao_repeticao');
  if (!bloco) {
    throw new Error(
      `O juiz nao chamou registrar_avaliacao_repeticao mesmo com tool_choice forcado. stop_reason=${resposta.stop_reason}`
    );
  }
  return { avaliacao: bloco.input, tokens: { entrada: resposta.usage.input_tokens, saida: resposta.usage.output_tokens } };
}

// -----------------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------------

function lerArgs(argv) {
  const args = { limite: 10, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--sem-cor') continue;
    else if (a === '--limit' || a === '--limite') args.limite = Number(argv[++i]);
    else if (a === '--help' || a === '-h') args.ajuda = true;
    else throw new Error(`Argumento desconhecido: ${a}. Use --help.`);
  }
  if (!Number.isFinite(args.limite) || args.limite < 1) throw new Error('--limit precisa ser um numero inteiro >= 1.');
  return args;
}

const AJUDA = `
Musa Balance — eval de repeticao_justificada_pelo_estoque (receita-premium-semanal)

  node evals/run-eval-receita-premium.js [opcoes]

  --limit N     traces a examinar (padrao: 10)
  --dry-run     julga e mostra, mas NAO grava Score no Langfuse
  --sem-cor     saida sem ANSI
  --help
`;

async function main() {
  const args = lerArgs(process.argv);
  if (args.ajuda) {
    console.log(AJUDA);
    return;
  }

  const { base } = configLangfuse();
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('Falta ANTHROPIC_API_KEY no ambiente.');

  console.log('');
  console.log(negrito('  Musa Balance — eval: repeticao_justificada_pelo_estoque'));
  console.log(cinza(`  operacao: ${OPERACAO}   juiz: ${MODELO_JUIZ}`));
  console.log(cinza('  Langfuse: ') + base + cinza('   modo: ') + (args.dryRun ? amarelo('DRY-RUN (nao grava)') : verde('GRAVANDO SCORES')));
  console.log('  ' + cinza(linha()));

  const householdId = await getHouseholdId();

  let traces;
  try {
    traces = await buscarTraces(args.limite);
  } catch (err) {
    console.log('  ' + vermelho('! nao consegui buscar traces:') + '\n    ' + detalharErro(err));
    process.exitCode = 1;
    return;
  }

  if (!traces.length) {
    console.log('');
    console.log('  ' + amarelo(`sem traces com o nome "${OPERACAO}" no projeto — nada a avaliar.`));
    console.log('  ' + cinza('(a job so roda sexta >= 10h; se nunca rodou com --force, nao ha trace ainda.)'));
    console.log('');
    return;
  }

  const relatorio = { avaliados: [], naoSeAplica: 0, incompletos: [], falhas: [] };

  for (let i = 0; i < traces.length; i++) {
    const resumo = traces[i];
    const rotulo = `[${i + 1}/${traces.length}] ${resumo.id.slice(0, 12)}...`;
    const quando = new Date(resumo.timestamp).toISOString().replace('T', ' ').slice(0, 16);
    console.log('');
    console.log('  ' + negrito(rotulo) + cinza(`  ${quando} UTC`));

    try {
      const completo = await buscarTraceCompleto(resumo.id);
      const material = montarMaterial(completo, householdId);

      const sinal = await apurarSinalRepeticao({
        householdId,
        weekStart: material.week_start,
        videoUrlEscolhido: material.video_escolhido.url,
      });

      console.log(cinza('        video: ') + material.video_escolhido.titulo);

      if (!sinal.video_ja_sugerido_antes) {
        console.log('        ' + cinza('sem repeticao — criterio nao se aplica, nenhum Score gravado.'));
        relatorio.naoSeAplica++;
        continue;
      }

      console.log(
        '        ' +
          amarelo(`! repeticao detectada: mesmo video da semana de ${sinal.semana_da_ocorrencia_anterior} (${sinal.semanas_desde_ultima_vez} semana(s) atras)`)
      );
      if (!material.feed_completo_disponivel) {
        console.log('        ' + cinza('(trace anterior a correcao de instrumentacao — feed completo indisponivel, julgando so pela justificativa)'));
      }

      const materialParaJuiz = {
        video_escolhido: material.video_escolhido,
        justificativa_do_modelo: material.justificativa_do_modelo,
        estoque_no_momento_da_escolha: material.estoque_no_momento_da_escolha,
        preferencias_no_momento_da_escolha: material.preferencias_no_momento_da_escolha,
        videos_do_feed_naquela_rodada: material.videos_do_feed_naquela_rodada,
        sinais_apurados_em_codigo: sinal,
      };

      const { avaliacao, tokens } = await julgar(materialParaJuiz);
      const valor = Math.max(0, Math.min(1, Number(avaliacao.valor)));
      const pinta = corDoValor(valor);

      console.log(
        '        ' +
          pinta(simbolo(valor)) +
          'repeticao_justificada_pelo_estoque  ' +
          pinta(valor.toFixed(2)) +
          '  ' +
          cinza(barra(valor)) +
          '  ' +
          cinza(encurtar(String(avaliacao.justificativa).replace(/\s+/g, ' '), 1500))
      );
      console.log(cinza(`        juiz: ${tokens.entrada} tokens entrada / ${tokens.saida} saida`));

      if (!args.dryRun) {
        await gravarScore({
          traceId: resumo.id,
          valor,
          comentario: `[juiz ${MODELO_JUIZ}] ${avaliacao.justificativa}`,
        });
      }

      relatorio.avaliados.push({ traceId: resumo.id, valor });
    } catch (err) {
      console.log('  ' + vermelho('FALHOU: ') + detalharErro(err));
      relatorio.falhas.push({ traceId: resumo.id, detalhe: detalharErro(err) });
    }
  }

  console.log('');
  console.log('  ' + cinza(linha('=')));
  console.log('  ' + negrito('RESUMO'));
  console.log('  ' + cinza(linha('=')));
  console.log('  ' + cinza(`traces examinados: `) + traces.length);
  console.log('  ' + cinza(`sem repeticao (N/A, nao avaliado): `) + relatorio.naoSeAplica);
  console.log('  ' + cinza(`avaliados pelo juiz: `) + relatorio.avaliados.length);
  if (relatorio.avaliados.length) {
    const media = relatorio.avaliados.reduce((a, r) => a + r.valor, 0) / relatorio.avaliados.length;
    const reprovados = relatorio.avaliados.filter((r) => r.valor < 0.5).length;
    console.log(
      '  ' + negrito('media repeticao_justificada_pelo_estoque: ') + corDoValor(media)(media.toFixed(2)) +
      cinza(reprovados ? `  (${reprovados} reprovado(s) < 0.5)` : '')
    );
  }
  if (relatorio.falhas.length) {
    console.log('');
    console.log('  ' + vermelho(negrito(`${relatorio.falhas.length} falha(s):`)));
    for (const f of relatorio.falhas) console.log('   - ' + vermelho(f.traceId.slice(0, 12) + '...') + '  ' + f.detalhe);
    process.exitCode = 1;
  }
  console.log('');
  if (args.dryRun) console.log('  ' + amarelo('DRY-RUN: nenhum Score foi gravado no Langfuse.'));
  else console.log('  ' + verde(`${relatorio.avaliados.length} Score(s) enviado(s) ao Langfuse.`) + cinza(' (lag de ~45s pra ficar consultavel — SDD §11.2)'));
  console.log('');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('');
    console.error('  ' + vermelho(negrito('O eval parou:')));
    console.error('    ' + detalharErro(err));
    console.error('');
    process.exit(1);
  });
}

module.exports = { montarMaterial, apurarSinalRepeticao, julgar };
