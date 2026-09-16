# Aula bônus — Evals do zero, ao vivo, com o Claude

> **Rascunho para debate — ainda não aprovado.** Formato Tela · Fala ·
> Ação, mais detalhado que o padrão normal do curso porque esta aula é
> gravada com três janelas trocando ao vivo (chat, editor, terminal) — cada
> passo tem o comando exato, não só a intenção.
>
> **Numeração confirmada em 16/09: esta aula é a 2.5.** O texto "O que
> aprendemos" (antigo 2.5) foi renumerado para 2.6
> (`docs/aula2-o-que-aprendemos.md`). Deck inicial já gerado:
> `slides/Aula 2.5 - Evals do zero - inicial.pptx` (10 slides, a partir das
> bases já finalizadas da Aula 2 — ver `slides/gerador-musa/gerar-aula2.5.ps1`).

**Duração estimada:** 20–25 min.
**Formato:** tela do chat do Claude aberta o tempo todo — o aluno vê o
prompt saindo, a resposta chegando, e você reagindo/debatendo em tempo real.
Não é demo congelada como as Aulas 2–4; aqui o ponto é ver o processo,
imperfeito e tudo.

**Operação escolhida:** `receita-premium-semanal` (`receita-premium.js`) —
a sugestão semanal de receita do canal do chef Mohamad Hindi.

**PR final:** **simulado** — tela do diff / mockup de PR, sem push real.

---

## Correspondência slide ↔ passo (atualizada 16/09, após a capa)

> **Todo slide deste deck é pra ser mostrado.** Não existe slide de apoio ou
> de backup nesta aula — se algum slide aparecer **oculto** no PowerPoint,
> é bug de geração (já aconteceu uma vez: um slide-base do deck da Aula 2
> estava oculto lá por outro motivo, e o "oculto" vazou pra 5 slides gerados
> a partir dele — corrigido em 16/09, tanto no arquivo atual quanto no
> gerador). Reative, não apague.
>
> As anotações do apresentador de cada slide (exceto a capa) começam com a
> tag `[2.5.N]` — bate o olho na nota durante a apresentação e já sabe em
> que passo deste `.md` você está. Um passo do roteiro pode ocupar **mais
> de um slide** (ex.: 2.5.1 e 2.5.4 têm dois cada) — avance o slide no meio
> da fala do passo, não é erro de sincronismo.

| Slide no arquivo | Passo do `.md` | Título do slide |
|---|---|---|
| 1 | 2.5.1 | "2.5 Evals do zero, ao vivo" (divisor) |
| 2 | *(capa, fora do roteiro)* | — |
| 3 | 2.5.1 (2º slide) | "Eval não é teste. Critério tem 4 partes." |
| 4 | 2.5.2 | "O caminho de hoje" |
| 5 | 2.5.3 | "O prompt" |
| 6 | 2.5.4 | "Duas semanas. Mesmo vídeo." (tabela) |
| 7 | 2.5.4 (2º slide) | "Repetir vídeo: 100% verificável em código." |
| 8 | 2.5.5 | "O documento final" |
| 9 | 2.5.6 | "O juiz, em código" |
| 10 | 2.5.7 | "Isso aqui é simulado." |
| 11 | 2.5.8 | "Eu sei o que procurar. Agora falta enxergar." |

Se você adicionar/remover slides no PowerPoint depois desta versão, esta
tabela desatualiza — refaça a contagem antes de gravar (mesma regra de
"não prometer número antes de ver" das Aulas 2–4, aplicada a slide em vez
de métrica).

---

## Setup antes de gravar (fazer OFF-camera)

> **Terminal usado nesta aula: PowerShell**, não o bash do VS Code. Todos os
> comandos abaixo foram testados literalmente em PowerShell (Windows
> PowerShell 5.1) antes de entrar neste documento — pode colar exatamente
> como está.
>
> **Armadilha real, já batida ao vivo:** o caminho do projeto tem espaço
> (`6498 - Evals conformidade e observabilidade`). Em PowerShell, digitar só
> o caminho **não** troca de pasta — precisa do comando `cd`/`Set-Location`,
> e o caminho precisa estar **entre aspas** por causa do espaço. Sem aspas,
> o PowerShell lê `D:\TIME_CINTHIA\6498` como o nome de um comando e quebra
> com `CommandNotFoundException`. Use sempre a forma completa abaixo.

1. **Abra o PowerShell e entre na pasta do projeto:**
   ```powershell
   cd "D:\TIME_CINTHIA\6498 - Evals conformidade e observabilidade\chef-caseiro"
   ```
