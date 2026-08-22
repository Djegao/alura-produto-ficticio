// v4 "Feed vivo" (2026-08-21): o caminho UNICO de escrita conversacional.
//
// Antes do pivot v4, a logica de "o que uma intencao classificada FAZ com o
// estado" vivia duplicada e divergente: telegram.js aplicava efeitos
// completos (aquisicao estocava, desperdicio zerava porcao, relato caseiro
// baixava porcao) enquanto /api/relatos so gravava pensamento + meal_report.
// A divergencia era documentada como intencional na era do Kanban (dois
// caminhos de escrita de proposito). Com o Kanban morto, a divergencia
// perdeu a razao de existir: TODO canal (web, Telegram, futuros) classifica
// com o mesmo agente de ingestao e cai AQUI pra aplicar efeitos.
//
// Regras de ouro preservadas (v3-musa-balance.md):
// - Matematica/estado sempre em codigo; a LLM so classifica.
// - Sem match exato, nao infere: relato que nao casa com item nao mexe em nada.
// - Porcionar e' sempre manual: se a pessoa nao disse o numero de porcoes,
//   o sistema PERGUNTA (campo `pergunta` no retorno) — nunca chuta.
//
// Retorno: { pensamento, efeitos: [string], pergunta: string|null }
// - efeitos: frases prontas pra UI/bot mostrarem o que de fato mudou.
// - pergunta: preenchida quando falta dado que so o humano tem.

const { supabase, getHouseholdId, runTool, marcarCompradoNaLista } = require('./tools');

async function getDiasValidade(householdId) {
  const { data, error } = await supabase
    .from('households')
    .select('dias_validade_pos_branqueamento')
    .eq('id', householdId)
    .single();
  if (error) throw new Error(error.message);
  return data.dias_validade_pos_branqueamento ?? 6;
}

// Match de prato 'preparado' vivo por nome — mesmo criterio que o fluxo de
// desperdicio sempre usou (ilike, mais recente primeiro, porcao restante > 0).
async function acharPreparadoVivo(householdId, nome) {
  const { data } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('household_id', householdId)
    .eq('state', 'preparado')
    .ilike('name', `%${nome}%`)
    .gt('portions_remaining', 0)
    .order('prepared_at', { ascending: false, nullsFirst: false })
    .limit(1);
  return (data && data[0]) || null;
}

