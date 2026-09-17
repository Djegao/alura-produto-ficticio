# Aula 4 — ensaio do meio novo (Episódio D): fala por quadro

> Escrito em 17/09, casado com
> `slides/Aula 4 6498 - meio episodio D.pptx` (branch
> `aula4/deck-meio-episodio-d`, 79 quadros = 30 slides lógicos com animação
> forçada). Cobre 4.2.1–4.2.6 e o 4.5 novo. **4.1 não muda** — continua em
> `aula4-script.md`.
>
> **Como ler:** cada quadro tem **Tela** (o que aparece *agora*), **Dizer**
> (a fala daquele trecho) e **Fazer** quando tem ação. Numa animação
> forçada, cada avanço tem a sua própria fala: avance o slide **enquanto**
> diz a frase, não antes. As notas do .pptx trazem tudo no primeiro quadro
> do conjunto — este documento é a versão fatiada, que é a que vale no
> estúdio.
>
> **Voz:** product builder, não engenheiro. Você observa, junta evidência e
> pergunta. Nomes de arquivo e função só aparecem quando estão na tela.
>
> ⚠️ **Antes de gravar, ver "Correções pendentes no deck" no fim.**

---

## Antes do REC

| Item | Estado |
|---|---|
| Produção | fix no ar (deploy `118df82a`, 17/09 14:58) |
| Banco | migração Fase 7 rodada; backfill de 14/09 inserido (`expirada`) |
| Sopa de abóbora | **mandar no grupo antes de gravar o 4.2.2 e não responder** — expira em ~20 min, chega a tempo do 4.2.5 |
| Frango do teste ao vivo | usar frase **sem peso**: "Preparei frango desfiado" |
| Abertos na tela | chat do Claude · editor (`intencao-efeitos.js`, `evals/criterios.md`, SDD) · terminal PowerShell · Telegram · GitHub |
| Plano B do eval | banco já tem os três casos: hambúrguer `expirada`, frango `completo`, sopa `expirada` |

---

# 4.2.1 — O hambúrguer que sumiu

## Slide 1 · divisor (quadro 1)

**Tela:** "4.2.1 O hambúrguer que sumiu"

**Dizer:** Na aula passada eu mostrei esse achado. Agora ele vira o fio de
um ciclo inteiro: decidir, corrigir e provar.

## Slide 2 · conversa (quadros 2–8) — animação forçada, 7 passos

**Quadro 2** — Tela: título "14/09, 18h17. Quatro mensagens." + primeira
mensagem, "O que vamos comer na sexta?"

**Dizer:** Essa é uma conversa real, no Telegram, 14 de setembro. Começa
comigo perguntando o que a gente vai comer na sexta.

**Quadro 3** — Tela: "Preparei hambúrguer de patinho, 220g pra mim e 160g
pra esposa…"

**Dizer:** Aí eu cozinho e conto pro produto: hambúrguer de patinho, 220
gramas pra mim, 160 pra minha esposa, dois de cada, no congelador.

**Quadro 4** — Tela: o bot pergunta "Quantas porções rendeu a hambúrguer de
patinho?"

**Dizer:** E ele pergunta quantas porções rendeu — exatamente como eu
desenhei: quando falta o número, perguntar, nunca chutar.

**Quadro 5** — Tela: "Porcionei em 2 unidades de 220g e 2 unidades de 160g"

**Dizer:** Eu respondo. Do jeito que qualquer um responderia: sem repetir o
nome do prato, porque ele acabou de perguntar sobre ele.

**Quadro 6** — Tela: o bot pergunta de novo, "Porcionou o quê, e em quantas
porções?"

**Dizer:** E ele pergunta de novo. Mais genérico ainda — agora nem sabe
mais de que prato a gente está falando.

**Quadro 7** — Tela: "O hambúrguer de patinho"

**Dizer:** Eu tento pela terceira vez, só o nome do prato.

**Quadro 8** — Tela: legenda "Fim da conversa: uma reação 🤔. O prato nunca
entrou no estoque."

**Dizer:** E acabou num emoji. Nada deu erro: nenhum log, nenhum alarme,
nenhuma linha vermelha. O hambúrguer simplesmente não existe no sistema.

## Slide 3 · tabela (quadros 9–12) — animação forçada, 4 passos

**Quadro 9** — Tela: tabela "Cada mensagem, classificada certo" com a
linha 1 (desejo, nada gravado)

