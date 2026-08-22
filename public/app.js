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

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

// ---- Config (eixo ao vivo: modelo) ----

async function loadConfig() {
  const cfg = await api('/api/config');
  $('cfg-model').innerHTML = cfg.availableModels.map((m) => `<option value="${m}">${m}</option>`).join('');
  $('cfg-model').value = cfg.model;
}

async function saveConfig() {
  const model = $('cfg-model').value;
  $('cfg-status').textContent = 'salvando...';
  await api('/api/config', { method: 'POST', body: JSON.stringify({ model }) });
  $('cfg-status').textContent = `ativo: ${model}`;
  setTimeout(() => ($('cfg-status').textContent = ''), 2000);
}
$('cfg-model').addEventListener('change', saveConfig);

// ---- Atores (filtro) ----

let atoresCache = [];
async function loadAtores() {
  atoresCache = await api('/api/atores');
  const wrap = $('actor-filter');
  atoresCache.forEach((a) => {
    const btn = document.createElement('button');
    btn.className = 'actor-chip';
    btn.dataset.filter = a.role;
    btn.innerHTML = `<span class="actor-avatar ${a.role}">${a.name[0]}</span> ${escapeHtml(a.name)}`;
    wrap.appendChild(btn);
  });
  wrap.querySelectorAll('.actor-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      wrap.querySelectorAll('.actor-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      loadKanban(chip.dataset.filter);
    });
  });
}

// ---- Despensa (estoque assentado) ----

const STATE_LABEL = { base: 'base', ingrediente: 'ingrediente' };

