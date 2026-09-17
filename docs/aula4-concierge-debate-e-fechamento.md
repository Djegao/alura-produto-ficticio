# Concierge — debate (episódio 2) e fechamento (episódio 7) do Episódio D

> Escrito em 17/09, à tarde, **para debate — não é roteiro aprovado**. Deck
> só depois da sua confirmação (mesma convenção das Aulas 2.5 e 3).
>
> Fecha os dois buracos que faltavam no meio novo da Aula 4. Os outros
> episódios já têm material:
>
> | # | Episódio | Material | Estado |
> |---|---|---|---|
> | 1 | Diagnóstico (recap) | `aula4-investigacao-sdd.md` Episódio D + `apoio/evidencia-porcionamento-patinho.md` | congelado, pronto |
> | 2 | **Debate do caminho** | **este documento** | rascunho |
> | 3 | SDD + quatro decisões | `aula4-sdd-pre-manufaturado-episodio-d.md` + cap. 4.4.1 do concierge de código | pronto — ver sobreposição abaixo |
> | 4 | Código real | `aula4-concierge-codigo-episodio-d.md` | **implementado antes da gravação** (branch `aula4/fix-episodio-d-porcionamento`), em câmera vira leitura + smoke test |
> | 5–6 | Evals + antes/depois | `aula4-concierge-evals-episodio-d.md` | pronto, depende do deploy |
> | 7 | **Fechamento** | **este documento** (substitui 4.5 antigo) | rascunho |

---

## Três decisões pra você bater antes de gravar

### D1. A soma 2+2 da mensagem 3 real — o que fazer com ela?

**O fato (testado hoje, Haiku, 2 rodadas cada):** "Porcionei em 2 unidades
de 220g e 2 unidades de 160g" **nunca** traz `item_quantidade`. Chegar a 4
é soma, e a regra de ouro proíbe a LLM de somar. Com o fix atual, essa
mensagem não se perde mais (o bot pergunta de novo, citando o prato), mas
**também não resolve sozinha** — o Diego de 14/09 ainda teria que mandar
"porcionei em 4".

| Opção | O que é | Custo | Efeito na aula |
|---|---|---|---|
| **A (recomendada)** | Não mexer. Contar em câmera que o fix passa no caso simples e que o caso real ainda pede uma segunda volta. Vai pro backlog. | zero código | Reforça o fio da aula: toda correção abre uma consequência nova pra observar. É honesto e é a ponte natural pro fechamento. |
| B | A LLM extrai **parcelas** (`[{quantidade: 2, peso_g: 220}, {quantidade: 2, peso_g: 160}]`) e o **código soma**. | médio: schema da tool, `intencao-efeitos.js`, novo deploy, novo teste | Resolve o caso real e de quebra a observação antiga das porções não equivalentes (lasanha 4×250 g + 1×330 g). Mas é código novo a poucas horas de gravar, e muda o escopo que o episódio 3 acabou de fechar ("só porcionamento, só o número"). |
| C | Código lê "N unidades" por regex e soma. | baixo | Frágil ("dois de cada" já quebra). Parece solução e não é — não recomendo. |

**Recomendação: A.** B é boa ideia, mas é a segunda volta, não esta.

**✅ Decidido em 17/09: A.** Diego notou no smoke test que o peso também se
perde ("porcionei em 3" não guarda gramas — o schema nunca guardou peso por
porção, mesma observação da lasanha 4×250 g + 1×330 g no `CLAUDE.md`). O
fechamento diz isso explicitamente.

### D2. Episódio 3 (SDD) e capítulo 4.4.1 (fechar o desenho) são a mesma cena

Os dois fecham as mesmas quatro decisões (nome do status, coluna, janela,
escopo). **Recomendação:** fundir — o episódio 3 *é* o 4.4.1. Abre a SDD
pré-manufaturada, decide as quatro em voz alta (com o lembrete dos 20 min
x 120 min), e o texto vira §11.7. Economiza uns 3 minutos de repetição.

### D3. O caminho expirado precisa de ~22 min de espera

**Recomendação:** disparar a mensagem "Preparei sopa de abóbora" **logo
antes de começar a gravar o episódio 2**, sem responder. Quando chegar no
smoke test (episódio 4), o aviso de expiração já chegou no grupo e você só
mostra. Fala de transparência: "mandei essa antes de começar, de propósito,
pra não fazer vocês esperarem vinte minutos."

