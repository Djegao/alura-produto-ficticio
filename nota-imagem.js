// Ingestao de nota fiscal por FOTO (2026-08-23). Nasceu de uma quebra de
// expectativa real: o instrutor fotografou o cupom e mandou no Telegram
// esperando que o sistema resolvesse — e o bot ignorou em silencio.
//
// A ordem de tentativas nao e' arbitraria, veio de teste com nota real de SP:
//
//   1. DECODIFICAR O QR DA FOTO. O portal da SEFAZ-SP NAO aceita consulta
//      so com a chave de 44 digitos — testado com chave real, por fetch e
//      por navegador com JS: devolve so a casca da pagina. Ele exige o
//      payload completo do QR (chave|versao|ambiente|idToken|hash), e esse
//      hash SO existe dentro do QR. Logo, ler os digitos por visao nao abre
//      a nota; decodificar o QR abre. Com o payload completo a SEFAZ
//      responde em HTML puro, sem JS (12KB), e o pipeline existente de
//      sefaz.js resolve o resto.
//
//   2. VISAO LE OS ITENS. So quando o QR nao decodifica (papel amassado,
//      angulo, foco) E os itens aparecem na foto. E' um degrau de menor
//      confianca, marcado como tal — dado lido de pixel, nao dado oficial.
//
//   3. PERGUNTAR. Se nenhum dos dois, dizer exatamente o que faltou. Nunca
//      inventar, nunca silenciar (o silencio foi o bug que originou isto).
//
// A chave lida por visao nao serve pra consultar, mas serve pra CONFERIR:
// o ultimo digito e' verificador (modulo 11), calculavel em codigo. Mesma
// regra de ouro do projeto — a LLM le, o codigo verifica.

const Anthropic = require('@anthropic-ai/sdk');
const { startObservation } = require('@langfuse/tracing');
const jsQR = require('jsqr');
const jpeg = require('jpeg-js');

const anthropic = new Anthropic();

// --- Camada deterministica -------------------------------------------------

// Digito verificador da chave de acesso (modulo 11, pesos 2..9 ciclicos).
function digitoVerificador(chave43) {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  let p = 0;
  for (let i = chave43.length - 1; i >= 0; i--) {
    soma += Number(chave43[i]) * pesos[p % 8];
    p++;
  }
  const resto = soma % 11;
  return resto === 0 || resto === 1 ? 0 : 11 - resto;
}

function chaveValida(chave) {
  if (!/^\d{44}$/.test(chave || '')) return false;
  return digitoVerificador(chave.slice(0, 43)) === Number(chave[43]);
}

// Reducao por vizinho mais proximo. Foto de celular vem em 3000x4000 e o
// jsQR fica lento e menos preciso nesse tamanho — reduzir costuma ACHAR o
// QR que falhou em tamanho cheio, alem de ser mais rapido.
function reduzir(dados, largura, altura, fator) {
  const nl = Math.floor(largura / fator);
  const na = Math.floor(altura / fator);
  const out = new Uint8ClampedArray(nl * na * 4);
  for (let y = 0; y < na; y++) {
    for (let x = 0; x < nl; x++) {
      const de = ((y * fator) * largura + x * fator) * 4;
      const para = (y * nl + x) * 4;
      out[para] = dados[de];
      out[para + 1] = dados[de + 1];
      out[para + 2] = dados[de + 2];
      out[para + 3] = dados[de + 3];
    }
  }
  return { dados: out, largura: nl, altura: na };
}

// Tenta em tamanho cheio e depois reduzido. `inversionAttempts: 'attemptBoth'`
// cobre cupom impresso claro sobre escuro (raro, mas barato de tentar).
function decodificarQR(bufferJpeg) {
  let img;
  try {
    img = jpeg.decode(bufferJpeg, { useTArray: true });
  } catch (err) {
    return { url: null, erro: 'nao consegui decodificar a imagem (formato?): ' + err.message };
  }

  const tentativas = [{ dados: img.data, largura: img.width, altura: img.height }];
  for (const fator of [2, 3, 4]) {
    if (img.width / fator >= 200) tentativas.push(reduzir(img.data, img.width, img.height, fator));
  }

  for (const t of tentativas) {
    const r = jsQR(t.dados, t.largura, t.altura, { inversionAttempts: 'attemptBoth' });
    if (r && r.data) return { url: r.data, erro: null };
  }
  return { url: null, erro: 'QR nao decodificou' };
}

// --- Camada probabilistica (degrau 2) --------------------------------------

const LER_NOTA_TOOL = {
  name: 'ler_nota_da_foto',
  description: 'Registra o que foi possivel ler na foto de um cupom fiscal.',
  input_schema: {
    type: 'object',
    properties: {
      chave_acesso: {
        type: 'string',
        description:
          'Os 44 digitos da chave de acesso, se estiverem legiveis na foto (costumam vir agrupados de 4 em 4 — junte tudo, so digitos). Omita se nao der pra ler com certeza; nao complete digitos que voce nao viu.',
      },
      itens: {
        type: 'array',
        description:
          'Itens de alimentacao/cozinha visiveis na foto. Deixe vazio se a lista de itens nao aparecer na imagem — nao deduza itens que nao estao visiveis.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'nome limpo e curto, ex: "cafe gourmet"' },
            quantity: { type: 'number', description: 'quantidade total normalizada' },
            unit: { type: 'string', description: 'kg, g, ml, L, unidade, etc' },
            state: { type: 'string', enum: ['base', 'ingrediente', 'preparado'] },
            storage: { type: 'string', enum: ['seco', 'perecivel'] },
          },
          required: ['name', 'quantity', 'unit', 'state', 'storage'],
        },
      },
      itens_visiveis: {
        type: 'boolean',
        description: 'true se a lista de itens aparece na foto; false se a foto mostra so o rodape/QR.',
      },
    },
    required: ['itens', 'itens_visiveis'],
  },
};

