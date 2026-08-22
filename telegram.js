// v3 "Musa Balance": canal Telegram, rodando em paralelo ao web (decisao
// 2026-08-02 — nao substitui, so soma). Texto primeiro; audio fica pra
// depois (exige transcricao, formato OGG do Telegram precisa conversao).
//
// Onboarding: a primeira mensagem de um telegram_user_id desconhecido faz o
// PROPRIO bot perguntar quem e, com botoes (inline keyboard) — nao exige
// decorar comando nenhum. Quem tocar no botao manda um "callback_query" pro
// webhook (tipo de update diferente de mensagem de texto), tratado abaixo.
// /eusou_chef e /eusou_musa continuam funcionando tambem, como atalho.

const { supabase, getHouseholdId, getActorByRole, runTool, marcarCompradoNaLista } = require('./tools');
const { ingerirRelato } = require('./relato-ingestao');
const { extrairUrlNfce, ingerirNotaSefaz } = require('./sefaz');
const { estocarItensDaNota } = require('./nota-fiscal');

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

const BUDGET_LABEL = { tr_diego: 'TR Diego', tr_esposa: 'TR Esposa', credito_familia: 'Crédito Família' };

// So pergunta quando o Agente de Ingestao nao capturou a categoria do texto
// (ninguem disse "paguei com..."). callback_data carrega categoria+id do
// pensamento pendente — curto o suficiente pro limite de 64 bytes do Telegram.
async function perguntarOrcamento(chatId, pensamentoId) {
  await enviarMensagem(chatId, 'De qual orçamento saiu essa compra?', {
    inline_keyboard: [
      [{ text: 'TR Diego', callback_data: `bg:tr_diego:${pensamentoId}` }],
      [{ text: 'TR Esposa', callback_data: `bg:tr_esposa:${pensamentoId}` }],
      [{ text: 'Crédito Família', callback_data: `bg:credito_familia:${pensamentoId}` }],
    ],
  });
}

