require('./instrumentation');

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { supabase, getHouseholdId } = require('./tools');
const { sugerirReceita } = require('./agent');

const app = express();

function basicAuth(req, res, next) {
  const { APP_USER, APP_PASSWORD } = process.env;
  if (!APP_USER || !APP_PASSWORD) return next();

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
  try {
    const householdId = await getHouseholdId();
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/estoque', async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/estoque/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('pantry_items').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Preferencias ----

app.get('/api/preferencias', async (req, res) => {
  try {
    const householdId = await getHouseholdId();
    const { data, error } = await supabase
      .from('preferences')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/preferencias', async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/preferencias/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('preferences').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Sugestao de receita (nucleo agentico) ----

app.post('/api/sugestao', async (req, res) => {
  try {
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

    const result = await sugerirReceita({ promptText, model, promptVersion });

    const { data: suggestion, error: suggestionError } = await supabase
      .from('meal_suggestions')
      .insert({
        meal_request_id: request.id,
        suggestion_text: result.text,
        model_used: model,
        prompt_version: promptVersion,
        items_used: result.itemsUsed,
      })
      .select()
      .single();
    if (suggestionError) return res.status(500).json({ error: suggestionError.message });

    res.json({ ...suggestion, toolCallCount: result.toolCallCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sugestoes', async (req, res) => {
  try {
    const householdId = await getHouseholdId();
    const { data, error } = await supabase
      .from('meal_suggestions')
      .select('*, meal_requests!inner(household_id, prompt_text), stock_consumptions(id, confirmed_at)')
      .eq('meal_requests.household_id', householdId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sugestoes/:id/confirmar', async (req, res) => {
  try {
    const { data: suggestion, error: sErr } = await supabase
      .from('meal_suggestions')
      .select('items_used')
      .eq('id', req.params.id)
      .single();
    if (sErr) return res.status(500).json({ error: sErr.message });

    const itemsUsed = Array.isArray(suggestion.items_used) ? suggestion.items_used : [];
    const itemsConsumed = [];

    for (const { item_id, quantidade } of itemsUsed) {
      const { data: item, error: iErr } = await supabase
        .from('pantry_items')
        .select('name, unit, quantity')
        .eq('id', item_id)
        .single();
      if (iErr || !item) continue;

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/consumos', async (req, res) => {
  try {
    const householdId = await getHouseholdId();
    const { data, error } = await supabase
      .from('stock_consumptions')
      .select('*, meal_suggestions!inner(suggestion_text, meal_requests!inner(household_id, prompt_text))')
      .eq('meal_suggestions.meal_requests.household_id', householdId)
      .order('confirmed_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
