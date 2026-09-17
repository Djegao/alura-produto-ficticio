# Concierge — criar o eval do Episódio D ao vivo (passo 5 do ciclo completo)

> Escrito em 17/09, pré-debatido nesta sessão pra você seguir fluido em
> câmera. Formato Tela · Fala · Ação, mesmo padrão de
> `docs/aula-bonus-evals-do-zero-roteiro.md` — cada bloco tem o que
> aparece na tela, o texto exato pra falar/colar, e o que fazer com as
> mãos. **Ramificações** (o que fazer se o Claude responder diferente do
> esperado) vêm marcadas, do mesmo jeito que na 2.5.
>
> **Pré-requisito:** este passo assume que o passo 4 (código real do fix,
> `docs/aula4-concierge-codigo-episodio-d.md`) já está mergeado e no ar,
> com esta interface exata (é o contrato que o código precisa cumprir pra
> este roteiro funcionar sem improviso):
>
> - `pensamentos.status` aceita `'aguardando_porcoes'`, `'completo'` e
>   **`'expirada'`** (terceiro valor, adicionado em 17/09 — ideia do Diego:
>   uma pendência nunca resolvida não fica muda, um job a marca expirada e
>   avisa a casa).
> - Coluna `pensamentos.item_pendente` (texto) guarda o nome do prato
>   esperando número de porções.
> - Toda pendência criada grava `trace_id` (o campo já existe no schema e
>   já é preenchido no insert normal — só precisa valer também pro insert
>   novo do fluxo de pendência).
> - Quando a pendência resolve, o mesmo registro (ou um novo, referenciando
>   o item) vira `status='completo'`. Quando expira sem resposta, vira
>   `status='expirada'`.
>
> **Mudança importante em relação à primeira versão deste documento:** o
> sinal do eval não calcula mais janela de tempo — ele só **lê o `status`**
> que o produto já decidiu. Isso ficou mais simples depois que o passo 4
> passou a expirar pendências explicitamente em vez de deixá-las
> indefinidas.
>
> Se o passo 4 saiu com nomes diferentes, ajuste os trechos de código
> deste documento antes de gravar — a lógica não muda, só os nomes.

---

## Setup antes de gravar (OFF-camera)

1. **Confirme que o fix está em produção** — rode uma consulta de
   aquecimento (mesmo espírito da 2.5) contra o Supabase real:
   ```powershell
   node -e "require('dotenv').config(); const {createClient}=require('@supabase/supabase-js'); const s=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY); s.from('pensamentos').select('status').limit(1).then(({data,error})=>console.log(data,error))"
   ```
   Se der erro de coluna/valor inexistente, o fix não subiu — pare e
   resolva antes de gravar este passo.
2. **Confirme o trace histórico "antes" continua no Langfuse — e faça o
   backfill, disclosed, antes de gravar.** Trace 2 do Episódio D
   (`240ad5bb32...`, ver `docs/apoio/evidencia-porcionamento-patinho.md`)
   é o que criou a pendência original — "Preparei hambúrguer de patinho,
   220g...". **Problema:** o bug original nunca persistia nada (é
   literalmente o defeito que o passo 4 corrigiu), então não existe hoje
   nenhuma linha em `pensamentos` com `trace_id = '240ad5bb32...'` pro
   eval novo ler. Sem essa linha, o sinal cai em "não se aplica" e o
   critério passaria — o oposto do que a demo precisa provar.

   **Solução: backfill manual, off-camera, disclosed em fala on-camera.**
   É reconstrução de evidência real documentada (já está em
   `evidencia-porcionamento-patinho.md`), não fabricação — só falta entrar
   na tabela nova que não existia em 14/09:
   ```sql
   insert into pensamentos (actor_id, tipo, descricao, status, item_pendente, trace_id, created_at)
   select id, 'porcionamento', 'Preparei hambúrguer de patinho, 220g...', 'expirada',
          'hambúrguer de patinho', '240ad5bb32...', '2026-09-14T21:18:05Z'
   from actors where name = 'Diego' limit 1;
   ```
   (ajuste `actor_id`/nome conforme o ator real da mensagem 2 — confirme
   em `evidencia-porcionamento-patinho.md` antes de rodar). Grave o status
   já como `'expirada'` — o job novo não precisa (e não deve) rodar contra
   dado de 14/09 retroativamente, isso já é o resultado final conhecido.

   **Fala pra usar em câmera, sem escondido:** "Essa linha eu inseri à
   mão, com o timestamp real do incidente — o bug original nunca guardava
   isso, é por isso que ele existia. Não é trapaça, é a mesma evidência
   documentada, só entrando na estrutura que não existia na época."

   **Atenção à retenção de 30 dias do Langfuse** (mesmo aviso já em vigor
   pra Aula 3) — se o trace já tiver caído do Langfuse, o backfill ainda
   funciona pro Supabase (o eval lê `pensamentos`, não recalcula do
   trace), mas você perde a possibilidade de abrir o trace real ao vivo
   pra contexto visual.