**Dizer:** Eu fui olhar trace por trace, no Langfuse. Mensagem 1, "o que
vamos comer na sexta": desejo. Certo. E não gravou nada, porque não tem
nada pra gravar.

**Quadro 10** — Tela: linha 2

**Dizer:** Mensagem 2: porcionamento, prato certo, sem número. Certo também
— eu realmente não disse quantas porções. Gravado: nada. Só a pergunta,
que ninguém guardou.

**Quadro 11** — Tela: linha 3

**Dizer:** Mensagem 3: porcionamento, com o número, sem o prato. Também
está certo — eu não disse o prato. E de novo: nada gravado, outra pergunta.

**Quadro 12** — Tela: linha 4

**Dizer:** Mensagem 4: desejo. Uma frase solta, sem verbo, parece mesmo um
desejo. Quatro classificações, quatro acertos. E olha a última coluna
inteira: nada, nada, nada, nada.

## Slide 4 · cards (quadros 13–16) — animação forçada, 4 passos

**Quadro 13** — Tela: "Prompt, dados ou modelo?" + card PROMPT

**Dizer:** Então eu rodo o mesmo diagnóstico dos outros episódios. O
prompt? Correto. Pediu exatamente o que devia, nas quatro chamadas.

**Quadro 14** — Tela: card DADOS

**Dizer:** Os dados? Corretos. O texto que chegou era claro — qualquer
pessoa entenderia.

**Quadro 15** — Tela: card MODELO

**Dizer:** O modelo? Acertou quatro de quatro. Nenhuma classificação errada
na sequência inteira.

**Quadro 16** — Tela: "Nenhum dos três. A causa é o produto em volta do
modelo."

**Dizer:** Nenhum dos três explica. A causa é uma quarta categoria:
arquitetura. A pergunta foi feita e ninguém guardou que ela foi feita. Eu
já sei o que quebrou — antes de abrir código, eu preciso decidir o caminho.

---

# 4.2.2 — Qual caminho, antes do código

## Slide 5 · divisor (quadro 17)

**Tela:** "4.2.2 Qual caminho, antes do código"

**Dizer:** Antes de escrever qualquer linha, a decisão.

> **Fazer (fora de cena, antes deste vídeo):** mandar "Preparei sopa de
> abóbora" no grupo e **não responder**. É o caminho expirado do 4.2.5.

## Slide 6 · três caminhos (quadros 18–20) — animação forçada, 3 passos

**Quadro 18** — Tela: card P1

**Dizer:** Eu já tenho um backlog desse episódio, com três caminhos. P1:
guardar a pergunta. É o mesmo padrão que o fluxo de orçamento já usa aqui
dentro, aplicado só no porcionamento. Esforço baixo, risco baixo.

**Quadro 19** — Tela: card P2

**Dizer:** P2: generalizar isso pra qualquer guardrail que pergunta. Mais
esforço — e eu não tenho um segundo caso real pra justificar.

**Quadro 20** — Tela: card P3

**Dizer:** P3: memória de conversa. O classificador passa a receber as
últimas mensagens. É o que parece mais inteligente, e é o de risco mais
alto. Eu tenho opinião sobre qual é o certo, mas eu não quero que o Claude
só concorde comigo.

## Slide 7 · o que eu levo pro Claude (quadros 21–23) — animação forçada

**Quadro 21** — Tela: "O que eu levo pro Claude" + primeiro item (o código
real)

**Dizer:** Então eu levo três coisas pra essa conversa. Primeiro, o código
real dos dois arquivos que tratam disso — não um resumo meu.

**Quadro 22** — Tela: segundo item (regra de ouro)

**Dizer:** Segundo, a regra de ouro do projeto: a inteligência não decide o
que dá pra verificar em código.

**Quadro 23** — Tela: terceiro item (quanto custa o P3)

**Dizer:** E terceiro, a pergunta que importa: quanto custa o P3 de
verdade? Vamos perguntar.

**Fazer:** tela cheia no chat do Claude; colar o prompt do §2.1 de
`docs/aula4-concierge-debate-e-fechamento.md`, com os dois arquivos
anexados. Deixar terminar e ler em voz alta a parte do P3.

