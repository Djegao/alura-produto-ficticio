// Ferramentas que o Claude pode chamar durante a sugestao de receita/cardapio.
// Cada uma consulta o Supabase de verdade — nada de dado pre-buscado pelo backend.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const HOUSEHOLD_ID_CACHE = { id: null };

async function getHouseholdId() {
  if (HOUSEHOLD_ID_CACHE.id) return HOUSEHOLD_ID_CACHE.id;
  const { data, error } = await supabase.from('households').select('id').limit(1).single();
  if (error) throw new Error('Nao foi possivel achar o domicilio: ' + error.message);
  HOUSEHOLD_ID_CACHE.id = data.id;
  return data.id;
}

const toolDefinitions = [
  {
    name: 'consultar_estoque',
    description:
      'Consulta os itens disponiveis no estoque (despensa/geladeira) do domicilio. Use para saber o que ha disponivel antes de sugerir uma receita ou cardapio.',
    input_schema: {
      type: 'object',
      properties: {
        estado: {
          type: 'string',
          enum: ['base', 'ingrediente', 'preparado'],
          description: 'Filtra por estado do alimento. Omita para trazer todos os estados.',
        },
      },
    },
  },
  {
    name: 'consultar_preferencias',
    description:
      'Consulta as preferencias e restricoes persistentes do domicilio (ex: alergias, restricoes alimentares, gostos). Use antes de finalizar qualquer sugestao para garantir que ela respeita o perfil da casa.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'registrar_itens_usados',
    description:
      'Registra quais itens do estoque a receita sugerida efetivamente usa, e em que quantidade. Use o "id" de cada item exatamente como veio de consultar_estoque. So chame isso depois de decidir a receita — nao chame se nao consultou o estoque.',
    input_schema: {
      type: 'object',
      properties: {
        itens: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              item_id: { type: 'string', description: 'id do item, retornado por consultar_estoque' },
              quantidade: { type: 'number', description: 'quantidade usada, na mesma unidade do item' },
            },
            required: ['item_id', 'quantidade'],
          },
        },
      },
      required: ['itens'],
    },
  },
];

async function consultar_estoque({ estado } = {}) {
  const householdId = await getHouseholdId();
  let query = supabase.from('pantry_items').select('*').eq('household_id', householdId);
  if (estado) query = query.eq('state', estado);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

async function consultar_preferencias() {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('preferences')
    .select('description')
    .eq('household_id', householdId);
  if (error) throw new Error(error.message);
  return data.map((p) => p.description);
}

async function registrar_itens_usados({ itens } = {}) {
  // Nao grava nada aqui — o agent.js captura o input desta chamada diretamente
  // (e' o dado estruturado que vira meal_suggestions.items_used). So confirma
  // pro Claude que o registro foi recebido, pra fechar o ciclo de tool_result.
  return { ok: true, itens_recebidos: Array.isArray(itens) ? itens.length : 0 };
}

// --- v3 "Musa Balance": tools deterministicas do Agente Mediador ---------
// Mesma regra de ouro do v3-musa-balance.md: nenhuma destas calcula nada "no
// chute" pelo Claude — prazo, decaimento e saldo financeiro/calorico sao
// sempre matematica em codigo. O Claude so le o resultado.

async function getDiasValidadePosBranqueamento(householdId) {
  const { data, error } = await supabase
    .from('households')
    .select('dias_validade_pos_branqueamento')
    .eq('id', householdId)
    .single();
  if (error) throw new Error(error.message);
  return data.dias_validade_pos_branqueamento ?? 6;
}

async function getActorByRole(role) {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('actors')
    .select('id, name, role')
    .eq('household_id', householdId)
    .eq('role', role)
    .single();
  if (error) throw new Error(`Nao foi possivel achar o ator "${role}": ${error.message}`);
  return data;
}

// Semana comeca na segunda-feira — usado tanto pro orcamento quanto pra
// decisao de trade-off, pra os dois falarem da mesma "semana" sempre.
function getWeekStart(referenceDate = new Date()) {
  const d = new Date(referenceDate);
  const day = d.getUTCDay(); // 0 = domingo
  const diffParaSegunda = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffParaSegunda);
  return d.toISOString().slice(0, 10);
}

