# Script linear — curso completo, Aulas 1 a 5

Documento único, na ordem de gravação. Do primeiro "oi" ao último corte.
Escrito em 09/09 para ser lido **de cima para baixo**, sem pular entre
arquivos.

**Como usar:** cada vídeo tem quatro blocos fixos — `TELA` (o que precisa
estar aberto), `FALA` (texto para dizer; escrito para soar falado, não para
decorar), `COMANDOS` (o que rodar, na ordem) e `CORTE` (onde termina). Os
demais documentos (`PLANO-GRAVACAO-CURSO.md`, roteiros por aula, runbook da
Aula 4) continuam válidos como referência de detalhe — este aqui é o fio
condutor.

---

## ⏳ ANTES DE TUDO: a janela tem prazo

Verificado em 09/09: **o Langfuse Cloud está retendo ~30 dias de traces.**
Os dados mais antigos já sumiram — a janela visível hoje começa em 12/08,
quando o RUNBOOK falava em traces desde 27/07.

Consequência direta para a gravação:

| Trace | Data | Sustenta | Expira por volta de |
|---|---|---|---|
| `41a4e5c75e33...` (episódio C, lasagna) | 22/08 | Aulas 3.4 e 4.1 | **21/09** |
| `57debf7a7153...` (truncamento) | 22/08 | Aulas 3.4 e 4.2 | **21/09** |

Ambos **ainda estão presentes** (verificado hoje). Mas o dia 22/08 concentra
21 dos traces mais ricos do curso, e ele sai da janela em cerca de doze
dias.

**Recomendação:** antes de gravar qualquer coisa, tire prints dos dois
traces acima e salve em `docs/apoio/`. Leva cinco minutos e transforma um
prazo em um não-problema. Se preferir, eu faço isso agora — é só pedir.

E há um ganho didático aqui: a retenção **vira conteúdo** da Aula 3. O dado
bruto é caro e some; o que sobrevive é o que você agregou. Está no script,
no vídeo 3.3.

---

## 🔧 Bloco 0 — preparação do ambiente (~20 min, sem gravar)

Estado verificado em 09/09, todos verdes:

- Produção no ar: `chef.workshopee.com.br` responde 401 (Basic Auth) ✅
- Chave da Anthropic funcionando no `.env` **e** no Railway ✅
- PRs #4 e #6 abertos, na ordem certa ✅
- `return` mudo preservado em `master` ✅
- Lasanha **5/5 porções** — episódio C intacto ✅
- 43 Scores no Langfuse (a rodada de evals de 28/08 sobreviveu) ✅

```bash
curl.exe -s -o NUL -w "producao: HTTP %{http_code}\n" https://chef.workshopee.com.br
```

**Novidade de estado que melhora a aula:** a faixa "vencendo" — que estava
vazia em agosto — agora tem **três itens vencidos de verdade**: espinafre
(9 dias vencido), vagem e couve-flor (5 dias cada). Isso enriquece a demo da
Aula 1: o painel não mostra mais um estado idealizado, mostra uma cozinha
real com comida esquecida na geladeira. Use isso.

**Abas para deixar abertas** (nesta ordem, da esquerda para a direita):

1. `chef.workshopee.com.br` (autenticado)
2. Langfuse Cloud — `us.cloud.langfuse.com`
3. Telegram Web, no grupo da casa
4. GitHub — `docs/PLANO-GRAVACAO-CURSO.md` **(obrigatório: some do disco na Aula 4)**
5. VS Code no repositório, em `master`

---

# AULA 1 — O produto lançou. E agora?

**Versão:** `master`, produção. Nenhum checkout, nenhum deploy.

## 1.1 — Apresentação (3 min)

**TELA:** você. Sem slide de produto.

**FALA:**

> Oi! Eu sou o Diego, e nos próximos cinco capítulos a gente vai fazer uma
> coisa que quase nenhum curso de IA faz: olhar um produto **depois** que
> ele já está no ar.
>
> Não vamos construir um produto do zero. Vamos pegar um que já existe, que
> já tem usuário real — a minha casa —, que já gerou dado real e que já
> quebrou de verdade. E vamos aprender a operar isso.
>
> Ao final, você vai saber avaliar a qualidade das respostas do seu produto
> de forma contínua, enxergar o que ele está fazendo em produção sem estar
> olhando o tempo todo, e colocar limites que protegem o seu usuário e a sua
> empresa.
>
> Tem uma frase que vai atravessar o curso inteiro: **lançar é a parte
> fácil**. Vamos começar.

*(Audiodescrição conforme padrão Alura.)*

**CORTE:** logo após a frase de gancho.

---

## 1.2 — Lançar é o começo (5 min)

**TELA:** slide 1, depois o navegador em `chef.workshopee.com.br`.

**FALA:**

> O erro mental mais comum em produto é tratar o deploy como linha de
> chegada. Subiu, está no ar, acabou. Só que com IA isso é ainda mais falso
> do que com software tradicional.
>
> Um software tradicional degrada quando alguém mexe nele. Um produto com IA
> degrada **sem ninguém mexer em nada**: o modelo muda de comportamento, o
> contexto cresce, os usuários começam a escrever de um jeito que você não
> previu. O código está igual, o comportamento não.
>
> Deixa eu te mostrar o produto que vai nos acompanhar.

**[trocar para o navegador]**

> Isso aqui é o Chef Caseiro. Ele é fictício no sentido de que existe para
> este curso — mas tudo nele é real: roda em produção, conversa comigo e com
> a minha esposa pelo Telegram, e lê nota fiscal de verdade da SEFAZ.
>
> Essa faixa de cima é o estado da cozinha, calculado em código. Tenho uma
> lasanha com cinco porções vivas. E aqui embaixo, olha só: espinafre
> vencido há nove dias, vagem e couve-flor há cinco. Isso não é dado de
> demonstração. É a minha geladeira, com a comida que eu esqueci lá.
>
> Aqui embaixo é o feed — cada linha é um evento real da casa. E este é o
> ciclo que o curso ensina: avaliar, observar, proteger, e voltar para o
> começo. Não é uma lista de tarefas. É um loop, e ele não termina.