**Dizer (ramificação A — ele recomenda P1):** Bateu com o meu backlog. Mas
repara no motivo: o P3 devolve pro modelo uma decisão que hoje é do código
— o que é resposta a quê. Cada conversa longa vira uma chance nova de ligar
a resposta no prato errado, e isso não aparece em lugar nenhum.

**Dizer (ramificação B — ele recomenda P2 ou P3):** Olha que interessante,
ele foi pro caminho mais geral. Não está errado em tese, mas eu tenho um
caso real, um só. Generalizar sem um segundo caso é especular. E memória de
conversa tira do código uma decisão que hoje é verificável. Eu fico com o
P1 e anoto o resto.

> Não corrigir o Claude no ar.

## Slide 8 · frase (quadro 24)

**Tela:** "Perguntar não basta. Precisa lembrar que perguntou."

**Dizer:** Essa é a frase do P1. O guardrail de perguntar em vez de chutar
estava certo. O que faltava era guardar a pergunta em algum lugar que a
próxima mensagem consulta antes de começar do zero.

## Slide 9 · ramos (quadros 25–27) — animação forçada, 3 passos

**Quadro 25** — Tela: "E se ninguém responder?" · raiz "Pergunta guardada"
· ramo ✓ "Resolve"

**Dizer:** Só que o P1, do jeito que estava escrito, tem um furo. Guardar a
pergunta resolve o caminho feliz: a resposta chega, o prato entra no
estoque.

**Quadro 26** — Tela: ramo ! "Expira, com aviso"

**Dizer:** E se ninguém nunca responder? A pendência fica aberta pra
sempre, e ninguém fica sabendo que o prato não entrou. Então ela precisa de
um fim que alguém veja: ou resolve, ou expira com um aviso claro.

**Quadro 27** — Tela: "Sem um fim visível, é o bug de 14/09 de novo, um
passo depois."

**Dizer:** Sem esse fim visível, eu recriaria o mesmo bug um passo adiante:
silêncio de novo. Não é bonito receber "não consegui concluir". Mas é
visível — e visível é o requisito. Agora sim eu tenho um caminho. Antes de
pedir código, quatro decisões pequenas.

---

# 4.2.3 — A SDD e quatro decisões

## Slide 10 · divisor (quadro 28)

**Tela:** "4.2.3 A SDD e quatro decisões"

**Dizer:** Toda decisão de produto que vira restrição permanente mora num
lugar só: a spec.

## Slide 11 · citação (quadro 29)

**Tela:** a restrição da SDD §11.7

**Fazer:** abrir `docs/aula4-sdd-pre-manufaturado-episodio-d.md` no editor.

**Dizer:** Esse é o rascunho da seção 11.7 da spec do produto — mesmo
formato dos outros achados: observação, diagnóstico, restrição, onde mexer.
A restrição tem duas partes: guardar a pergunta antes de perguntar, e
garantir que ela termina em algo que alguém vê.

## Slide 12 · quatro decisões (quadros 30–34) — animação forçada, 5 passos

**Quadro 30** — Tela: as quatro perguntas, respostas em branco

**Dizer:** Quatro decisões pequenas que fazem diferença depois. Vou decidir
as quatro agora, em voz alta.

**Quadro 31** — Tela: resposta 1, `aguardando_porcoes`

**Dizer:** Nome do status: aguardando porções. Não inventei nada — é
simetria com o "aguardando categoria" que já existe no fluxo de orçamento.

**Quadro 32** — Tela: resposta 2, coluna nova `item_pendente`

**Dizer:** Onde guardar o prato que está esperando: uma coluna nova, item
pendente. Eu poderia reaproveitar um campo de texto que já existe, mas
coluna explícita é mais honesta pro eval consultar depois.

**Quadro 33** — Tela: resposta 3, "20 minutos — em aberto"

**Dizer:** Janela de expiração: vinte minutos. E essa eu não considero
fechada — é o próximo slide.

**Quadro 34** — Tela: resposta 4, "só porcionamento, por enquanto"

**Dizer:** Escopo: só porcionamento. Generalizar pra qualquer guardrail
fica pra quando houver um segundo caso real.

**Fazer:** fechar essas quatro no texto da SDD, em cena.

## Slide 13 · a régua (quadros 35–39) — animação forçada, 5 passos

**Quadro 35** — Tela: "20 minutos é uma aposta" + marca dos 20 min

**Dizer:** Vinte minutos. Por que vinte?