// Array separado, de proposito: NAO mutar toolDefinitions (o loop v1/v2
// original do Chef Ops usa esse array diretamente — se essas tools novas
// entrassem ali, contaminariam a comparacao de aula que precisa continuar
// intacta). O agente mediador usa mediatorToolDefinitions, definido no fim.
const novasToolsMediador = [
  {
    name: 'consultar_validade_estoque',
    description:
      'Consulta o estoque perecivel com o estado de conservacao JA CALCULADO (fresco ou branqueado, regra D-6 dias). Nunca infira prazo de validade por conta propria — use sempre o "dias_restantes" retornado aqui.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'consultar_orcamento_semanal',
    description:
      'Consulta o saldo calorico e financeiro da semana atual (teto configurado menos o que ja foi relatado em meal_reports). O calculo e feito em codigo — use o saldo retornado, nao estime por conta propria.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'registrar_relato_refeicao',
    description:
      'Registra o que um ator (chef ou musa) relatou ter comido em um dia. Use para alimentar o orcamento semanal com dado real.',
    input_schema: {
      type: 'object',
      properties: {
        ator: { type: 'string', enum: ['chef', 'musa'], description: 'Qual ator fez o relato.' },
        data: { type: 'string', description: 'Data da refeicao, formato YYYY-MM-DD.' },
        descricao: { type: 'string', description: 'O que foi comido, em texto livre.' },
        fonte: { type: 'string', enum: ['manual', 'telegram', 'reminder'], description: 'Canal de origem do relato.' },
        calorias: { type: 'number', description: 'Estimativa de calorias, se disponivel.' },
        custo: { type: 'number', description: 'Custo em reais, se disponivel.' },
        fonte_refeicao: {
          type: 'string',
          enum: ['caseira', 'delivery', 'restaurante'],
          description: 'De onde veio a comida, se der pra inferir.',
        },
      },
      required: ['ator', 'data', 'descricao', 'fonte'],
    },
  },
  {
    name: 'consultar_relatos_recentes',
    description:
      'Consulta os relatos de refeicao dos ultimos dias, incluindo de onde veio cada uma (caseira/delivery/restaurante). Use pra notar se um pedido de fora aconteceu enquanto ha porcoes caseiras prontas e nao consumidas — mas a decisao de comentar ou nao essa tensao e sua, nao ha regra fixa aqui.',
    input_schema: {
      type: 'object',
      properties: {
        dias: { type: 'number', description: 'Quantos dias pra tras olhar. Padrao: 7.' },
      },
    },
  },
  {
    name: 'verificar_disponibilidade',
    description:
      'Verifica, em codigo (match de nome contra o estoque real), quais ingredientes de uma receita existem no estoque e quais faltam. Use SEMPRE antes de afirmar que algo falta ou sobra — nunca decida disponibilidade "de olho" em cima do consultar_estoque.',
    input_schema: {
      type: 'object',
      properties: {
        itens: {
          type: 'array',
          items: { type: 'string' },
          description: 'Nomes dos ingredientes necessarios, limpos e curtos (ex: "arroz arboreo", "parmesao").',
        },
      },
      required: ['itens'],
    },
  },
  {
    name: 'registrar_lista_compras',
    description:
      'Adiciona itens faltantes a lista de compras da casa. So chame para itens que verificar_disponibilidade confirmou como faltantes E que nao tem substituto razoavel no estoque — substituicao vem antes de compra.',
    input_schema: {
      type: 'object',
      properties: {
        itens: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nome: { type: 'string', description: 'nome limpo e curto do item' },
              quantidade: { type: 'number', description: 'quantidade necessaria, se souber' },
              unidade: { type: 'string', description: 'kg, g, ml, L, unidade, etc' },
              motivo: { type: 'string', description: 'pra que serve, ex: "risoto premium de sabado"' },
            },
            required: ['nome'],
          },
        },
      },
      required: ['itens'],
    },
  },
  {
    name: 'registrar_decisao_cardapio',
    description:
      'Registra a proposta de trade-off apresentada e a escolha feita para a semana. So chame depois de consultar estoque, validade e orcamento — a decisao final e sempre do casal, voce so expoe o trade-off e registra o que foi decidido.',
    input_schema: {
      type: 'object',
      properties: {
        proposta: {
          type: 'object',
          description: 'As opcoes apresentadas e o impacto/trade-off de cada uma.',
        },
        escolha: {
          type: 'object',
          description: 'O que foi de fato decidido (refeicao premium, marmitas, lista de compras).',
        },
      },
      required: ['proposta'],
    },
  },
];