**CORTE:** após "não termina".

**SE DER ERRADO:** se o site não abrir, use um print. O vídeo é conceitual;
a demo ilustra, não sustenta.

---

## 1.3 — Os três pilares da operação (5 min)

**TELA:** slides 2 e 3. Sem terminal.

**FALA:**

> Operar um produto com IA se apoia em três pilares.
>
> O primeiro é **evals**. A pergunta que ele responde é: como eu sei que a
> resposta do meu produto é boa, sem ler uma por uma na mão? É o Capítulo 2.
>
> O segundo é **observabilidade**. A pergunta: o que está acontecendo aí
> dentro agora, sem que eu esteja olhando? Capítulos 3 e 4.
>
> O terceiro é **conformidade responsável**. A pergunta: onde estão os
> limites que protegem quem usa e quem construiu? Capítulo 5.
>
> E aqui está a parte que quase todo mundo erra: esses três não são etapas
> em sequência. Eles se alimentam. Um eval mal feito não detecta a falha que
> a observabilidade só vai encontrar semanas depois. Uma falha que a
> observabilidade mostra e que não tem guardrail vira incidente. E um
> guardrail que você nunca avaliou é só uma linha de código que você
> **acredita** que funciona.

**CORTE:** após "acredita que funciona".

---

## 1.4 — Mapeando riscos do produto (5 min)

**TELA:** slide 4 (matriz de risco), depois VS Code em `agent.js` e
`tools.js`.

> ⚠️ **Este é o vídeo-gancho.** Ele planta as sementes das Aulas 3 e 4.
> Nomeie os riscos como **pergunta**, nunca entregue o desfecho.

**FALA:**

> Vamos fazer o exercício que eu faria em qualquer produto no primeiro dia
> de operação: onde isso aqui pode dar errado? Quatro riscos, todos reais.
>
> **Risco um: custo concentrado.** Um dos agentes desse produto, o mediador
> de cardápio, é responsável por uma fatia pequena das chamadas e por uma
> fatia enorme da conta. O que acontece se ele entrar em loop? Ou se o preço
> do modelo mudar?
>
> **Risco dois: correspondência de dado que falha calada.** O sistema
> registra o que a pessoa disse. Mas e se o que ela disse não bater
> exatamente com o que está gravado no banco? Ele avisa — ou fica quieto?
>
> **Risco três: canal que não avisa quando falha.** O bot recebe uma
> mensagem que ele não sabe processar. Ele devolve um erro, ou finge que
> nunca recebeu nada?
>
> **Risco quatro: o modelo fazendo conta.** Em algum lugar desse sistema, um
> modelo de linguagem soma dois números em vez de um código fazer isso. Por
> que isso é arriscado, mesmo quando a conta dá certo?

**[abrir VS Code]**

> Aqui é o `agent.js`, o loop do agente — cada chamada vira uma observação
> registrada. E aqui, no `tools.js`, tem a função que casa o nome do que a
> pessoa falou com o que está no estoque.
>
> Eu não vou explicar essas duas agora. Guarda elas na memória.
>
> A pergunta que fecha este capítulo é: quantos desses quatro riscos esse
> produto já sofreu de verdade, em produção? A resposta é nos próximos
> capítulos — e ela é maior do que você imagina.

**CORTE:** após "maior do que você imagina".

---

## 1.5 — O que aprendemos? (texto, não é vídeo)

- Lançar é o começo de um ciclo de operação, não o fim de um projeto.
- Produtos com IA degradam sem ninguém mexer no código.
- Três pilares sustentam a operação: evals, observabilidade e conformidade
  responsável — e eles se alimentam, não se sucedem.
- Todo produto tem riscos mapeáveis: custo concentrado, falha silenciosa de
  dado, canal mudo e aritmética no lugar errado.

---

# AULA 2 — Evals: avaliando a qualidade das respostas

**Versão:** `master`. **Nenhum checkout** — de propósito, para o material
não sumir do disco.

Confira antes de gravar:

```bash
node evals/run-evals.js --help
```

## 2.1 — O que são evals? (10 min)

**TELA:** slides. Sem terminal.

**FALA:**

> Eval é teste automatizado — mas para qualidade de resposta, não para
> correção de código.
>
> E essa diferença muda tudo. Num teste comum, existe verde e vermelho: dois
> mais dois é quatro, passou. Numa resposta de linguagem natural não existe
> isso. Existe **critério**.
>
> Por que não dá para revisar na mão? O Chef Caseiro gerou algumas dezenas
> de interações em um mês de uso de **uma casa só**. Uma. Agora multiplica
> por mil usuários e me diz quem vai ler.
>
> E tem uma diferença que quase todo mundo ignora: testar antes do deploy é
> uma coisa; **avaliar continuamente depois** é outra. O modelo muda, o
> prompt muda, os dados mudam. Um eval que passou ontem pode falhar hoje sem
> você ter tocado em uma linha.
>
> Eval não substitui observabilidade nem guardrail. Ele é a primeira camada:
> responde "isso é bom?" antes de "isso está funcionando?" e antes de "isso
> é seguro?".

**CORTE:** após "isso é seguro".

---

## 2.2 — Critérios de qualidade (12 min)

**TELA:** VS Code em `evals/criterios.md`, lado a lado com `SDD.md` §7.

**FALA:**

> Um critério bom é uma pergunta que **qualquer pessoa da equipe** consegue
> responder olhando a resposta. Sem saber programar.
>
> Critério ruim: "a resposta é boa". Isso não é critério, é opinião.
> Critério bom: "a sugestão usa apenas ingredientes que existem no estoque
> hoje". Isso qualquer um julga, e dois avaliadores diferentes chegam à
> mesma conclusão.

**[abrir `evals/criterios.md`]**

