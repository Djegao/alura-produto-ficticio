# Aula 4 — redesign para ciclo completo (rascunho de planejamento)

> Escrito em 17/09, antes da gravação (adiantada de 18/09 para hoje).
> Decisão desta sessão: reestruturar o Módulo 4 pra puxar o diagnóstico
> (`docs/aula4-investigacao-sdd.md`) pra dentro de um ciclo completo, no
> mesmo espírito da Aula bônus 2.5 (`docs/aula-bonus-evals-do-zero-roteiro.md`),
> mas com duas diferenças deliberadas em relação à 2.5:
>
> 1. **Fecha o módulo**, não é bônus solto — precisa amarrar com o que já
>    foi ensinado em 4.1–4.5 do script atual (`aula4-script.md`).
> 2. **É real, não simulado.** Código, eval e PR de verdade — decidido
>    nesta sessão, ao contrário do PR simulado da 2.5.
>
> **Episódio escolhido como centerpiece: D — "o hambúrguer que sumiu"**
> (decidido nesta sessão). Motivo: é o único dos quatro episódios cuja
> causa é arquitetural (não prompt/dados/modelo), cujo fix reaproveita um
> padrão que já existe no produto, e cujo backlog já aponta a necessidade
> de um eval novo — cobre diagnóstico→SDD→código→eval sozinho, sem precisar
> forçar costura entre episódios diferentes.
>
> **Episódio C (lasanha/lasagna) permanece intocado** — é o gancho de
> abertura da Aula 5 (guardrails/transparência), confirmado em `CLAUDE.md`
> e no próprio doc de investigação. Não entra neste redesign.
>
> **Status: plano, não roteiro final.** Falta você revisar as decisões em
> aberto (seção final) antes de eu escrever o Slide·Script definitivo.

---

## Os 7 passos, mapeados ao que já existe e ao que falta

### 1. Diagnóstico — já pronto, não precisa refazer ao vivo

Material congelado: `docs/aula4-investigacao-sdd.md`, seção "Episódio D".
Recapitular como abertura do módulo (2-3 min, sem Claude aberto): as quatro
mensagens reais, cada uma classificada certo, resultado líquido zero. É o
mesmo achado que já está em `aula4-script.md` 4.2 (slide 11) — a mudança é
que agora ele deixa de ser só ilustração e vira o gatilho do resto da aula.

### 2. Debate diante do relatório — ao vivo, formato 2.5

Abre o chat do Claude com o backlog priorizado do Episódio D como contexto
(as 4 prioridades P1–P4 já escritas no doc de investigação). Pergunta a
fazer ao vivo, nos mesmos moldes do prompt da 2.5.3: **qual dessas opções
resolve o caso real sem herdar o risco de memória de conversa completa?**

O documento já tem a resposta redigida (P1: reaproveitar o padrão
`perguntarOrcamento`/`bg:`), então o debate ao vivo não é "descobrir do
zero" — é **validar a recomendação já registrada contra o código real**,
igual a 2.5.4 validou a proposta do Claude contra o Supabase real. Isso
mantém a autenticidade sem depender de o Claude acertar de primeira num
código que ele nunca viu.

### 3. SDD — formalizar a restrição

Diferente da 2.5 (que só documentou em `evals/criterios.md`), aqui a saída
é uma entrada real em `SDD.md` — o produto ganha uma restrição de design
nova, não só um eval. Rascunho da restrição, com base no código atual
(`telegram.js:71-79`, `intencao-efeitos.js:145-168`):

> **Toda pergunta de guardrail que pode ter resposta em mensagem separada
> precisa persistir estado de "pendente" antes de perguntar — nunca confiar
> em memória de conversa implícita.** Hoje só o fluxo de orçamento
> (`aguardando_categoria` + `callback_data: bg:categoria:id`) faz isso.
> Porcionamento pergunta em texto livre e **não grava nada** enquanto
> `pergunta != null` (`intencao-efeitos.js:176-178`) — não existe pendência
> pra a próxima mensagem checar contra.