**Quadro 36** — Tela: marca "10 min — primeira versão"

**Dizer:** A primeira versão desse desenho tinha dez. O incidente real
inteiro durou cerca de um minuto, então dez já era folga generosa.

**Quadro 37** — Tela: marca "120 min — cheguei a considerar"

**Dizer:** E eu cheguei a considerar duas horas. Porque janela longa não
custa nada: esse trabalho roda sozinho, não chama modelo nenhum, não tem
custo de API.

**Quadro 38** — Tela: "Curta demais: frustra quem demora pra responder."

**Dizer:** Janela curta demais frustra: a pessoa demora vinte e cinco
minutos pra responder e perde a pendência.

**Quadro 39** — Tela: "Longa demais: dois pratos pendentes, a porção cai no
prato errado. Em silêncio."

**Dizer:** Mas janela longa demais abre um bug novo: eu cozinho dois
pratos, não respondo nenhum, e a próxima resposta vai pro prato errado sem
ninguém perceber. Trocar um silêncio por outro. Fiquei no meio: vinte. É
uma aposta, e o dado de uso vai confirmar ou derrubar.

---

# 4.2.4 — O que subiu

## Slide 14 · divisor (quadro 40)

**Tela:** "4.2.4 O que subiu"

**Dizer:** Esse código eu subi antes de gravar. Vou mostrar a migração, o
diff e o deploy reais — e testar ao vivo, contra produção, no próximo
vídeo.

## Slide 15 · a migração (quadros 41–42) — animação forçada, 2 passos

**Quadro 41** — Tela: o `alter table` da coluna nova

**Dizer:** Essa é a única parte que eu não pedi pro Claude escrever. É
schema, é barato, e é convenção deste projeto rodar migração na mão e
documentar depois. Uma coluna nova, pra guardar o prato que está esperando.

**Quadro 42** — Tela: o `check` com os quatro status

**Dizer:** E aqui entra um terceiro status: expirada. Não é só pendente ou
resolvida. Uma pendência que nunca resolve precisa de um destino final que
alguém vê.

## Slide 16 · o padrão (quadros 43–45) — animação forçada, 3 passos

**Quadro 43** — Tela: "aguardando_categoria — orçamento, já em produção"

**Dizer:** O produto já resolvia esse problema pra outro caso. Quando você
registra uma compra e não diz de qual orçamento saiu, ele pergunta — e
guarda a pendência antes de perguntar.

**Quadro 44** — Tela: "aguardando_porcoes — porcionamento, novo"

**Dizer:** Então o pedido pro Claude foi: aplica essa mesma forma no
porcionamento, com as quatro decisões que eu acabei de fechar.

**Quadro 45** — Tela: os três passos "pergunta · guarda a pendência · a
resposta resolve"

**Fazer:** mostrar o diff de `intencao-efeitos.js`.

**Dizer:** Pergunta, guarda, resolve. E repara que a mudança inteira mora
dentro de uma função que já existia — não precisou de arquitetura nova, só
de um pedaço de estado que faltava.

## Slide 17 · contraste (quadros 46–47) — animação forçada, 2 passos

**Quadro 46** — Tela: lado RESOLVIDA, `status = completo`

**Dizer:** Com isso, o caminho feliz fecha: a resposta chega dentro da
janela e o prato entra no estoque.

**Quadro 47** — Tela: lado ESQUECIDA, `status = expirada`

**Fazer:** mostrar `expiracao-porcionamento.js` ao lado de `lembrete.js`.

**Dizer:** E o caminho esquecido também. O produto já tinha um trabalho que
cobra relato de hora em hora; esse aqui é a mesma ideia, só que rápido: de
dois em dois minutos, porque a conversa real se resolve ou morre em
minutos. Ele fecha a pendência e avisa o grupo. A frase é literal de
propósito — vira o padrão pra qualquer guardrail que expirar.

## Slide 18 · fechado, não só narrado (quadros 48–50) — animação forçada

**Quadro 48** — Tela: "Migração rodada e verificada no Supabase."

**Dizer:** Então: a migração rodou no banco de produção e eu conferi que
pegou.

**Quadro 49** — Tela: "Deploy real no Railway, não simulado."

**Dizer:** O deploy é real. Aqui é onde este episódio se separa da aula
bônus: lá o PR era simulado. Esse código vale pra minha casa de verdade,
agora.

