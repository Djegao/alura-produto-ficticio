# Decisão — `repeticao_justificada_pelo_estoque`

> **Fechado em 16/09.** Este documento registra a decisão e o que foi
> descartado; o critério final está em `evals/criterios.md` (operação
> `receita-premium-semanal`) e a implementação em
> `evals/run-eval-receita-premium.js`.

---

## O critério, no formato de `criterios.md`

### `repeticao_justificada_pelo_estoque` — 0 a 1

**Pergunta:** quando o vídeo escolhido nesta semana já havia sido sugerido em
uma semana anterior para a mesma casa, essa repetição faz sentido dado o
estoque atual, as preferências da casa e os vídeos novos que estavam
disponíveis no feed no momento da decisão?

**Escala:**
- **1.0** — repetiu porque não havia vídeo novo relevante no feed (poucos
  lançamentos, ou os novos não combinam com estoque/preferências), OU o
  estoque ainda favorece fortemente aquela receita (ex.: ingrediente
  perecível específico sobrando, mesma situação da vez anterior) — e a
  justificativa do modelo menciona isso.
- **0.5** — repetiu havendo alternativa razoável no feed, sem uma
  justificativa forte pra preferir repetir.
- **0.0** — repetiu com vídeos novos claramente melhor aproveitáveis
  disponíveis (batem com estoque/preferências) e sem menção a isso na
  justificativa — sinal de que o modelo não está de fato olhando o feed, só
  repetindo o que já tinha escolhido.
- **N/A (não se aplica / não gera score)** — quando não houve repetição
  (vídeo é inédito para a casa). Não deveria virar 1.0 automático — é
  simplesmente um caso fora do domínio do critério. Ver "dúvida em aberto"
  abaixo sobre como tratar isso no pipeline.

**Se falhar, o que acontece?** o valor do produto é trazer variedade real
toda semana — é literalmente por isso que o feed é consultado de novo a cada
rodada em vez de fixar uma lista. Repetição não justificada é indistinguível,
pra quem recebe a mensagem no Telegram, de "o modelo não está prestando
atenção" — mina a confiança na única decisão que é da LLM nessa operação
(a escolha do vídeo; tudo o resto — dedupe semanal, persistência, lista de
compras — já é determinístico).

**Nota didática (mesmo padrão de `ancoragem_no_texto`):** este critério só
existe porque dois fatos são apuráveis em código, não em julgamento — "esse
vídeo já foi sugerido antes pra essa casa" (comparação de `video_url` no
histórico) e "quais vídeos do feed daquela rodada não foram escolhidos". O
juiz recebe os dois prontos e avalia só o que não é apurável: se a
justificativa dada pelo modelo é uma razão real ou um preenchimento vazio.

---

## Sinais a apurar em código (regra de ouro do projeto: LLM não faz aritmética)

Pra alimentar o juiz, o material da interação precisaria trazer, calculado
em JS a partir de `premium_suggestions` (não estimado, não perguntado ao
modelo):

```js
// Rascunho — NÃO integrado a run-evals.js. Ilustra a forma do sinal.
async function apurarSinaisRepeticao({ householdId, weekStart, videoUrlEscolhido }) {
  const { data: anteriores, error } = await supabase
    .from('premium_suggestions')
    .select('week_start, video_title, video_url')
    .eq('household_id', householdId)
    .lt('week_start', weekStart)
    .order('week_start', { ascending: true });
  if (error) throw new Error(error.message);

  const ocorrenciaAnterior = anteriores.find((s) => s.video_url === videoUrlEscolhido);

  return {
    video_ja_sugerido_antes: !!ocorrenciaAnterior,
    semana_da_ocorrencia_anterior: ocorrenciaAnterior?.week_start ?? null,
    semanas_desde_ultima_vez: ocorrenciaAnterior
      ? Math.round((new Date(weekStart) - new Date(ocorrenciaAnterior.week_start)) / (7 * 24 * 3600 * 1000))
      : null,
    // Ver "dúvida em aberto" — depende de o feed completo daquela rodada
    // estar preservado no trace, o que hoje NÃO está (ver bloqueio abaixo).
    videos_novos_disponiveis_nao_escolhidos: null, // placeholder
  };
}
```

## Bloqueio de instrumentação (achado ao escrever este draft)

Ao ler `receita-premium.js` de novo com esse critério em mente: a chamada ao
Claude registra no Langfuse **só a contagem** de vídeos e itens de estoque —

```js
const generation = agent.startObservation(
  'escolher-video',
  { input: { videos: videos.length, estoqueItens: estoque.length }, model },
  { asType: 'generation' }
);
```