Acho que essa é a frase-chave pra puxar do relatório pro SDD — mas é
exatamente o tipo de frase que vale bater com você antes de eu commitar em
`SDD.md`, porque vira restrição permanente do produto, não conteúdo de
aula.

### 4. Código — o fix real

Desenho técnico (levantado nesta sessão, ainda não escrito):

- Quando `intencao-efeitos.js` monta `pergunta` no ramo `porcionamento`
  (linhas 165-169) **e já existe `item_nome`**, persistir um pensamento com
  `status: 'aguardando_porcoes'` (mesmo padrão do `aguardando_categoria`)
  guardando `item_nome` e `chat_id` — hoje isso não acontece, a função
  retorna sem gravar nada (linha 179: `if (!pergunta)`).
- Em `telegram.js`, antes de classificar uma mensagem nova do zero,
  checar se existe um pensamento `aguardando_porcoes` pendente pro mesmo
  `chat_id`. Se existir e a mensagem nova tiver só o número de porções
  (sem repetir o nome do prato — exatamente a mensagem 3 do episódio real,
  "Porcionei em 2 unidades de 220g e 2 unidades de 160g"), resolver contra
  o `item_nome` já guardado em vez de perguntar de novo/classificar como
  `desejo`.
- Escopo deliberadamente **menor** que P2 do backlog (que generaliza pra
  qualquer guardrail) — replica só o padrão pro caso de porcionamento,
  igual o backlog recomenda.

**Ponto em aberto:** isso é código de produção real (Telegram, banco). Different
from a 2.5, que rodou só leitura contra Supabase. Ver "Decisões em aberto"
abaixo sobre onde testar isso sem arriscar o webhook de produção durante a
gravação.

### 5. Evals — o critério novo (P4 do backlog)

Não existe hoje avaliação multi-trace no projeto — `evals/run-evals.js` e
`evals/run-eval-receita-premium.js` julgam **um trace por vez**. O
critério novo (`ciclo_pergunta_resposta_resolvido` ou nome equivalente)
precisa:

- Olhar uma **janela de pensamentos** por `chat_id`/ator (não um trace
  isolado).
- Sinal apurado em código (convenção do projeto): existe um pensamento com
  `status='aguardando_porcoes'` seguido, dentro de uma janela de tempo, por
  um pensamento `porcionamento` completo pro mesmo `item_nome`? Isso é
  100% verificável sem LLM — só o juiz aplica a régua e o LLM (se sobrar
  algum julgamento qualitativo, tipo "a pergunta feita fazia sentido")
  entra por cima do sinal, igual ao padrão de `nao_repete_semana_anterior`
  da 2.5.
- Decisão em aberto: qual o tamanho da janela de tempo antes de considerar
  "nunca resolvido"? O incidente real levou ~1 min entre as 4 mensagens.

### 6. Observabilidade — testar antes/depois no Langfuse

**Este é o passo mais delicado do plano** — ver decisão em aberto abaixo.
A ideia: rodar o eval novo contra o trace real de 14/09 (reprova, mesmo
resultado do incidente) e depois contra uma conversa nova, pós-fix,
gerando um trace que o mesmo eval aprova. Isso é literalmente "antes e
depois" no Langfuse, o exercício mais forte que o módulo pode fechar com.

### 7. Fechamento do módulo

Recap: dos 5 padrões de falha (A–E, incluindo o achado do 14/09) ao PR real
fechado, com eval provando que o ciclo agora se resolve. Amarra de volta
com a promessa do módulo 4 atual ("detectando degradação" → "diagnosticando"
→ "corrigindo antes do usuário") — a diferença é que agora "corrigindo" tem
prova, não só narrativa.

---

## Decisões em aberto — preciso da sua palavra antes do roteiro final