> Estes são os critérios reais do produto. Olha este: "a receita respeita as
> restrições alimentares da casa". E este: "o agente registrou o consumo
> depois de sugerir".
>
> E agora o detalhe que eu quero que você leve: esse último critério não
> nasceu da minha cabeça. Ele nasceu de um **bug real** que aconteceu neste
> produto — o agente sugeria a receita e simplesmente não registrava o que
> tinha sido consumido. Está documentado na especificação.
>
> Critério mensurável nasce de requisito real, e requisito real muitas vezes
> nasce de cicatriz.

**CORTE:** após "nasce de cicatriz".

---

## 2.3 — Claude como avaliador (12 min)

**TELA:** VS Code em `evals/run-evals.js`, no bloco do `tool_choice`.

**FALA:**

> A ideia do Claude-as-judge é simples: um segundo agente lê a interação
> inteira — o pedido, a resposta, o estado do estoque na hora — e julga
> contra os critérios que a gente acabou de escrever.
>
> Só que tem uma armadilha aqui, e ela é a lição mais reaproveitável do
> curso inteiro.

**[mostrar o bloco de `tool_choice`]**

> Repara nisto: eu não peço para o Claude "responder em JSON". Eu **forço** a
> chamada de ferramenta.
>
> Por quê? Porque este produto já aprendeu essa lição na dor. Numa versão
> anterior, o prompt **pedia** para o agente registrar o consumo. Pedia com
> todas as letras. E o modelo, às vezes, simplesmente não fazia. Não é
> desobediência, é probabilidade.
>
> A regra que ficou: **pedir não garante, forçar garante**. Isso virou
> convenção no projeto inteiro — está no agente, está na leitura de nota
> fiscal, e está aqui no juiz.
>
> E para um juiz isso é ainda mais crítico. Se a saída dele não for
> estruturada de verdade, você não consegue agregar nada depois. Um juiz que
> responde em texto livre é um juiz que você vai ter que ler na mão — ou
> seja, voltamos ao problema do início.
>
> O resultado do julgamento vira um **Score** gravado de volta no Langfuse,
> amarrado ao ID do trace original. É esse Score que o Capítulo 3 vai usar
> para falar de qualidade ao longo do tempo.

**CORTE:** após "ao longo do tempo".

---

## 2.4 — Primeiro conjunto de evals (15 min)

**TELA:** terminal + Langfuse Cloud.

> ⚠️ **Avise a turma do lag ANTES de rodar.** São ~45 segundos entre a
> execução e o Score ficar consultável. Sem o aviso, alguém acha que quebrou.

**FALA (antes de rodar):**

> Duas decisões antes de escrever o primeiro conjunto.
>
> A primeira: **não avalie tudo.** Priorize pelos cenários que mais custam
> quando dão errado. Aqui são três: sugestão que usa item que não existe,
> sugestão que ignora restrição alimentar, e consumo que não foi registrado.
>
> A segunda: rode contra **interações reais já registradas**, não contra
> exemplos que você inventou agora. O valor de um eval despenca quando ele
> nunca viu dado de verdade.
>
> Ah, e já vou avisando: quando eu rodar isso, o Score não vai aparecer na
> hora no Langfuse. Tem um atraso de uns 45 segundos entre exportar e ficar
> consultável. Isso é esperado, não é bug — e é um detalhe que muda como
> você automatiza em cima disso.

**COMANDOS:**

```bash
node evals/run-evals.js --limit 3
```

**FALA (enquanto roda):**

> Enquanto ele roda: o script busca os traces recentes de cada operação,
> monta o contexto de cada interação, chama o juiz com a saída forçada, e
> grava o Score de volta amarrado ao trace.

**FALA (com o resumo na tela):**

> Olha o resultado. E olha uma coisa que eu não planejei mostrar: o critério
> de **integridade de execução** deu 0,33 nas duas operações de geração. Dois
> de cada três traces estão estruturalmente quebrados.
>
> Isso não é o juiz sendo severo. É um problema real, que eu vou diagnosticar
> no Capítulo 4.
>
> E repara no contraste: a operação de ingestão, que é simples e barata, deu
> integridade perfeita. As caras e complexas é que degradam. Guarda isso.

**[abrir o Langfuse e procurar o Score — mostrar que ainda não está lá]**

> Viu? Não está. Não quebrou — é o lag. *(cortar na edição e voltar com o
> Score visível)*

**CORTE:** com o Score aparecendo na tela.

**SE DER ERRADO:** já existem **43 Scores gravados** no Langfuse da rodada
de 28/08. Se a execução ao vivo falhar, mostre os Scores que já estão lá e
siga — a aula não depende da execução dar certo na hora.

---

## 2.5 — O que aprendemos? (texto)

- Eval é critério repetível para qualidade de resposta, não asserção de
  código.
- Critério mensurável nasce de requisito real — e muitas vezes de um bug
  real.
- Claude-as-judge só é confiável com saída estruturada **forçada**: pedir
  não garante, forçar garante.
- O primeiro conjunto prioriza os cenários mais custosos, roda contra dado
  real e grava Score de volta no Langfuse — com um lag de ~45s que é
  esperado.

---

# AULA 3 — Observabilidade: monitorando em produção

**Versão:** `master` + Langfuse Cloud com dados reais. Uma demo local de
liga/desliga no 3.2.

> ⚠️ **Números:** a tabela detalhada do `RUNBOOK-gravacao-29-08.md` §3 é a
> foto de 22/08 (68 traces, US$ 1,65). **Hoje o Langfuse mostra 50 traces**,
> porque a retenção do plano cortou os mais antigos. Não decore números:
> abra o painel e leia o que estiver lá. A diferença virou conteúdo — está
> no 3.3.

## 3.1 — O que é observabilidade?

**TELA:** VS Code em `instrumentation.js` (17 linhas).

**FALA:**

