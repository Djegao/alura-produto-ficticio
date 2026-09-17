// Episodio D (SDD §11.7), segunda metade: persistir a pendencia nao basta.
// Pendencia que ninguem responde vira 'expirada' com aviso explicito no grupo
// — nunca fica muda pra sempre (SDD §8). Mesmo molde de lembrete.js, mas em
// minutos: a conversa real resolve ou morre em minutos, nao num dia.

const { supabase, getHouseholdId } = require('./tools');
const { enviarMensagem } = require('./telegram');
const { JANELA_PENDENCIA_MIN } = require('./intencao-efeitos');

const INTERVALO_MIN = 2;

async function expirarPendenciasPorcionamento() {
  const householdId = await getHouseholdId();
  const { data: household, error: householdError } = await supabase
    .from('households')
    .select('telegram_chat_id')
    .eq('id', householdId)
    .single();
  if (householdError) throw new Error(householdError.message);

  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select('id')
    .eq('household_id', householdId);
  if (actorsError) throw new Error(actorsError.message);

  const limite = new Date(Date.now() - JANELA_PENDENCIA_MIN * 60 * 1000).toISOString();
  const { data: vencidas, error } = await supabase
    .from('pensamentos')
    .select('id, item_pendente')
    .in('actor_id', actors.map((a) => a.id))
    .eq('status', 'aguardando_porcoes')
    .lt('created_at', limite);
  if (error) throw new Error(error.message);

  for (const pendencia of vencidas) {
    // Filtro no status evita avisar duas vezes se a resposta chegou no meio.
    const { data: atualizadas, error: updError } = await supabase
      .from('pensamentos')
      .update({ status: 'expirada' })
      .eq('id', pendencia.id)
      .eq('status', 'aguardando_porcoes')
      .select('id');
    if (updError) throw new Error(updError.message);
    if (!atualizadas.length) continue;

    const aviso = `Ingestão não concluída por falta de porções: ${pendencia.item_pendente}.`;
    if (household.telegram_chat_id) {
      await enviarMensagem(household.telegram_chat_id, aviso);
    } else {
      console.warn('Pendencia expirada sem grupo do Telegram pra avisar:', aviso);
    }
  }
}

function iniciarExpiracaoPorcionamento() {
  setInterval(() => {
    expirarPendenciasPorcionamento().catch((err) => {
      const causa = err?.cause ? ` (causa: ${err.cause.code || err.cause.message || err.cause})` : '';
      console.error('Erro no job de expiracao de porcionamento:', err.message + causa);
    });
  }, INTERVALO_MIN * 60 * 1000);
}

module.exports = { iniciarExpiracaoPorcionamento, expirarPendenciasPorcionamento };