2. **Três janelas** lado a lado ou em abas de fácil alt-tab:
   - **Chat do Claude** (esta conversa ou uma nova, sem histórico do produto
     — se for nova, ele não vai saber o contexto do repo; o passo **2.5.3**
     já inclui todo o contexto necessário dentro do próprio prompt)
   - **Editor de código** (VS Code), aberto **a partir do PowerShell já na
     pasta certa** (evita abrir na pasta errada por engano):
     ```powershell
     code .
     ```
   - **Terminal**: pode ser o mesmo PowerShell já aberto no passo 1, ou o
     terminal integrado do VS Code — **confirme no canto inferior direito do
     VS Code que o terminal integrado diz "PowerShell"**, não "bash"/"WSL",
     senão os comandos abaixo não são garantidos.
3. **Confirme que o servidor não precisa estar rodando** — esta aula não
   usa o painel web, só terminal + Supabase direto. Se `npm start` estiver
   rodando em background de uma sessão anterior, pode deixar, não interfere.
4. **Rode a consulta de aquecimento** (ver nota de rede intermitente em
   `docs/RETOMADA-15-09.md`) — roda a mesma consulta que vai aparecer ao
   vivo, uma vez, só para "esquentar" a conexão. Comando testado em
   PowerShell 5.1 nesta máquina, funciona colado exatamente assim (as aspas
   simples internas não precisam de escape em PowerShell):
   ```powershell
   node -e "require('dotenv').config(); const {createClient}=require('@supabase/supabase-js'); const s=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY); s.from('premium_suggestions').select('week_start,video_title').order('week_start').then(({data,error})=>{console.log(data,error)})"
   ```
   Confirme na tela do terminal (fora de gravação) que aparece:
   ```
   [
     { week_start: '2026-08-17', video_title: 'Como fazer picanha na frigideira' },
     { week_start: '2026-08-24', video_title: 'Como fazer BEEF WELLINGTON, Receita original do Gordon Ramsay' },
     { week_start: '2026-08-31', video_title: 'Como fazer BEEF WELLINGTON, Receita original do Gordon Ramsay' },
     { week_start: '2026-09-07', video_title: 'Como fazer POLENTA CREMOSA, nunca mais erre o ponto!' }
   ]
   ```
   Se os dados vierem diferentes disso (produto usado de novo entre agora e
   a gravação), **atualize os números deste documento antes de escrever a
   fala** — mesma regra de "não prometer número antes de ver" das Aulas 2–4.
5. **Abra dois arquivos no editor, em abas separadas, sem fechar depois:**
   - `evals/criterios.md`
   - `evals/run-evals.js`

   O achado dos "quatro documentos concorrentes" da Aula 2 (passo **2.5.4**)
   é contado **só de fala**, sem abrir arquivo — é uma nota de produção
   interna (`docs/aula2-avaliacao-e-plano.md`), não conteúdo pronto pra
   aluno ver na tela. Não precisa dela aberta.

---

## ⚠ ANTES DE GRAVAR — o achado real

Duas semanas seguidas (24/08 e 31/08), a receita premium escolheu o **mesmo
vídeo** (Beef Wellington). Não é bug fabricado — é o estado real do banco.
`unique(household_id, week_start)` só impede repetir **na mesma** semana;
não existe regra de "não repetir **entre** semanas". Convenção do projeto:
**não corrigir sem perguntar antes.** Esta aula usa o achado como conteúdo;
decisão de consertar o código é separada, depois da gravação.

---

## 2.5.1 — Recap (2 min)

**TELA — 2 slides:**
1. Divisor: "2.5 Evals do zero, ao vivo"
2. Statement: "Eval não é teste. Critério tem 4 partes."

**AÇÃO:** nenhuma — só fala de câmera/voiceover sobre os dois slides.

**FALA (slide 1)**

Rapidão antes de começar. Na Aula 2 a gente viu: eval não é teste, e todo
critério bom tem quatro partes. Hoje sem mais teoria — vou abrir o chat do
Claude, ao vivo, sem nada preparado, e construir do zero um conjunto de
eval pra uma parte do produto que eu nunca avaliei: **a receita premium
semanal**.

**[avança o slide]**

**FALA (slide 2)**

Só pra fechar o que ficou da Aula 2, numa frase: eval não é teste — teste
compara com o resultado esperado, eval pergunta se é bom. E todo critério
bom tem quatro partes: nome, pergunta, escala, e o que acontece se falhar.

É com essas quatro partes que eu vou construir o conjunto de hoje.

---

## 2.5.2 — O passo a passo (2–3 min)

**TELA:** slide "O caminho de hoje" — 3 bullets: Propor / Debater / Fechar.