async function aplicarIntencao({ intencao, actor, canal, traceId }) {
  const householdId = await getHouseholdId();
  const hoje = new Date().toISOString().slice(0, 10);
  const fonte = canal === 'telegram' ? 'telegram' : 'manual';
  const efeitos = [];
  let pergunta = null;
  let diasDesdePreparo = null;
  let statusPensamento = 'completo';

  if (intencao.tipo === 'relato_refeicao') {
    await runTool('registrar_relato_refeicao', {
      ator: actor.role,
      data: intencao.data || hoje,
      descricao: intencao.descricao,
      fonte,
      calorias: intencao.calorias,
      custo: intencao.custo,
      fonte_refeicao: intencao.fonte_refeicao,
    });
    efeitos.push('relato contabilizado no orçamento da semana');

    // Refeicao caseira que nomeia um prato preparado baixa porcao — o unico
    // caso em que relato mexe no estoque, e so com match.
    if (intencao.fonte_refeicao === 'caseira' && intencao.item_nome) {
      const prato = await acharPreparadoVivo(householdId, intencao.item_nome);
      if (prato) {
        const porcoes = Number(intencao.item_quantidade) || 1;
        const restante = Math.max(0, Number(prato.portions_remaining) - porcoes);
        await supabase
          .from('pantry_items')
          .update({ portions_remaining: restante, updated_at: new Date().toISOString() })
          .eq('id', prato.id);
        efeitos.push(`baixei ${porcoes} porção(ões) de "${prato.name}" — restam ${restante} de ${prato.portions_total}`);
      }
    }
  } else if (intencao.tipo === 'desperdicio') {
    if (intencao.item_nome) {
      const prato = await acharPreparadoVivo(householdId, intencao.item_nome);
      if (prato && prato.prepared_at) {
        diasDesdePreparo = Math.floor((Date.now() - new Date(prato.prepared_at).getTime()) / 86400000);
      }
      if (prato) {
        await supabase.from('pantry_items').update({ portions_remaining: 0 }).eq('id', prato.id);
        efeitos.push(
          `"${prato.name}" zerado no estoque` +
            (diasDesdePreparo != null ? ` — durou ${diasDesdePreparo} dia(s) desde o preparo (aprendido, não configurado)` : '')
        );
      }
    }
    if (efeitos.length === 0) efeitos.push('desperdício registrado — não achei o prato no estoque, nada foi alterado');
  } else if (intencao.tipo === 'aquisicao') {
    if (intencao.item_nome && intencao.item_state && intencao.item_storage) {
      await supabase.from('pantry_items').insert({
        household_id: householdId,
        name: intencao.item_nome,
        quantity: intencao.item_quantidade || 0,
        unit: intencao.item_unidade || 'unidade',
        state: intencao.item_state,
        storage: intencao.item_storage,
        source: canal,
      });
      efeitos.push(`"${intencao.item_nome}" entrou no estoque (${intencao.item_quantidade || '?'} ${intencao.item_unidade || 'unidade'})`);
    }
    if (intencao.item_nome) {
      const { atualizados } = await marcarCompradoNaLista(intencao.item_nome).catch(() => ({ atualizados: 0 }));
      if (atualizados > 0) efeitos.push(`marquei "${intencao.item_nome}" como comprado na lista de compras`);
    }
    if (!intencao.budget_categoria) {
      statusPensamento = 'aguardando_categoria';
      efeitos.push('compra registrada — falta dizer de qual orçamento saiu');
    }
  } else if (intencao.tipo === 'branqueamento') {
    // Substitui a acao 'branquear' do Kanban morto: dito em palavras, aplicado
    // em codigo. So marca item perecivel nao-preparado que case por nome.
    if (intencao.item_nome) {
      const { data: candidatos } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('household_id', householdId)
        .eq('storage', 'perecivel')
        .neq('state', 'preparado')
        .ilike('name', `%${intencao.item_nome}%`)
        .order('created_at', { ascending: false })
        .limit(1);
      const item = candidatos && candidatos[0];
      if (item) {
        await supabase
          .from('pantry_items')
          .update({ blanched_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', item.id);
        const dias = await getDiasValidade(householdId);
        efeitos.push(`"${item.name}" marcado como branqueado — validade de ${dias} dia(s) a partir de agora (regra D-N)`);
      } else {
        efeitos.push(`não achei "${intencao.item_nome}" na geladeira — nada foi marcado`);
      }
    } else {
      pergunta = 'Branqueou o quê? Me diz o nome do item.';
    }
  } else if (intencao.tipo === 'porcionamento') {
    // Substitui a acao 'porcionar' do Kanban morto. Sempre manual: o numero
    // de porcoes vem da pessoa que cozinhou, nunca de estimativa.
    if (intencao.item_nome && intencao.item_quantidade) {
      const porcoes = Number(intencao.item_quantidade);
      await supabase.from('pantry_items').insert({
        household_id: householdId,
        name: intencao.item_nome,
        quantity: porcoes,
        unit: intencao.item_unidade || 'porção',
        state: 'preparado',
        storage: 'perecivel',
        source: canal,
        prepared_at: new Date().toISOString(),
        portions_total: porcoes,
        portions_remaining: porcoes,
      });
      efeitos.push(`"${intencao.item_nome}" pronto e porcionado: ${porcoes} porção(ões) na geladeira`);
    } else if (intencao.item_nome) {
      pergunta = `Quantas porções rendeu a ${intencao.item_nome}? Só quem cozinhou sabe — me manda "porcionei ${intencao.item_nome} em N".`;
    } else {
      pergunta = 'Porcionou o quê, e em quantas porções?';
    }
  } else {
    // desejo (e qualquer tipo futuro nao mapeado cai aqui sem efeito de estado)
    efeitos.push('anotado como desejo — entra no plano da semana');
  }

  // Todo evento classificado vira pensamento — a tabela E' o feed. Quando o
  // sistema precisou perguntar (pergunta != null), nada de estado mudou e o
  // pensamento nao e' gravado: o evento so existe quando esta completo.
  let pensamento = null;
  if (!pergunta) {
    const { data, error } = await supabase
      .from('pensamentos')
      .insert({
        actor_id: actor.id,
        tipo: intencao.tipo,
        descricao: intencao.descricao,
        data: intencao.data || (intencao.tipo === 'desejo' ? null : hoje),
        calorias: intencao.calorias ?? null,
        custo: intencao.custo ?? null,
        budget_categoria: intencao.budget_categoria || null,
        status: statusPensamento,
        fonte_refeicao: intencao.fonte_refeicao || null,
        dias_desde_preparo: diasDesdePreparo,
        trace_id: traceId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    pensamento = data;
  }

  return { pensamento, efeitos, pergunta };
}

module.exports = { aplicarIntencao };
