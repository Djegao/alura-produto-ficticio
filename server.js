require('./instrumentation'); // precisa ser o primeiro require do arquivo

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { supabase, getHouseholdId, getWeekStart, getActorByRole, runTool } = require('./tools');
const { sugerirReceita, mediarCardapio } = require('./agent');
const { ingerirNotaFiscal } = require('./nota-fiscal');
const { ingerirRelato } = require('./relato-ingestao');
const { processarUpdate } = require('./telegram');
const { iniciarLembretes } = require('./lembrete');

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
};

const AVAILABLE_MODELS = ['claude-sonnet-5', 'claude-haiku-4-5', 'claude-opus-5'];

app.get('/api/config', (req, res) => {
  res.json({ ...currentConfig, availableModels: AVAILABLE_MODELS });
});

app.post('/api/config', (req, res) => {
  const { promptVersion, model } = req.body;
  if (promptVersion === 'v1' || promptVersion === 'v2') currentConfig.promptVersion = promptVersion;
  if (AVAILABLE_MODELS.includes(model)) currentConfig.model = model;
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

  const householdId = await getHouseholdId();
  const { model } = currentConfig;

  try {
    const result = await ingerirNotaFiscal({ filename, content, model });

    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        household_id: householdId,
        image_path: `texto:${filename || 'nota.md'}`,
        status: 'confirmado',
        model_used: model,
        trace_id: result.traceId,
      })
      .select()
      .single();
    if (receiptError) return res.status(500).json({ error: receiptError.message });

    const itemsAdded = [];
    for (const item of result.itens) {
      const { data, error } = await supabase
        .from('pantry_items')
        .insert({
          household_id: householdId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          state: item.state,
          storage: item.storage,
          source: 'nota_fiscal',
        })
        .select()
        .single();
      if (!error) itemsAdded.push(data);

      await supabase.from('receipt_items').insert({
        receipt_id: receipt.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        state_guess: item.state,
        confirmed: true,
      });
    }

    res.json({ receipt, itemsAdded, traceId: result.traceId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// Recebe texto livre de qualquer ator (o form web manda "ator" explicito; o
// Telegram, quando existir, resolve via telegram_user_id antes de chamar
// esta mesma logica). Classifica com o Agente de Ingestao e so persiste
// relato de refeicao diretamente — "desejo" e devolvido pro front decidir
// se abre uma mediacao, nunca gravado como se fosse fato.
app.post('/api/relatos', async (req, res) => {
  const { texto, ator } = req.body;
  if (!texto || !ator) return res.status(400).json({ error: 'texto e ator sao obrigatorios' });

  const { model } = currentConfig;
  const hoje = new Date().toISOString().slice(0, 10);

  try {
    const { intencao, traceId } = await ingerirRelato({ texto, dataReferencia: hoje, model, canal: 'manual' });
    const actor = await getActorByRole(ator);

    // Todo pensamento classificado entra no log (painel "balao de pensamento"),
    // relato de refeicao OU desejo — sem distincao de importancia aqui.
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
      const resultado = await runTool('registrar_relato_refeicao', {
        ator,
        data: intencao.data || hoje,
        descricao: intencao.descricao,
        fonte: 'manual',
        calorias: intencao.calorias,
        custo: intencao.custo,
      });
      return res.json({ intencao, traceId, registrado: resultado });
    }

    res.json({ intencao, traceId, registrado: null });
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

  const { data, error } = await supabase
    .from('pensamentos')
    .select('*')
    .in('actor_id', actorIds)
    .order('created_at', { ascending: false });
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

// ---- Kanban "Musa Balance": 3 estagios ativos + Porcionamento/Consumo -----
// Despensa NAO entra aqui — e' funcao separada (GET /api/estoque, decisao
// 2026-08-02). O Kanban so mostra trabalho em andamento, por definicao
// pequeno: Plano Semanal (desejo + proposta aberta), Pre-preparo
// (branqueado), Preparo (decisao confirmada, ainda nao porcionada),
// Porcionamento (lote intocado) e Consumo (lote em uso).

app.get('/api/kanban', async (req, res) => {
  const householdId = await getHouseholdId();

  // Nunca engolir erro de query em silencio (nem que seja pra cair num "[]"
  // que parece vazio de verdade) — cada consulta propaga o proprio erro em
  // vez de mascarar com fallback, senao um problema real de schema vira uma
  // coluna vazia sem explicacao nenhuma.
  const semSilencio = (promise) =>
    promise.then(({ data, error }) => {
      if (error) throw new Error(error.message);
      return data;
    });

  try {
    const [validadeEstoque, decisoes, pensamentosRecentes, preparados] = await Promise.all([
      runTool('consultar_validade_estoque', {}),
      semSilencio(
        supabase
          .from('trade_off_decisions')
          .select('*')
          .eq('household_id', householdId)
          .is('porcionado_em', null)
          .order('created_at', { ascending: false })
      ),
      semSilencio(
        supabase
          .from('pensamentos')
          .select('*, actors!inner(name, role, household_id)')
          .eq('actors.household_id', householdId)
          .eq('tipo', 'desejo')
          .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
          .order('created_at', { ascending: false })
      ),
      semSilencio(
        supabase
          .from('pantry_items')
          .select('*')
          .eq('household_id', householdId)
          .eq('state', 'preparado')
          .gt('portions_remaining', 0)
      ),
    ]);

    const planoSemanal = [
      ...pensamentosRecentes.map((p) => ({
        kind: 'desejo',
        id: p.id,
        descricao: p.descricao,
        atorNome: p.actors?.name,
        criadoEm: p.created_at,
      })),
      ...decisoes
        .filter((d) => !d.escolha)
        .map((d) => ({ kind: 'proposta_aberta', id: d.id, proposta: d.proposta, criadoEm: d.created_at })),
    ];

    const preparo = decisoes
      .filter((d) => !!d.escolha)
      .map((d) => ({ kind: 'decisao_confirmada', id: d.id, proposta: d.proposta, escolha: d.escolha, criadoEm: d.created_at }));

    const prePreparo = validadeEstoque.filter((item) => item.blanched_at);

    const porcionamento = preparados.filter((p) => p.portions_remaining === p.portions_total);
    const consumo = preparados.filter((p) => p.portions_remaining < p.portions_total);

    res.json({ planoSemanal, prePreparo, preparo, porcionamento, consumo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kanban/acao', async (req, res) => {
  const { acao } = req.body;
  const householdId = await getHouseholdId();

  try {
    if (acao === 'branquear') {
      const { item_id } = req.body;
      const { data, error } = await supabase
        .from('pantry_items')
        .update({ blanched_at: new Date().toISOString() })
        .eq('id', item_id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return res.json(data);
    }

    if (acao === 'porcionar') {
      // So um humano que cozinhou de verdade sabe o rendimento — por isso
      // essa acao e' sempre manual, nunca automatizada pelo Mediador.
      const { trade_off_decision_id, nome, porcoes, unidade } = req.body;
      if (!nome || !porcoes) return res.status(400).json({ error: 'nome e porcoes sao obrigatorios' });

      const { data: item, error: itemError } = await supabase
        .from('pantry_items')
        .insert({
          household_id: householdId,
          name: nome,
          quantity: porcoes,
          unit: unidade || 'porção',
          state: 'preparado',
          storage: 'perecivel',
          source: 'kanban',
          prepared_at: new Date().toISOString(),
          portions_total: porcoes,
          portions_remaining: porcoes,
        })
        .select()
        .single();
      if (itemError) throw new Error(itemError.message);

      if (trade_off_decision_id) {
        await supabase
          .from('trade_off_decisions')
          .update({ porcionado_em: new Date().toISOString() })
          .eq('id', trade_off_decision_id);
      }
      return res.json(item);
    }

    if (acao === 'consumir') {
      const { pantry_item_id, quantidade } = req.body;
      const { data: item, error: fetchError } = await supabase
        .from('pantry_items')
        .select('portions_remaining')
        .eq('id', pantry_item_id)
        .single();
      if (fetchError) throw new Error(fetchError.message);

      const novoRestante = Math.max(0, Number(item.portions_remaining) - (Number(quantidade) || 1));
      const { data, error } = await supabase
        .from('pantry_items')
        .update({ portions_remaining: novoRestante, updated_at: new Date().toISOString() })
        .eq('id', pantry_item_id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return res.json(data);
    }

    res.status(400).json({ error: `acao desconhecida: ${acao}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
    await processarUpdate(req.body, { model: currentConfig.model });
  } catch (err) {
    console.error('Erro processando update do Telegram:', err.message);
  }
});

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  iniciarLembretes();
});