const SYSTEM_VISAO = `Voce le fotos de cupom fiscal brasileiro (NFC-e).

Regras:
- Se a lista de itens estiver visivel, extraia SO alimentos e bebidas de
  cozinha (ignore limpeza, higiene, papelaria, tinta, etc).
- Normalize quantidade: "2 UN x 500G" vira 1 kg; "1,250 KG" vira 1.25 kg.
- state: 'base' = materia-prima crua; 'ingrediente' = transformado mas nao e
  prato pronto (cafe moido, queijo fatiado); 'preparado' = pronto pra comer
  (chocolate, biscoito).
- storage: 'seco' = despensa; 'perecivel' = geladeira.
- Se a foto mostrar so o rodape (QR, chave, totais) e nao a lista de itens,
  marque itens_visiveis=false e devolva itens vazio. NAO invente itens.
- A chave de acesso so deve ser preenchida se voce conseguir ler os digitos.
  Nao adivinhe nenhum digito.

Chame ler_nota_da_foto exatamente uma vez.`;

async function lerNotaPorVisao({ buffer, mediaType, model, agent }) {
  const generation = agent.startObservation(
    'ler-nota-por-visao',
    { input: { bytes: buffer.length, mediaType }, model },
    { asType: 'generation' }
  );

  const response = await anthropic.messages.create({
    model,
    max_tokens: 2048,
    system: SYSTEM_VISAO,
    tools: [LER_NOTA_TOOL],
    tool_choice: { type: 'tool', name: 'ler_nota_da_foto' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: buffer.toString('base64') } },
          { type: 'text', text: 'Leia esta foto de cupom fiscal.' },
        ],
      },
    ],
  });

  generation.update({
    output: response.content,
    usageDetails: { input: response.usage.input_tokens, output: response.usage.output_tokens },
  });
  generation.end();

  const bloco = response.content.find((b) => b.type === 'tool_use' && b.name === 'ler_nota_da_foto');
  return bloco ? bloco.input : { itens: [], itens_visiveis: false };
}

// --- Orquestracao ----------------------------------------------------------

// Retorna { via, itens, chave, traceId, confianca, aviso } ou lanca erro com
// mensagem util pro usuario final (nunca um "falhou" generico).
async function ingerirNotaImagem({ buffer, mediaType = 'image/jpeg', model, modelVisao }) {
  const { ingerirNotaSefaz } = require('./sefaz'); // require tardio: evita ciclo

  const agent = startObservation(
    'ingerir-nota-imagem',
    { input: { bytes: buffer.length, mediaType, model, modelVisao } },
    { asType: 'agent' }
  );
  const traceId = agent.traceId;

  try {
    // Degrau 1: QR (deterministico, dado oficial)
    const qrSpan = agent.startObservation('decodificar-qr', { input: { bytes: buffer.length } }, { asType: 'span' });
    const qr = decodificarQR(buffer);
    qrSpan.update({ output: { decodificou: !!qr.url, erro: qr.erro } });
    qrSpan.end();

    if (qr.url) {
      const r = await ingerirNotaSefaz({ url: qr.url, model });
      agent.update({ output: { via: 'qr', itens: r.itens.length } });
      return { via: 'qr', itens: r.itens, chave: r.chave, traceId, confianca: 'oficial' };
    }

    // Degrau 2: visao le o que da
    const lido = await lerNotaPorVisao({ buffer, mediaType, model: modelVisao, agent });
    const chaveLida = (lido.chave_acesso || '').replace(/\D/g, '');
    const chaveOk = chaveValida(chaveLida);

    if (Array.isArray(lido.itens) && lido.itens.length > 0) {
      agent.update({ output: { via: 'visao', itens: lido.itens.length, chaveOk } });
      return {
        via: 'visao',
        itens: lido.itens,
        chave: chaveOk ? chaveLida : null,
        traceId,
        confianca: 'estimada',
        aviso:
          'Não consegui ler o QR, então tirei os itens da própria imagem — confere antes de confiar. ' +
          'Uma foto do cupom inteiro, sem dobra sobre o QR, traz o dado oficial da SEFAZ.',
      };
    }

    // Degrau 3: perguntar, dizendo exatamente o que faltou
    if (chaveOk) {
      throw new Error(
        `Li a chave (${chaveLida.slice(0, 8)}…${chaveLida.slice(-4)}) e ela é válida, mas a SEFAZ de SP não abre a nota só com a chave — ` +
          'ela exige o QR code. Manda outra foto com o QR nítido e sem dobra, ou cola aqui o link que sai ao escanear o QR pela câmera.'
      );
    }
    throw new Error(
      lido.itens_visiveis === false
        ? 'Essa foto mostra o rodapé, mas o QR não decodificou (dobra, foco ou ângulo). Tenta de novo com o QR bem plano — ou manda a foto do cupom inteiro, que aí eu leio os itens.'
        : 'Não consegui ler nem o QR nem os itens dessa foto. Tenta com mais luz e o cupom esticado.'
    );
  } catch (err) {
    agent.update({ level: 'ERROR', statusMessage: err.message });
    throw err;
  } finally {
    agent.end();
  }
}

module.exports = { ingerirNotaImagem, decodificarQR, chaveValida, digitoVerificador };
