const $ = (id) => document.getElementById(id);

async function api(path, opts) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisicao');
  return data;
}

// ---- Config (eixos ao vivo) ----

async function loadConfig() {
  const cfg = await api('/api/config');
  $('cfg-prompt').value = cfg.promptVersion;
  $('cfg-model').innerHTML = cfg.availableModels
    .map((m) => `<option value="${m}">${m}</option>`)
    .join('');
  $('cfg-model').value = cfg.model;
}

async function saveConfig() {
  const promptVersion = $('cfg-prompt').value;
  const model = $('cfg-model').value;
  $('cfg-status').textContent = 'salvando...';
  await api('/api/config', { method: 'POST', body: JSON.stringify({ promptVersion, model }) });
  $('cfg-status').textContent = `ativo: ${promptVersion} / ${model}`;
  setTimeout(() => ($('cfg-status').textContent = ''), 2500);
}

$('cfg-prompt').addEventListener('change', saveConfig);
$('cfg-model').addEventListener('change', saveConfig);

// ---- Estoque ----

const STATE_LABEL = { base: 'base', ingrediente: 'ingrediente', preparado: 'preparado' };

async function loadEstoque() {
  const items = await api('/api/estoque');
  const list = $('estoque-list');
  if (!items.length) {
    list.innerHTML = '<div class="empty">Nenhum item ainda.</div>';
    return;
  }
  list.innerHTML = items
    .map(
      (it) => `
    <li>
      <span><strong>${it.name}</strong> — ${it.quantity} ${it.unit} <span class="pill ${it.state}">${STATE_LABEL[it.state]}</span></span>
      <button class="ghost" data-del-estoque="${it.id}">remover</button>
    </li>`
    )
    .join('');
}

$('btn-add-estoque').addEventListener('click', async () => {
  const name = $('estoque-name').value.trim();
  if (!name) return;
  await api('/api/estoque', {
    method: 'POST',
    body: JSON.stringify({
      name,
      quantity: Number($('estoque-qty').value) || 0,
      unit: $('estoque-unit').value.trim() || 'unidade',
      state: $('estoque-state').value,
    }),
  });
  $('estoque-name').value = '';
  $('estoque-qty').value = '';
  $('estoque-unit').value = '';
  loadEstoque();
});

$('estoque-list').addEventListener('click', async (e) => {
  const id = e.target.dataset.delEstoque;
  if (!id) return;
  await api(`/api/estoque/${id}`, { method: 'DELETE' });
  loadEstoque();
});

// ---- Preferencias ----

async function loadPreferencias() {
  const items = await api('/api/preferencias');
  const list = $('pref-list');
  if (!items.length) {
    list.innerHTML = '<div class="empty">Nenhuma preferencia ainda.</div>';
    return;
  }
  list.innerHTML = items
    .map(
      (p) => `
    <li>
      <span>${p.description}</span>
      <button class="ghost" data-del-pref="${p.id}">remover</button>
    </li>`
    )
    .join('');
}

$('btn-add-pref').addEventListener('click', async () => {
  const description = $('pref-text').value.trim();
  if (!description) return;
  await api('/api/preferencias', { method: 'POST', body: JSON.stringify({ description }) });
  $('pref-text').value = '';
  loadPreferencias();
});

$('pref-list').addEventListener('click', async (e) => {
  const id = e.target.dataset.delPref;
  if (!id) return;
  await api(`/api/preferencias/${id}`, { method: 'DELETE' });
  loadPreferencias();
});

// ---- Sugestao ----

