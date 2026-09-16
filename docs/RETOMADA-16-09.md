# Retomada — 16/09

> Escrito em 16/09, no fim da gravação da **Aula bônus 2.5 (Evals na
> prática)**. Substitui `RETOMADA-15-09.md` como ponto de partida.

## Prompt para colar numa sessão nova

```text
Continuando a preparação do curso Alura "Evals, observabilidade e conformidade".
A Aula bonus 2.5 (evals na pratica) foi gravada em 16/09. Agora é a Aula 3
(observabilidade).

Antes de qualquer coisa:

1. Leia docs/RETOMADA-16-09.md e depois docs/aula2-4-ensaio.md (é o modelo de
   ensaio que funcionou: TELA, FALA desenvolvida, marcos por número de linha,
   riscos e demos validadas antes de escrever a fala).
2. Confirme o estado: produção em 401, chave da Anthropic respondendo, se a
   branch aula-bonus/eval-receita-premium-repeticao ja foi mergeada ou segue
   pendente de push (ver "Pendências" abaixo), e se os traces das demos
   ainda estão no Langfuse (retenção ~30 dias).
3. Me diga em uma linha o que fazer primeiro.

Convenções que não devo violar:
- Falhas preservadas de propósito são conteúdo de aula. Não corrigir sem
  perguntar.
- Demo ao vivo se valida ANTES de escrever a fala. Rodar 2 ou 3 vezes e
  congelar os números; o que varia não entra em promessa.
- Não fazer deploy, merge nem push sem eu pedir.
- Aritmética (datas, contagem, comparação) é sempre código, nunca critério de
  Claude-as-judge — decisão reafirmada nesta sessão, ver abaixo.
```

## Estado em 16/09, fim da gravação

