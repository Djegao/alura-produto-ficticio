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

// ---- Config (eixos ao vivo: geracao + ingestao) ----

async function loadConfig() {
  const cfg = await api('/api/config');
  const opts = cfg.availableModels.map((m) => `<option value="${m}">${m}</option>`).join('');
  $('cfg-model').innerHTML = opts;
  $('cfg-model').value = cfg.model;
  $('cfg-model-ingestao').innerHTML = opts;
  $('cfg-model-ingestao').value = cfg.modelIngestao;
}

async function saveConfig() {
  $('cfg-status').textContent = 'salvando...';
  const body = { model: $('cfg-model').value, modelIngestao: $('cfg-model-ingestao').value };
  await api('/api/config', { method: 'POST', body: JSON.stringify(body) });
  $('cfg-status').textContent = 'salvo';
  setTimeout(() => ($('cfg-status').textContent = ''), 2000);
}
$('cfg-model').addEventListener('change', saveConfig);
$('cfg-model-ingestao').addEventListener('change', saveConfig);

// ---- Atores: filtro do feed + "quem fala" do composer ----

let atoresCache = [];
let currentFilter = 'all';
let composerAtor = 'chef';

async function loadAtores() {
  atoresCache = await api('/api/atores');

  const filterWrap = $('actor-filter');
  atoresCache.forEach((a) => {
    const btn = document.createElement('button');
    btn.className = 'actor-chip';
    btn.dataset.filter = a.role;
    btn.innerHTML = `<span class="actor-avatar ${a.role}">${a.name[0]}</span> ${escapeHtml(a.name)}`;
    filterWrap.appendChild(btn);
  });
  filterWrap.querySelectorAll('.actor-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      filterWrap.querySelectorAll('.actor-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      loadFeed();
    });
  });

  const composerWrap = $('composer-atores');
  atoresCache.forEach((a) => {
    const btn = document.createElement('button');
    btn.className = 'actor-chip' + (a.role === composerAtor ? ' active' : '');
    btn.dataset.role = a.role;
    btn.innerHTML = `<span class="actor-avatar ${a.role}">${a.name[0]}</span> ${escapeHtml(a.name)}`;
    btn.addEventListener('click', () => {
      composerAtor = a.role;
      composerWrap.querySelectorAll('.actor-chip').forEach((c) => c.classList.toggle('active', c.dataset.role === a.role));
    });
    composerWrap.appendChild(btn);
  });
}

// ---- v4 "Feed vivo": faixa de estado derivado ----
// So leitura, tudo calculado em codigo no backend — o residuo util do Kanban.

function pillDias(d) {
  if (d < 0) return `<span class="pill bad">vencido há ${Math.abs(d)}d</span>`;
  if (d <= 2) return `<span class="pill warn">restam ${d}d</span>`;
  return `<span class="pill good">restam ${d}d</span>`;
}