> Observabilidade não é log. E essa confusão custa caro.
>
> Log responde "o que aconteceu aqui". Observabilidade responde outra coisa:
> "eu consigo **reconstruir por que** aconteceu, sem ter estado olhando na
> hora?".
>
> Neste produto isso não é uma feature bonita — é uma invariante escrita na
> especificação: **nenhuma chamada ao modelo pode acontecer fora de uma
> observação registrada**. Requisito não-funcional, não item de backlog.

**[mostrar `instrumentation.js`]**

> São dezessete linhas, e elas precisam rodar **antes de tudo**. É o primeiro
> require do servidor. Se qualquer módulo carregar antes disso, as chamadas
> que ele fizer não são capturadas — e você nem fica sabendo que perdeu.
>
> E aqui está a parte contraintuitiva: se eu tirar as credenciais do
> Langfuse, o produto **continua funcionando**. Continua gerando ID de trace,
> continua respondendo ao usuário. Ele só não consegue mais te contar o que
> fez.
>
> Tirar observabilidade não quebra o produto. Quebra a sua capacidade de
> saber o que ele está fazendo. Deixa eu provar isso.

**CORTE:** após "deixa eu provar isso" — emenda direto no 3.2.

---

## 3.2 — Conhecendo o Langfuse

**TELA:** Langfuse Cloud + terminal.

**FALA (estrutura de dados):**

> Antes da demo, o vocabulário. São três níveis.
>
> **Trace** é a interação inteira — uma pessoa pediu uma receita, isso é um
> trace. Dentro dele vêm as **observations**: cada chamada ao modelo, cada
> ferramenta executada, cada pedaço de lógica. Aqui no Chef Caseiro, cada
> chamada e cada tool call viram uma observação própria, aninhadas dentro de
> um span do agente.
>
> É essa hierarquia que permite responder "por quê" em vez de só "o quê".

**COMANDOS (o "antes"):**

```bash
powershell -File scripts/observabilidade.ps1 off
```

```bash
npm start
```

**FALA (com o Langfuse vazio):**

> Desliguei só as credenciais do Langfuse. Nada mais. Agora vou usar o
> produto normalmente.
>
> *(fazer uma ação — mandar uma mensagem na conversa)*
>
> Funcionou. Respondeu. O usuário não percebeu absolutamente nada. E o
> Langfuse... nada. Nenhum trace.
>
> Esse é o ponto: **o produto não sabe que está cego**. Não tem erro, não tem
> alerta, não tem log dizendo "perdi a instrumentação". Ele só para de te
> contar, e segue em frente.

**COMANDOS (o "depois"):**

```bash
powershell -File scripts/observabilidade.ps1 on
```

```bash
npm start
```

**FALA:**

> Religo, repito a mesma ação — e agora o trace aparece. Lembrando dos 45
> segundos de lag: se não apareceu na hora, espera antes de achar que
> quebrou.

**CORTE:** com o trace visível.

**SE DER ERRADO:** `powershell -File scripts/observabilidade.ps1 status` diz
em que estado está. Se não existir `.env` na máquina, rode `... preparar`
antes — ele monta o arquivo a partir das variáveis do Railway.

---

## 3.3 — Lendo os dados de produção

**TELA:** Langfuse Cloud, visão agregada.

**FALA:**

> Agora vem a parte que muda a forma de operar: parar de olhar uma interação
> por vez e olhar o conjunto.

**[abrir a visão de traces, filtrar por operação]**

> Olha a distribuição. A ingestão de relato é a operação mais frequente —
> são conversas curtas, baratas, rápidas. O mediador de cardápio aparece bem
> menos vezes.
>
> Só que quando eu olho o **custo**, a história inverte completamente. O
> mediador é uma fatia pequena das chamadas e a maior fatia da conta. Ele não
> é o mais frequente. Ele é o mais caro por chamada — e por uma margem
> enorme.
>
> Esse tipo de conclusão não aparece olhando interação por interação. Só
> aparece no agregado. É exatamente o risco número um que eu levantei lá no
> Capítulo 1 — e aqui ele deixou de ser hipótese e virou número.

**FALA (comparação de modelos):**

> E tem um experimento que já está rodado aqui dentro. A mesma tarefa de
> ingestão rodou em dois modelos diferentes, com o mesmo prompt. O modelo
> mais leve saiu praticamente duas vezes mais barato e duas vezes e meia mais
> rápido — na mesma tarefa, com qualidade equivalente.
>
> É por isso que este produto tem um eixo de modelo separado para
> classificação e outro para geração. Não é over-engineering: é o dado
> mandando.

**FALA (a retenção — conteúdo novo, e importante):**

> E agora uma coisa que eu descobri preparando esta aula, e que eu acho que é
> a lição mais subestimada de observabilidade.
>
> Quando eu documentei esses números pela primeira vez, eu tinha traces desde
> o fim de julho. Hoje, quando eu abro esse painel, os mais antigos
> **sumiram**. O plano retém mais ou menos trinta dias, e o resto evaporou.
>
> Ou seja: o dado bruto é caro e **tem prazo de validade**. O que sobrevive é
> aquilo que você agregou, anotou, transformou em métrica ou em documento.
>
> Se a sua estratégia de observabilidade é "está tudo guardado lá, eu vejo
> depois", eu tenho uma má notícia: depois, pode não estar mais.

**CORTE:** após "pode não estar mais".

---

## 3.4 — Padrões de falha

**TELA:** Langfuse, traces específicos.

**FALA:**

