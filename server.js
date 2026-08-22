require('./instrumentation'); // precisa ser o primeiro require do arquivo

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { supabase, getHouseholdId, getWeekStart, getActorByRole, runTool } = require('./tools');
const { sugerirReceita, mediarCardapio } = require('./agent');
const { ingerirNotaFiscal, estocarItensDaNota } = require('./nota-fiscal');
const { ingerirNotaSefaz } = require('./sefaz');
const { ingerirRelato } = require('./relato-ingestao');
const { aplicarIntencao } = require('./intencao-efeitos');
const { processarUpdate } = require('./telegram');
const { iniciarLembretes } = require('./lembrete');
const { sugerirReceitaPremium, iniciarReceitaPremium } = require('./receita-premium');

const app = express();

// Protege a app inteira com senha simples — ela roda com chaves reais e pagas
// (Anthropic/Supabase/Langfuse), entao nao pode ficar aberta ao publico sem gate.
function basicAuth(req, res, next) {
  // O Telegram nao manda Basic Auth — esse endpoint se protege sozinho via
  // secret_token (checado dentro da propria rota), nao pelo gate geral.
  if (req.path === '/api/telegram/webhook') return next();

  const { APP_USER, APP_PASSWORD } = process.env;
  if (!APP_USER || !APP_PASSWORD) return next(); // sem credenciais configuradas = sem gate (uso local)

  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
    const userOk = user && user.length === APP_USER.length && crypto.timingSafeEqual(Buffer.from(user), Buffer.from(APP_USER));
    const passOk = pass && pass.length === APP_PASSWORD.length && crypto.timingSafeEqual(Buffer.from(pass), Buffer.from(APP_PASSWORD));
    if (userOk && passOk) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Chef Caseiro"');
  res.status(401).send('Autenticacao necessaria.');
}

app.use(basicAuth);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Estado global simples so para permitir alternar os eixos ao vivo durante a
// gravacao da Aula 4 (detectar degradacao -> trocar prompt/modelo -> validar melhoria).
let currentConfig = {
  promptVersion: 'v1',
  model: 'claude-sonnet-5',
  // v4 "Feed vivo": eixo de custo separado — a classificacao conversacional
  // (agente de ingestao) roda num modelo barato por padrao; o modelo de
  // geracao (mediador, receita, nota) continua sendo o eixo `model`.
  modelIngestao: 'claude-haiku-4-5',
};

const AVAILABLE_MODELS = ['claude-sonnet-5', 'claude-haiku-4-5', 'claude-opus-5'];

app.get('/api/config', (req, res) => {
  res.json({ ...currentConfig, availableModels: AVAILABLE_MODELS });
});

app.post('/api/config', (req, res) => {
  const { promptVersion, model, modelIngestao } = req.body;
  if (promptVersion === 'v1' || promptVersion === 'v2') currentConfig.promptVersion = promptVersion;
  if (AVAILABLE_MODELS.includes(model)) currentConfig.model = model;
  if (AVAILABLE_MODELS.includes(modelIngestao)) currentConfig.modelIngestao = modelIngestao;
  res.json(currentConfig);
});

// ---- Estoque (pantry_items) ----

