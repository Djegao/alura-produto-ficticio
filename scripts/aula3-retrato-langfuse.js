// Retrato dos dados de producao para a Aula 3 (observabilidade).
//
// SOMENTE LEITURA: faz apenas GET na API publica do Langfuse. Nao grava Score,
// nao toca no Supabase, nao chama modelo. Serve pra revalidar os numeros de
// docs/apoio/aula3-dados-congelados.md perto da gravacao — o painel muda todo
// dia (retencao de 30 dias no plano Hobby).
//
//   node scripts/aula3-retrato-langfuse.js
//
// Horarios em BRT (UTC-3). Toda conta e' feita aqui, em codigo.

require('dotenv').config({ quiet: true });

const TETOS = [512, 1024, 2048]; // max_tokens configurados no produto
const UNIDADES_HOBBY = 50000;
const RETENCAO_DIAS = 30;

const base = (process.env.LANGFUSE_BASE_URL || '').replace(/\/+$/, '');
if (!base || !process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
  console.error('Faltam LANGFUSE_BASE_URL / LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY no .env.');
  process.exit(1);
}
const auth = 'Basic ' + Buffer.from(`${process.env.LANGFUSE_PUBLIC_KEY}:${process.env.LANGFUSE_SECRET_KEY}`).toString('base64');
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(caminho, tentativa = 1) {
  let r;
  try {
    r = await fetch(base + caminho, { headers: { Authorization: auth } });
  } catch (err) {
    throw new Error(`GET ${caminho} nao completou: ${err.cause?.message || err.message}`);
  }
  if (r.status === 429 && tentativa <= 5) {
    await dormir(20000); // limite de ~15 chamadas/min na listagem do Langfuse Cloud
    return get(caminho, tentativa + 1);
  }
  const texto = await r.text();
  if (!r.ok) throw new Error(`GET ${caminho} respondeu ${r.status}: ${texto.slice(0, 300)}`);
  return JSON.parse(texto);
}

async function paginar(rota, params = {}) {
  const todos = [];
  for (let page = 1; ; page++) {
    const q = new URLSearchParams({ ...params, limit: '100', page: String(page) });
    const r = await get(`${rota}?${q}`);
    todos.push(...(r.data || []));
    if (page >= (r.meta?.totalPages ?? 1) || !(r.data || []).length) break;
    await dormir(4500);
  }
  return todos;
}

const brt = (iso) => new Date(new Date(iso).getTime() - 3 * 3600e3).toISOString();
const diaBrt = (iso) => brt(iso).slice(0, 10);
const horaBrt = (iso) => brt(iso).slice(5, 16).replace('T', ' ');
const usd = (v, casas = 4) => 'US$ ' + v.toFixed(casas).replace('.', ',');
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1).replace('.', ',') + '%' : '-');
const seg = (v) => v.toFixed(1).replace('.', ',') + ' s';
const soma = (arr, f) => arr.reduce((a, x) => a + (f(x) || 0), 0);