3. **Planeje a réplica "depois".** Você vai mandar, ao vivo, no Telegram de
   produção, uma sequência equivalente às mensagens 2 e 3 do episódio real
   (pode usar outro prato pra não confundir com o dado histórico — ex.:
   "Preparei frango desfiado, 300g" → esperar a pergunta → "Porcionei em 3
   unidades"). **Anote o nome do prato escolhido antes de gravar** — você
   vai precisar dele no comando do passo 6.
4. **Abra três coisas, sem fechar durante o segmento:**
   - Chat do Claude (pode ser esta conversa)
   - Editor, aba `evals/criterios.md`
   - Terminal PowerShell, na pasta do projeto

---

## Passo 5.1 — Propor o critério (3-4 min)

**TELA:** slide "O ciclo que só se prova entre mensagens" (ou equivalente
— título sugerido) → depois o chat do Claude, tela cheia.

**FALA (antes de colar)**

A Aula 2.5 criou um eval do zero pra uma operação que nunca tinha eval. Hoje
é diferente: a operação (`ingerir-relato`) **já tem** eval — três critérios,
Aula 2. Só que nenhum deles pega o Episódio D, porque todos julgam **um
trace por vez**, e a falha do hambúrguer que sumiu só existe **entre**
quatro traces. Vou pedir pro Claude um critério novo com essa restrição
explícita.

**AÇÃO — cole exatamente este prompt:**

```
Contexto: `ingerir-relato` já tem três critérios de eval de trace único
(evals/criterios.md). Um achado real (Episódio D, docs/aula4-investigacao-sdd.md)
não é pego por nenhum: um guardrail pergunta "quantas porções rendeu X"
quando falta o número; a resposta pode chegar numa mensagem separada, sem
repetir o nome do prato. Corrigimos isso persistindo a pendência
(pensamentos.status = 'aguardando_porcoes', item_pendente = nome do prato,
trace_id = o trace que perguntou) até uma mensagem posterior resolver — e
se ninguém responder dentro de 20 min, um job marca status='expirada' e
avisa a casa explicitamente, em vez de deixar a pendência muda.

Regra de ouro do projeto: a LLM nunca decide algo 100% verificável em
código. O destino final da pendência (completo/expirada/ainda pendente) já
é um fato gravado no banco pelo próprio produto — não é julgamento.

Proponha UM critério de eval, no formato de evals/criterios.md (nome,
pergunta, escala, "se falhar o que acontece"), pra responder: "quando este
trace criou uma pendência de porcionamento, ela chegou a se resolver, ou o
produto reconheceu explicitamente que não resolveu?" — sabendo que isso
exige olhar OUTROS traces/pensamentos além do atual, não só o material de
um trace isolado, e que "avisou que falhou" não é o mesmo que "resolveu de
verdade" (o item ainda não foi pro estoque).
```

**AÇÃO:** deixe a resposta terminar. Leia em voz alta o critério proposto.

**FALA (ramificação A — se o Claude propuser que a LLM julgue "a pergunta
fazia sentido" ou algo qualitativo em cima do sinal)**

Interessante, mas separa duas coisas: se resolveu ou não é fato, 100% banco
de dados — isso não entra pro juiz decidir. Se sobra alguma pergunta de
qualidade *depois* do fato apurado, tipo "a pergunta foi clara", isso é um
critério **diferente**, não este.

**FALA (ramificação B — cenário mais provável — ele propõe corretamente um
critério binário "resolveu ou não", já delegando o cálculo pro código)**

Isso. Repara que ele já separou o que é fato (resolveu/não resolveu) do
que seria opinião — nem tentou fazer o modelo comparar timestamp.

---

## Passo 5.2 — Debater contra a realidade (3-4 min)

**TELA:** slide/tabela com os 4 traces do Episódio D (dados já congelados
em `docs/apoio/evidencia-porcionamento-patinho.md` — não abrir o markdown
em si, mostrar como tabela no slide, igual a 2.5.4 fez com a tabela do
Supabase).

**FALA**

Antes de fechar o critério, bato contra o que realmente aconteceu em
produção, 14 de setembro. Quatro mensagens, 21h17 às 21h18, cada
classificação individual correta — e ainda assim o prato nunca entrou no
estoque. **[aponta a tabela]** Mensagem 2 cria a pendência. Mensagem 3
tenta responder, mas sem repetir o nome do prato — perde a referência.
Mensagem 4 já nem é reconhecida como resposta pendente.

Isso é exatamente o motivo de este eval não poder ser "olhe o trace 3 e
julgue" — o trace 3, isolado, está perfeito. O problema só existe quando
você olha o par 2→3 junto. É esse par que o critério novo precisa
enxergar.

---

## Passo 5.3 — Fechar o critério no documento (2 min)

**TELA:** editor, aba `evals/criterios.md`, no fim da seção de
`ingerir-relato`.

**AÇÃO:** cole este bloco (já debatido — é o candidato final, ajuste só se
o passo 5.1 tiver saído com nome diferente):

```markdown
### `ciclo_pergunta_resposta_resolvido` — binário

**Pergunta:** quando este trace criou uma pendência de guardrail (pediu um
dado que faltava, ex.: número de porções), o produto chegou a um destino
final visível — resolveu, ou reconheceu explicitamente que a ingestão não
se concluiu por falta do dado — em vez de deixar a pendência esquecida sem
sinal?

**Como julgar:** sinal 100% apurado em código
(`sinais_apurados_em_codigo.status_da_pendencia`) — lê direto o `status`
que o próprio produto já decidiu para a pendência que este trace criou (se
criou alguma). `null` (nenhuma pendência criada) ou `completo` → critério
vale 1. `expirada` → vale 0: o guardrail perguntou, ninguém respondeu a
tempo, e o produto avisou "ingestão não concluída por falta de X" em vez
de silêncio — mas o resultado de produto (o item no estoque) continua
sendo uma falha. `aguardando_porcoes` no momento da avaliação → ainda não
dá pra julgar, pule este trace nesta rodada (rode o eval de novo depois da
janela passar). O juiz não decide nada disso, só lê o sinal pronto — mesma
convenção de `nao_repete_semana_anterior` (Aula 2.5), agora mais simples
porque o produto (não o eval) já apura o destino final.

**Se falhar, o que acontece?** achado real de 14/09 (Episódio D): um prato
de verdade, cozinhado e porcionado, nunca entra no estoque — e nenhum dos
três critérios de trace único aponta isso, porque cada mensagem, isolada,
está classificada certo. É a categoria de falha que só existe no ciclo, não
na mensagem. Desde 17/09, pelo menos a falha vira aviso explícito
("Ingestão não concluída por falta de porções: X") em vez de ausência
completa de sinal — mas isso não é a mesma coisa que o item aparecer no
estoque, e o eval precisa continuar reprovando esse caso.
```

**AÇÃO:** salvar (`Ctrl+S`).

**FALA (fechando o slide/documento)**

Igual na 2.5: o documento final não é a primeira resposta — é a proposta
menos o que já é código, mais o que os quatro traces reais mostraram.

---

## Passo 5.4 — Virar código (4-5 min)

**TELA:** editor, novo arquivo `evals/run-eval-ciclo-pergunta-resposta.js`
(mesmo padrão de arquivo standalone que `run-eval-receita-premium.js` já
usa pra `receita-premium-semanal` — este critério também não cabe no
`montarMaterial` síncrono de `run-evals.js`, porque precisa consultar o
Supabase).

**FALA (antes de pedir pro Claude)**

Este critério não cabe no pipeline principal como está — ele só olha o
trace que tem na mão, e aqui eu preciso consultar o banco pra saber se uma
mensagem *depois* resolveu. A Aula 2.5 já resolveu esse mesmo problema pra
outro caso — vou pedir pro Claude seguir o mesmo molde.

**AÇÃO — cole este prompt:**

```
Crie evals/run-eval-ciclo-pergunta-resposta.js, no MESMO padrao estrutural
de evals/run-eval-receita-premium.js (mesmas funcoes langfuse/gravarScore,
tool_choice forcado no juiz, flags --dry-run/--limit/--sem-cor).

Ao inves de operar sobre um trace so, este script:
1. Busca traces da operacao 'ingerir-relato' no Langfuse (mesmo helper
   buscarTraces do outro arquivo).
2. Para cada trace, consulta a tabela `pensamentos` no Supabase filtrando
   por trace_id = trace.id E status = 'aguardando_porcoes' (a pendencia
   que ESSE trace, se algum, criou).
3. Se achou pendencia, busca depois um pensamento tipo='porcionamento',
   status='aguardando_porcoes' (a pendencia que ESSE trace, se algum,
   criou), e le o campo `status` direto do resultado — sem calcular
   nenhuma janela, o produto ja decidiu isso (aguardando_porcoes /
   completo / expirada, ver capitulo 4.4.4 do fix). Isso vira o sinal
   `status_da_pendencia` (um desses tres valores, ou `null` se o trace nao
   criou pendencia nenhuma).
4. O criterio unico e' `ciclo_pergunta_resposta_resolvido`, formato de
   evals/criterios.md ja escrito la (binario: 1 se status_da_pendencia e'
   null OU 'completo'; 0 se for 'expirada'; se for 'aguardando_porcoes',
   PULE este trace da rodada — nao force um valor, ainda e' cedo pra
   saber). O juiz so' le o sinal, nao decide nada.

Regra do projeto: nada falha em silencio — erro de consulta ao Supabase
tem que propagar, nao virar `|| []`/`|| null`.
```

**AÇÃO:** enquanto ele escreve, aponte na tela os três blocos que devem
aparecer (mesma estrutura de `run-eval-receita-premium.js`): a função
`apurarStatusDaPendencia` (equivalente a `apurarSinalRepeticao`, linha
~164 daquele arquivo — só que mais simples aqui, porque não recalcula
janela, só lê o `status`), `montarMaterial` (equivalente à linha ~191), e
o `TOOL_JUIZ` (linha ~226).

**FALA (enquanto ele escreve)**

Repara: ele não inventou uma estrutura nova — reaproveitou a mesma forma
que resolveu "essa receita já foi sugerida antes" na 2.5. E fica ainda
mais simples que aquele caso, porque agora nem o eval decide o que é
"resolvido" — o produto já decidiu isso sozinho, no capítulo anterior.

**AÇÃO:** salve o arquivo gerado.

---

## Passo 5.5 — Rodar antes e depois (4-5 min, o clímax do módulo)

**TELA:** terminal PowerShell, tela cheia (fonte grande).

### "Antes" — o trace histórico, nunca resolvido

**AÇÃO:**
```powershell
node evals/run-eval-ciclo-pergunta-resposta.js --limit 20 --dry-run
```

**FALA (apontando o trace `240ad5bb32...` na saída)**

Ali está: o trace de 14 de setembro que perguntou quantas porções rendeu o
hambúrguer de patinho. Nota 0. E uma nota de transparência: a linha que
guarda essa pendência no banco eu inseri à mão antes de gravar — com o
timestamp real do incidente — porque em 14/09 o produto ainda não
persistia nada, esse era exatamente o bug. Não é dado fabricado, é o
mesmo achado documentado, só entrando na estrutura que não existia na
época. E o resultado é real: nenhuma mensagem depois resolveu essa
pendência.

### "Depois" — replicar ao vivo, contra produção

**AÇÃO:** no Telegram do grupo real, mande a mensagem preparada no setup
(ex.: "Preparei frango desfiado, 300g"). Espere o bot perguntar quantas
porções. Responda só o número ("Porcionei em 3 unidades"), sem repetir o
nome do prato — **de propósito**, é o mesmo padrão da mensagem 3 real, que
antes falhava.

**FALA (enquanto espera a resposta do bot)**

Isso aqui é a mesma sequência que quebrou em 14 de setembro. A diferença é
o código que a gente acabou de fechar no passo anterior.

**AÇÃO:** confirme na tela do Telegram que o bot reconheceu a resposta como
continuação (mensagem de confirmação mencionando o prato certo, não uma
pergunta nova nem um "desejo" mal-classificado). Depois, no terminal:

```powershell
node evals/run-eval-ciclo-pergunta-resposta.js --limit 5 --dry-run
```

**FALA (apontando o trace novo, score 1)**

Mesmo critério, mesmo script, trace novo — resolvido. Isso é o antes e
depois no Langfuse que a Aula 3 ensinou a procurar, só que agora fechando
um ciclo que a gente mesmo diagnosticou, decidiu, implementou e testou
hoje.

**[SE o bot não reconhecer a continuação — ver "Se travar" no fim]**

---

## Passo 5.6 — Gravar o Score de verdade (1 min, opcional)

Se quiser o Score reamente escrito no Langfuse (não só `--dry-run`), rode
sem a flag:

```powershell
node evals/run-eval-ciclo-pergunta-resposta.js --limit 5
```

Decida na hora se isso entra no vídeo — é o mesmo tipo de decisão que a
2.5 tomou (manter dry-run como evidência congelada). Aqui, diferente da
2.5, o fechamento do módulo pede um PR e um merge reais — então gravar o
Score real reforça a história de "fechou de verdade", não só narrou.

---

## Se travar

**Frase âncora:** "O trace isolado estava perfeito nas quatro mensagens —
o que faltava era um jeito de olhar o par pergunta-resposta, não a
mensagem sozinha."

Se o Telegram de produção não responder como esperado ao vivo (rede,
guardrail pegando um caminho diferente do esperado): você já tem o "antes"
garantido (trace histórico). Para o "depois", tenha um segundo trace já
testado **antes de gravar** (rodado no setup, não em câmera) como
plano B — mesma convenção de números congelados que a Aula 2/2.5 usam
quando o Supabase falha em cena.

Se `run-eval-ciclo-pergunta-resposta.js` der erro de coluna/nome
inexistente: o fix do passo 4 saiu com nomes diferentes do que este
documento assume — confira contra o código real do fix antes de tentar de
novo, não adivinhe em cena.