**Atenção pra frase do teste:** não use "dois de cada" ou qualquer frase que
peça soma — o Haiku às vezes soma sozinho (viola a regra de ouro e mascara o
teste). Use número único e explícito: "Porcionei em 3 unidades".

**E não ponha peso na primeira mensagem.** Testado em produção em 17/09:
"Preparei frango desfiado, 300g" vira `aquisicao` (compra de 300 g,
`state: ingrediente`) 3 de 3 vezes, e o bot pergunta o orçamento em vez das
porções. Sem o peso ("Preparei frango desfiado") vira `porcionamento` 3 de 3.
Pode até virar fala: o peso fez o modelo ler "comprei", não "cozinhei".

---

## Episódio 2 — Debate: qual caminho, antes de qualquer código (5–6 min)

**Entrega:** a escolha do caminho (P1) sai justificada contra as
alternativas, e a ideia da expiração entra como sua — antes de a SDD
existir.

**Por que este episódio existe:** sem ele, a aula pula do "o que quebrou"
direto pro "o que eu fiz". O aluno precisa ver a decisão sendo pesada,
inclusive a opção mais tentadora (dar memória de conversa pro modelo) sendo
recusada por um motivo de produto, não de preguiça.

**Slide sugerido 1:** "Três caminhos" — tabela P1 / P2 / P3 do backlog
(ação em uma linha, esforço, risco). P4 fica de fora da tabela de propósito
— entra na fala como "e em qualquer caminho, eu preciso de um jeito de
provar".

**Slide sugerido 2:** "Perguntar não basta. Precisa lembrar que perguntou."

### 2.1 — Levar o backlog pro Claude

**TELA:** slide 1 → chat do Claude, tela cheia, fonte grande.

**FALA (antes de colar)**

Eu já tenho um backlog pra esse episódio, com três caminhos. Eu tenho
opinião sobre qual é o certo — mas eu não quero que o Claude só concorde
comigo. Vou dar o código real e perguntar qual deles resolve o caso de
verdade sem criar um problema maior.

**AÇÃO — cole este prompt** (anexe `intencao-efeitos.js` e `telegram.js`, ou
cole os trechos `intencao-efeitos.js` ramo porcionamento e
`telegram.js` `perguntarOrcamento`):

```
Contexto: no produto Musa Balance, um guardrail pergunta "quantas porções
rendeu X?" quando a pessoa conta que cozinhou mas não diz o número. Num caso
real, a resposta veio em mensagem separada, sem repetir o nome do prato, e
o prato nunca entrou no estoque. Cada mensagem foi classificada certo; o
classificador (relato-ingestao.js) só recebe o texto da mensagem atual.

Regra de ouro do projeto: a LLM nunca decide algo 100% verificável em
código, nunca faz conta, e nada falha em silêncio.

Três caminhos no backlog:
P1 — reaproveitar o padrão do fluxo de orçamento (aguardando_categoria):
     persistir a pergunta pendente e checar antes de classificar do zero,
     só pro porcionamento.
P2 — generalizar P1 pra qualquer guardrail que pergunta.
P3 — dar memória de conversa ao classificador (últimas N mensagens).

Olhando o código anexo: qual caminho resolve o caso real com menor risco
pro produto, e o que cada um dos outros dois custa de verdade? Seja
específico sobre o risco de P3.
```

**AÇÃO:** deixe terminar. Leia em voz alta a parte sobre P3.

**FALA (ramificação A — cenário mais provável: ele recomenda P1)**

Bateu com o backlog. Mas repara no motivo que importa pra mim: P3 parece a
solução "inteligente", só que ela devolve pro modelo uma decisão que hoje é
do código — o que é resposta a quê. Aí cada conversa longa vira uma chance
nova de o modelo ligar a resposta no prato errado, e isso não aparece em
lugar nenhum.

**FALA (ramificação B — ele recomenda P3 ou P2)**

Olha que interessante: ele foi pro caminho mais geral. Não está errado em
tese — mas eu tenho um caso real, um só. Generalizar sem um segundo caso é
especular. E memória de conversa tira do código uma decisão que hoje é
verificável. Eu fico com P1 e anoto o resto.

> Não corrija o Claude no ar se ele for por outro lado — use a ramificação B.
> Mesma convenção da 2.5.

### 2.2 — O furo do P1 (a sua ideia da expiração)

**TELA:** slide 2.

**FALA**