**AÇÃO:** nenhuma — leitura dos três bullets, explicados um a um.

**FALA**

O caminho de hoje tem três fases.

**[bullet 1 — Propor]** Primeiro eu proponho: peço pro Claude um conjunto
de critérios, dando o contexto da operação e a regra de ouro do projeto —
a LLM nunca faz aritmética nem decide sozinha algo que devia ser
determinístico. E dentro de propor, eu me guio por três perguntas: qual a
promessa da operação, onde ela pode "chutar" de um jeito que parece certo,
e qual papel ela não pode abandonar.

**[bullet 2 — Debater]** Segundo, eu debato: bato a proposta contra o que
a casa já viveu de verdade — não aceito de primeira.

**[bullet 3 — Fechar]** Terceiro, eu fecho: documento único, juiz
implementado em código, e um PR — hoje, simulado.

Escolhi a receita premium porque ela nunca passou por esse processo.

---

## 2.5.3 — O prompt ao Claude (5–6 min)

**TELA:** slide "O prompt" (bullets: Contexto / Regra de ouro / Três
perguntas) **e depois** a janela do chat do Claude, tela cheia, fonte
grande (`Ctrl` + `+` no navegador/app se precisar aumentar).

**AÇÃO:** cole exatamente este texto na caixa de mensagem e envie. Pode
ajustar ao vivo se quiser, mas isto é o ponto de partida testado:

```
Contexto: `receita-premium.js` sugere UMA receita por semana, escolhida por
um modelo (tool_choice forçado) a partir do feed real de vídeos de um canal
do YouTube, cruzando com estoque e preferências da casa. A URL escolhida tem
que existir de fato no feed — se não existir, é erro, não silêncio.

Regra de ouro do projeto: a LLM nunca faz aritmética nem decide sozinha
coisa que devia ser determinística; código apura fato, o modelo julga só o
que não é apurável.

Proponha um conjunto de critérios de eval para esta operação, em linguagem
de produto (qualquer pessoa do time deveria julgar sem programar). Cada
critério precisa ter: nome (vira nome de Score), pergunta, escala (binário
ou 0–1) e "se falhar, o que acontece" com custo concreto. Use as três
perguntas como guia: qual a promessa desta operação, onde ela pode
"chutar" de um jeito que parece certo, e qual papel ela não pode abandonar.
```

**FALA (antes de enviar)**

Eu não vou pedir "crie critérios de eval" — vago demais, ele devolve
clichê. Vou dar o mesmo contexto que acabei de mostrar no slide: o produto,
a regra de ouro, e as três perguntas.

**AÇÃO:** deixe a resposta terminar de streamar. Leia em voz alta **pelo
menos um critério inteiro**, apontando na tela onde estão as quatro partes.

**FALA (reagindo — ramificação A, se ele sugerir algo sobre a URL real)**

Repara: isso já existe em código, é guarda-corpo, não eval — mesma discussão
do `criterios.md`, casamento de nome é código, não eval. Vou cortar isso.

**FALA (reagindo — ramificação B, se ele NÃO sugerir nada sobre repetição
entre semanas — cenário mais provável)**

Interessante — ele não sugeriu nada sobre repetir receita de uma semana pra
outra. E isso é exatamente o tipo de coisa que só aparece quando você olha
o dado real, não a spec. Guardo essa pergunta pro próximo passo.

---

## 2.5.4 — Debate: bater com o que a casa já viveu (5–6 min)

**TELA — 2 slides:**
1. Statement + tabela: "Duas semanas. Mesmo vídeo." (a tabela real do
   Supabase)
2. Statement: "Repetir vídeo: 100% verificável em código."

**AÇÃO 1:** conte este achado **só de fala**, sem abrir nenhum arquivo — é
bastidor de produção deste curso, não faz sentido pro aluno ver o arquivo
em si:

**FALA**

Antes de aceitar a proposta do Claude como final, eu bato contra uma coisa
real que já me aconteceu montando este curso. Uma vez eu cheguei a ter
**quatro documentos diferentes** de critério pra mesma aula — cada um com
um número diferente. Só descobri quando fui montar o material e nada
batia.

Então bater proposta nova contra o que eu já vivi não é formalidade. É a
pergunta: esse documento vai ser o único lugar onde esse critério mora, ou
eu vou ter uma segunda versão em outro arquivo semana que vem?

**AÇÃO 2:** volte ao terminal PowerShell (`Ctrl+\`` se estiver no VS Code, e
confirme que o terminal integrado diz "PowerShell") e rode, ao vivo, a
consulta real (a mesma do aquecimento, agora em cena):