1. **Onde testar o fix ao vivo sem arriscar produção.** O Telegram bot real
   está em produção, com o grupo real da casa. Reproduzir as 4 mensagens
   do Episódio D ao vivo, contra o webhook de produção, grava dado real no
   banco de novo. Alternativas: (a) um chat/household de teste separado no
   Telegram, (b) um harness offline que chama `relato-ingestao.js` +
   `intencao-efeitos.js` direto, sem Telegram, nos moldes do
   `--dry-run` dos evals. Isso muda o roteiro inteiro do passo 6 — preciso
   que você escolha antes de eu escrever a fala.
2. **O PR real vai de fato pra produção antes da aula acabar, ou fica
   aberto sem merge até você decidir depois da gravação?** Isso afeta se o
   passo 7 mostra "está no ar" ou "está pronto, aguardando seu merge".
3. **Tempo de gravação disponível hoje.** A 2.5 levou 20-25 min pra um
   ciclo Propor/Debater/Fechar mais simples (sem código real, sem eval
   multi-trace). Este ciclo tem mais uma etapa (SDD) e é código real — se
   o tempo de estúdio for curto, talvez valha cortar o passo 3 (SDD escrito
   ao vivo) e levar pronto, só validando em cena.
4. **Quem escreve o eval multi-trace:** ao vivo com o Claude (mesmo padrão
   da 2.5.6) ou preparado antes, como setup, e só demonstrado rodando?
   Dado que é uma peça técnica nova pro projeto (nenhum precedente de
   avaliação multi-trace), fazer 100% ao vivo é mais arriscado que os
   passos de código já vistos em aula.

Assim que você bater essas quatro, eu escrevo o Slide·Script definitivo
substituindo 4.2–4.4 de `aula4-script.md` (mantendo 4.1 "Detectando
degradação" como está, que já funciona como abertura).

---

## Atualização 17/09 — sincronização confirmada

Decidido: **4.2, 4.3 e 4.4 somem como seções separadas** e viram uma aula
única, orgânica, não presa à linearidade do espelho — episódios livres,
seguindo o ritmo de um trabalho de produto real, não o slide-a-slide
antigo. `aula4-script.md` já foi marcado (seções 4.2–4.4 preservadas como
registro histórico, não como roteiro). 4.1 (abertura) e 4.5 (fechamento)
seguem valendo como estão, com 4.5 precisando de revisão de conteúdo
depois que o novo meio existir.

**Episódios do novo meio (nomes provisórios, ordem sugerida — livre pra
reorganizar em câmera):**

1. **Diagnóstico** — recap do Episódio D, material congelado
   (`aula4-investigacao-sdd.md`), 2-3 min, sem Claude aberto.
2. **Debate** — ao vivo com o Claude, validando a recomendação P1 do
   backlog contra o código real. *Roteiro concierge ainda não escrito.*
3. **SDD** — debate em câmera do rascunho pré-manufaturado
   (`aula4-sdd-pre-manufaturado-episodio-d.md`), fechando os 4 pontos
   abertos (nome do status, onde guardar o item pendente, janela de
   expiração, escopo). *Roteiro concierge ainda não escrito — mas o
   conteúdo de debate já está pronto no doc.*
4. **Código real** — implementar o fix, mergear em produção durante a
   gravação. *Roteiro concierge ainda não escrito — é o gap mais urgente,
   porque os episódios 5 e 6 dependem da interface exata que sair daqui.*
5. **Evals** — critério novo multi-trace. Concierge completo já escrito:
   `docs/aula4-concierge-evals-episodio-d.md`.
6. **Observabilidade (antes/depois)** — já coberto dentro do próprio
   concierge de evals (passo 5.5), reaproveitado como o mesmo episódio ou
   separado, sua escolha em câmera.
7. **Fechamento do módulo** — amarra com 4.5, ainda não escrito.

**Gap mais urgente pra você não ficar sem rede em câmera:** os episódios
2 (debate) e 4 (código real) ainda não têm concierge no formato
Tela·Fala·Ação. O 4 é o mais crítico, porque fixa a interface
(`status`, `item_pendente`, `trace_id`) que o concierge de evals já
assume.
