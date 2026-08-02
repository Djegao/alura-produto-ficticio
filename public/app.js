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
// Agrupado por "storage" (geladeira/despensa) — cada grupo e' uma grade de
// cards que quebra linha sozinha, sem precisar de scroll horizontal.

const STATE_LABEL = { base: 'base', ingrediente: 'ingrediente', preparado: 'preparado' };

function renderEstoqueGroup(containerId, countId, items) {
  const container = $(containerId);
  $(countId).textContent = items.length ? `(${items.length})` : '';
  if (!items.length) {
    container.innerHTML = '<div class="empty">Nada por aqui ainda.</div>';
    return;
  }
  container.innerHTML = items
    .map(
      (it) => `
    <div class="item-card">
      <strong>${escapeHtml(it.name)}</strong>
      <span class="qty">${it.quantity} ${escapeHtml(it.unit)}</span>
      <span class="pill ${it.state}">${STATE_LABEL[it.state]}</span>
      <button class="item-card__remove" data-del-estoque="${it.id}" title="remover" aria-label="remover ${escapeHtml(it.name)}">×</button>
    </div>`
    )
    .join('');
}

async function loadEstoque() {
  const items = await api('/api/estoque');
  renderEstoqueGroup('estoque-perecivel', 'count-perecivel', items.filter((i) => i.storage === 'perecivel'));
  renderEstoqueGroup('estoque-seco', 'count-seco', items.filter((i) => i.storage !== 'perecivel'));
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
      storage: $('estoque-storage').value,
    }),
  });
  $('estoque-name').value = '';
  $('estoque-qty').value = '';
  $('estoque-unit').value = '';
  loadEstoque();
});

async function handleRemoveEstoque(e) {
  const id = e.target.dataset.delEstoque;
  if (!id) return;
  await api(`/api/estoque/${id}`, { method: 'DELETE' });
  loadEstoque();
}
$('estoque-perecivel').addEventListener('click', handleRemoveEstoque);
$('estoque-seco').addEventListener('click', handleRemoveEstoque);

// ---- Importar nota fiscal (texto/markdown) ----

$('btn-importar-nota').addEventListener('click', async () => {
  const fileInput = $('nota-file');
  const file = fileInput.files[0];
  const status = $('nota-status');
  if (!file) {
    status.textContent = 'Escolha um arquivo primeiro.';
    return;
  }

  status.textContent = 'Lendo e extraindo itens...';
  try {
    const content = await file.text();
    const result = await api('/api/notas-fiscais', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, content }),
    });
    status.textContent = `${result.itemsAdded.length} itens adicionados ao estoque (trace: ${result.traceId}).`;
    fileInput.value = '';
    loadEstoque();
  } catch (err) {
    status.textContent = `Erro: ${err.message}`;
  }
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
  loadConsumos();
  loadEstoque(); // quantidades podem ter mudado — o consumo decrementa de verdade
});

// ---- Log de consumo (dentro da geladeira) ----

async function loadConsumos() {
  const items = await api('/api/consumos');
  const box = $('consumos-list');
  if (!items.length) {
    box.innerHTML = '<div class="empty">Nenhum consumo confirmado ainda.</div>';
    return;
  }
  const total = items.length;
  box.innerHTML = items
    .map((c, idx) => {
      const numero = total - idx;
      const chips = (c.items_consumed || [])
        .map((it) => `<span class="consumo-chip">${escapeHtml(it.name)} — ${it.quantity} ${escapeHtml(it.unit || '')}</span>`)
        .join('');
      const promptText = c.meal_suggestions?.meal_requests?.prompt_text || '';
      return `
      <div class="consumo-item">
        <div class="receita">Receita #${numero} — "${escapeHtml(promptText)}"</div>
        <div class="itens">${chips || '<span class="empty">sem itens detalhados</span>'}</div>
        <div class="quando">${new Date(c.confirmed_at).toLocaleString('pt-BR')}</div>
      </div>`;
    })
    .join('');
}

// ---- Objetos da cozinha (geladeira / livro / bloco de notas) ----
// Cada objeto e um portal: clicar abre a porta/capa e revela o painel
// correspondente. So um objeto fica aberto por vez, como gavetas de verdade.

const kitchenObjects = [
  { card: $('card-fridge'), trigger: $('trigger-fridge'), panel: $('panel-fridge') },
  { card: $('card-book'), trigger: $('trigger-book'), panel: $('panel-book') },
  { card: $('card-note'), trigger: $('trigger-note'), panel: $('panel-note') },
];

function closeKitchenObject(obj) {
  obj.card.classList.remove('open');
  obj.panel.classList.remove('open');
  obj.trigger.setAttribute('aria-expanded', 'false');
}

function openKitchenObject(obj) {
  kitchenObjects.forEach((other) => {
    if (other !== obj) closeKitchenObject(other);
  });
  obj.card.classList.add('open');
  obj.panel.classList.add('open');
  obj.trigger.setAttribute('aria-expanded', 'true');
}

kitchenObjects.forEach((obj) => {
  obj.trigger.addEventListener('click', () => {
    if (obj.card.classList.contains('open')) closeKitchenObject(obj);
    else openKitchenObject(obj);
  });
});

// ---- Boot ----

Promise.all([loadConfig(), loadEstoque(), loadPreferencias(), loadHistory(), loadConsumos()]).catch((err) =>
  console.error('Erro ao carregar painel:', err)
);