function quantil(valores, q) {
  const s = [...valores].sort((a, b) => a - b);
  if (!s.length) return 0;
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

function tabelaPorOperacao(traces) {
  const totalN = traces.length;
  const totalC = soma(traces, (t) => t.totalCost);
  const grupos = {};
  for (const t of traces) (grupos[t.name] ??= []).push(t);
  console.log('| Operação | n | % das chamadas | custo médio | % da conta | latência média | p50 | p95 | pior |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const [nome, ts] of Object.entries(grupos).sort((a, b) => soma(b[1], (t) => t.totalCost) - soma(a[1], (t) => t.totalCost))) {
    const custo = soma(ts, (t) => t.totalCost);
    const lat = ts.map((t) => t.latency || 0);
    console.log(`| \`${nome}\` | ${ts.length} | ${pct(ts.length, totalN)} | ${usd(custo / ts.length)} | ${pct(custo, totalC)} | ${seg(soma(lat, (x) => x) / lat.length)} | ${seg(quantil(lat, 0.5))} | ${seg(quantil(lat, 0.95))} | ${seg(Math.max(...lat))} |`);
  }
}

(async () => {
  const traces = await paginar('/api/public/traces');
  await dormir(4500);
  // /api/public/observations sem filtro de data passou a devolver 422 no
  // Langfuse Cloud ("narrow your request... shorter date range") — o
  // endpoint legado pede fromStartTime/toStartTime (achado 16/09; a mesma
  // migracao pra /api/public/v2/observations ja aparece documentada nos
  // traces preservados em docs/apoio/traces-preservados/).
  const observacoes = await paginar('/api/public/observations', {
    fromStartTime: new Date(Date.now() - (RETENCAO_DIAS + 10) * 24 * 3600e3).toISOString(),
    toStartTime: new Date().toISOString(),
  });
  await dormir(4500);
  const notas = await paginar('/api/public/scores');

  const porTrace = {};
  for (const o of observacoes) (porTrace[o.traceId] ??= []).push(o);
  const datas = traces.map((t) => t.timestamp).sort();
  const custoTotal = soma(traces, (t) => t.totalCost);
  const unidades = traces.length + observacoes.length + notas.length;

  console.log(`# Retrato do Langfuse — capturado em ${horaBrt(new Date().toISOString())} (BRT)\n`);
  console.log(`- Janela visível: **${traces.length} interações**, de ${horaBrt(datas[0])} a ${horaBrt(datas[datas.length - 1])} (BRT)`);
  console.log(`- Custo acumulado na janela: **${usd(custoTotal, 2)}**`);
  console.log(`- Registros visíveis (interações + passos + notas): ${traces.length} + ${observacoes.length} + ${notas.length} = **${unidades}** — ${pct(unidades, UNIDADES_HOBBY)} das ${UNIDADES_HOBBY} unidades/mês do plano Hobby\n`);

  console.log('## Por operação\n');
  tabelaPorOperacao(traces);

  console.log('\n## Volume por dia (BRT)\n');
  console.log('| Dia | Interações | Custo | Operações |');
  console.log('|---|---|---|---|');
  const dias = {};
  for (const t of traces) {
    const d = (dias[diaBrt(t.timestamp)] ??= { n: 0, c: 0, ops: {} });
    d.n++; d.c += t.totalCost || 0; d.ops[t.name] = (d.ops[t.name] || 0) + 1;
  }
  for (const d of Object.keys(dias).sort()) {
    console.log(`| ${d} | ${dias[d].n} | ${usd(dias[d].c)} | ${Object.entries(dias[d].ops).map(([k, v]) => `${k} ${v}`).join(', ')} |`);
  }

  console.log('\n## Passos por interação (tamanho da árvore)\n');
  const passos = {};
  for (const t of traces) (passos[t.name] ??= []).push((porTrace[t.id] || []).length);
  for (const [nome, ns] of Object.entries(passos)) console.log(`- \`${nome}\`: ${[...new Set(ns)].sort((a, b) => a - b).join(', ')} passos`);

  console.log('\n## Vermelho no painel (observações com nível ERROR)\n');
  const nomeTrace = Object.fromEntries(traces.map((t) => [t.id, t.name]));
  const erros = observacoes.filter((o) => o.level === 'ERROR').sort((a, b) => a.startTime.localeCompare(b.startTime));
  console.log(`${erros.length} interações com erro:\n`);
  for (const o of erros) console.log(`- ${horaBrt(o.startTime)} · \`${nomeTrace[o.traceId] || '(fora da janela)'}\` · ${(o.statusMessage || '').replace(/\s+/g, ' ').slice(0, 140)} · \`${o.traceId.slice(0, 12)}\``);

  console.log('\n## Gerações no teto de tokens, por operação\n');
  const geracoes = observacoes.filter((o) => o.type === 'GENERATION');
  const teto = {};
  for (const g of geracoes) {
    const k = `${nomeTrace[g.traceId] || '(fora)'} / ${g.name}`;
    teto[k] ??= { total: 0, noTeto: 0, maior: 0 };
    const saida = g.usage?.output ?? g.usageDetails?.output ?? 0;
    teto[k].total++;
    teto[k].maior = Math.max(teto[k].maior, saida);
    if (TETOS.includes(saida)) teto[k].noTeto++;
  }
  for (const [k, v] of Object.entries(teto)) console.log(`- ${k}: ${v.noTeto} de ${v.total} no teto (maior saída: ${v.maior} tokens)`);

  console.log('\n## As mediações, uma por uma\n');
  console.log('| Quando (BRT) | Trace | Painel | Tela | Texto final | Custo | Latência |');
  console.log('|---|---|---|---|---|---|---|');
  const mediacoes = traces.filter((t) => t.name === 'mediar-cardapio').sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const custoPorStatus = {};
  for (const t of mediacoes) {
    const obs = porTrace[t.id] || [];
    const erro = obs.some((o) => o.type === 'AGENT' && o.level === 'ERROR');
    const texto = typeof t.output === 'string' ? t.output.trim() : '';
    const textoNoTeto = obs.some((o) => o.type === 'GENERATION' && o.name === 'chamada-claude' && TETOS.includes(o.usage?.output ?? -1));
    let status;
    if (erro) status = 'erro';
    else if (!texto) status = 'vazia';
    else if (!/\s/.test(texto)) status = 'uma palavra';
    else if (textoNoTeto) status = 'cortada';
    else status = 'inteira';
    custoPorStatus[status] = (custoPorStatus[status] || 0) + (t.totalCost || 0);
    const trecho = status === 'erro' ? '—' : texto ? `…${JSON.stringify(texto.slice(-40)).slice(1, -1)}` : '(vazio)';
    console.log(`| ${horaBrt(t.timestamp)} | \`${t.id.slice(0, 8)}\` | ${erro ? 'vermelho' : 'verde'} | ${status} | ${trecho} | ${usd(t.totalCost || 0)} | ${seg(t.latency || 0)} |`);
  }
  const custoMed = soma(mediacoes, (t) => t.totalCost);
  const naoInteiras = custoMed - (custoPorStatus.inteira || 0);
  console.log(`\nCusto por desfecho: ${Object.entries(custoPorStatus).map(([k, v]) => `${k} ${usd(v)}`).join(' · ')}`);
  console.log(`Mediações que não chegaram inteiras: **${usd(naoInteiras)}** — ${pct(naoInteiras, custoMed)} do custo do Mediador e **${pct(naoInteiras, custoTotal)} da conta do produto**.`);

  console.log('\n## Notas (Scores)\n');
  const tracesComNota = [...new Set(notas.map((s) => s.traceId))];
  const naJanela = tracesComNota.filter((id) => nomeTrace[id]);
  console.log(`- ${notas.length} notas em ${tracesComNota.length} interações; ${naJanela.length} dessas interações ainda estão na janela`);
  console.log(`- Dias em que as notas foram escritas (BRT): ${[...new Set(notas.map((s) => diaBrt(s.timestamp)))].sort().join(', ')}`);

  console.log(`\n## Projeção da retenção (${RETENCAO_DIAS} dias) — o que sobra no painel\n`);
  console.log('| Se abrir o painel em | Interações | Custo | Mediações | % da conta no Mediador | Interações com nota |');
  console.log('|---|---|---|---|---|---|');
  const hoje = new Date();
  for (let i = 1; i <= 10; i++) {
    const dia = new Date(hoje.getTime() + i * 24 * 3600e3);
    const corte = new Date(dia.getTime() - RETENCAO_DIAS * 24 * 3600e3).toISOString();
    const vis = traces.filter((t) => t.timestamp >= corte);
    const med = vis.filter((t) => t.name === 'mediar-cardapio');
    const c = soma(vis, (t) => t.totalCost);
    const comNota = vis.filter((t) => tracesComNota.includes(t.id)).length;
    console.log(`| ${diaBrt(dia.toISOString())} | ${vis.length} | ${usd(c, 2)} | ${med.length} | ${pct(soma(med, (t) => t.totalCost), c)} | ${comNota} |`);
  }
  console.log('\n(Projeção assume que nada novo entra até lá e que a janela conta 30 dias a partir do horário de cada interação.)');
})().catch((err) => {
  console.error('FALHOU:', err.message);
  process.exit(1);
});