> Quatro padrões de falha reais, todos deste produto, todos documentados.
>
> **Padrão um: truncamento por limite de tokens.** A assinatura é
> reconhecível: os tokens de saída batem exatamente no teto configurado. A
> resposta corta no meio de uma palavra.
>
> Isso começou cosmético. Aí a despensa cresceu, e o corte passou a acontecer
> **no meio de uma chamada de ferramenta** — deixando uma chamada órfã que
> derruba a requisição seguinte com erro. Degradou de feio para quebrado, sem
> ninguém mexer em nada.
>
> *(abrir o trace `57debf7a7153...` e mostrar output tokens no teto)*
>
> **Padrão dois: erro engolido por fallback defensivo.** Um retorno vazio
> padrão num lugar errado. A consulta falhava, e a tela mostrava vazio em vez
> de erro. Vazio parece dado; erro parece erro. O primeiro te engana por
> semanas.
>
> **Padrão três: os dois modos de cegueira de um canal.** Num caso, o
> tratamento de erro destruiu a evidência do erro. No outro, a evidência
> nunca chegou a existir. Eu vou diagnosticar os dois no próximo capítulo.
>
> **Padrão quatro, e é o meu favorito: o modelo acertou e o código errou.**
>
> *(abrir o trace `41a4e5c75e33...`)*
>
> Olha esse trace. Alguém relatou ter comido três porções de lasanha. O
> modelo classificou tudo certo: identificou que era refeição caseira,
> extraiu o nome do prato, extraiu a quantidade. Perfeito.
>
> E o estoque **não mudou**. Continua com cinco porções — que é o que a tela
> ainda mostra hoje, semanas depois.
>
> O prato está gravado como "lasanha", com "nh". O relato veio "lasagna", com
> "gn". A busca não casou. Não é acento, não é maiúscula — é grafia mesmo.
>
> E tudo "funcionou": o relato foi gravado, o registro da refeição foi
> gravado, o bot até reagiu com joinha na mensagem. Estado errado, zero
> alarme.
>
> Repara no que os quatro têm em comum: **nenhum deles gritou**. Cada um
> precisou de alguém olhando o dado certo, com a pergunta certa. É exatamente
> por isso que o próximo capítulo se chama detectar, diagnosticar e corrigir.

**CORTE:** após "detectar, diagnosticar e corrigir".

---

## 3.5 — O que aprendemos? (texto)

- Observabilidade é reconstruir a causa, não registrar o evento — e aqui é
  invariante de código.
- Trace → observation → generation é a estrutura; sem credenciais o produto
  funciona e fica cego, sem avisar.
- O agregado revela o que a interação isolada esconde: onde o custo se
  concentra e onde trocar de modelo compensa.
- Dado bruto tem prazo de validade — o que sobrevive é o que você agregou.
- Quatro padrões de falha reais, e nenhum deles gritou sozinho.

---

# AULA 4 — Detectar, diagnosticar e corrigir

**A aula mais complexa do curso.** É a única com deploy real, ordem de
branch que importa e Telegram ao vivo.

> 🔴 **ANTES DE COMEÇAR — leia os três avisos:**
>
> 1. **Deixe `PLANO-GRAVACAO-CURSO.md` e este script abertos no GitHub.** Os
>    checkouts abaixo **apagam todos os documentos do disco**. É o erro mais
>    provável do dia.
> 2. **A ordem dos PRs é obrigatória: #4 antes do #6.** O #6 usa uma função
>    que o #4 introduz.
> 3. **Tenha a foto do cupom pronta** no celular, para enviar três vezes ao
>    grupo do Telegram.

**Mapa dos atos do runbook nos vídeos do CSV:**

| Vídeo | Ato do runbook | O que acontece |
|---|---|---|
| 4.1 | Ato 1 | A falha: manda a foto, nada acontece |
| 4.2 | Ato 2 | O diagnóstico por eliminação + os evals |
| 4.3 | Ato 3 | Deploy do PR #4 — o remendo honesto |
| 4.4 | Atos 4 e 5 | Deploy do PR #6 + a consequência |

**Estado de partida (confirme antes de gravar):**

```bash
curl.exe -s -o NUL -w "producao: HTTP %{http_code}\n" https://chef.workshopee.com.br
```

```bash
git branch --show-current
```

Precisa estar em `master`. Se não estiver: `git checkout master`.

---

## 4.1 — Detectando degradação

**TELA:** Telegram Web + Langfuse + logs do Railway.

**FALA (abertura):**

> Nos capítulos anteriores a gente montou o instrumental. Agora vamos usar,
> num caso real que aconteceu com este produto em produção.
>
> Eu vou mandar uma foto de um cupom fiscal no grupo da minha casa. É uma
> coisa que eu, como usuário, acho absolutamente razoável fazer: tira foto do
> cupom, manda pro bot, ele registra as compras.

**[mandar a foto no Telegram]**

> Mandei. E agora a gente espera.
>
> ...
>
> Nada. Nenhuma resposta, nenhuma reação na mensagem, nenhum item novo no
> estoque. Do meu lado, como usuário, o produto simplesmente me ignorou.
>
> Vamos investigar com as ferramentas do capítulo anterior.

**[abrir o Langfuse]**

> Langfuse: **nenhum trace**. Não tem trace com erro. Não tem trace pela
> metade. Não tem trace nenhum.

**[abrir os logs do Railway]**

```bash
railway logs --deployment
```

> Logs: **nenhuma linha**. Nem erro, nem aviso, nem "recebi alguma coisa".

**[mostrar o getWebhookInfo]**

> E agora a parte que torna isso interessante. Vou perguntar pro próprio
> Telegram se ele entregou a mensagem.
>
> Zero updates pendentes. Nenhum erro de entrega. **O Telegram entregou com
> sucesso.**
>
> Então junta as três coisas: o canal confirma a entrega, o sistema não tem
> log, não tem trace, não tem escrita e não respondeu.
>
> A pergunta que abre este capítulo é essa: **se o canal confirma a entrega e
> o sistema não registra absolutamente nada, onde está a mensagem?**
>
> E repara numa coisa: essa é a falha mais difícil de detectar que existe.
> Não é um erro vermelho na tela. É ausência. Se eu não estivesse procurando,
> eu nunca saberia.

**CORTE:** após "eu nunca saberia".

---

## 4.2 — Diagnosticando a causa

**TELA:** VS Code em `telegram.js` + terminal com os evals.

**FALA (diagnóstico por eliminação):**

> Vamos raciocinar por eliminação, que é o que sobra quando não há evidência.
>
> A mensagem chegou — o Telegram confirmou. Então o servidor recebeu. Se
> recebeu e não deixou rastro nenhum, existe um caminho no código que sai sem
> logar, sem gravar e sem responder.
>
> Quantos caminhos assim podem existir? Vamos olhar.

