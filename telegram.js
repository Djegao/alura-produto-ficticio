// v3 "Musa Balance": canal Telegram, rodando em paralelo ao web (decisao
// 2026-08-02 — nao substitui, so soma). Texto primeiro; audio fica pra
// depois (exige transcricao, formato OGG do Telegram precisa conversao).
//
// Onboarding minimo: a primeira mensagem de um telegram_user_id desconhecido
// recebe um pedido de identificacao (/eusou_chef ou /eusou_musa). Depois
// disso o bot resolve o ator sozinho a partir do id, sem perguntar de novo.

const { supabase, getHouseholdId, getActorByRole, runTool } = require('./tools');
const { ingerirRelato } = require('./relato-ingestao');

const TELEGRAM_API = 'https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN;

async function enviarMensagem(chatId, text) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN nao configurado — mensagem nao enviada:', text);
    return;
  }
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function getActorByTelegramId(telegramUserId) {
  const { data, error } = await supabase
    .from('actors')
    .select('id, name, role, household_id')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function identificarAtor(telegramUserId, role) {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('actors')
    .update({ telegram_user_id: telegramUserId })
    .eq('household_id', householdId)
    .eq('role', role)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Ponto de entrada do webhook. server.js so repassa o body do POST — toda a
// logica de negocio fica aqui, no mesmo espirito de nota-fiscal.js/tools.js
// (nada de logica de canal misturada nas rotas Express).
async function processarUpdate(update, { model }) {
  const message = update.message;
  if (!message || !message.text) return; // foto/audio: fora do escopo desta fase

  const telegramUserId = message.from.id;
  const chatId = message.chat.id;
  const texto = message.text.trim();

  // Aprende o chat_id do grupo sozinho, na primeira mensagem — e' pra la que
  // o lembrete de dado ausente (camada 5) manda aviso, ja que o bot nao pode
  // iniciar conversa privada com ninguem sem essa pessoa ter falado antes.
  if (message.chat.type === 'group' || message.chat.type === 'supergroup') {
    const householdId = await getHouseholdId();
    await supabase
      .from('households')
      .update({ telegram_chat_id: chatId })
      .eq('id', householdId)
      .is('telegram_chat_id', null);
  }

  if (texto === '/eusou_chef' || texto === '/eusou_musa') {
    const role = texto === '/eusou_chef' ? 'chef' : 'musa';
    const actor = await identificarAtor(telegramUserId, role);
    await enviarMensagem(chatId, `Prontinho — voce e ${actor.name} (${role}) a partir de agora.`);
    return;
  }

  const actor = await getActorByTelegramId(telegramUserId);
  if (!actor) {
    await enviarMensagem(
      chatId,
      'Ainda nao sei quem e voce. Responda /eusou_chef ou /eusou_musa antes de mandar relatos ou desejos.'
    );
    return;
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const { intencao, traceId } = await ingerirRelato({ texto, dataReferencia: hoje, model, canal: 'telegram' });

  await supabase.from('pensamentos').insert({
    actor_id: actor.id,
    tipo: intencao.tipo,
    descricao: intencao.descricao,
    data: intencao.data || null,
    calorias: intencao.calorias ?? null,
    custo: intencao.custo ?? null,
    trace_id: traceId,
  });

  if (intencao.tipo === 'relato_refeicao') {
    await runTool('registrar_relato_refeicao', {
      ator: actor.role,
      data: intencao.data || hoje,
      descricao: intencao.descricao,
      fonte: 'telegram',
      calorias: intencao.calorias,
      custo: intencao.custo,
    });
    await enviarMensagem(chatId, `📝 Relato registrado: ${intencao.descricao}`);
  } else {
    await enviarMensagem(chatId, `💭 Anotado como desejo pra semana: ${intencao.descricao}`);
  }
}

module.exports = { processarUpdate, enviarMensagem, getActorByTelegramId };