```powershell
node -e "require('dotenv').config(); const {createClient}=require('@supabase/supabase-js'); const s=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY); s.from('premium_suggestions').select('week_start,video_title').order('week_start').then(({data,error})=>{console.log(data,error)})"
```

**FALA (enquanto roda, e apontando o resultado — avança pro slide 1 deste
passo, com a tabela)**

Vou consultar o Supabase agora, real, sem preparar.

**[aponta as duas linhas de Beef Wellington na saída/tabela]**

Olha. Duas semanas, mesmo vídeo. Isso não estava na proposta do Claude.
Isso é um critério que só nasce de olhar o dado, não a spec.

**AÇÃO 3 — pergunta de debate pra fazer em voz alta, avançando pro slide 2
deste passo (não precisa resolver sozinho, é o ponto pedagógico):**

**FALA**

E aqui cabe uma pergunta antes de eu sair escrevendo critério: isso é eval
de qualidade — algo que só uma LLM pode julgar — ou é regra 100%
verificável em código, tipo o casamento de nome no estoque, que é
determinístico e não julgamento de LLM?

**[responde]** É verificável em código: duas semanas, mesmo `video_url`, dá
pra comparar sem IA nenhuma. Então não vai ser um critério que o juiz
*decide* — vai ser um sinal que o **código** apura, o mesmo padrão que
`execucao_integra` já usa pra detectar corte de resposta. O juiz só lê o
sinal pronto.

---

## 2.5.5 — Fechar o documento final (2–3 min)

**TELA — 2 momentos:**
1. Slide "O documento final" (3 bullets: menos código / mais repetição /
   documento só)
2. Editor, aba `evals/criterios.md`

**FALA (no slide, antes de ir pro editor)**

O documento final não é a primeira resposta do Claude. É a primeira
resposta menos o que já é código — a URL real. Mais o que o dado real
mostrou — a repetição. E um documento só, não quatro em disputa, como
quase aconteceu aqui na produção deste curso.

**[avança pro editor]**

