// v3 "Musa Balance": canal Telegram, rodando em paralelo ao web (decisao
// 2026-08-02 — nao substitui, so soma). Texto primeiro; audio fica pra
// depois (exige transcricao, formato OGG do Telegram precisa conversao).
//
// Onboarding: a primeira mensagem de um telegram_user_id desconhecido faz o
// PROPRIO bot perguntar quem e, com botoes (inline keyboard) — nao exige
// decorar comando nenhum. Quem tocar no botao manda um "callback_query" pro
// webhook (tipo de update diferente de mensagem de texto), tratado abaixo.
// /eusou_chef e /eusou_musa continuam funcionando tambem, como atalho.

const { supabase, getHouseholdId, getActorByRole } = require('./tools');
const { ingerirRelato } = require('./relato-ingestao');
const { aplicarIntencao } = require('./intencao-efeitos');
const { extrairUrlNfce, ingerirNotaSefaz } = require('./sefaz');
const { estocarItensDaNota } = require('./nota-fiscal');

const TELEGRAM_API = 'https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN;

// `fetch failed` do Node esconde a causa real (DNS, TLS, conexao recusada)
// numa mensagem generica — sem isso o log de producao nao diz nada util.
function detalharErro(err) {
  const causa = err?.cause;
  if (!causa) return err?.message || String(err);
  return `${err.message} (causa: ${causa.code || causa.message || causa})`;
}

async function enviarMensagem(chatId, text, replyMarkup) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN nao configurado — mensagem nao enviada:', text);
    return;
  }
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup }),
  });
  // A API do Telegram responde 200 com {ok:false} pra varios erros (chat
  // errado, texto vazio, markup invalido) — sem checar isso, uma mensagem
  // que nunca chegou parecia enviada com sucesso.
  if (!res.ok) {
    console.warn('Telegram recusou a mensagem:', res.status, (await res.text()).slice(0, 200));
  }
}

// Avisar o usuario NUNCA pode derrubar o fluxo: se o proprio aviso de erro
// falhar (rede caida), o erro original se perdia e o log so mostrava o
// segundo "fetch failed" — foi o que cegou o diagnostico em 2026-08-21.
async function avisar(chatId, text) {
  try {
    await enviarMensagem(chatId, text);
  } catch (err) {
    console.error('Nao consegui nem avisar o usuario no Telegram:', detalharErro(err));
  }
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
const EMOJI_POR_TIPO = { relato_refeicao: '👍', desejo: '🤔', aquisicao: '👍', desperdicio: '😢', branqueamento: '👍', porcionamento: '👍' };

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
// modelIngestao (eixo de custo, v4): a classificacao conversacional roda no
// modelo barato; `model` continua sendo o modelo de geracao (nota fiscal via
// link SEFAZ e /premium, que sao tarefas de extracao/escolha, nao roteamento).
async function processarUpdate(update, { model, modelIngestao }) {
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

  // Foto/audio ainda nao sao lidos — mas ANTES isso era um `return` mudo, e
  // quem mandava a foto do cupom nao recebia sinal nenhum de que o bot tinha
  // desistido (nem reacao, nem mensagem, nem log). Falhar em silencio e' o
  // unico pecado capital deste projeto; agora diz que nao sabe ler ainda.
  if (message && !message.text) {
    const tipo = message.photo ? 'foto' : message.voice || message.audio ? 'audio' : message.document ? 'documento' : 'esse formato';
    console.warn('Update ignorado — formato nao suportado:', tipo, '| chat:', message.chat?.id);
    if (message.chat?.id) {
      await avisar(
        message.chat.id,
        tipo === 'foto'
          ? '📷 Ainda não sei ler foto de cupom — leitura por imagem é a próxima camada. Por enquanto me manda o link do QR code da nota, ou o texto dela.'
          : `Ainda não sei processar ${tipo}. Por texto eu entendo tudo: relato, compra, desperdício, porcionamento e link de nota fiscal.`
      );
    }
    return;
  }
  if (!message) return;

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
      await avisar(chatId, "⚠️ Nao consegui fechar a receita premium agora: " + err.message);
    }
    return;
  }

  // Link do QR code de NFC-e no meio da mensagem: ingestao SEFAZ direto do
  // chat — busca a pagina publica da nota, extrai os itens de comida e
  // estoca. Resposta com o resumo do que entrou (aqui a resposta em texto se
  // justifica: e' resultado de acao pedida, nao comentario de conversa).
  const urlNfce = extrairUrlNfce(texto);

  // Se veio link mas nao e' NFC-e reconhecida, dizer isso em voz alta. Antes
  // a mensagem caia calada no classificador de relato e virava um "desejo"
  // sem sentido — o usuario mandava a nota e nao entendia por que nada
  // acontecia (episodio de 2026-08-21).
  if (!urlNfce && /https?:\/\//i.test(texto)) {
    const link = (texto.match(/https?:\/\/\S+/i) || [''])[0];
    console.warn('Link recebido mas nao reconhecido como NFC-e:', link.slice(0, 120));
    await avisar(
      chatId,
      'Recebi um link, mas não reconheci como consulta de NFC-e. Espero o endereço do QR code do cupom ' +
        '(domínio .gov.br com a chave de acesso de 44 dígitos). Se o seu veio encurtado, abre ele no navegador ' +
        'e me manda o endereço final.'
    );
    return;
  }

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
      await avisar(chatId, `🧾 Nota da SEFAZ ingerida — ${itemsAdded.length} itens no estoque:\n${resumo}`);
    } catch (err) {
      console.error('Erro ingerindo NFC-e via Telegram:', detalharErro(err), '| url:', urlNfce.url.slice(0, 120));
      await avisar(chatId, '⚠️ Nao consegui ler essa nota na SEFAZ: ' + err.message);
    }
    return;
  }

  // v4 "Feed vivo" (2026-08-21): o Telegram nao aplica mais efeito nenhum por
  // conta propria — classifica com o agente de ingestao (modelo barato) e
  // delega pro caminho unico de escrita (intencao-efeitos.js), o MESMO que a
  // conversa web usa. As convencoes de canal ficam aqui: captura silenciosa
  // vira reacao; pergunta do sistema (dado que so o humano tem) e' mensagem
  // de verdade; aquisicao sem carteira dispara os botoes de orcamento.
  try {
    const { intencao, traceId } = await ingerirRelato({
      texto,
      dataReferencia: hoje,
      model: modelIngestao || model,
      canal: 'telegram',
    });
    const { pensamento, efeitos, pergunta } = await aplicarIntencao({ intencao, actor, canal: 'telegram', traceId });

    if (pergunta) {
      await enviarMensagem(chatId, `🤔 ${pergunta}`);
      return;
    }

    await reagir(chatId, message.message_id, EMOJI_POR_TIPO[intencao.tipo] || '👍');
    if (pensamento && pensamento.status === 'aguardando_categoria') {
      await perguntarOrcamento(chatId, pensamento.id);
    }
  } catch (err) {
    console.error('Erro capturando relato/desejo/aquisicao via Telegram:', detalharErro(err));
    await avisar(chatId, '⚠️ Não consegui registrar essa — tenta de novo em instantes.');
  }
}

module.exports = { processarUpdate, enviarMensagem, perguntarIdentidade, getActorByTelegramId };