**[abrir `telegram.js`, achar a linha do return mudo]**

> Aqui está. Uma linha:
>
> `if (!message || !message.text) return;`
>
> Se a mensagem não tem texto — se é foto, áudio, documento — o código
> simplesmente **retorna**. Sem log. Sem resposta. Sem nada.
>
> E olha o comentário ao lado: "foto/áudio: fora do escopo desta fase". Ou
> seja, eu sabia. Eu escrevi isso conscientemente. E mesmo assim, quando
> aconteceu comigo, do outro lado da tela, eu levei um tempo até entender o
> que estava havendo.
>
> Aqui está a lição: o pecado não é não saber ler foto. Todo sistema tem
> limite. **O pecado é não dizer que não sabe.**

**FALA (o episódio irmão — os 8 microssegundos):**

> E tem um segundo caso, do dia anterior, que fecha o raciocínio. Nesse
> outro, apareceram **dois** erros no log, quase idênticos, com uma diferença
> de **oito microssegundos** entre eles.
>
> Oito microssegundos. Nenhuma chamada de rede acontece nesse tempo. Então a
> segunda falha não foi uma nova tentativa: foi o **aviso de erro falhando
> dentro do tratamento do primeiro erro** — e, ao estourar, ele engoliu o
> erro original.
>
> O tratamento de erro apagou a evidência do erro.
>
> Junta os dois casos e você tem os dois modos de cegueira: num, a informação
> foi destruída; no outro, ela nunca existiu. A correção dos dois é da mesma
> família: **nenhum caminho pode terminar em silêncio.**

**FALA (evals como instrumento de diagnóstico — objetivo do CSV):**

> E aqui eu quero conectar com o Capítulo 2, porque diagnóstico não é só ler
> código: é medir.

```bash
node evals/run-evals.js --limit 3
```

> Lembra que o critério de integridade de execução deu 0,33 nas operações de
> geração? Aquilo é um diagnóstico quantitativo. Ele me diz que o problema
> não é um caso isolado que eu tive azar de encontrar — são dois de cada três.
>
> E aponta a causa: o truncamento por limite de tokens que a gente viu no
> capítulo anterior. O eval não me deu a solução, mas me deu a **prevalência**
> — e prevalência é o que separa "bug que eu vi uma vez" de "problema
> sistêmico que precisa de decisão".

**CORTE:** após "decisão".

---

## 4.3 — Corrigindo antes do usuário

**TELA:** terminal + Telegram.

**FALA:**

> Agora eu vou corrigir. E eu quero que você repare no **tipo** de correção,
> porque ela é mais modesta do que você imagina — e mais valiosa.
>
> Eu não vou ensinar o bot a ler foto. Ainda não. Eu vou fazer ele **dizer
> que não sabe**.

**COMANDOS:**

```bash
git checkout aula4/fix-diagnostico-telegram
```

```bash
railway up --service chef-caseiro --detach
```

**FALA (enquanto sobe):**

> Enquanto sobe, o que tem nesse fix. Três mudanças, todas sobre não perder
> informação.
>
> A primeira: o erro passa a ser desembrulhado. Aquele `fetch failed`
> genérico vira `fetch failed` mais a causa real e o host envolvido.
>
> A segunda: avisar o usuário nunca mais pode derrubar o fluxo. O envio da
> mensagem de erro ganhou o próprio tratamento — então o erro original
> sobrevive no log, em vez de ser substituído pelo erro do aviso. É a
> correção direta dos oito microssegundos.
>
> A terceira: os caminhos silenciosos passam a falar. Link que não é nota
> fiscal válida? O bot diz. Formato que ele não sabe ler? O bot diz.

**[mandar a mesma foto de novo]**

> Mesma foto, segunda vez. E agora:
>
> *"ainda não sei ler foto de cupom, me manda o link do QR ou o texto"*
>
> Olha o que mudou na experiência. O produto continua **sem saber** ler a
> foto. A capacidade é exatamente a mesma. Mas a experiência é radicalmente
> diferente — porque agora eu sei o que aconteceu e sei o que fazer.
>
> **Admitir a limitação já é uma correção.**
>
> E tem um ganho operacional junto: a partir de agora, essa situação deixa
> rastro. Ela vira log, vira trace, vira dado. O que era invisível virou
> mensurável.

**CORTE:** após "virou mensurável".

---

## 4.4 — Simulando o ciclo completo

**TELA:** terminal + Telegram + painel web.

**FALA:**

> Fechado o ciclo de detectar, diagnosticar e corrigir, vamos rodar ele
> inteiro mais uma vez — agora com uma capacidade nova. Porque dizer "não
> sei" é honesto, mas em algum momento é melhor saber.

**COMANDOS:**

```bash
git checkout aula4/nota-por-foto
```

```bash
railway up --service chef-caseiro --detach
```

**FALA (enquanto sobe — a história do desenho derrubado):**

> E aqui tem uma história de produto que eu acho que vale mais que a feature.
>
> O desenho original era: o modelo de visão lê a foto do cupom e extrai os
> quarenta e quatro dígitos da chave da nota. Óbvio, direto, e é o tipo de
> coisa que a gente promete numa reunião sem testar.
>
> **Esse desenho foi derrubado por teste.** A SEFAZ exige um código de
> segurança que só existe dentro do QR code — não está impresso em lugar
> nenhum do cupom. Nenhum modelo de visão do mundo consegue ler o que não
> está escrito.
>
> A solução real ficou outra: ler o QR code, e usar a visão só como degrau de
> recuo. Menos elegante, e funciona.

**[mandar a foto pela terceira vez]**

> Terceira vez, mesma foto. E agora os itens entram no estoque — com dado
> oficial da SEFAZ, não com o que um modelo achou que estava escrito no papel.

**FALA (a consequência — Ato 5):**

