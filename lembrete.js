// v3 "Musa Balance", camada 5: lembrete proativo de dado ausente. Decisao
// tomada em 2026-08-02: quando um ator nao relata o que comeu, o sistema
// PERGUNTA — nunca infere silenciosamente (regra de ouro do produto).
//
// So funciona depois que o grupo do Telegram existe e mandou pelo menos uma
// mensagem (households.telegram_chat_id aprendido em telegram.js) — sem
// isso nao ha canal de push real, entao o job simplesmente nao faz nada.

const { supabase, getHouseholdId } = require('./tools');
const { enviarMensagem } = require('./telegram');

const HORA_LEMBRETE = 20; // 20h local — so cobra depois que o dia de refeicoes ja "deveria" ter acontecido
const jaLembrado = new Set(); // dedupe em memoria: `${data}:${actorId}`, reseta a cada deploy

async function verificarRelatosPendentes() {
  const agora = new Date();
  if (agora.getHours() < HORA_LEMBRETE) return;

  const householdId = await getHouseholdId();
  const { data: household } = await supabase
    .from('households')
    .select('telegram_chat_id')
    .eq('id', householdId)
    .single();
  if (!household?.telegram_chat_id) return; // sem grupo aprendido ainda — nada a fazer

  const hoje = agora.toISOString().slice(0, 10);

  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select('id, name')
    .eq('household_id', householdId);
  if (actorsError || !actors?.length) return;

  const { data: relatosHoje, error: relatosError } = await supabase
    .from('meal_reports')
    .select('actor_id')
    .in('actor_id', actors.map((a) => a.id))
    .eq('date', hoje);
  if (relatosError) return;

  const jaRelataram = new Set(relatosHoje.map((r) => r.actor_id));
  const faltantes = actors.filter((a) => !jaRelataram.has(a.id) && !jaLembrado.has(`${hoje}:${a.id}`));

  for (const actor of faltantes) {
    await enviarMensagem(
      household.telegram_chat_id,
      `${actor.name}, ainda nao vi um relato seu de refeicao hoje. Manda um "comi X" quando puder — sem isso o orcamento da semana fica com um buraco, nao um chute.`
    );
    jaLembrado.add(`${hoje}:${actor.id}`);
  }
}

function iniciarLembretes() {
  // Checa a cada hora — barato o suficiente, e HORA_LEMBRETE + o dedupe em
  // memoria ja evitam mandar a mesma cobranca de novo no mesmo dia.
  setInterval(() => {
    verificarRelatosPendentes().catch((err) => console.error('Erro no job de lembrete:', err.message));
  }, 60 * 60 * 1000);
}

module.exports = { iniciarLembretes, verificarRelatosPendentes };