| Item | Estado |
|---|---|
| Aula bônus 2.5 (evals na prática) | ✅ **gravada** — construção ao vivo de um eval do zero, do debate de critério até o relatório do juiz rodando contra trace real |
| Branch da Aula 2.5 | `aula-bonus/eval-receita-premium-repeticao`, commitada localmente (`de847e9`), **push ainda não feito** — sem credenciais Git no ambiente da sessão (ver "Pendências") |
| Branch de gravação anterior | `gravacao/aulas-3-e-4-material`, sem alteração nesta sessão |
| Produção | não tocada nesta sessão — segue como em 14/09 (401, PRs #4/#6 mergeados) |
| Próximo | **Aula 3 — observabilidade** |

## O que foi construído na Aula 2.5

Eval novo, do zero, pra operação `receita-premium-semanal` (o job semanal
de `receita-premium.js`), que até esta sessão não tinha nenhum critério de
qualidade — só as três operações do agente conversacional (`sugerir-receita`,
`mediar-cardapio`, `ingerir-relato`) tinham.

**Critério final: `repeticao_justificada_pelo_estoque` (0 a 1, Claude-as-judge).**
Julga se, quando o vídeo premium da semana repete um já sugerido antes pra
mesma casa, a repetição faz sentido dado o estoque/preferências e os vídeos
novos que estavam disponíveis no feed — ou se é só o modelo não olhando pro
feed de verdade.

**Decisão didática central da aula** (o próprio debate virou conteúdo):
dois critérios óbvios foram propostos e **descartados de propósito** —
`entrega_no_prazo` e `sem_semana_pulada`. Ambos são aritmética de data
(comparar timestamp/`week_start`), resolvível 100% em código; virar eval de
LLM pra isso contradiria a regra de ouro do próprio projeto ("a LLM não faz
aritmética", já em `criterios.md`/`SDD.md`). Ficaram registrados em
`evals/criterios.md` (seção "O que deliberadamente não virou critério") como
pendência de observabilidade, não de qualidade.

**Achado ao vivo, sem ensaio:** rodando o eval novo em `--dry-run` contra
traces reais do Langfuse, ele pegou um caso genuíno — o vídeo "Beef
Wellington" foi sugerido de novo uma semana depois de já ter sido sugerido,
e a justificativa do modelo nunca mencionou a repetição. Nota do juiz: 0,15.
Não foi preparado — foi o primeiro caso real que o eval encontrou.

**Arquivos:**
- `evals/draft-repeticao-justificada-pelo-estoque.md` — registro da decisão,
  do que foi descartado e das pendências futuras (peso por distância entre
  semanas, comportamento em escala/múltiplas casas)
- `evals/criterios.md` — critério final documentado, na operação
  `receita-premium-semanal`
- `receita-premium.js` — corrigida uma lacuna de instrumentação achada ao
  escrever o eval: a observação `escolher-video` logava só a **contagem**
  de vídeos/itens de estoque, não a lista real enviada ao modelo. Sem a
  lista, o juiz não tem como saber se havia alternativa melhor no feed.
  Traces anteriores a essa correção não são avaliáveis por este critério
  quando há repetição (o pipeline trata isso como "feed completo
  indisponível" e julga só pela justificativa, sem quebrar).
- `evals/run-eval-receita-premium.js` — pipeline standalone (mesmo padrão de
  `run-evals.js`: `tool_choice` forçado no juiz, sinal de repetição apurado
  em código via Supabase antes de qualquer julgamento, nada falha em
  silêncio). CLI: `--dry-run`, `--limit`, `--sem-cor`.

## Pendências para depois da gravação

**Push da branch `aula-bonus/eval-receita-premium-repeticao` não foi feito.**
O ambiente desta sessão não tem `gh` CLI instalado nem token Git válido pra
`https://github.com/Djegao/alura-produto-ficticio.git` (a tentativa de push
falhou com "Invalid username or token"). O commit `de847e9` está pronto e
local. Pra abrir o PR de fato, rodar de uma máquina autenticada:

```bash
git push -u origin aula-bonus/eval-receita-premium-repeticao
gh pr create --base gravacao/aulas-3-e-4-material \
  --title "Eval: repeticao_justificada_pelo_estoque para receita-premium-semanal" \
  --body "Novo criterio Claude-as-judge para a operacao receita-premium-semanal (ate agora sem eval). Ver evals/draft-repeticao-justificada-pelo-estoque.md pra decisao registrada e evals/criterios.md pro criterio final."
```

**O Score do trace 0,15 não foi gravado no Langfuse** — a rodada de
demonstração foi só `--dry-run`, por decisão explícita de manter como
evidência congelada desta gravação (mesma convenção da Aula 2/3/4). Se
quiser o Score real na UI pra usar em aula futura, rodar
`node evals/run-eval-receita-premium.js --limit 10` sem `--dry-run`.

**Há trabalho não commitado nesta working tree que não é desta sessão** —
`docs/aula2-o-que-aprendemos.md` modificado e `docs/aula-bonus-evals-do-zero-roteiro.md` /
`slides/Aula 2.5 - Evals do zero - inicial.pptx` / `slides/gerador-musa/gerar-aula2.5.ps1`
sem rastrear. Não foram tocados nem incluídos no commit desta sessão
(propositalmente, pra não misturar autoria) — revisar e decidir o que fazer
com eles antes de começar a Aula 3.

**Duas execuções antigas de `receita-premium-semanal` terminaram em erro**
(traces `463d682c0f84...` e `461cc85b29e1...`, nível `AGENT:ERROR`, sem
chegar a escolher vídeo). O eval novo reporta isso como falha em vez de
esconder, mas a causa-raiz não foi investigada nesta sessão — pode virar
conteúdo da Aula 3 (mais um caso de causa-raiz a diagnosticar), se ainda
estiverem no Langfuse quando for gravar.

## Aula 3 — o que foi feito depois (16/09, sessão seguinte)

Script mestre da Aula 3 escrito **para debate**, e o deck fica pra depois de
fechar o debate:

- [`aula3-script.md`](./aula3-script.md): 45 slides, formato Slide · Script (o parser `slides/gerador-musa/parse-script.py` leu sem aviso de orçamento)
- [`aula3-avaliacao-e-plano.md`](./aula3-avaliacao-e-plano.md): ata × espelho, auditoria do ensaio de 14/09, 15 decisões com recomendação, efeitos na Aula 4
- [`apoio/aula3-dados-congelados.md`](./apoio/aula3-dados-congelados.md) + `scripts/aula3-retrato-langfuse.js` (só leitura)
- [`apoio/aula3-preflight-e-apoio.md`](./apoio/aula3-preflight-e-apoio.md), [`aula3-bases.md`](./aula3-bases.md), [`aula3-o-que-aprendemos.md`](./aula3-o-que-aprendemos.md) (rascunho)
- [`persona-ai-product-builder.md`](./persona-ai-product-builder.md): persona completa ingerida

Os dois traces em `AGENT:ERROR` da receita premium citados em "Pendências" **já têm
causa**: `401 API key is invalid` em 28/08 (a chave revogada), antes da troca
das 12h54. Viraram o exemplo do 3.1.

## O que isso prepara para a Aula 3 (observabilidade)

A Aula 2.5 termina exatamente no ponto que a Aula 3 precisa: um Score real
gravado (ou pronto pra gravar) no Langfuse, com uma nota baixa (0,15) e uma
causa identificável no trace — material pronto pra "olhar o trace e
diagnosticar por quê", que é o exercício central da Aula 3. Os dois traces
em erro (`AGENT:ERROR`) são um segundo candidato a diagnóstico, ainda não
explorado.