**Quadro 50** — Tela: "PR com a SDD §11.7 junto do código."

**Fazer:** mostrar o **PR #13** no GitHub — "Fix: pendencia de porcionamento
persistida e expirada (Episodio D)", já **mergeado** no `master`. Fique na
aba **Conversation**: a aba "Files changed" tem 13 arquivos e a maioria é
material de produção do curso, inclusive este ensaio.

**Dizer:** E a spec vai junto do código, no mesmo PR. Esse aqui eu abri e
mergeei antes de gravar: o código já roda na minha casa desde o deploy, e o
merge é o que traz a mudança de volta pra linha principal do projeto — que é
onde a próxima pessoa vai pegar. Título, corpo, diff, merge: o mesmo destino
de qualquer mudança de produto de verdade.

> **Não diga que o merge "põe no ar".** Aqui a publicação é um passo à
> parte, feita pelo Railway — e ela já aconteceu, no quadro anterior.

---

# 4.2.5 — Smoke test contra produção

## Slide 19 · divisor (quadro 51)

**Tela:** "4.2.5 Smoke test contra produção"

**Dizer:** Isso aqui não é o teste formal — o formal, com nota, é o próximo
vídeo. É só: o código está no ar e faz as duas coisas que eu descrevi.

## Slide 20 · dois caminhos (quadros 52–53) — animação forçada, 2 passos

**Quadro 52** — Tela: coluna "Frango desfiado"

**Fazer (ao vivo, no Telegram):** mandar "Preparei frango desfiado"
(**sem peso**). Esperar a pergunta. Responder "Porcionei em 3 unidades",
sem repetir o prato.

**Dizer:** Vamos fazer ao vivo. Eu conto que preparei frango desfiado. Ele
pergunta quantas porções. E eu respondo só o número — sem repetir o nome do
prato, exatamente o que quebrava em 14 de setembro. Olha a resposta: ele
menciona o frango desfiado. A referência não se perdeu.

**Quadro 53** — Tela: coluna "Sopa de abóbora"

**Fazer:** mostrar no grupo o aviso de expiração da sopa.

**Dizer:** E o outro caminho: antes de começar a gravar, eu mandei que
tinha preparado uma sopa de abóbora e não respondi a pergunta — de
propósito, pra não fazer vocês esperarem vinte minutos comigo. Olha o que
chegou sozinho: ingestão não concluída por falta de porções, sopa de
abóbora. Ninguém precisou ir conferir o estoque pra descobrir.

> **Se o bot não reconhecer a continuação, ou o aviso não estiver lá:**
> pare aqui. Não siga pro eval fingindo que funcionou.

## Slide 21 · a conversa real (quadros 54–56) — animação forçada, 3 passos

**Quadro 54** — Tela: "Porcionei em 2 unidades de 220g e 2 unidades de
160g"

**Dizer:** Só que tem uma coisa que eu preciso contar, porque senão esse
teste parece melhor do que ele é. A mensagem real daquele dia não era "em
3 unidades". Era essa: duas de 220 e duas de 160.

**Quadro 55** — Tela: a resposta do bot, "Ainda falta o total de porções de
hambúrguer de patinho…"

**Dizer:** E ela não traz número nenhum — porque chegar a quatro é somar. O
que o produto faz hoje é isso: pergunta de novo, já citando o prato. A
referência não se perde mais, a pendência continua viva. Mas o Diego de 14
de setembro ainda teria que mandar "porcionei em 4".

**Quadro 56** — Tela: "2 + 2 é conta. Conta é do código, não do modelo."

**Dizer:** E eu não vou pedir pro modelo somar. Essa é a regra de ouro do
projeto: conta é do código. A saída certa é o modelo separar as parcelas e
o código somar — e isso é a segunda volta, não esta. Fica no backlog, dito
em voz alta.

---

# 4.2.6 — Um eval que olha o ciclo

## Slide 22 · divisor (quadro 57)

**Tela:** "4.2.6 Um eval que olha o ciclo"

**Dizer:** Corrigir sem provar é narrativa. Falta a prova.

## Slide 23 · frase (quadro 58)

**Tela:** "O ciclo só se prova entre mensagens."

**Dizer:** Na aula bônus a gente criou um eval do zero pra uma operação que
não tinha nenhum. Hoje é diferente: essa operação já tem três critérios.
Só que nenhum deles pega esse episódio, porque todos julgam uma mensagem
por vez — e essa falha só existe entre mensagens.

