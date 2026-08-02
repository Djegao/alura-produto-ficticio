require('./instrumentation'); // precisa ser o primeiro require do arquivo

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { supabase, getHouseholdId } = require('./tools');
const { sugerirReceita } = require('./agent');
const { ingerirNotaFiscal } = require('./nota-fiscal');

const app = express();

// Protege a app inteira com senha simples — ela roda com chaves reais e pagas
// (Anthropic/Supabase/Langfuse), entao nao pode ficar aberta ao publico sem gate.
function basicAuth(req, res, next) {
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

app.get('/api/estoque', async (req, res) => {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('household_id', householdId)
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

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