async function loadEstado() {
  try {
    const k = await api('/api/estado-cozinha');

    const porcoesEl = $('estado-porcoes');
    if (!k.porcoesVivas.length) {
      porcoesEl.innerHTML = '<div class="empty">nenhum prato pronto na geladeira</div>';
    } else {
      porcoesEl.innerHTML = k.porcoesVivas
        .map((p) => {
          const pct = p.portions_total ? (p.portions_remaining / p.portions_total) * 100 : 0;
          return `
        <div class="linha"><strong>${escapeHtml(p.name)}</strong>
          <span class="num${p.dias_desde_preparo >= 4 ? ' warn' : ''}">${p.portions_remaining}<span class="sub">/${p.portions_total}</span></span></div>
        <div class="portion-bar"><span style="width:${pct}%"></span></div>
        <div class="sub">${p.dias_desde_preparo != null ? `preparado há ${p.dias_desde_preparo}d` : ''}</div>`;
        })
        .join('');
    }

    const vencendoEl = $('estado-vencendo');
    if (!k.vencendo.length) {
      vencendoEl.innerHTML = '<div class="empty">nada branqueado correndo prazo</div>';
    } else {
      vencendoEl.innerHTML = k.vencendo
        .map((i) => `<div class="linha"><strong>${escapeHtml(i.name)}</strong>${pillDias(i.dias_restantes)}</div>`)
        .join('');
    }

    const orc = k.orcamento;
    $('estado-semana-label').textContent = orc.semana_inicio ? new Date(orc.semana_inicio + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
    const linhas = [];
    if (orc.teto_financeiro != null) {
      linhas.push(`<div class="linha"><strong>saldo R$</strong><span class="num${orc.saldo_financeiro < 0 ? ' bad' : ''}">${Number(orc.saldo_financeiro).toFixed(0)}</span></div><div class="sub">de R$ ${orc.teto_financeiro} — gasto R$ ${Number(orc.custo_consumido).toFixed(0)}</div>`);
    }
    if (orc.teto_calorico != null) {
      linhas.push(`<div class="linha"><strong>saldo kcal</strong><span class="num${orc.saldo_calorico < 0 ? ' bad' : ''}">${orc.saldo_calorico}</span></div><div class="sub">de ${orc.teto_calorico} kcal</div>`);
    }
    linhas.push(`<div class="sub" style="margin-top:4px">${orc.relatos_contabilizados} relato(s) contabilizado(s)</div>`);
    $('estado-orcamento').innerHTML = orc.teto_financeiro == null && orc.teto_calorico == null
      ? '<div class="empty">sem teto definido — configure na gaveta</div>' + linhas[linhas.length - 1]
      : linhas.join('');
  } catch (err) {
    // Convencao do projeto: erro aparece, nunca vira "vazio" misterioso.
    ['estado-porcoes', 'estado-vencendo', 'estado-orcamento'].forEach((id) => {
      $(id).innerHTML = `<div class="empty">erro: ${escapeHtml(err.message)}</div>`;
    });
  }
}

// ---- v4 "Feed vivo": o feed (a tabela pensamentos E' a tela) ----

const TIPO_LABEL = {
  relato_refeicao: 'relato', desejo: 'desejo', aquisicao: 'aquisição',
  desperdicio: 'desperdício', branqueamento: 'branqueamento', porcionamento: 'porcionamento',
};
const BUDGET_LABEL = { tr_diego: 'TR Diego', tr_esposa: 'TR Esposa', credito_familia: 'Crédito Família' };

async function loadFeed() {
  const box = $('feed');
  try {
    let items = await api('/api/pensamentos');
    if (currentFilter !== 'all') items = items.filter((p) => p.actor?.role === currentFilter);
    if (!items.length) { box.innerHTML = '<div class="empty">nada por aqui ainda — conta pra cozinha o que aconteceu.</div>'; return; }
    box.innerHTML = items
      .map((p) => {
        const extras = [];
        if (p.budget_categoria) extras.push(`<span class="pill gold">${BUDGET_LABEL[p.budget_categoria]}</span>`);
        if (p.fonte_refeicao) extras.push(`<span class="pill neutral">${p.fonte_refeicao}</span>`);
        if (p.dias_desde_preparo != null) extras.push(`<span class="pill bad">durou ${p.dias_desde_preparo}d</span>`);
        if (p.status === 'aguardando_categoria') extras.push(`<span class="pill warn">aguardando orçamento</span>`);
        const mediar = p.tipo === 'desejo'
          ? `<div class="acao-linha"><button class="small" data-mediar="${escapeHtml(p.descricao)}">🍳 Mediar com a casa</button></div>`
          : '';
        return `
      <div class="feed-item">
        <span class="actor-avatar ${p.actor?.role || ''}">${escapeHtml((p.actor?.name || '?')[0])}</span>
        <div class="corpo">
          <div class="topo">
            <span class="quem">${escapeHtml(p.actor?.name || '?')}</span>
            <span class="pill ${p.tipo}">${TIPO_LABEL[p.tipo] || p.tipo}</span>
            ${extras.join(' ')}
          </div>
          <div class="texto">${escapeHtml(p.descricao)}</div>
          <div class="quando">${new Date(p.created_at).toLocaleString('pt-BR')}</div>
          ${mediar}
        </div>
      </div>`;
      })
      .join('');
  } catch (err) {
    box.innerHTML = `<div class="empty">erro no feed: ${escapeHtml(err.message)}</div>`;
  }
}

// ---- Conversa (composer) ----

function mostrarResposta(html, classe) {
  const box = $('resposta-agente');
  box.className = 'resposta-agente show' + (classe ? ` ${classe}` : '');
  box.innerHTML = `<button class="fechar" aria-label="fechar">×</button>${html}`;
  box.querySelector('.fechar').addEventListener('click', () => { box.className = 'resposta-agente'; box.innerHTML = ''; });
}

async function enviarConversa() {
  const input = $('conversa-texto');
  const texto = input.value.trim();
  if (!texto) return;
  const btn = $('btn-enviar');
  btn.disabled = true; btn.textContent = 'ouvindo...';
  try {
    const r = await api('/api/conversa', { method: 'POST', body: JSON.stringify({ texto, ator: composerAtor }) });
    if (r.pergunta) {
      mostrarResposta(`🤔 ${escapeHtml(r.pergunta)}`, 'pergunta');
    } else {
      const tipo = TIPO_LABEL[r.intencao.tipo] || r.intencao.tipo;
      mostrarResposta(
        `<strong style="text-transform:uppercase; font-size:10.5px; letter-spacing:.05em; color:var(--accent)">${escapeHtml(tipo)}</strong>` +
          r.efeitos.map((e) => `<div class="ef">${escapeHtml(e)}</div>`).join(''),
        ''
      );
      input.value = '';
    }
    await Promise.all([loadFeed(), loadEstado(), loadEstoque(), loadListaCompras()]);
  } catch (err) {
    mostrarResposta(`⚠️ ${escapeHtml(err.message)}`, 'pergunta');
  } finally {
    btn.disabled = false; btn.textContent = 'Enviar';
  }
}
$('btn-enviar').addEventListener('click', enviarConversa);
$('conversa-texto').addEventListener('keydown', (e) => { if (e.key === 'Enter') enviarConversa(); });

// Mediacao a partir de um desejo do feed — o Mediador (modelo de geracao,
// eixo caro) expoe o trade-off; a resposta aparece na conversa.
$('feed').addEventListener('click', async (e) => {
  const desejo = e.target.dataset.mediar;
  if (!desejo) return;
  e.target.disabled = true; e.target.textContent = 'mediando...';
  try {
    const r = await api('/api/mediacao', { method: 'POST', body: JSON.stringify({ promptText: desejo }) });
    mostrarResposta(`<strong>🍳 Mediador:</strong>\n${escapeHtml(r.text || '(proposta registrada sem texto)')}`, 'mediador');
    loadFeed();
  } catch (err) {
    mostrarResposta(`⚠️ Erro na mediação: ${escapeHtml(err.message)}`, 'pergunta');
  } finally {
    e.target.disabled = false; e.target.textContent = '🍳 Mediar com a casa';
  }
});

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
    await api(`/api/estoque/${branquearId}/branquear`, { method: 'POST' });
    loadEstoque();
    loadEstado();
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

// Abre PRIMEIRO, carrega depois: se o carregamento fosse aguardado antes de
// abrir, uma falha da API deixava o clique sem efeito nenhum e sem mensagem
// (bug encontrado no QA de 2026-08-21 — a gaveta simplesmente nao abria).
$('btn-config').addEventListener('click', async () => {
  $('drawer').classList.add('open');
  $('drawer-backdrop').classList.add('open');
  const hint = $('cfg-save-hint');
  hint.className = 'save-hint';
  hint.textContent = 'carregando...';
  try {
    await loadConfigDrawer();
    hint.textContent = '';
  } catch (err) {
    hint.className = 'save-hint erro';
    hint.textContent = 'erro ao carregar: ' + err.message;
  }
});
function closeDrawer() { $('drawer').classList.remove('open'); $('drawer-backdrop').classList.remove('open'); }
$('drawer-close').addEventListener('click', closeDrawer);
$('drawer-backdrop').addEventListener('click', closeDrawer);

$('btn-salvar-config').addEventListener('click', async () => {
  const hint = $('cfg-save-hint');
  hint.className = 'save-hint';
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
    loadEstado();
  } catch (err) {
    hint.className = 'save-hint erro';
    hint.textContent = 'erro: ' + err.message;
  }
});

// ---- Objetos da cozinha (Despensa / Preferencias) ----

const kitchenObjects = [
  { card: $('card-fridge'), trigger: $('trigger-fridge'), panel: $('panel-fridge') },
  { card: $('card-note'), trigger: $('trigger-note'), panel: $('panel-note') },
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

Promise.all([loadConfig(), loadAtores(), loadEstado(), loadFeed(), loadEstoque(), loadListaCompras(), loadPreferencias()]).catch((err) =>
  console.error('Erro ao carregar painel:', err)
);