**Fazer:** colar o prompt do passo 5.1 de
`docs/aula4-concierge-evals-episodio-d.md`.

**Dizer (ramificação A — o Claude quer que o juiz avalie qualidade):** Se
resolveu ou não é fato, é banco de dados; isso não entra pro juiz decidir.
Se a pergunta foi clara é outro critério, não este.

**Dizer (ramificação B — ele propõe binário, com cálculo em código):** Isso.
Ele já separou o que é fato do que seria opinião — nem tentou fazer o
modelo comparar horário.

## Slide 24 · timeline (quadros 59–63) — animação forçada, 5 passos

**Quadro 59** — Tela: trace 1

**Dizer:** Antes de fechar o critério, eu bato contra o que aconteceu de
verdade. Trace 1: desejo, certo.

**Quadro 60** — Tela: trace 2

**Dizer:** Trace 2: porcionamento. É o que cria a pendência.

**Quadro 61** — Tela: trace 3

**Dizer:** Trace 3: porcionamento de novo — a tentativa de resposta, sem o
nome do prato.

**Quadro 62** — Tela: trace 4

**Dizer:** Trace 4: desejo. Nem é reconhecido como resposta a nada.

**Quadro 63** — Tela: a chave "a falha só existe no par 2 → 3"

**Dizer:** Por isso este eval não pode ser "olhe o trace 3 e julgue". O
trace 3, isolado, está perfeito. O problema só existe quando você olha o
par: a pergunta que ficou aberta e a resposta que não achou o caminho de
volta.

## Slide 25 · o critério (quadros 64–66) — animação forçada, 3 passos

**Quadro 64** — Tela: nome do critério + saída 1

**Fazer:** colar o bloco do passo 5.3 em `evals/criterios.md`; depois pedir
o script (passo 5.4), no molde do eval da receita premium.

**Dizer:** O critério é binário e o juiz só lê um status que o produto já
decidiu. Se o trace não criou pendência nenhuma, ou se ela foi resolvida:
vale 1.

**Quadro 65** — Tela: saída "expirada → 0"

**Dizer:** Se expirou, vale zero. E aqui é o ponto fino: o produto avisou,
o que é melhor que silêncio — mas avisar que falhou não é a mesma coisa que
o prato estar no estoque. O resultado de produto continua sendo falha.

**Quadro 66** — Tela: saída "ainda aguardando → pula"

**Dizer:** E se a pendência ainda estiver aberta na hora da avaliação, o
eval pula: ainda é cedo pra julgar. Repara que nem o eval decide o que é
"resolvido" — o produto já decidiu isso sozinho.

## Slide 26 · antes e depois (quadros 67–69) — animação forçada, 3 passos

**Quadro 67** — Tela: painel "ANTES · 14/09 · hambúrguer de patinho · 0"

**Fazer:** `node evals/run-eval-ciclo-pergunta-resposta.js --limit 20 --dry-run`

> **Conferido em 17/09 16h:** o trace de 14/09 é o 12º mais recente da
> operação `ingerir-relato` — cabe no `--limit 20`, com folga de umas 8
> mensagens. Cada teste novo no Telegram gasta uma dessas vagas; se você
> ensaiar muito antes de gravar, suba o limite para 30.

**Dizer:** Ali está o trace de 14 de setembro: nota zero. E uma nota de
transparência, porque ela importa: a linha que guarda essa pendência no
banco eu inseri à mão antes de gravar, com o horário real do incidente.
Naquele dia o produto não persistia nada — esse era exatamente o bug. Não é
dado fabricado: é o mesmo achado documentado, entrando na estrutura que não
existia na época.

**Quadro 68** — Tela: painel "DEPOIS · ao vivo · frango desfiado · 1"

**Fazer:** `node evals/run-eval-ciclo-pergunta-resposta.js --limit 5 --dry-run`

**Dizer:** Mesmo critério, mesmo script, trace novo — o frango desfiado que
a gente acabou de mandar. Nota 1: o ciclo se fechou.

**Quadro 69** — Tela: painel "DEPOIS · sem resposta · sopa de abóbora · 0"

**Dizer:** E a sopa aparece com zero. Isso não é o eval errando — é
exatamente o que ele tem que dizer. O produto avisou, e a sopa continua
fora do estoque.

