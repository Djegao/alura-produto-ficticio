// Receita premium semanal (requisito 2026-08-21): toda semana o sistema
// sugere UMA receita premium vinda do canal do chef Mohamad Hindi
// (youtube.com/@mohindi), cruzada com o estoque e as preferencias reais da
// casa. Sem API key e sem intermediario: o canal e' lido pelo feed RSS
// publico do YouTube (feeds/videos.xml), que traz os ~15 videos mais
// recentes com titulo/descricao — suficiente pro MVP.
//
// Divisao deterministico/probabilistico do projeto preservada: buscar feed,
// dedupe semanal e persistencia sao codigo; a UNICA decisao da LLM e' qual
// video casa melhor com estoque+preferencias, capturada com tool_choice
// forcado (padrao SDD §11.3). Itens que a receita provavelmente exige e nao
// ha em casa entram na lista de compras (source 'premium') — mesma lista que
// o Mediador alimenta, fechando o ciclo de falta de item.
//
// Job semanal no padrao de lembrete.js: checagem horaria barata; dispara na
// sexta a partir das 10h, e o unique(household_id, week_start) no banco e'
// o dedupe real (sobrevive a redeploy, diferente do Set em memoria).

const Anthropic = require('@anthropic-ai/sdk');
const { startObservation } = require('@langfuse/tracing');
const { supabase, getHouseholdId, getWeekStart, runTool } = require('./tools');
const { enviarMensagem } = require('./telegram');

const anthropic = new Anthropic();

const CANAL_URL = 'https://www.youtube.com/@mohindi';
const DIA_PREMIUM = 5; // sexta — a refeicao premium e' do fim de semana
const HORA_PREMIUM = 10;

// channelId do handle @mohindi, resolvido uma vez por processo (fetch da
// pagina do canal + regex). Env var opcional pula o fetch se um dia o
// scraping da pagina quebrar.
let channelIdCache = process.env.YOUTUBE_MOHINDI_CHANNEL_ID || null;

async function resolverChannelId() {
  if (channelIdCache) return channelIdCache;
  const res = await fetch(CANAL_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`YouTube respondeu ${res.status} ao abrir o canal @mohindi.`);
  const html = await res.text();
  // O HTML do canal expoe o id como "externalId"/"browseId" (nem sempre
  // "channelId") — testado ao vivo em 2026-08-21, externalId veio primeiro.
  const match = html.match(/"(?:externalId|browseId|channelId)":"(UC[0-9A-Za-z_-]{22})"/);
  if (!match) throw new Error('Nao consegui achar o channelId do @mohindi na pagina do canal.');
  channelIdCache = match[1];
  return channelIdCache;
}

// Parse do feed Atom por regex — o feed do YouTube e' bem-formado e estavel;
// nao vale uma dependencia de XML so pra isso.
function parseFeed(xml) {
  const entries = xml.split('<entry>').slice(1);
  return entries
    .map((entry) => {
      const titulo = (entry.match(/<title>([^<]*)<\/title>/) || [])[1];
      const url = (entry.match(/<link rel="alternate" href="([^"]+)"/) || [])[1];
      const publicado = (entry.match(/<published>([^<]+)<\/published>/) || [])[1];
      const descricao = ((entry.match(/<media:description>([\s\S]*?)<\/media:description>/) || [])[1] || '')
        .slice(0, 400);
      return titulo && url ? { titulo, url, publicado, descricao } : null;
    })
    .filter(Boolean);
}