// Remove o teclado da mensagem original apos o toque — sem isso o Telegram
// deixa os botoes clicaveis pra sempre (nao fecha sozinho so por ter
// respondido o callback_query). Atualiza o texto tambem, pra mostrar o que
// foi escolhido em vez de deixar a pergunta pairando sem resposta visivel.
async function editarMensagem(chatId, messageId, text) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, reply_markup: { inline_keyboard: [] } }),
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
const EMOJI_POR_TIPO = { relato_refeicao: '👍', desejo: '🤔', aquisicao: '👍', desperdicio: '😢' };

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

    if (cq.data.startsWith('bg:')) {
      const [, categoria, pensamentoId] = cq.data.split(':');
      const { error } = await supabase
        .from('pensamentos')
        .update({ budget_categoria: categoria, status: 'completo' })
        .eq('id', pensamentoId);
      await responderCallback(cq.id, error ? 'Não consegui salvar, tenta de novo.' : `Marcado: ${BUDGET_LABEL[categoria]}`);
      if (!error) {
        await editarMensagem(cq.message.chat.id, cq.message.message_id, `De qual orçamento saiu essa compra? → ${BUDGET_LABEL[categoria]} ✓`);
      }
      return;
    }

    const role = cq.data === 'eusou_chef' ? 'chef' : cq.data === 'eusou_musa' ? 'musa' : null;
    if (!role) return;

    const actor = await identificarAtor(cq.from.id, role);
    await responderCallback(cq.id, `Prontinho, ${actor.name}!`);
    await editarMensagem(cq.message.chat.id, cq.message.message_id, `Prontinho — você é ${actor.name} (${role}) a partir de agora. ✓`);
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

  // /lista: a lista de compras pendente, direto no chat — a interface
  // primaria do produto e' o Telegram, nao o painel web.
  if (texto === '/lista') {
    const householdId = await getHouseholdId();
    const { data: pendentes, error } = await supabase
      .from('shopping_list_items')
      .select('name, quantity, unit, motivo')
      .eq('household_id', householdId)
      .eq('status', 'pendente')
      .order('created_at', { ascending: true });
    if (error) {
      await enviarMensagem(chatId, '⚠️ Nao consegui ler a lista de compras: ' + error.message);
      return;
    }
    if (!pendentes.length) {
      await enviarMensagem(chatId, '🛒 Lista de compras vazia — nada pendente.');
      return;
    }
    const linhas = pendentes.map(
      (p) => `• ${p.name}${p.quantity ? ` (${p.quantity} ${p.unit || ''})`.trimEnd() + ')' : ''}${p.motivo ? ` — ${p.motivo}` : ''}`
    );
    await enviarMensagem(chatId, `🛒 Lista de compras:\n${linhas.join('\n')}`);
    return;
  }

  // /premium: forca a sugestao premium da semana agora, sem esperar sexta.
  // require tardio de proposito: receita-premium.js importa enviarMensagem
  // deste arquivo — require no topo criaria ciclo com modulo pela metade.
  if (texto === '/premium') {
    await enviarMensagem(chatId, '⭐ Buscando a receita premium da semana no canal do Mohamad Hindi...');
    try {
      const { sugerirReceitaPremium } = require('./receita-premium');
      await sugerirReceitaPremium({ model, force: true });
      // A propria sugerirReceitaPremium posta o resultado no grupo.
    } catch (err) {
      console.error('Erro na receita premium via /premium:', err.message);
      await enviarMensagem(chatId, '⚠️ Nao consegui fechar a receita premium agora: ' + err.message);
    }
    return;
  }

  // Link do QR code de NFC-e no meio da mensagem: ingestao SEFAZ direto do
  // chat — busca a pagina publica da nota, extrai os itens de comida e
  // estoca. Resposta com o resumo do que entrou (aqui a resposta em texto se
  // justifica: e' resultado de acao pedida, nao comentario de conversa).
  const urlNfce = extrairUrlNfce(texto);
  if (urlNfce) {
    await reagir(chatId, message.message_id, '👍');
    try {
      const { itens, traceId, chave } = await ingerirNotaSefaz({ url: urlNfce.url, model });
      const { itemsAdded } = await estocarItensDaNota({
        itens,
        traceId,
        model,
        origem: `sefaz:${chave}`,
      });
      const resumo = itemsAdded.map((i) => `• ${i.name} (${i.quantity} ${i.unit})`).join('\n');
      await enviarMensagem(chatId, `🧾 Nota da SEFAZ ingerida — ${itemsAdded.length} itens no estoque:\n${resumo}`);
    } catch (err) {
      console.error('Erro ingerindo NFC-e via Telegram:', err.message);
      await enviarMensagem(chatId, '⚠️ Nao consegui ler essa nota na SEFAZ: ' + err.message);
    }
    return;
  }

  try {
    const { intencao, traceId } = await ingerirRelato({ texto, dataReferencia: hoje, model, canal: 'telegram' });

    if (intencao.tipo === 'relato_refeicao') {
      await runTool('registrar_relato_refeicao', {
        ator: actor.role,
        data: intencao.data || hoje,
        descricao: intencao.descricao,
        fonte: 'telegram',
        calorias: intencao.calorias,
        custo: intencao.custo,
        fonte_refeicao: intencao.fonte_refeicao,
      });

      // Estoque atualizado pelo chat (requisito 2026-08-21): relato de comida
      // caseira que nomeia um prato preparado baixa a(s) porcao(oes)
      // correspondente(s) — mesmo padrao de match do desperdicio abaixo.
      // Sem match exato de prato 'preparado' vivo, nao baixa nada: relato
      // sem correspondencia nao vira inferencia de consumo.
      if (intencao.fonte_refeicao === 'caseira' && intencao.item_nome) {
        const householdId = await getHouseholdId();
        const { data: candidatos } = await supabase
          .from('pantry_items')
          .select('id, name, portions_remaining')
          .eq('household_id', householdId)
          .eq('state', 'preparado')
          .ilike('name', `%${intencao.item_nome}%`)
          .gt('portions_remaining', 0)
          .order('prepared_at', { ascending: false })
          .limit(1);

        const prato = candidatos && candidatos[0];
        if (prato) {
          const porcoes = Number(intencao.item_quantidade) || 1;
          await supabase
            .from('pantry_items')
            .update({
              portions_remaining: Math.max(0, Number(prato.portions_remaining) - porcoes),
              updated_at: new Date().toISOString(),
            })
            .eq('id', prato.id);
        }
      }

      await supabase.from('pensamentos').insert({
        actor_id: actor.id,
        tipo: intencao.tipo,
        descricao: intencao.descricao,
        data: intencao.data || null,
        calorias: intencao.calorias ?? null,
        custo: intencao.custo ?? null,
        budget_categoria: intencao.budget_categoria || null,
        fonte_refeicao: intencao.fonte_refeicao || null,
        trace_id: traceId,
      });
      await reagir(chatId, message.message_id, EMOJI_POR_TIPO.relato_refeicao);
    } else if (intencao.tipo === 'desperdicio') {
      // Aprendizado, nao configuracao: casa o relato com um prato 'preparado'
      // ainda vivo (mesmo nome, ainda tem porcao restante) e calcula quantos
      // dias ele durou desde prepared_at. Nao tenta adivinhar quando nao acha
      // correspondencia — so registra a descricao crua.
      const householdId = await getHouseholdId();
      let diasDesdePreparo = null;

      if (intencao.item_nome) {
        const { data: candidatos } = await supabase
          .from('pantry_items')
          .select('*')
          .eq('household_id', householdId)
          .eq('state', 'preparado')
          .not('prepared_at', 'is', null)
          .ilike('name', `%${intencao.item_nome}%`)
          .gt('portions_remaining', 0)
          .order('prepared_at', { ascending: false })
          .limit(1);

        const item = candidatos && candidatos[0];
        if (item) {
          diasDesdePreparo = Math.floor((Date.now() - new Date(item.prepared_at).getTime()) / 86400000);
          await supabase.from('pantry_items').update({ portions_remaining: 0 }).eq('id', item.id);
        }
      }

      await supabase.from('pensamentos').insert({
        actor_id: actor.id,
        tipo: 'desperdicio',
        descricao: intencao.descricao,
        data: intencao.data || hoje,
        dias_desde_preparo: diasDesdePreparo,
        trace_id: traceId,
      });
      await reagir(chatId, message.message_id, EMOJI_POR_TIPO.desperdicio);
    } else if (intencao.tipo === 'aquisicao') {
      // Estagio i->ii do pipeline: a aquisicao ja estoca o item (fisicamente
      // ja esta na casa), independente de quem/qual carteira pagou — isso e'
      // resolvido em paralelo, sem travar o estoque nessa bookkeeping.
      if (intencao.item_nome && intencao.item_state && intencao.item_storage) {
        const householdId = await getHouseholdId();
        await supabase.from('pantry_items').insert({
          household_id: householdId,
          name: intencao.item_nome,
          quantity: intencao.item_quantidade || 0,
          unit: intencao.item_unidade || 'unidade',
          state: intencao.item_state,
          storage: intencao.item_storage,
          source: 'telegram',
        });
      }

      // Compra relatada no chat tambem fecha item pendente da lista de
      // compras, igual a ingestao de nota fiscal faz.
      if (intencao.item_nome) {
        await marcarCompradoNaLista(intencao.item_nome).catch((err) =>
          console.warn('Nao consegui cruzar aquisicao com a lista de compras:', err.message)
        );
      }

      const temCategoria = !!intencao.budget_categoria;
      const { data: pensamento } = await supabase
        .from('pensamentos')
        .insert({
          actor_id: actor.id,
          tipo: 'aquisicao',
          descricao: intencao.descricao,
          data: intencao.data || hoje,
          custo: intencao.custo ?? null,
          budget_categoria: intencao.budget_categoria || null,
          status: temCategoria ? 'completo' : 'aguardando_categoria',
          trace_id: traceId,
        })
        .select()
        .single();

      await reagir(chatId, message.message_id, EMOJI_POR_TIPO.aquisicao);
      if (!temCategoria && pensamento) await perguntarOrcamento(chatId, pensamento.id);
    } else {
      await supabase.from('pensamentos').insert({
        actor_id: actor.id,
        tipo: intencao.tipo,
        descricao: intencao.descricao,
        data: intencao.data || null,
        calorias: intencao.calorias ?? null,
        custo: intencao.custo ?? null,
        trace_id: traceId,
      });
      await reagir(chatId, message.message_id, EMOJI_POR_TIPO.desejo);
    }
  } catch (err) {
    console.error('Erro capturando relato/desejo/aquisicao via Telegram:', err.message);
    await enviarMensagem(chatId, '⚠️ Não consegui registrar essa — tenta de novo em instantes.');
  }
}

module.exports = { processarUpdate, enviarMensagem, perguntarIdentidade, getActorByTelegramId };