> Opcional (passo 5.6): rodar sem `--dry-run` pra gravar o Score real no
> Langfuse.

---

# 4.5 — O que aprendemos

## Slide 27 · divisor (quadro 70)

**Tela:** "4.5 O que aprendemos"

**Dizer:** Recapitulando.

## Slide 28 · o ciclo (quadros 71–75) — animação forçada, 5 passos

**Quadro 71** — Tela: "Observar"

**Dizer:** Eu não li código pra descobrir o problema. Eu observei: quatro
mensagens, quatro classificações certas, e um prato que nunca existiu no
sistema.

**Quadro 72** — Tela: "Diagnosticar"

**Dizer:** Diagnostiquei com a evidência na mão, e a resposta não era
prompt, nem dado, nem modelo — era o produto em volta do modelo.

**Quadro 73** — Tela: "Decidir"

**Dizer:** Decidi o caminho antes de escrever código, e escrevi a restrição
na spec.

**Quadro 74** — Tela: "Corrigir"

**Dizer:** Corrigi de verdade: migração, código, deploy, produção.

**Quadro 75** — Tela: "Provar"

**Dizer:** E provei, com um eval que enxerga o que nenhum dos anteriores
enxergava: o ciclo, não a mensagem.

## Slide 29 · o que a correção abriu (quadros 76–78) — animação forçada

**Quadro 76** — Tela: item 1, a janela de 20 minutos

**Dizer:** E agora o ponto que eu mais quero que fique. Essa correção não
terminou o trabalho — ela trocou um problema invisível por três coisas
visíveis. A janela de vinte minutos é uma aposta: se o dado mostrar muita
pendência expirando, a régua estava errada.

**Quadro 77** — Tela: item 2, o aviso de "não concluída"

**Dizer:** O aviso de ingestão não concluída é honesto, mas agora alguém
precisa ler. Eu troquei um silêncio por uma mensagem — e mensagem que
ninguém lê vira silêncio de novo.

**Quadro 78** — Tela: item 3, "2 de 220 g e 2 de 160 g"

**Dizer:** E a mensagem real daquele dia ainda não fecha sozinha. O produto
pergunta de novo citando o prato, o que é melhor que silêncio. Mas mesmo
quando resolve, ele registra três porções sem saber quanto pesa cada uma —
e numa casa que conta caloria, isso ainda é um buraco.

## Slide 30 · hero (quadro 79)

**Tela:** "Consertar não é o fim. É o começo do que observar."

**Dizer:** Consertar não é o fim — é o começo do que observar. E quando o
produto passa a perguntar, a avisar e a decidir coisas pela casa, a
pergunta seguinte é inevitável: o que ele pode fazer sozinho, o que ele
precisa me contar, e o que ele não deveria nem guardar. Isso é a Aula 5:
guardrails, transparência e LGPD — começando pelo episódio que eu deixei de
propósito sem corrigir, o da lasanha. Até lá.

---

## Correções pendentes no deck (antes de gravar)

1. **Quadro 52 (slide 20, "Dois caminhos")** mostra a frase
   `"Preparei frango desfiado, 300g"`. **Com o peso, o classificador
   entende compra** — testado 3 de 3 vezes em 17/09, e foi o que aconteceu
   no primeiro teste real: o bot perguntou o orçamento, não as porções. Na
   tela e na fala, usar **"Preparei frango desfiado"**. A nota do mesmo
   slide no .pptx também precisa perder o `300g`.
2. ~~**Quadro 50 (slide 18)** fala em PR.~~ **Resolvido:** o
   [PR #13](https://github.com/Djegao/alura-produto-ficticio/pull/13) foi
   aberto e mergeado em 17/09, antes da gravação. O slide continua válido
   como está; só a nota do .pptx precisa dizer "já mergeado" e não sugerir
   que o merge publica.
3. **Notas do .pptx:** em cada conjunto de animação forçada, os quadros
   2 a N trazem "(animação forçada N/7 — notas no primeiro frame)". As
   falas fatiadas deste documento é que valem; se quiser as notas do deck
   iguais a estas, o conserto é na fonte
   (`slides/gerador-musa/aula4-meio-spec.json`, campo `notes`, e a expansão
   no `aula4-meio-spec-build.js`), regerando o .pptx — trabalho da janela do
   deck.