**AÇÃO:** posicione o cursor no fim do arquivo (depois da seção "O que
deliberadamente não virou critério", antes do fecho) e cole o bloco novo:

```markdown
---

## Operação: `receita-premium-semanal`

O job semanal que escolhe UMA receita do canal do chef Mohamad Hindi,
cruzando com estoque e preferências. Construído em aula, ao vivo — ver
`docs/aula-bonus-evals-do-zero-roteiro.md`.

### `execucao_integra` — binário

Mesmo critério transversal já definido no topo deste documento.

### `nao_repete_semana_anterior` — binário

**Pergunta:** o vídeo escolhido esta semana é diferente do escolhido na
semana imediatamente anterior?

**Como julgar:** sinal 100% apurado em código (`sinais_apurados_em_codigo.repetiu_video_da_semana_anterior`)
— comparação de `video_url` entre a semana atual e a anterior em
`premium_suggestions`. O juiz não decide isso, só lê o sinal pronto — é a
mesma convenção de `execucao_integra` com truncamento.

**Se falhar, o que acontece?** achado real de 2026-09-16: 24/08 e 31/08
escolheram o mesmo vídeo (Beef Wellington). A "surpresa semanal" que
justifica a feature vira repetição — e ninguém recebe erro, o produto só
fica menos útil silenciosamente.

### `escolha_ancorada_no_feed` — binário

**Pergunta:** a justificativa da escolha cita elementos reais do vídeo
(título, ingredientes da descrição) e do estoque consultado, em vez de
genérico?

**Se falhar, o que acontece?** mesma lógica de `ancoragem_no_texto` na
ingestão — justificativa genérica ("essa receita é ótima") não prova que o
modelo realmente cruzou feed + estoque, só que ele sabe escrever elogio.
```

**AÇÃO:** salve o arquivo (`Ctrl+S`).

---

## 2.5.6 — Implementar o LLM-as-judge (4–5 min)

**TELA — 2 momentos:**
1. Slide "O juiz, em código" (4 bullets, resumindo as 3 mudanças)
2. Editor, aba `evals/run-evals.js`

**FALA (no slide, antes de ir pro editor)**

Três mudanças, resumidas aqui: o nome novo entra na lista de operações, o
sinal de repetição é apurado em código, e o mesmo padrão de sempre —
`tool_choice` forçado. O juiz só lê o sinal, não decide.

**[avança pro editor]**

**AÇÃO 1:** peça pro Claude (no chat, mesma conversa) escrever as três
edições abaixo — cole este prompt:

```
Agora vira código. Em evals/run-evals.js:

1. Adicione 'receita-premium-semanal' ao array OPERACOES (linha ~58).
2. Em montarMaterial (a função que monta sinais_apurados_em_codigo), adicione
   um sinal `repetiu_video_da_semana_anterior` calculado assim: se
   trace.name === 'receita-premium-semanal', busca no Supabase
   (tabela premium_suggestions) a linha da semana imediatamente anterior
   à do trace atual e compara video_url. Sem chamada de IA nenhuma nessa
   comparação.
3. Adicione uma entrada nova no objeto CRITERIOS para
   'receita-premium-semanal', com os critérios execucao_integra,
   nao_repete_semana_anterior e escolha_ancorada_no_feed, seguindo
   exatamente o mesmo formato (nome/tipo/descricao) das entradas
   sugerir-receita e mediar-cardapio já existentes acima.

Siga a convenção do arquivo: nada em silêncio, erro explícito se a consulta
ao Supabase falhar.
```

**AÇÃO 2:** enquanto ele responde, aponte na tela do editor (lado a lado
com o chat) os três pontos exatos que vão mudar:

- linha **58** — `const OPERACOES = [...]`
- dentro de `montarMaterial`, bloco `const sinais = { ... }` (linha **273**
  na versão atual)
- dentro do objeto `CRITERIOS`, depois da entrada `'ingerir-relato'`
  (fecha na linha **~417**)

**FALA (enquanto ele escreve)**

Repara que ele reaproveita a estrutura que já existe —
`sinais_apurados_em_codigo` antes do juiz, critério de execução íntegra
primeiro. Isso não é coincidência, é o padrão que a gente construiu junto
virando reflexo.

**AÇÃO 3:** aplique a edição proposta pelo Claude no editor (aceitar/colar),
salvar, e rodar no terminal PowerShell (já na pasta do projeto):

```powershell
node evals/run-evals.js --operacao receita-premium-semanal --dry-run
```

**FALA**

E aí está: o critério de repetição, testado contra o dado real, reprova a
semana de 31/08. Não porque eu programei ele pra reprovar. Porque é o que
aconteceu.

**[SE a rede falhar aqui — ver "Se travar" no fim]**

---

## 2.5.7 — PR simulado (2 min)

**TELA:** slide "Isso aqui é simulado." — **é só essa frase**, não existe
um mockup de tela de PR com título/corpo/diff. O "PR" é descrito de boca,
não mostrado.

**AÇÃO:** nenhuma ação no terminal/editor/tela aqui — intencionalmente só
fala, sem `git push`, sem `gh pr create`, e sem trocar de slide.

**FALA**

Última etapa, direto: isso aqui é simulado. Não vou dar push nem abrir PR
de verdade agora. Se um PR real saísse disso, o título seria algo como
"Eval: receita-premium-semanal", o corpo diria o que muda e por quê, e o
diff seria as três edições que a gente acabou de fazer.

O ponto não é o clique. É que o eval que a gente construiu nos últimos
vinte minutos tem o mesmo destino de qualquer mudança de produto: revisão,
diff, decisão de alguém — não fica só na conversa com o chat.

---

## 2.5.8 — Fecho (1 min)

**TELA:** slide "Eu sei o que procurar. Agora falta enxergar."

**FALA**

O que eu quero que fique: construir eval do zero não é escrever critério
bonito na primeira tentativa. É propor, bater contra a realidade, e só
então fechar. E o dado sempre tem a última palavra que a spec não tem.

**CORTE.**

---

## Se travar

Frase âncora: **"O documento final não é a primeira resposta — é a primeira
resposta menos o que já é código, mais o que o dado real mostrou."**

Se o Claude propuser algo inesperado que não seja péssimo, não descarte —
reaja e debata na hora; é o ponto da aula.

Se a consulta ao Supabase falhar em cena (rede intermitente já documentada
em `docs/RETOMADA-15-09.md` — antivírus interceptando TLS, some sozinho):
os quatro valores já estão congelados no bloco "Setup" deste documento.
Leia deles em voz alta e siga.

Se `node evals/run-evals.js --operacao receita-premium-semanal` der erro
porque a edição do Claude não bateu com o nome exato de algum campo do
Supabase: tenha o schema de `premium_suggestions` (colunas `week_start`,
`video_url`, `video_title`) já anotado — está em `schema.sql`, buscar por
`premium_suggestions`.

---

## Numeração

Confirmada em 16/09: esta aula é **2.5**. Verifique se o espelho oficial da
plataforma também precisa de atualização — mesmo erro que travou o deck
original da Aula 2 foi título divergente do espelho
(`docs/aula2-avaliacao-e-plano.md` item 2).