Só que P1, do jeito que está escrito, tem um furo. Ele guarda a pergunta
pendente. E se ninguém nunca responder? A pendência fica lá, aberta, pra
sempre — e ninguém fica sabendo que o prato não entrou. É o mesmo bug de
14/09, só que um passo depois: silêncio de novo.

Então a pendência precisa de um fim que alguém veja. Ou resolve, ou expira
com um aviso claro: "Ingestão não concluída por falta de porções". Não é
bonito, mas é visível. E visível é o requisito.

**FALA (ponte pro episódio 3)**

Agora sim eu tenho um caminho. Antes de pedir código, quatro decisões
pequenas — e uma delas eu ainda não fechei direito.

---

## Episódio 7 — Fechamento do módulo (3–4 min)

**Substitui:** 4.5 "O que aprendemos" (slides 20–22 antigos). O conteúdo
antigo ("quatro falhas, nenhuma gritou") continua verdadeiro, mas agora a
aula não termina em diagnóstico — termina num ciclo fechado com prova. O
fechamento precisa dizer isso, e abrir a Aula 5.

**Fio condutor (já no topo de `aula4-script.md`):** *toda correção cria uma
consequência nova pra observar.* Este episódio é onde essa frase se paga.

### Slide 7.1 (divisor)
**4.5 O que aprendemos**

### Slide 7.2 (statement) — o ciclo, em uma linha
**Observar → diagnosticar → decidir → corrigir → provar.**

**Script**

Recapitulando o que a gente fez nesta aula. Eu não li código pra descobrir
o problema: eu observei. Quatro mensagens, quatro classificações certas, e
um prato que nunca existiu no sistema. O diagnóstico não era prompt, nem
dado, nem modelo — era o produto em volta do modelo. Aí eu decidi o
caminho, escrevi a restrição, subi o código, e criei um eval que enxerga o
que nenhum dos três critérios anteriores enxergava: o ciclo, não a
mensagem.

### Slide 7.3 (statement) — o que a correção abriu
**Toda correção cria uma coisa nova pra observar.**

Três linhas no slide:
- uma janela de 20 minutos que é aposta, não verdade
- um aviso de "não concluída" que agora alguém precisa ler
- um prato que chega com o número de porções, mas sem saber quanto pesa cada uma

**Script**

E agora o ponto que eu mais quero que fique. Essa correção não terminou o
trabalho — ela trocou um problema invisível por três coisas visíveis. A
janela de 20 minutos é uma aposta: se o dado mostrar muita pendência
expirando, a régua estava errada. O aviso de "ingestão não concluída" é
honesto, mas alguém precisa ler. E a mensagem real daquele dia, "dois de
220 e dois de 160", ainda não resolve sozinha — somar é conta, e conta
aqui é do código, não do modelo. O produto agora pergunta de novo, citando
o prato. Melhor que silêncio. E mesmo quando resolve, o prato chega com o
número certo de porções, mas não sabe quanto pesa cada uma — pra casa que
conta caloria, isso ainda é um buraco. Não é o fim.

### Slide 7.4 (hero, fechamento)
**Consertar não é o fim.**
É o começo do que observar.

**Script**

Consertar não é o fim — é o começo do que observar. E quando o produto
passa a perguntar, a avisar e a decidir coisas pela casa, a pergunta seguinte
é inevitável: o que ele pode fazer sozinho, o que ele precisa me contar, e
o que ele não deveria nem guardar. Isso é a Aula 5: guardrails,
transparência e LGPD — começando justamente pelo episódio que eu deixei de
propósito sem corrigir, o da lasanha. Até lá.

---

## Ordem de gravação sugerida (com D2 e D3 aplicados)

1. **Antes de gravar:** conferir o deploy; mandar "Preparei sopa de
   abóbora" no grupo e não responder; conferir a linha histórica de 14/09
   (backfill) no Supabase.
2. Episódio 1 — recap do diagnóstico (2–3 min)
3. Episódio 2 — debate (5–6 min)
4. Episódio 3 = cap. 4.4.1 — SDD e quatro decisões, com o lembrete 20 × 120 (4–5 min)
5. Episódio 4 — leitura do que subiu (migração, diff, deploy, PR) + smoke test ao vivo "frango desfiado" + mostrar o aviso da sopa já expirada (5–6 min)
6. Episódios 5–6 — eval multi-trace + antes/depois (12–15 min)
7. Episódio 7 — fechamento (3–4 min)

Estimativa total do meio + fechamento: **31–39 min**, fora o 4.1.