> E agora a parte que fecha o curso, que é a consequência de ter dado esse
> poder ao produto.
>
> Com foto, a taxa de erro **sobe**. Cupom amassado, foto tremida, iluminação
> ruim. Antes, o produto não errava porque não fazia. Agora ele faz — e
> erra às vezes.
>
> Ou seja: toda capacidade nova traz superfície de erro nova. E é aí que a
> tela de revisão, que eu venho adiando desde o começo do projeto, deixa de
> ser luxo e vira necessidade.
>
> Repara no ciclo completo: eu detectei uma falha, diagnostiquei a causa,
> corrigi com honestidade, entreguei a capacidade — e a capacidade gerou um
> novo risco, que volta pro começo do ciclo.
>
> Isso não é o processo dando errado. **Isso é o processo.**

**FALA (o que ficou preservado — honestidade):**

> E eu quero terminar com uma confissão, porque seria fácil editar isso fora.
>
> Aquele bug do "lasagna" com "gn" que eu mostrei no capítulo passado?
> Continua lá. As cinco porções continuam intactas no meu estoque, semanas
> depois.
>
> Eu escolhi não corrigir. Não por preguiça: porque eu ainda não sei qual é a
> correção certa. Fazer a busca mais esperta resolve esse caso e cria outros.
> A saída provável não é um algoritmo melhor — é o sistema **perguntar**
> quando estiver em dúvida, que é o que ele já faz em outra parte do produto.
>
> Operar produto em produção é também isso: saber distinguir o bug que você
> corrige hoje do bug que você ainda precisa entender. Os dois são decisões.
> Fingir que o segundo não existe é que não é opção.

**COMANDOS (voltar ao estado inicial, ainda gravando ou logo após):**

```bash
git checkout master
```

**CORTE:** após "não é opção".

---

## 4.5 — O que aprendemos? (texto)

- Detectar é a parte mais difícil: a pior falha não é a que grita, é a que
  não deixa rastro.
- Diagnóstico por eliminação funciona quando não há evidência — e o
  timestamp pode entregar o mecanismo.
- Evals dão a **prevalência** do problema, que é o que separa caso isolado de
  problema sistêmico.
- Admitir a limitação já é uma correção — e transforma o invisível em
  mensurável.
- Toda capacidade nova traz superfície de erro nova; o ciclo não termina.
- Nem todo bug deve ser corrigido agora — mas todo bug deve ser decidido.

---

# AULA 5 — Guardrails, transparência e LGPD

**Versão:** `master`, tour de código. Sem deploy, sem checkout.

> ⚠️ **Confirme que você voltou para `master` depois da Aula 4** — o vídeo
> 5.2 precisa mostrar o código **sem** o fix aplicado:
>
> ```bash
> git checkout master
> ```
>
> Esta aula tem **seis vídeos** (5.1 a 5.6), não quatro.

## 5.1 — O que são guardrails?

**TELA:** VS Code, quatro arquivos em sequência.

**FALA:**

> Guardrail é limite operacional. É o que o produto **não pode** fazer,
> escrito em código — não é intenção, não é pedido no prompt, não é
> documentação.
>
> E eu vou mostrar cinco que já existem neste produto, porque guardrail em
> exemplo hipotético não ensina nada.

**[abrir `agent.js`]**

> **Um: saída estruturada forçada.** A gente já viu isso duas vezes no curso.
> Aqui o enquadramento muda: não é só qualidade, é guardrail. O produto **não
> confia** em pedir por linguagem natural quando a saída importa de verdade.

**[abrir `sefaz.js`]**

> **Dois: validar antes de confiar em dado externo.** Olha essa validação: só
> aceita URL de domínio `.gov.br` **e** com chave de quarenta e quatro
> dígitos. Qualquer outra coisa é rejeitada **antes** de gastar uma chamada de
> rede ou de modelo.
>
> Isso é guardrail de custo e de segurança ao mesmo tempo.

**[abrir `intencao-efeitos.js`]**

> **Três: perguntar em vez de chutar.** Se alguém diz "porcionei a lasanha" e
> não diz em quantas porções, o sistema **não estima**. Ele devolve uma
> pergunta, e não grava nada até a resposta vir.
>
> Isso é a regra de ouro do projeto — o modelo nunca calcula — aplicada a uma
> segunda forma: o modelo nunca inventa quantidade que ninguém disse.

**[abrir `receita-premium.js`]**

> **Quatro: guarda-corpo contra alucinação de URL.** Aqui a única decisão do
> modelo é escolher qual vídeo combina com o estoque. Mas antes de postar, o
> código **confere se a URL existe de verdade** na lista original. Se não
> existir: erro. Nunca uma URL inventada indo para o Telegram de alguém.

> **Cinco: autenticação como guardrail de custo.** O produto está protegido
> por senha não só por privacidade — é que ele gasta dinheiro de verdade a
> cada chamada. Uma URL pública sem gate é uma conta aberta.
>
> O fio que liga os cinco: **nenhum deles confia em pedir**. Todos verificam.

**CORTE:** após "todos verificam".

---

## 5.2 — Transparência com o usuário

**TELA:** `telegram.js` em `master` (sem o fix) + slide antes/depois.

**FALA:**

> Transparência em produto com IA não é aviso legal no rodapé. É o produto
> dizer, **no momento certo**, o que ele sabe e o que não sabe fazer.
>
> E o exemplo mais concreto do curso inteiro é o que a gente viveu no
> capítulo passado.

**[mostrar o `return` mudo em `master`]**

> Antes: essa linha. Foto chega, o produto retorna, silêncio absoluto. O
> usuário fica sem saber se o sistema caiu, se a mensagem não chegou, ou se
> ele fez algo errado.
>
> Depois do fix: *"ainda não sei ler foto de cupom, me manda o link do QR ou
> o texto"*.
>
> A capacidade técnica é **exatamente a mesma** nos dois casos. O produto não
> aprendeu nada. O que mudou foi só ele ter dito.
>
> E é por isso que essa frase ficou como a lição central da aula: **admitir a
> limitação já é uma correção**.
>
> Generalizando pro seu produto: toda resposta "não sei fazer isso" é mais
> transparente — e muito mais barata de construir — do que fingir que
> processou algo que não processou. A tentação de parecer capaz é o começo de
> quase todo problema de confiança.