function renderEstoqueGroup(containerId, countId, items) {
  const container = $(containerId);
  $(countId).textContent = items.length ? `(${items.length})` : '';
  if (!items.length) {
    container.innerHTML = '<div class="empty">Nada por aqui ainda.</div>';
    return;
  }
  container.innerHTML = items
    .map((it) => {
      const podeBranquear = it.storage === 'perecivel' && !it.blanched_at;
      return `
    <div class="item-card">
      <strong>${escapeHtml(it.name)}</strong>
      <span class="qty">${it.quantity} ${escapeHtml(it.unit)}</span>
      <span class="pill ${it.state}">${STATE_LABEL[it.state] || it.state}</span>
      ${podeBranquear ? `<div class="row"><button class="small" data-branquear="${it.id}">🔥 Branquear</button></div>` : ''}
      <button class="item-card__remove" data-del-estoque="${it.id}" title="remover" aria-label="remover ${escapeHtml(it.name)}">×</button>
    </div>`;
    })
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

async function handleEstoqueClick(e) {
  const delId = e.target.dataset.delEstoque;
  const branquearId = e.target.dataset.branquear;
  if (delId) {
    await api(`/api/estoque/${delId}`, { method: 'DELETE' });
    loadEstoque();
  } else if (branquearId) {
    await api('/api/kanban/acao', { method: 'POST', body: JSON.stringify({ acao: 'branquear', item_id: branquearId }) });
    loadEstoque();
    loadKanban(currentFilter);
  }
}
$('estoque-perecivel').addEventListener('click', handleEstoqueClick);
$('estoque-seco').addEventListener('click', handleEstoqueClick);

$('btn-importar-nota').addEventListener('click', async () => {
  const fileInput = $('nota-file');
  const file = fileInput.files[0];
  const status = $('nota-status');
  if (!file) { status.textContent = 'Escolha um arquivo primeiro.'; return; }
  status.textContent = 'Lendo e extraindo itens...';
  try {
    const content = await file.text();
    const result = await api('/api/notas-fiscais', { method: 'POST', body: JSON.stringify({ filename: file.name, content }) });
    status.textContent = `${result.itemsAdded.length} itens adicionados (trace: ${result.traceId}).`;
    fileInput.value = '';
    loadEstoque();
  } catch (err) {
    status.textContent = `Erro: ${err.message}`;
  }
});

$('btn-importar-sefaz').addEventListener('click', async () => {
  const url = $('nota-sefaz-url').value.trim();
  const status = $('nota-status');
  if (!url) { status.textContent = 'Cole o link do QR code da NFC-e primeiro.'; return; }
  status.textContent = 'Consultando a SEFAZ e extraindo itens...';
  try {
    const result = await api('/api/notas-fiscais/sefaz', { method: 'POST', body: JSON.stringify({ url }) });
    status.textContent = `${result.itemsAdded.length} itens adicionados da nota ${result.chave.slice(0, 8)}... (trace: ${result.traceId}).`;
    $('nota-sefaz-url').value = '';
    loadEstoque();
    loadListaCompras();
  } catch (err) {
    status.textContent = `Erro: ${err.message}`;
  }
});

// ---- Lista de compras ----

async function loadListaCompras() {
  const list = $('lista-compras');
  try {
    const items = await api('/api/lista-compras');
    const pendentes = items.filter((i) => i.status === 'pendente');
    $('count-lista').textContent = pendentes.length ? `(${pendentes.length})` : '';
    if (!pendentes.length) { list.innerHTML = '<div class="empty">Nada pendente pra comprar.</div>'; return; }
    list.innerHTML = pendentes
      .map(
        (i) => `<li><span>${escapeHtml(i.name)}${i.quantity ? ` — ${i.quantity} ${escapeHtml(i.unit || '')}` : ''}${i.motivo ? ` <em style="opacity:.7">(${escapeHtml(i.motivo)})</em>` : ''}</span>
          <span><button class="ghost" data-lista-comprado="${i.id}">comprado</button>
          <button class="ghost" data-lista-dispensar="${i.id}">dispensar</button></span></li>`
      )
      .join('');
  } catch (err) {
    // Antes da migracao fase 5 rodar no Supabase, a tabela nao existe — o
    // erro aparece aqui em vez de sumir (convencao: nunca falhar em silencio).
    $('count-lista').textContent = '';
    list.innerHTML = `<div class="empty">Erro na lista de compras: ${escapeHtml(err.message)}</div>`;
  }
}
$('lista-compras').addEventListener('click', async (e) => {
  const compradoId = e.target.dataset.listaComprado;
  const dispensarId = e.target.dataset.listaDispensar;
  if (!compradoId && !dispensarId) return;
  await api(`/api/lista-compras/${compradoId || dispensarId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status: compradoId ? 'comprado' : 'dispensado' }),
  });
  loadListaCompras();
});

// ---- Preferencias ----

async function loadPreferencias() {
  const items = await api('/api/preferencias');
  const list = $('pref-list');
  if (!items.length) { list.innerHTML = '<div class="empty">Nenhuma preferencia ainda.</div>'; return; }
  list.innerHTML = items.map((p) => `<li><span>${escapeHtml(p.description)}</span><button class="ghost" data-del-pref="${p.id}">remover</button></li>`).join('');
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

// ---- Atividade recente (pensamentos) ----

const TIPO_LABEL = { relato_refeicao: 'relato', desejo: 'desejo', aquisicao: 'aquisição', desperdicio: 'desperdício' };
const BUDGET_LABEL = { tr_diego: 'TR Diego', tr_esposa: 'TR Esposa', credito_familia: 'Crédito Família' };

async function loadPensamentos() {
  const items = await api('/api/pensamentos');
  const box = $('pensamentos-list');
  if (!items.length) { box.innerHTML = '<div class="empty">Nenhum pensamento capturado ainda.</div>'; return; }
  box.innerHTML = items
    .map((p) => {
      const extras = [];
      if (p.budget_categoria) extras.push(`<span class="pill gold">${BUDGET_LABEL[p.budget_categoria]}</span>`);
      if (p.fonte_refeicao) extras.push(`<span class="pill neutral">${p.fonte_refeicao}</span>`);
      if (p.dias_desde_preparo != null) extras.push(`<span class="pill bad">durou ${p.dias_desde_preparo}d</span>`);
      if (p.status === 'aguardando_categoria') extras.push(`<span class="pill warn">aguardando orçamento</span>`);
      return `
    <div class="pensamento-item">
      <span class="quem">${escapeHtml(p.actor?.name || '?')}</span>
      <span class="pill ${p.tipo}">${TIPO_LABEL[p.tipo] || p.tipo}</span>
      ${extras.join(' ')}
      <div>${escapeHtml(p.descricao)}</div>
      <div class="quando">${new Date(p.created_at).toLocaleString('pt-BR')}</div>
    </div>`;
    })
    .join('');
}

// ---- Kanban ----

let currentFilter = 'all';
let kanbanCache = null;

function pillFresco(item) {
  if (item.estado_conservacao === 'vencido') return `<span class="pill bad">vencido há ${Math.abs(item.dias_restantes)}d</span>`;
  if (item.estado_conservacao === 'branqueado') return `<span class="pill good">restam ${item.dias_restantes}d</span>`;
  return `<span class="pill neutral">fresco</span>`;
}

function cardPlanoSemanal(c) {
  if (c.kind === 'desejo') {
    return `
      <div class="kcard" data-actor="${c.atorAvatarRole || ''}">
        <div class="eyebrow">${escapeHtml(c.atorNome || '?')} · desejo</div>
        <h3>${escapeHtml(c.descricao)}</h3>
        <div class="actions"><button class="small" data-iniciar-preparo="${escapeHtml(c.descricao)}">🍳 Iniciar decisão</button></div>
      </div>`;
  }
  const opcoes = c.proposta && c.proposta.opcoes ? JSON.stringify(c.proposta).slice(0, 140) : 'proposta em aberto';
  return `
    <div class="kcard">
      <div class="eyebrow">proposta do Mediador</div>
      <h3>${escapeHtml(opcoes)}</h3>
      <div class="meta-row"><span class="pill warn">aguardando escolha</span></div>
    </div>`;
}

function cardPrePreparo(item) {
  return `
    <div class="kcard">
      <div class="eyebrow">${escapeHtml(item.name)}</div>
      <h3>${escapeHtml(item.name)}</h3>
      <div class="meta-row">${pillFresco(item)}</div>
    </div>`;
}

function cardPreparo(d) {
  const escolha = d.escolha && typeof d.escolha === 'object' ? JSON.stringify(d.escolha).slice(0, 160) : 'decisão confirmada';
  return `
    <div class="kcard">
      <div class="eyebrow">decisão confirmada</div>
      <h3>${escapeHtml(escolha)}</h3>
      <div class="actions">
        <button class="small" data-porcionar="${d.id}">🍽️ Porcionar</button>
      </div>
    </div>`;
}

function cardPorcionamentoOuConsumo(item, coluna) {
  const pct = (item.portions_remaining / item.portions_total) * 100;
  return `
    <div class="kcard draggable" data-id="${item.id}" data-col="${coluna}">
      <div class="eyebrow">preparado ${item.prepared_at ? new Date(item.prepared_at).toLocaleDateString('pt-BR') : ''}</div>
      <h3>${escapeHtml(item.name)}</h3>
      <div class="portion-bar"><span style="width:${pct}%"></span></div>
      <div class="portion-label">${item.portions_remaining} de ${item.portions_total} porções restantes</div>
      <div class="actions"><button class="small" data-consumir="${item.id}">✅ Comer 1 porção</button></div>
    </div>`;
}

async function loadKanban(filter) {
  currentFilter = filter || currentFilter;
  const k = await api('/api/kanban');
  kanbanCache = k;

  const cols = {
    planoSemanal: k.planoSemanal.map(cardPlanoSemanal),
    prePreparo: k.prePreparo.map(cardPrePreparo),
    preparo: k.preparo.map(cardPreparo),
    porcionamento: k.porcionamento.map((i) => cardPorcionamentoOuConsumo(i, 'porcionamento')),
    consumo: k.consumo.map((i) => cardPorcionamentoOuConsumo(i, 'consumo')),
  };

  Object.entries(cols).forEach(([stage, htmls]) => {
    const el = $('col-' + stage);
    el.innerHTML = htmls.length ? htmls.join('') : '<div class="empty-slot">nada por aqui agora</div>';
    document.querySelector(`.column[data-stage="${stage}"] .count`).textContent = htmls.length || '';
  });

  attachKanbanDrag();
}

document.getElementById('board').addEventListener('click', async (e) => {
  const iniciar = e.target.dataset.iniciarPreparo;
  const porcionar = e.target.dataset.porcionar;
  const consumir = e.target.dataset.consumir;

  if (iniciar) {
    e.target.disabled = true;
    e.target.textContent = 'pensando...';
    try {
      await api('/api/mediacao', { method: 'POST', body: JSON.stringify({ promptText: iniciar }) });
      loadKanban(currentFilter);
    } catch (err) {
      alert('Erro na mediação: ' + err.message);
      e.target.disabled = false;
      e.target.textContent = '🍳 Iniciar decisão';
    }
  } else if (porcionar) {
    const nome = window.prompt('Nome do prato:');
    if (!nome) return;
    const porcoes = Number(window.prompt('Quantas porções rendeu?', '4'));
    if (!porcoes) return;
    await api('/api/kanban/acao', {
      method: 'POST',
      body: JSON.stringify({ acao: 'porcionar', trade_off_decision_id: porcionar, nome, porcoes }),
    });
    loadKanban(currentFilter);
  } else if (consumir) {
    await api('/api/kanban/acao', { method: 'POST', body: JSON.stringify({ acao: 'consumir', pantry_item_id: consumir, quantidade: 1 }) });
    loadKanban(currentFilter);
  }
});

// arrasto manual (pointer events) — so entre Porcionamento e Consumo, as
// duas colunas que compartilham o mesmo tipo de card (pantry_item preparado)
let dragState = null;
function attachKanbanDrag() {
  document.querySelectorAll('.kcard.draggable').forEach((card) => {
    card.onpointerdown = (e) => {
      if (e.target.tagName === 'BUTTON') return;
      startDrag(e, card);
    };
  });
}
function startDrag(e, card) {
  const rect = card.getBoundingClientRect();
  dragState = { card, id: card.dataset.id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, fromCol: card.dataset.col };
  card.setPointerCapture(e.pointerId);
  card.style.setProperty('--lift-w', rect.width + 'px');
  card.classList.add('lifted');
  card.style.left = rect.left + 'px';
  card.style.top = rect.top + 'px';
  card.onpointermove = onDragMove;
  card.onpointerup = onDragEnd;
}
function onDragMove(e) {
  if (!dragState) return;
  dragState.card.style.left = (e.clientX - dragState.offsetX) + 'px';
  dragState.card.style.top = (e.clientY - dragState.offsetY) + 'px';
  document.querySelectorAll('.column-body').forEach((c) => c.classList.remove('drag-over'));
  const under = document.elementFromPoint(e.clientX, e.clientY);
  const col = under && under.closest('.column-body');
  if (col) col.classList.add('drag-over');
}
async function onDragEnd(e) {
  if (!dragState) return;
  const { card, id, fromCol } = dragState;
  document.querySelectorAll('.column-body').forEach((c) => c.classList.remove('drag-over'));
  const under = document.elementFromPoint(e.clientX, e.clientY);
  const targetCol = under && under.closest('.column-body');
  const toStage = targetCol ? targetCol.id.replace('col-', '') : null;

  card.classList.remove('lifted');
  card.style.left = ''; card.style.top = '';
  card.onpointermove = null; card.onpointerup = null;
  dragState = null;

  if (toStage === 'consumo' && fromCol === 'porcionamento') {
    await api('/api/kanban/acao', { method: 'POST', body: JSON.stringify({ acao: 'consumir', pantry_item_id: id, quantidade: 1 }) });
    await loadKanban(currentFilter);
    const moved = document.querySelector(`.kcard[data-id="${id}"]`);
    if (moved) moved.classList.add('glow-manual');
  }
}

const board = document.getElementById('board');
const dotsEl = document.getElementById('dots');
['planoSemanal', 'prePreparo', 'preparo', 'porcionamento', 'consumo'].forEach((s, i) => {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  dotsEl.appendChild(d);
});

board.addEventListener('scroll', () => {
  const cols = [...document.querySelectorAll('.column')];
  const boardRect = board.getBoundingClientRect();
  let closest = 0, closestDist = Infinity;
  cols.forEach((col, i) => {
    const dist = Math.abs(col.getBoundingClientRect().left - boardRect.left);
    if (dist < closestDist) { closestDist = dist; closest = i; }
  });
  [...dotsEl.children].forEach((d, i) => d.classList.toggle('active', i === closest));
}, { passive: true });

// ---- Gaveta de configuracoes ----

async function loadConfigDrawer() {
  const cfg = await api('/api/config-quantitativo');
  $('cfg-dias-validade').value = cfg.diasValidadePosBranqueamento;

  const wrap = $('cfg-atores-wrap');
  wrap.querySelectorAll('.actor-row').forEach((el) => el.remove());
  cfg.atores.forEach((a) => {
    const row = document.createElement('div');
    row.className = 'actor-row';
    row.innerHTML = `<span class="actor-avatar ${a.role}">${a.nome[0]}</span><input type="number" data-actor-id="${a.id}" value="${a.calorieCapDaily ?? ''}" placeholder="kcal" /><span class="hint">kcal/dia</span>`;
    wrap.appendChild(row);
  });

  $('cfg-budget-list').innerHTML = cfg.budgetCategorias.map((b) => `<div class="budget-item">${BUDGET_LABEL[b]}</div>`).join('');

  try {
    const orc = await api('/api/orcamento-semanal');
    $('cfg-teto-calorico').value = orc.teto_calorico ?? '';
    $('cfg-teto-financeiro').value = orc.teto_financeiro ?? '';
  } catch (e) { /* sem orcamento definido ainda — ok deixar em branco */ }
}

$('btn-config').addEventListener('click', async () => {
  await loadConfigDrawer();
  $('drawer').classList.add('open');
  $('drawer-backdrop').classList.add('open');
});
function closeDrawer() { $('drawer').classList.remove('open'); $('drawer-backdrop').classList.remove('open'); }
$('drawer-close').addEventListener('click', closeDrawer);
$('drawer-backdrop').addEventListener('click', closeDrawer);

$('btn-salvar-config').addEventListener('click', async () => {
  const hint = $('cfg-save-hint');
  hint.textContent = 'salvando...';
  try {
    await api('/api/config-quantitativo/validade', { method: 'POST', body: JSON.stringify({ dias: Number($('cfg-dias-validade').value) }) });
    await api('/api/orcamento-semanal', {
      method: 'POST',
      body: JSON.stringify({
        calorie_cap: $('cfg-teto-calorico').value ? Number($('cfg-teto-calorico').value) : null,
        financial_cap: $('cfg-teto-financeiro').value ? Number($('cfg-teto-financeiro').value) : null,
      }),
    });
    const actorInputs = $('cfg-atores-wrap').querySelectorAll('input[data-actor-id]');
    for (const input of actorInputs) {
      await api('/api/config-quantitativo/metas', {
        method: 'POST',
        body: JSON.stringify({ actor_id: input.dataset.actorId, calorie_cap_daily: input.value ? Number(input.value) : null }),
      });
    }
    hint.textContent = 'salvo!';
    setTimeout(() => (hint.textContent = ''), 2000);
  } catch (err) {
    hint.textContent = 'erro: ' + err.message;
  }
});

// ---- Objetos da cozinha (Despensa / Preferencias / Atividade) ----

const kitchenObjects = [
  { card: $('card-fridge'), trigger: $('trigger-fridge'), panel: $('panel-fridge') },
  { card: $('card-note'), trigger: $('trigger-note'), panel: $('panel-note') },
  { card: $('card-pensamentos'), trigger: $('trigger-pensamentos'), panel: $('panel-pensamentos') },
];
function closeKitchenObject(obj) { obj.card.classList.remove('open'); obj.panel.classList.remove('open'); obj.trigger.setAttribute('aria-expanded', 'false'); }
function openKitchenObject(obj) {
  kitchenObjects.forEach((other) => { if (other !== obj) closeKitchenObject(other); });
  obj.card.classList.add('open'); obj.panel.classList.add('open'); obj.trigger.setAttribute('aria-expanded', 'true');
}
kitchenObjects.forEach((obj) => {
  obj.trigger.addEventListener('click', () => {
    if (obj.card.classList.contains('open')) closeKitchenObject(obj);
    else openKitchenObject(obj);
  });
});

// ---- Boot ----

Promise.all([loadConfig(), loadAtores(), loadEstoque(), loadListaCompras(), loadPreferencias(), loadPensamentos(), loadKanban('all')]).catch((err) =>
  console.error('Erro ao carregar painel:', err)
);