// So a despensa "assentada" — itens preparados vivem no Kanban
// (Porcionamento/Consumo), nao aqui (decisao 2026-08-02, ver plano de
// redesenho: Despensa e' funcao fora do fluxo ativo).
app.get('/api/estoque', async (req, res) => {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('household_id', householdId)
    .neq('state', 'preparado')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/estoque', async (req, res) => {
  const { name, quantity, unit, state, storage } = req.body;
  if (!name || !state) return res.status(400).json({ error: 'name e state sao obrigatorios' });
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('pantry_items')
    .insert({
      household_id: householdId,
      name,
      quantity: quantity || 0,
      unit: unit || 'unidade',
      state,
      storage: storage === 'perecivel' ? 'perecivel' : 'seco',
      source: 'manual',
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/estoque/:id', async (req, res) => {
  const { error } = await supabase.from('pantry_items').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ---- Ingestao de nota fiscal (texto/markdown por enquanto) ----

app.post('/api/notas-fiscais', async (req, res) => {
  const { filename, content } = req.body;
  if (!content) return res.status(400).json({ error: 'content e obrigatorio' });

  const { model } = currentConfig;

  try {
    const result = await ingerirNotaFiscal({ filename, content, model });

    // Usa a MESMA persistencia do caminho SEFAZ. Na fase 5 esta rota ficou
    // com uma copia inline "pra nao refatorar conteudo de aula", mas o teste
    // de ponta a ponta de 2026-08-21 mostrou o efeito colateral: so o SEFAZ
    // e o chat fechavam item pendente da lista de compras, e a nota por
    // texto nao — dois caminhos com comportamentos diferentes, exatamente o
    // que a v4 matou no chat. Um caminho so.
    const { receipt, itemsAdded } = await estocarItensDaNota({
      itens: result.itens,
      traceId: result.traceId,
      model,
      origem: `texto:${filename || 'nota.md'}`,
    });

    res.json({ receipt, itemsAdded, traceId: result.traceId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ingestao direto da SEFAZ, pela URL do QR code da NFC-e — sem custo nem
// intermediario (a pagina publica de consulta do estado emissor vira texto e
// cai no mesmo extrator LLM da rota acima). Ver sefaz.js.
app.post('/api/notas-fiscais/sefaz', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url e obrigatoria (link do QR code da NFC-e)' });

  const { model } = currentConfig;
  try {
    const { itens, traceId, chave } = await ingerirNotaSefaz({ url, model });
    const { receipt, itemsAdded } = await estocarItensDaNota({ itens, traceId, model, origem: `sefaz:${chave}` });
    res.json({ receipt, itemsAdded, traceId, chave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Lista de compras (alimentada pelo Mediador, pela receita premium e
// manualmente; itens viram 'comprado' quando a compra chega via chat/nota) ----

app.get('/api/lista-compras', async (req, res) => {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/lista-compras', async (req, res) => {
  const { name, quantity, unit, motivo } = req.body;
  if (!name) return res.status(400).json({ error: 'name e obrigatorio' });
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('shopping_list_items')
    .insert({
      household_id: householdId,
      name,
      quantity: quantity ?? null,
      unit: unit ?? null,
      motivo: motivo ?? null,
      status: 'pendente',
      source: 'manual',
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/lista-compras/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['pendente', 'comprado', 'dispensado'].includes(status)) {
    return res.status(400).json({ error: 'status invalido' });
  }
  const { data, error } = await supabase
    .from('shopping_list_items')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/lista-compras/:id', async (req, res) => {
  const { error } = await supabase.from('shopping_list_items').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ---- Receita premium semanal (canal do Mohamad Hindi) ----

app.post('/api/receita-premium', async (req, res) => {
  try {
    const result = await sugerirReceitaPremium({ model: currentConfig.model, force: !!req.body?.force });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/receitas-premium', async (req, res) => {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('premium_suggestions')
    .select('*')
    .eq('household_id', householdId)
    .order('week_start', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---- Preferencias ----

app.get('/api/preferencias', async (req, res) => {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('preferences')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/preferencias', async (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'description e obrigatoria' });
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('preferences')
    .insert({ household_id: householdId, description })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/preferencias/:id', async (req, res) => {
  const { error } = await supabase.from('preferences').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ---- Sugestao de receita/cardapio (o nucleo agentico) ----

app.post('/api/sugestao', async (req, res) => {
  const { promptText } = req.body;
  if (!promptText) return res.status(400).json({ error: 'promptText e obrigatorio' });

  const householdId = await getHouseholdId();
  const { promptVersion, model } = currentConfig;

  const { data: request, error: requestError } = await supabase
    .from('meal_requests')
    .insert({ household_id: householdId, prompt_text: promptText })
    .select()
    .single();
  if (requestError) return res.status(500).json({ error: requestError.message });

  try {
    const result = await sugerirReceita({ promptText, model, promptVersion });

    const { data: suggestion, error: suggestionError } = await supabase
      .from('meal_suggestions')
      .insert({
        meal_request_id: request.id,
        suggestion_text: result.text,
        model_used: model,
        prompt_version: promptVersion,
        trace_id: result.traceId,
        items_used: result.itemsUsed,
      })
      .select()
      .single();
    if (suggestionError) return res.status(500).json({ error: suggestionError.message });

    res.json({ ...suggestion, toolCallCount: result.toolCallCount });
  } catch (err) {
    res.status(500).json({ error: err.message, requestId: request.id });
  }
});

app.get('/api/sugestoes', async (req, res) => {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('meal_suggestions')
    .select('*, meal_requests!inner(household_id, prompt_text), stock_consumptions(id, confirmed_at)')
    .eq('meal_requests.household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/sugestoes/:id/confirmar', async (req, res) => {
  const { data: suggestion, error: sErr } = await supabase
    .from('meal_suggestions')
    .select('items_used')
    .eq('id', req.params.id)
    .single();
  if (sErr) return res.status(500).json({ error: sErr.message });

  const itemsUsed = Array.isArray(suggestion.items_used) ? suggestion.items_used : [];
  const itemsConsumed = [];

  // Decrementa o estoque de verdade, so agora — nao na sugestao, so na
  // confirmacao ("fiz essa receita"). Guarda um retrato (nome/qtd/unidade)
  // no proprio registro de consumo, pra o log nao depender do item ainda
  // existir no estoque depois.
  for (const { item_id, quantidade } of itemsUsed) {
    const { data: item, error: iErr } = await supabase
      .from('pantry_items')
      .select('name, unit, quantity')
      .eq('id', item_id)
      .single();
    if (iErr || !item) continue; // item pode ter sido removido do estoque — ignora

    const used = Number(quantidade) || 0;
    const newQty = Math.max(0, Number(item.quantity) - used);
    await supabase
      .from('pantry_items')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', item_id);

    itemsConsumed.push({ name: item.name, quantity: used, unit: item.unit });
  }

  const { data, error } = await supabase
    .from('stock_consumptions')
    .insert({ meal_suggestion_id: req.params.id, items_consumed: itemsConsumed })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---- Log de consumo (exibido dentro da geladeira) ----

app.get('/api/consumos', async (req, res) => {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('stock_consumptions')
    .select('*, meal_suggestions!inner(suggestion_text, meal_requests!inner(household_id, prompt_text))')
    .eq('meal_suggestions.meal_requests.household_id', householdId)
    .order('confirmed_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---- v3 "Musa Balance": atores, relatos, orcamento semanal e mediacao ----

app.get('/api/atores', async (req, res) => {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('actors')
    .select('*')
    .eq('household_id', householdId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// v4 "Feed vivo": a conversa web. Substitui o antigo /api/relatos (que so
// gravava pensamento + meal_report, sem os outros efeitos) — agora o canal
// web classifica com o agente de ingestao no modelo BARATO (eixo
// modelIngestao) e cai no MESMO aplicarIntencao do Telegram. Um caminho de
// escrita so, três canais.
app.post('/api/conversa', async (req, res) => {
  const { texto, ator } = req.body;
  if (!texto || !ator) return res.status(400).json({ error: 'texto e ator sao obrigatorios' });

  const { modelIngestao } = currentConfig;
  const hoje = new Date().toISOString().slice(0, 10);

  try {
    const actor = await getActorByRole(ator);
    const { intencao, traceId } = await ingerirRelato({ texto, dataReferencia: hoje, model: modelIngestao, canal: 'web' });
    const { pensamento, efeitos, pergunta } = await aplicarIntencao({ intencao, actor, canal: 'web', traceId });
    res.json({ intencao, efeitos, pergunta, pensamento, traceId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Painel "balao de pensamento" — so leitura por enquanto (SDD/UI decisao
// 2026-08-02): mostra o que foi capturado, sem form de entrada no web ainda.
app.get('/api/pensamentos', async (req, res) => {
  const householdId = await getHouseholdId();
  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select('id, name, role')
    .eq('household_id', householdId);
  if (actorsError) return res.status(500).json({ error: actorsError.message });
  const actorIds = actors.map((a) => a.id);

  if (actorIds.length === 0) return res.json([]);

  // Teto no feed: sem isso a tela cresce sem limite conforme a casa usa o
  // produto (achado do QA de 2026-08-21). 200 cobre semanas de uso real; se
  // um dia precisar de historico completo, isso vira paginacao de verdade.
  const limite = Math.min(Number(req.query.limite) || 200, 500);
  const { data, error } = await supabase
    .from('pensamentos')
    .select('*')
    .in('actor_id', actorIds)
    .order('created_at', { ascending: false })
    .limit(limite);
  if (error) return res.status(500).json({ error: error.message });

  const actorById = Object.fromEntries(actors.map((a) => [a.id, a]));
  res.json(data.map((p) => ({ ...p, actor: actorById[p.actor_id] || null })));
});

app.get('/api/orcamento-semanal', async (req, res) => {
  try {
    const saldo = await runTool('consultar_orcamento_semanal', {});
    res.json(saldo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orcamento-semanal', async (req, res) => {
  const { calorie_cap, financial_cap } = req.body;
  const householdId = await getHouseholdId();
  const weekStart = getWeekStart();
  const { data, error } = await supabase
    .from('weekly_budgets')
    .upsert(
      { household_id: householdId, week_start: weekStart, calorie_cap, financial_cap },
      { onConflict: 'household_id,week_start' }
    )
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// O nucleo agentico da v3: o Agente Mediador NAO decide sozinho — expoe a
// proposta e o trade-off, e so grava "escolha" se o proprio Claude ja
// capturou uma na conversa. A decisao final continua sendo do casal.
app.post('/api/mediacao', async (req, res) => {
  const { promptText } = req.body;
  if (!promptText) return res.status(400).json({ error: 'promptText e obrigatorio' });

  const householdId = await getHouseholdId();
  const { model } = currentConfig;

  try {
    const result = await mediarCardapio({ promptText, model });

    const { data: decisao, error } = await supabase
      .from('trade_off_decisions')
      .insert({
        household_id: householdId,
        week_start: getWeekStart(),
        proposta: result.proposta || {},
        escolha: result.escolha || null,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });

    res.json({ ...decisao, text: result.text, traceId: result.traceId, toolCallCount: result.toolCallCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mediacoes', async (req, res) => {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('trade_off_decisions')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---- Configuracoes quantitativas (repositorio editavel) ----

app.get('/api/config-quantitativo', async (req, res) => {
  const householdId = await getHouseholdId();
  const [householdRes, actorsRes, targetsRes] = await Promise.all([
    supabase.from('households').select('dias_validade_pos_branqueamento').eq('id', householdId).single(),
    supabase.from('actors').select('id, name, role').eq('household_id', householdId),
    supabase.from('actor_daily_targets').select('*'),
  ]);
  if (householdRes.error) return res.status(500).json({ error: householdRes.error.message });
  if (actorsRes.error) return res.status(500).json({ error: actorsRes.error.message });
  if (targetsRes.error) return res.status(500).json({ error: targetsRes.error.message });

  const household = householdRes.data;
  const actors = actorsRes.data;
  const targets = targetsRes.data;
  const targetByActor = Object.fromEntries((targets || []).map((t) => [t.actor_id, t]));
  res.json({
    diasValidadePosBranqueamento: household?.dias_validade_pos_branqueamento ?? 6,
    atores: (actors || []).map((a) => ({
      id: a.id,
      nome: a.name,
      role: a.role,
      calorieCapDaily: targetByActor[a.id]?.calorie_cap_daily ?? null,
      proteinG: targetByActor[a.id]?.protein_g ?? null,
      carbsG: targetByActor[a.id]?.carbs_g ?? null,
      fatG: targetByActor[a.id]?.fat_g ?? null,
    })),
    budgetCategorias: ['tr_diego', 'tr_esposa', 'credito_familia'],
  });
});

app.post('/api/config-quantitativo/validade', async (req, res) => {
  const { dias } = req.body;
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('households')
    .update({ dias_validade_pos_branqueamento: dias })
    .eq('id', householdId)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/config-quantitativo/metas', async (req, res) => {
  const { actor_id, calorie_cap_daily, protein_g, carbs_g, fat_g } = req.body;
  if (!actor_id) return res.status(400).json({ error: 'actor_id e obrigatorio' });
  const { data, error } = await supabase
    .from('actor_daily_targets')
    .upsert(
      { actor_id, calorie_cap_daily, protein_g, carbs_g, fat_g, updated_at: new Date().toISOString() },
      { onConflict: 'actor_id' }
    )
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---- v4 "Feed vivo": estado derivado da cozinha ---------------------------
// O Kanban morreu em 2026-08-21 (decisao registrada no CLAUDE.md/SDD): a
// estrutura de 5 estagios exigia eventos num formato que a vida da casa nao
// produz. O que ele fazia de util — estado de relance — sobrevive aqui como
// faixa de leitura derivada: porcoes vivas, o que esta vencendo, e o saldo
// da semana. Tudo calculado em codigo, nada interativo. As ACOES que eram
// botoes de coluna (branquear/porcionar/consumir) viraram frases na conversa
// (ver intencao-efeitos.js).

app.get('/api/estado-cozinha', async (req, res) => {
  const householdId = await getHouseholdId();

  // Convencao mantida do endpoint morto: nenhuma consulta cai em silencio.
  const semSilencio = (promise) =>
    promise.then(({ data, error }) => {
      if (error) throw new Error(error.message);
      return data;
    });

  try {
    const [validadeEstoque, orcamento, preparados] = await Promise.all([
      runTool('consultar_validade_estoque', {}),
      runTool('consultar_orcamento_semanal', {}),
      semSilencio(
        supabase
          .from('pantry_items')
          .select('id, name, portions_total, portions_remaining, prepared_at')
          .eq('household_id', householdId)
          .eq('state', 'preparado')
          .gt('portions_remaining', 0)
          .order('prepared_at', { ascending: true, nullsFirst: true })
      ),
    ]);

    const agora = Date.now();
    const porcoesVivas = preparados.map((p) => ({
      ...p,
      dias_desde_preparo: p.prepared_at ? Math.floor((agora - new Date(p.prepared_at).getTime()) / 86400000) : null,
    }));

    const vencendo = validadeEstoque
      .filter((i) => i.blanched_at && i.dias_restantes != null)
      .sort((a, b) => a.dias_restantes - b.dias_restantes)
      .map((i) => ({ id: i.id, name: i.name, estado_conservacao: i.estado_conservacao, dias_restantes: i.dias_restantes }));

    res.json({ porcoesVivas, vencendo, orcamento });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Branquear pelo botao da despensa continua existindo (era a unica acao do
// Kanban que ja morava na tela certa) — agora como rota do proprio estoque.
app.post('/api/estoque/:id/branquear', async (req, res) => {
  const { data, error } = await supabase
    .from('pantry_items')
    .update({ blanched_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Webhook do Telegram — validado por secret_token (header proprio do
// Telegram), nao pelo Basic Auth geral da app (ver bypass em basicAuth acima).
app.post('/api/telegram/webhook', async (req, res) => {
  const secretEsperado = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secretEsperado) {
    const recebido = req.headers['x-telegram-bot-api-secret-token'];
    if (recebido !== secretEsperado) return res.sendStatus(401);
  }

  // Responde 200 imediatamente — o Telegram reenvia o update se demorar ou
  // se receber erro. O processamento real acontece depois, fora do request.
  res.sendStatus(200);

  try {
    await processarUpdate(req.body, { model: currentConfig.model, modelIngestao: currentConfig.modelIngestao });
  } catch (err) {
    console.error('Erro processando update do Telegram:', err.message);
  }
});

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  iniciarLembretes();
  // O job le o modelo na hora de rodar (getter), pra respeitar troca de eixo
  // ao vivo feita no painel entre uma sexta e outra.
  iniciarReceitaPremium(() => currentConfig.model);
});