$('btn-sugerir').addEventListener('click', async () => {
  const promptText = $('prompt-text').value.trim();
  if (!promptText) return;
  const btn = $('btn-sugerir');
  btn.disabled = true;
  $('sugerir-status').textContent = 'consultando estoque e preferencias, gerando sugestao...';
  $('suggestion-result').innerHTML = '';

  try {
    const s = await api('/api/sugestao', { method: 'POST', body: JSON.stringify({ promptText }) });
    $('sugerir-status').textContent = '';
    $('suggestion-result').innerHTML = renderSuggestion(s);
    loadHistory();
  } catch (err) {
    $('sugerir-status').textContent = '';
    $('suggestion-result').innerHTML = `<div class="err">${err.message}</div>`;
  } finally {
    btn.disabled = false;
  }
});

function renderSuggestion(s) {
  return `
    <div class="suggestion">
      <div class="meta">
        <span>modelo: <code>${s.model_used}</code></span>
        <span>prompt: <code>${s.prompt_version}</code></span>
        <span>chamadas de ferramenta: <code>${s.toolCallCount ?? '—'}</code></span>
        ${s.trace_id ? `<span>trace: <code>${s.trace_id}</code></span>` : ''}
      </div>
      <div class="text">${formatSuggestion(s.suggestion_text)}</div>
    </div>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Formatacao minima o suficiente pra deixar a resposta do Claude legivel
// (ele responde em markdown leve: ##, **negrito**, - listas).
function formatSuggestion(str) {
  return escapeHtml(str)
    .replace(/^## (.+)$/gm, '<strong style="font-size:15px">$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '&nbsp;&nbsp;• $1');
}

// ---- Historico ----

async function loadHistory() {
  const items = await api('/api/sugestoes');
  const box = $('history-list');
  if (!items.length) {
    box.innerHTML = '<div class="empty">Nenhuma sugestao ainda.</div>';
    return;
  }
  box.innerHTML = items
    .map((s) => {
      const confirmed = s.stock_consumptions && s.stock_consumptions.length > 0;
      return `
      <div class="history-item">
        <div class="prompt">"${escapeHtml(s.meal_requests?.prompt_text || '')}"</div>
        <div class="text">${formatSuggestion(s.suggestion_text)}</div>
        <div class="meta" style="margin-top:8px">
          <span><code>${s.model_used}</code></span>
          <span><code>${s.prompt_version}</code></span>
          ${
            confirmed
              ? '<span class="status-ok">✓ receita preparada, estoque confirmado</span>'
              : `<button class="ghost" data-confirm="${s.id}">marcar como preparada</button>`
          }
        </div>
      </div>`;
    })
    .join('');
}

$('history-list').addEventListener('click', async (e) => {
  const id = e.target.dataset.confirm;
  if (!id) return;
  await api(`/api/sugestoes/${id}/confirmar`, { method: 'POST' });
  loadHistory();
});

// ---- Objetos da cozinha (geladeira / livro / bloco de notas) ----
// Cada objeto e um portal: clicar abre a porta/capa e revela o painel
// correspondente. So um objeto fica aberto por vez, como gavetas de verdade.

function setupKitchenObject(cardId, triggerId, panelId) {
  const card = $(cardId);
  const trigger = $(triggerId);
  const panel = $(panelId);

  function open() {
    document.querySelectorAll('.object-card.open').forEach((el) => {
      if (el !== card) closeCard(el);
    });
    card.classList.add('open');
    panel.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
  }

  function closeCard(el) {
    el.classList.remove('open');
    const t = el.querySelector('.object-trigger');
    if (t) t.setAttribute('aria-expanded', 'false');
  }

  function close() {
    closeCard(card);
    panel.classList.remove('open');
  }

  trigger.addEventListener('click', () => {
    if (card.classList.contains('open')) close();
    else open();
  });
}

setupKitchenObject('card-fridge', 'trigger-fridge', 'panel-fridge');
setupKitchenObject('card-book', 'trigger-book', 'panel-book');
setupKitchenObject('card-note', 'trigger-note', 'panel-note');

// ---- Boot ----

Promise.all([loadConfig(), loadEstoque(), loadPreferencias(), loadHistory()]).catch((err) =>
  console.error('Erro ao carregar painel:', err)
);
