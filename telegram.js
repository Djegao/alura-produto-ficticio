// v3 "Musa Balance": canal Telegram, rodando em paralelo ao web (decisao
// 2026-08-02 — nao substitui, so soma). Texto primeiro; audio fica pra
// depois (exige transcricao, formato OGG do Telegram precisa conversao).
//
// Onboarding: a primeira mensagem de um telegram_user_id desconhecido faz o
// PROPRIO bot perguntar quem e, com botoes (inline keyboard) — nao exige
// decorar comando nenhum. Quem tocar no botao manda um "callback_query" pro
// webhook (tipo de update diferente de mensagem de texto), tratado abaixo.
// /eusou_chef e /eusou_musa continuam funcionando tambem, como atalho.

const { supabase, getHouseholdId, getActorByRole, runTool } = require('./tools');
const { ingerirRelato } = require('./relato-ingestao');

const TELEGRAM_API = 'https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN;

async function enviarMensagem(chatId, text, replyMarkup) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN nao configurado — mensagem nao enviada:', text);
    return;
  }
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup }),
  });
}

async function perguntarIdentidade(chatId) {
  await enviarMensagem(chatId, 'Oi! Ainda nao sei quem e voce por aqui. Quem esta falando?', {
    inline_keyboard: [
      [{ text: 'Diego (chef)', callback_data: 'eusou_chef' }],
      [{ text: 'Esposa (musa)', callback_data: 'eusou_musa' }],
    ],
  });
}

// Fecha o "carregando..." do botao no app do Telegram. Sem isso o botao
// fica com o spinner girando ate expirar sozinho.
async function responderCallback(callbackQueryId, text) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

// Decisao 2026-08-02: captura passiva bem-sucedida (relato/desejo) fica
// QUIETA — so uma reacao na propria mensagem, sem entrar como linha nova na
// conversa do casal. O bot nao deve parecer um estranho comentando cada
// interacao. Erro continua BARULHENTO de proposito (mensagem de verdade) —
// nunca falhar em silencio e' convencao do projeto (SDD/CLAUDE.md).
//
// A API de reacao do Telegram so aceita um conjunto FIXO de emojis (nao e'
// emoji livre como em texto) — 👍 e 🤔 estao confirmados nesse conjunto.
// Nao usamos 📝/💭 aqui por isso (💭 continua vivo no icone do painel web).
const EMOJI_POR_TIPO = { relato_refeicao: '👍', desejo: '🤔' };

async function reagir(chatId, messageId, emoji) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  const res = await fetch(`${TELEGRAM_API}/setMessageReaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, reaction: [{ type: 'emoji', emoji }] }),
  });
  if (!res.ok) {
    // Degrada com um aviso no log, nao quebra o fluxo — se o emoji escolhido
    // um dia sair da lista permitida do Telegram, prefiro logar do que
    // derrubar a captura do relato por causa da reacao.
    console.warn('Reacao do Telegram falhou:', await res.text());
  }
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
  // Toque num botao do teclado inline (resposta a perguntarIdentidade) —
  // update diferente de mensagem de texto, tratado a parte.
  if (update.callback_query) {
    const cq = update.callback_query;
    const role = cq.data === 'eusou_chef' ? 'chef' : cq.data === 'eusou_musa' ? 'musa' : null;
    if (!role) return;

    const actor = await identificarAtor(cq.from.id, role);
    await responderCallback(cq.id, `Prontinho, ${actor.name}!`);
    await enviarMensagem(cq.message.chat.id, `Prontinho — voce e ${actor.name} (${role}) a partir de agora.`);
    return;
  }

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
    await perguntarIdentidade(chatId);
    return;
  }

  const hoje = new Date().toISOString().slice(0, 10);

  try {
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
    }

    await reagir(chatId, message.message_id, EMOJI_POR_TIPO[intencao.tipo] || '👍');
  } catch (err) {
    console.error('Erro capturando relato/desejo via Telegram:', err.message);
    await enviarMensagem(chatId, '⚠️ Não consegui registrar essa — tenta de novo em instantes.');
  }
}

module.exports = { processarUpdate, enviarMensagem, perguntarIdentidade, getActorByTelegramId };