**CORTE:** após "problema de confiança".

---

## 5.3 — LGPD na prática

**TELA:** `schema.sql` + trecho do `CLAUDE.md`.

> ⚠️ **Não abra o Supabase com dados reais em tela cheia.** Os `pensamentos`
> são conversas reais suas com sua esposa. Se for mostrar, use zoom ou corte.

**FALA:**

> LGPD em produto com IA começa por uma pergunta desconfortável: **que dado
> pessoal eu estou coletando sem ter percebido?**
>
> Vamos olhar o que este produto guarda.

**[mostrar `schema.sql`]**

> Identificadores de conversa do Telegram — isso identifica pessoas reais,
> ligadas a papéis dentro de uma casa.
>
> E esta tabela aqui, que é o coração do produto: o registro cru de tudo que
> duas pessoas conversam sobre comida em casa. O que comeram, o que queriam
> comer, quanto gastaram, o que desperdiçaram.
>
> Isso não é dado financeiro nem dado de saúde no sentido estrito da lei. Mas
> é **rotina familiar** — e rotina familiar é íntima o suficiente para merecer
> o mesmo cuidado. Dado pessoal não é só CPF.

**[mostrar o trecho sobre RLS no `CLAUDE.md`]**

> E agora a parte que eu poderia esconder e não vou.
>
> A segurança em nível de linha do banco está **desligada**. De propósito. A
> proteção real é que só uma chave de serviço toca essas tabelas, e ela nunca
> chega ao navegador.
>
> Essa decisão está documentada e é defensável **no escopo de uma casa só**.
> Ela não seria aceitável num produto com múltiplos clientes — e é
> exatamente o tipo de dívida que precisa estar escrita, com data e
> justificativa, e não descoberta por alguém três anos depois.
>
> E fica a pergunta que o próximo vídeo formaliza: quem tem o direito de
> pedir que esses dados sejam apagados — e este produto conseguiria atender
> hoje?

**CORTE:** após "conseguiria atender hoje".

---

## 5.4 — Checklist de conformidade

**TELA:** `docs/aula5-checklist-conformidade.md`.

**FALA:**

> Tudo que a gente viu nos três vídeos anteriores vira um checklist que você
> aplica em qualquer produto com IA — não só neste.

**[percorrer a tabela item por item]**

> E eu quero chamar atenção pra coluna da direita, que é onde este checklist
> se diferencia dos que você encontra por aí. Ela não diz "conforme". Ela diz
> **como este produto está hoje** — inclusive quando a resposta é
> constrangedora.
>
> Sem política de retenção definida. Sem tela de revisão do que o modelo
> extraiu. Sem mecanismo de exclusão a pedido. Segurança de linha desligada.
>
> Um checklist honesto não é aquele que está todo verde. É aquele que te diz
> onde você está — e o que você aceitou como risco, conscientemente.

**CORTE:** após "conscientemente".

---

## 5.5 — O que aprendemos? (texto)

- Guardrail é limite em código, não intenção em prompt — e o padrão comum é
  nunca confiar em pedir.
- Transparência é o produto dizer, no momento certo, o que não sabe fazer:
  admitir já é corrigir.
- Dado pessoal não é só CPF — rotina familiar também é, e merece o mesmo
  cuidado.
- Um checklist de conformidade honesto mostra as lacunas, com data e
  justificativa.

---

## 5.6 — Conclusão

**TELA:** slide final (o ciclo da Aula 1, agora preenchido).

**FALA:**

> A gente começou este curso com uma frase: lançar é o começo. Agora ela tem
> conteúdo por trás.
>
> **Evals**: você viu critério mensurável nascer de um bug real, um modelo
> julgando com saída forçada, e o resultado virando dado consultável.
>
> **Observabilidade**: você viu dado de produção de verdade mostrar onde o
> custo se concentra, viu o produto ficar cego sem avisar, e viu quatro
> padrões de falha em que nenhum deles gritou sozinho.
>
> **Detectar, diagnosticar e corrigir**: você viu uma falha real ser
> encontrada pela ausência de rastro, diagnosticada por eliminação, corrigida
> ao vivo — primeiro com honestidade, depois com capacidade nova. E viu a
> capacidade nova criar um risco novo.
>
> **Conformidade responsável**: você viu guardrails que já existiam no
> código, transparência como comportamento em vez de rodapé, e um inventário
> honesto do que ainda falta.
>
> E o fecho é este: **nenhum dos três pilares funciona sozinho.**
>
> Um eval que não vira dado observável não gera aprendizado nenhum.
> Observabilidade sem guardrail só te dá um relato detalhado do incidente
> depois que ele aconteceu. E um guardrail que você nunca avaliou é só uma
> linha de código em que você acredita.
>
> O produto que você acabou de ver por dentro rodou, errou, foi corrigido, e
> errou de novo. Ele não é um exemplo de perfeição — é um exemplo de
> **operação**. E é isso que eu queria te entregar: não um produto sem
> defeito, mas a prática de conviver com um produto vivo sem ficar cego.
>
> Agora pega o seu, e roda esse ciclo nele. Valeu!

**CORTE:** fim do curso.

---

# Apêndice — restauração pós-gravação

Depois de tudo gravado, para devolver o ambiente ao estado de referência:

```bash
git checkout master
```

```bash
railway up --service chef-caseiro --detach
```

Confirme que produção voltou ao estado com as falhas preservadas:

```bash
curl.exe -s -o NUL -w "producao: HTTP %{http_code}\n" https://chef.workshopee.com.br
```

Os PRs #4 e #6 podem permanecer abertos — eles continuam sendo a
documentação viva do que foi demonstrado. Mergeie apenas se decidir que o
produto deve seguir com as correções.