const mediatorToolDefinitions = [...toolDefinitions, ...novasToolsMediador];

async function consultar_validade_estoque() {
  const householdId = await getHouseholdId();
  const [{ data, error }, diasBranqueado] = await Promise.all([
    supabase.from('pantry_items').select('*').eq('household_id', householdId).eq('storage', 'perecivel'),
    getDiasValidadePosBranqueamento(householdId),
  ]);
  if (error) throw new Error(error.message);

  const agora = new Date();
  return data.map((item) => {
    if (!item.blanched_at) {
      // Sem tabela de decaimento por item ainda — fresco fica sem prazo
      // calculado nesta fase, so marcado pra nao confundir com branqueado.
      return { ...item, estado_conservacao: 'fresco', dias_restantes: null };
    }
    const diasDesde = Math.floor((agora - new Date(item.blanched_at)) / 86400000);
    const diasRestantes = diasBranqueado - diasDesde;
    return {
      ...item,
      estado_conservacao: diasRestantes >= 0 ? 'branqueado' : 'vencido',
      dias_restantes: diasRestantes,
    };
  });
}

async function consultar_orcamento_semanal() {
  const householdId = await getHouseholdId();
  const weekStart = getWeekStart();
  const weekEnd = getWeekStart(new Date(new Date(weekStart + 'T00:00:00Z').getTime() + 7 * 86400000));

  const { data: budget, error: budgetError } = await supabase
    .from('weekly_budgets')
    .select('*')
    .eq('household_id', householdId)
    .eq('week_start', weekStart)
    .maybeSingle();
  if (budgetError) throw new Error(budgetError.message);

  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select('id')
    .eq('household_id', householdId);
  if (actorsError) throw new Error(actorsError.message);
  const actorIds = actors.map((a) => a.id);

  let relatos = [];
  if (actorIds.length > 0) {
    const { data, error } = await supabase
      .from('meal_reports')
      .select('calories, cost')
      .in('actor_id', actorIds)
      .gte('date', weekStart)
      .lt('date', weekEnd);
    if (error) throw new Error(error.message);
    relatos = data;
  }

  const caloriasConsumidas = relatos.reduce((soma, r) => soma + (Number(r.calories) || 0), 0);
  const custoConsumido = relatos.reduce((soma, r) => soma + (Number(r.cost) || 0), 0);

  return {
    semana_inicio: weekStart,
    teto_calorico: budget?.calorie_cap ?? null,
    teto_financeiro: budget?.financial_cap ?? null,
    calorias_consumidas: caloriasConsumidas,
    custo_consumido: custoConsumido,
    saldo_calorico: budget?.calorie_cap != null ? budget.calorie_cap - caloriasConsumidas : null,
    saldo_financeiro: budget?.financial_cap != null ? budget.financial_cap - custoConsumido : null,
    relatos_contabilizados: relatos.length,
  };
}

async function registrar_relato_refeicao({ ator, data, descricao, fonte, calorias, custo, fonte_refeicao } = {}) {
  const actor = await getActorByRole(ator);
  const { error } = await supabase.from('meal_reports').insert({
    actor_id: actor.id,
    date: data,
    description: descricao,
    source: fonte,
    calories: calorias ?? null,
    cost: custo ?? null,
    fonte_refeicao: fonte_refeicao ?? null,
  });
  if (error) throw new Error(error.message);
  return { ok: true, ator: actor.name };
}

async function consultar_relatos_recentes({ dias } = {}) {
  const householdId = await getHouseholdId();
  const janela = dias || 7;
  const desde = new Date(Date.now() - janela * 86400000).toISOString().slice(0, 10);

  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select('id, name')
    .eq('household_id', householdId);
  if (actorsError) throw new Error(actorsError.message);
  const actorIds = actors.map((a) => a.id);
  const actorById = Object.fromEntries(actors.map((a) => [a.id, a.name]));

  if (actorIds.length === 0) return [];

  const { data, error } = await supabase
    .from('meal_reports')
    .select('actor_id, date, description, fonte_refeicao, cost')
    .in('actor_id', actorIds)
    .gte('date', desde)
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);

  return data.map((r) => ({ ...r, ator: actorById[r.actor_id] }));
}