async function buscarVideosRecentes() {
  const channelId = await resolverChannelId();
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Feed RSS do canal respondeu ${res.status}.`);
  const videos = parseFeed(await res.text());
  if (videos.length === 0) throw new Error('Feed do canal veio sem videos — formato pode ter mudado.');
  return videos;
}

const ESCOLHER_TOOL = {
  name: 'escolher_receita_premium',
  description: 'Registra a escolha final da receita premium da semana, tirada da lista de videos fornecida.',
  input_schema: {
    type: 'object',
    properties: {
      video_titulo: { type: 'string', description: 'Titulo EXATO do video escolhido, copiado da lista.' },
      video_url: { type: 'string', description: 'URL EXATA do video escolhido, copiada da lista.' },
      justificativa: {
        type: 'string',
        description: 'Por que essa receita, em 2-3 frases, citando o que do estoque real ela aproveita e como respeita as preferencias.',
      },
      itens_provaveis_faltantes: {
        type: 'array',
        description: 'Ingredientes que a receita provavelmente exige e que NAO aparecem no estoque fornecido. Sem preco — nunca estime valores.',
        items: {
          type: 'object',
          properties: {
            nome: { type: 'string' },
            quantidade: { type: 'number' },
            unidade: { type: 'string' },
          },
          required: ['nome'],
        },
      },
    },
    required: ['video_titulo', 'video_url', 'justificativa', 'itens_provaveis_faltantes'],
  },
};

const SYSTEM_PROMPT = `Voce escolhe a receita premium do fim de semana pra uma casa, a partir dos
videos recentes do canal do chef Mohamad Hindi. Regras:
- Escolha EXATAMENTE UM video DA LISTA fornecida — nunca invente video, titulo
  ou URL que nao esteja na lista.
- Priorize receitas que aproveitem o que ja existe no estoque fornecido e que
  respeitem as preferencias/restricoes da casa.
- "Premium" significa a refeicao especial da semana: pode ser mais elaborada
  ou indulgente que o dia a dia.
- Liste os ingredientes que a receita provavelmente exige e nao estao no
  estoque (itens_provaveis_faltantes). Nao estime precos nem calorias.
Chame escolher_receita_premium exatamente uma vez.`;

async function sugerirReceitaPremium({ model, force = false }) {
  const householdId = await getHouseholdId();
  const weekStart = getWeekStart();

  const { data: existente, error: exErr } = await supabase
    .from('premium_suggestions')
    .select('*')
    .eq('household_id', householdId)
    .eq('week_start', weekStart)
    .maybeSingle();
  if (exErr) throw new Error(exErr.message);
  if (existente && !force) return { jaExistia: true, sugestao: existente };

  const agent = startObservation(
    'receita-premium-semanal',
    { input: { weekStart, model, force } },
    { asType: 'agent' }
  );
  const traceId = agent.traceId;

  try {
    const [videos, estoque, preferencias] = await Promise.all([
      buscarVideosRecentes(),
      runTool('consultar_estoque', {}),
      runTool('consultar_preferencias', {}),
    ]);

    const estoqueResumo = estoque
      .map((i) => `- ${i.name} (${i.quantity} ${i.unit}, ${i.state}/${i.storage})`)
      .join('\n');
    const videosResumo = videos
      .map((v, n) => `${n + 1}. ${v.titulo}\n   URL: ${v.url}\n   Publicado: ${v.publicado}\n   ${v.descricao.replace(/\s+/g, ' ')}`)
      .join('\n\n');

    const generation = agent.startObservation(
      'escolher-video',
      { input: { videos: videos.length, estoqueItens: estoque.length }, model },
      { asType: 'generation' }
    );

    const response = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: [ESCOLHER_TOOL],
      tool_choice: { type: 'tool', name: 'escolher_receita_premium' },
      messages: [
        {
          role: 'user',
          content: `Videos recentes do canal:\n\n${videosResumo}\n\nEstoque atual da casa:\n${estoqueResumo || '(vazio)'}\n\nPreferencias/restricoes:\n${preferencias.map((p) => `- ${p}`).join('\n') || '(nenhuma)'}`,
        },
      ],
    });

    generation.update({
      output: response.content,
      usageDetails: { input: response.usage.input_tokens, output: response.usage.output_tokens },
    });
    generation.end();

    const block = response.content.find((b) => b.type === 'tool_use' && b.name === 'escolher_receita_premium');
    if (!block) throw new Error('A escolha da receita premium nao veio estruturada.');
    const escolha = block.input;

    // Guarda-corpo deterministico: a URL registrada TEM que ser de um video da
    // lista real — se a LLM alucinar, o erro e' barulhento, nao gravado.
    const videoReal = videos.find((v) => v.url === escolha.video_url);
    if (!videoReal) throw new Error(`Video escolhido nao esta na lista do feed: ${escolha.video_url}`);

    const faltantes = Array.isArray(escolha.itens_provaveis_faltantes) ? escolha.itens_provaveis_faltantes : [];

    const { data: sugestao, error: upErr } = await supabase
      .from('premium_suggestions')
      .upsert(
        {
          household_id: householdId,
          week_start: weekStart,
          video_title: videoReal.titulo,
          video_url: videoReal.url,
          video_published_at: videoReal.publicado || null,
          justificativa: escolha.justificativa,
          itens_faltantes: faltantes,
          trace_id: traceId,
        },
        { onConflict: 'household_id,week_start' }
      )
      .select()
      .single();
    if (upErr) throw new Error(upErr.message);

    // Faltantes viram lista de compras (source 'premium'). Num re-run forcado
    // da mesma semana, limpa os pendentes 'premium' antigos antes — senao a
    // lista acumula ingrediente de receita que ja foi descartada.
    await supabase
      .from('shopping_list_items')
      .delete()
      .eq('household_id', householdId)
      .eq('source', 'premium')
      .eq('status', 'pendente');
    if (faltantes.length > 0) {
      const { error: listErr } = await supabase.from('shopping_list_items').insert(
        faltantes.map((f) => ({
          household_id: householdId,
          name: f.nome,
          quantity: f.quantidade ?? null,
          unit: f.unidade ?? null,
          motivo: `receita premium: ${videoReal.titulo}`,
          status: 'pendente',
          source: 'premium',
        }))
      );
      if (listErr) throw new Error(listErr.message);
    }

    // Push pro grupo do Telegram, se ja aprendido. Falha de envio nao desfaz
    // a sugestao ja persistida — loga e segue.
    const { data: household } = await supabase
      .from('households')
      .select('telegram_chat_id')
      .eq('id', householdId)
      .single();
    if (household?.telegram_chat_id) {
      const listaTxt = faltantes.length
        ? `\n\nPra lista de compras:\n${faltantes.map((f) => `• ${f.nome}${f.quantidade ? ` (${f.quantidade} ${f.unidade || ''})`.trimEnd() + ')' : ''}`).join('\n')}`
        : '\n\nTudo que precisa ja esta em casa. 👌';
      await enviarMensagem(
        household.telegram_chat_id,
        `⭐ Receita premium da semana (do canal do Mohamad Hindi):\n\n${videoReal.titulo}\n${videoReal.url}\n\n${escolha.justificativa}${listaTxt}`
      );
    }

    agent.update({ output: { video: videoReal.titulo, faltantes: faltantes.length } });
    return { jaExistia: false, sugestao };
  } catch (err) {
    agent.update({ level: 'ERROR', statusMessage: err.message });
    throw err;
  } finally {
    agent.end();
  }
}

function iniciarReceitaPremium(getModel) {
  setInterval(() => {
    const agora = new Date();
    if (agora.getDay() !== DIA_PREMIUM || agora.getHours() < HORA_PREMIUM) return;
    // O dedupe real e' o unique(household_id, week_start): sugerirReceitaPremium
    // sem force retorna a existente sem gastar chamada de modelo.
    sugerirReceitaPremium({ model: getModel() }).catch((err) =>
      console.error('Erro no job de receita premium:', err.message)
    );
  }, 60 * 60 * 1000);
}

module.exports = { sugerirReceitaPremium, iniciarReceitaPremium, buscarVideosRecentes };
