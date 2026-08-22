// Ingestao de nota fiscal direto da SEFAZ, via a URL do QR code impresso na
// NFC-e — sem custo e sem intermediario de proposito (requisito 2026-08-21):
// o QR aponta pra pagina publica de consulta da SEFAZ do estado emissor, que
// renderiza os itens da nota em HTML no servidor. Em vez de manter um parser
// por UF (cada SEFAZ tem um layout proprio), o HTML vira texto plano e cai no
// MESMO extrator LLM de nota-fiscal.js — estado-agnostico, e reusa o
// tool_choice forcado ja validado como padrao do projeto (SDD §11.3).
//
// Limite conhecido do MVP: alguns portais estaduais renderizam a consulta so
// no browser (JS). Nesses casos o texto extraido vem vazio/curto demais e o
// erro e' propagado BARULHENTO (convencao do projeto: nunca falhar em
// silencio) — a pessoa ainda pode importar a nota como texto pelo caminho
// antigo. Consulta por chave de 44 digitos sem URL fica de fora tambem: a
// maioria dos portais exige captcha nesse fluxo, e captcha nao se automatiza.

const { ingerirNotaFiscal } = require('./nota-fiscal');

const CHAVE_RE = /\d{44}/;

// Aceita so URL que (a) tenha a chave de acesso de 44 digitos embutida (todo
// QR de NFC-e tem) e (b) aponte pra um dominio .gov.br — todos os portais de
// consulta da SEFAZ vivem la. Isso tambem fecha a porta de usar o endpoint
// como proxy pra URL arbitraria.
function validarUrlNfce(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!/\.gov\.br$/i.test(parsed.hostname)) return null;
  const chave = (url.match(CHAVE_RE) || [])[0];
  if (!chave) return null;
  return { url: parsed.toString(), chave };
}

// Acha uma URL de NFC-e no meio de texto livre (mensagem do Telegram com o
// link do QR colado). Retorna null se nao houver — o chamador segue o fluxo
// normal de relato/desejo.
function extrairUrlNfce(texto) {
  const match = (texto || '').match(/https?:\/\/\S+/gi);
  if (!match) return null;
  for (const candidata of match) {
    const valida = validarUrlNfce(candidata);
    if (valida) return valida;
  }
  return null;
}

// HTML -> texto plano, sem dependencia nova: remove script/style, troca tags
// por espaco e decode das entidades mais comuns. Nao precisa ser perfeito —
// o consumidor e' o extrator LLM, que tolera ruido de layout.
function htmlParaTexto(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(tr|p|div|li|h[1-6]|table)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function buscarNotaSefaz(url) {
  const valida = validarUrlNfce(url);
  if (!valida) {
    throw new Error(
      'URL invalida: espero o link do QR code da NFC-e (dominio .gov.br com a chave de acesso de 44 digitos).'
    );
  }

  const res = await fetch(valida.url, {
    headers: {
      // Alguns portais recusam requisicao sem User-Agent de browser.
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`SEFAZ respondeu ${res.status} ao consultar a nota.`);

  const texto = htmlParaTexto(await res.text());
  // Pagina de consulta real tem centenas de caracteres so de cabecalho; texto
  // minusculo e' sinal de portal JS-rendered ou de erro mascarado em HTML.
  if (texto.length < 200) {
    throw new Error(
      'A pagina da SEFAZ veio sem conteudo legivel (portal provavelmente exige browser/JS). Importe a nota como texto pelo caminho manual.'
    );
  }
  return { texto, chave: valida.chave, url: valida.url };
}

// Fluxo completo: busca na SEFAZ e extrai itens com o extrator LLM existente.
async function ingerirNotaSefaz({ url, model }) {
  const { texto, chave } = await buscarNotaSefaz(url);
  const { itens, traceId } = await ingerirNotaFiscal({
    filename: `sefaz:${chave}`,
    content: texto,
    model,
  });
  if (itens.length === 0) {
    throw new Error(
      'Consegui abrir a pagina da SEFAZ mas nao encontrei itens de comida nela — confere se o link e da consulta da nota mesmo.'
    );
  }
  return { itens, traceId, chave };
}

module.exports = { ingerirNotaSefaz, extrairUrlNfce, buscarNotaSefaz, htmlParaTexto };