// Normaliza nome pra match: minusculo, sem acento. O match e' bidirecional
// ("arroz" acha "arroz arboreo" e vice-versa) — grosseiro de proposito, e'
// a camada deterministica; refinamento culinario e' trabalho do Mediador.
function normalizarNome(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

function nomesCasam(a, b) {
  const na = normalizarNome(a);
  const nb = normalizarNome(b);
  if (!na || !nb) return false;
  return na.includes(nb) || nb.includes(na);
}

async function verificar_disponibilidade({ itens } = {}) {
  const householdId = await getHouseholdId();
  const { data: estoque, error } = await supabase
    .from('pantry_items')
    .select('id, name, quantity, unit, state, storage, portions_remaining')
    .eq('household_id', householdId);
  if (error) throw new Error(error.message);

  const disponiveis = [];
  const faltantes = [];
  for (const solicitado of itens || []) {
    const encontrados = estoque.filter(
      (e) => nomesCasam(e.name, solicitado) && (Number(e.quantity) > 0 || Number(e.portions_remaining) > 0)
    );
    if (encontrados.length > 0) {
      disponiveis.push({ solicitado, itens_no_estoque: encontrados });
    } else {
      faltantes.push(solicitado);
    }
  }
  return { disponiveis, faltantes };
}

async function registrar_lista_compras({ itens } = {}) {
  const householdId = await getHouseholdId();
  const rows = (itens || [])
    .filter((i) => i && i.nome)
    .map((i) => ({
      household_id: householdId,
      name: i.nome,
      quantity: i.quantidade ?? null,
      unit: i.unidade ?? null,
      motivo: i.motivo ?? null,
      status: 'pendente',
      source: 'mediador',
    }));
  if (rows.length === 0) return { ok: true, adicionados: 0 };
  const { error } = await supabase.from('shopping_list_items').insert(rows);
  if (error) throw new Error(error.message);
  return { ok: true, adicionados: rows.length };
}

// Fecha o ciclo da falta: quando um item chega (aquisicao via chat ou nota
// fiscal), o item correspondente da lista de compras vira 'comprado'. Match
// pelo mesmo criterio bidirecional de verificar_disponibilidade — o filtro
// fino e' feito aqui em codigo, nao via ilike, pra manter um criterio so.
async function marcarCompradoNaLista(nomeItem) {
  if (!nomeItem) return { atualizados: 0 };
  const householdId = await getHouseholdId();
  const { data: pendentes, error } = await supabase
    .from('shopping_list_items')
    .select('id, name')
    .eq('household_id', householdId)
    .eq('status', 'pendente');
  if (error) throw new Error(error.message);

  const ids = (pendentes || []).filter((p) => nomesCasam(p.name, nomeItem)).map((p) => p.id);
  if (ids.length === 0) return { atualizados: 0 };

  const { error: updError } = await supabase
    .from('shopping_list_items')
    .update({ status: 'comprado', updated_at: new Date().toISOString() })
    .in('id', ids);
  if (updError) throw new Error(updError.message);
  return { atualizados: ids.length };
}

async function registrar_decisao_cardapio({ proposta, escolha } = {}) {
  // Igual a registrar_itens_usados: nao grava aqui — o loop do agente
  // mediador captura o input desta chamada diretamente pra persistir em
  // trade_off_decisions junto com escolhida_por. So fecha o ciclo de tool_result.
  return { ok: true, proposta_recebida: !!proposta, escolha_recebida: !!escolha };
}

async function runTool(name, input) {
  if (name === 'consultar_estoque') return consultar_estoque(input);
  if (name === 'consultar_preferencias') return consultar_preferencias(input);
  if (name === 'registrar_itens_usados') return registrar_itens_usados(input);
  if (name === 'consultar_validade_estoque') return consultar_validade_estoque(input);
  if (name === 'consultar_orcamento_semanal') return consultar_orcamento_semanal(input);
  if (name === 'registrar_relato_refeicao') return registrar_relato_refeicao(input);
  if (name === 'consultar_relatos_recentes') return consultar_relatos_recentes(input);
  if (name === 'registrar_decisao_cardapio') return registrar_decisao_cardapio(input);
  if (name === 'verificar_disponibilidade') return verificar_disponibilidade(input);
  if (name === 'registrar_lista_compras') return registrar_lista_compras(input);
  throw new Error(`Ferramenta desconhecida: ${name}`);
}

module.exports = {
  toolDefinitions,
  mediatorToolDefinitions,
  runTool,
  getHouseholdId,
  getActorByRole,
  getWeekStart,
  supabase,
  marcarCompradoNaLista,
  nomesCasam,
};