— não a lista real (`videosResumo`, `estoqueResumo`) que de fato foi enviada
pro modelo na mensagem. Isso é diferente do padrão usado em `agent.js`, onde
`input: messages` grava a conversa inteira. Sem a lista completa de vídeos
disponíveis naquela rodada, o sinal
`videos_novos_disponiveis_nao_escolhidos` não é reconstruível depois — o
juiz não teria como saber se havia alternativa melhor no feed, só que houve
repetição.

**Isso não foi corrigido aqui** — é mudança em arquivo original e o pedido
foi não mexer neles ainda. Registro como pré-requisito real: pra este
critério funcionar contra traces de produção, `receita-premium.js` precisa
passar a logar `input: { videosResumo, estoqueResumo }` (ou o array
estruturado de vídeos) na observação `escolher-video`, não só as contagens.
Traces gerados *antes* dessa mudança não têm o dado necessário pro juiz —
só dá pra aplicar o critério em interações futuras.

## Rascunho do schema de tool pro juiz (formato igual ao de `run-evals.js`)

```js
// Rascunho — seguiria o padrão de ferramentaDoJuiz() em run-evals.js
const CRITERIO_REPETICAO = {
  nome: 'repeticao_justificada_pelo_estoque',
  tipo: 'NUMERIC', // 0-1, com um valor de sentinela pra "não se aplica" — ver dúvida em aberto
  descricao:
    'De 0 a 1: quando sinais_apurados_em_codigo.video_ja_sugerido_antes = true, a repeticao faz sentido dado ' +
    'o estoque, as preferencias e os videos novos disponiveis no feed (videos_novos_disponiveis_nao_escolhidos)? ' +
    '1.0 = repetiu por falta real de alternativa relevante, e a justificativa do modelo menciona isso; ' +
    '0.5 = repetiu havendo alternativa razoavel, sem justificativa forte; ' +
    '0.0 = repetiu com alternativa claramente melhor disponivel e sem mencionar. ' +
    'Se video_ja_sugerido_antes = false, nao houve repeticao: registre valor 1.0 e diga isso na justificativa ' +
    '(nao se aplica, nao e mesma coisa que "repeticao boa" — ver nota de agregacao).',
};
```

## Decisões tomadas em 16/09 (gravação)

1. **"Não houve repetição" não vira Score.** O juiz só é chamado quando
   `video_ja_sugerido_antes = true`. Não existe 1.0 "automático" pra semana
   sem repetição — isso evitaria diluir a média com casos fora do domínio do
   critério, exatamente a ambiguidade que a opção (b) do rascunho original
   introduzia. Trace sem repetição simplesmente não gera esse Score no
   Langfuse; o relatório do pipeline reporta quantos traces foram "N/A" à
   parte da média.
2. **Comparação é contra qualquer semana anterior**, não só N-1 — mantido
   como no rascunho original. Peso diferenciado por distância entre semanas
   ficou registrado como melhoria futura (ver "Pendências" abaixo), não
   bloqueia a primeira versão.
3. **Instrumentação corrigida.** `receita-premium.js` agora loga
   `videosDisponiveis` (título+url de cada vídeo do feed) e `estoqueResumo`
   na observação `escolher-video`, não só a contagem. Traces anteriores a
   essa mudança não têm o dado necessário — o pipeline de eval trata isso
   como falha reportada, não como 0 silencioso (mesma convenção de
   `detalharErro` do `run-evals.js`: nada engolido em silêncio).

## O que ficou explicitamente FORA deste eval (registrado, não perdido)

Descartado durante o debate desta sessão, por contradizer a regra de ouro do
projeto (aritmética é código, não julgamento de LLM) — ver a seção nova "O
que deliberadamente não virou critério" em `criterios.md`:

- `entrega_no_prazo` — comparar timestamp do trace com a janela de sexta
  10h é aritmética pura. Se isso virar necessidade real, é um script de
  monitoramento separado (consulta a `premium_suggestions`/traces por data),
  não um critério de Claude-as-judge.
- `sem_semana_pulada` — mesma razão: detectar gap em `week_start` é uma
  query, não um julgamento.

## Pendências para priorização futura (não bloqueiam esta v1)

- Peso por distância entre semanas (repetir a 8 semanas de distância é mais
  defensável que repetir na semana seguinte) — hoje o critério trata os dois
  casos com a mesma pergunta ao juiz, sem diferenciar `semanas_desde_ultima_vez`
  na rubrica.
- Se o produto crescer pra múltiplas casas com o mesmo canal fonte, o
  universo de vídeos "não repetíveis" pode esgotar mais rápido que o canal
  publica — nesse cenário, `repeticao_justificada_pelo_estoque` = 1.0 legítimo
  vai ficar mais comum, e pode valer a pena separar "sem alternativa no
  feed" de "estoque favorece repetir" como dois sinais distintos em vez de
  uma única rubrica 0–1.
- Traces anteriores à correção de instrumentação (16/09) não são
  avaliáveis por este critério — não há reprocessamento retroativo possível
  sem a lista de vídeos daquela rodada.
