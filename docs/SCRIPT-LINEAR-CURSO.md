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
> ✅ **Formato: gravação linear.** Decidido em 09/09. O produto vai para a
> gravação **no estado final** — corrigido, com leitura de nota por foto — e
> permanece assim do primeiro ao último vídeo. **Nenhum checkout, nenhum
> deploy, nenhuma troca de branch durante a gravação.** As falhas e as
> correções são contadas por slide, com a evidência real extraída do
> Langfuse antes de ela expirar.
>
> Isso resolve o que travou as tentativas anteriores: a Aula 4 não exige
> mais dois deploys ao vivo, nem ordem de branch, nem apaga a sua
> documentação do disco no meio da gravação.

---


## ✅ ANTES DE TUDO: a evidência já está salva

O Langfuse Cloud retém ~30 dias, e os dois traces que sustentam as Aulas 3 e
4 estavam prestes a expirar — o do truncamento é de **12/08**, ou seja, sai
da janela por volta de **11/09**.

**Eles foram extraídos em 09/09 e estão versionados no repositório:**

- [`apoio/evidencia-preservada.md`](./apoio/evidencia-preservada.md) — a
  leitura pronta dos dois casos, já organizada para virar slide
- [`apoio/traces-preservados/`](./apoio/traces-preservados/) — os JSONs
  completos, como vieram da API
- [`apoio/antes-depois-codigo.md`](./apoio/antes-depois-codigo.md) — o
  código antes e depois das correções

**Você não depende mais do painel do Langfuse para gravar.** Se os traces
sumirem, a aula continua de pé.

E a retenção virou conteúdo: ela é o argumento do vídeo 3.3 sobre dado bruto
ter prazo de validade.


## 🔧 Bloco 0 — preparação do ambiente (~15 min, sem gravar)

**O produto está no estado final**: os PRs #4 e #6 foram mergeados em 09/09,
então ele responde com honestidade ao que não sabe fazer **e** lê nota
fiscal por foto. É esse estado que aparece nos cinco capítulos.

Confirme antes de começar:

```bash
curl.exe -s -o NUL -w "producao: HTTP %{http_code}\n" https://chef.workshopee.com.br
```

```bash
git branch --show-current
```

Esperado: **401** (Basic Auth ativo) e branch **master**. E é só — não há
mais nada para preparar em termos de versão.

**Novidade de estado que melhora a Aula 1:** a faixa "vencendo", que estava
vazia em agosto, agora tem **três itens vencidos de verdade** — espinafre há
9 dias, vagem e couve-flor há 5. O painel deixou de mostrar uma cozinha
idealizada e passou a mostrar uma cozinha real, com comida esquecida na
geladeira. Use isso no 1.2.

**Abas para deixar abertas:**

1. `chef.workshopee.com.br` (autenticado)
2. Langfuse Cloud — `us.cloud.langfuse.com`
3. Telegram Web, no grupo da casa
4. VS Code no repositório, em `master`

> Note que a aba do GitHub com a documentação **não é mais necessária**: sem
> troca de branch, nada some do disco durante a gravação.


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

> ✅ **Formato linear.** Nenhum checkout, nenhum deploy, nenhuma troca de
> branch. O produto está no estado final o tempo todo. As falhas são
> contadas com a **evidência real** extraída do Langfuse, que está em
> [`apoio/evidencia-preservada.md`](./apoio/evidencia-preservada.md), e as
> correções aparecem como antes/depois em
> [`apoio/antes-depois-codigo.md`](./apoio/antes-depois-codigo.md).

**Por que contado em vez de reproduzido:** a falha central deste capítulo é
uma **ausência** — nada acontece, nada aparece, nada é registrado. Ao vivo,
isso é uma tela parada em que o espectador precisa acreditar em você. Em
evidência, ele vê o número batendo no teto e a mensagem de erro nomeando a
chamada órfã. O silêncio não tem imagem; o dado tem.

**Demos ao vivo desta aula (todas seguras, nenhuma exige deploy):**

| Onde | O quê |
|---|---|
| 4.2 | Rodar os evals no terminal |
| 4.3 | Mandar a foto do cupom no Telegram — **e o produto responde** |
| 4.4 | Painel web mostrando o estoque com as 5 porções intactas |

---

## 4.1 — Detectando degradação

**TELA:** slides com a evidência + Langfuse ao vivo.

**FALA (abertura):**

> Nos capítulos anteriores a gente montou o instrumental. Agora vamos usar
> ele em três falhas reais que aconteceram com este produto em produção — e
> que eu não descobri por alerta nenhum. Descobri porque fui olhar.
>
> E eu quero começar pela mais difícil de todas, que é a que **não deixa
> rastro nenhum**.

**FALA (a falha silenciosa):**

> Em agosto eu fiz, como usuário, uma coisa completamente razoável: tirei
> foto de um cupom fiscal e mandei no grupo da minha casa, esperando que o
> bot registrasse as compras.
>
> E não aconteceu nada. Nenhuma resposta, nenhuma reação na mensagem, nenhum
> item novo no estoque.
>
> Aí eu fui investigar com as ferramentas do capítulo anterior. E olha o que
> eu encontrei:

**[slide: a tabela dos quatro lugares]**

> | Onde eu olhei | O que eu encontrei |
> |---|---|
> | Resposta no Telegram | nada |
> | Log da aplicação | **nenhuma linha** |
> | Trace no Langfuse | **nenhum trace** |
> | Banco de dados | nada |
> | `getWebhookInfo` do Telegram | **entrega confirmada**, zero pendentes |
>
> Repara na última linha, porque é ela que torna isso um problema
> interessante em vez de um bug comum. Eu perguntei pro próprio Telegram se
> ele tinha entregado a mensagem. E ele disse que sim: zero updates
> pendentes, nenhum erro de entrega.
>
> Então junta tudo: **o canal confirma a entrega, e o sistema não tem log,
> não tem trace, não tem escrita e não respondeu.**
>
> A pergunta que abre este capítulo é essa: se a mensagem chegou e o sistema
> não registrou absolutamente nada, **onde ela está?**

**FALA (por que esse tipo de falha é o pior):**

> E aqui eu quero que você pare um segundo nessa categoria de falha, porque
> ela é a mais perigosa que existe em produto.
>
> Um erro que grita é fácil: tem stack trace, tem alerta, alguém acorda. Uma
> **ausência** não dispara nada. Não existe monitor que te avise que uma
> coisa que deveria ter acontecido não aconteceu — a menos que você tenha
> pensado nisso antes.
>
> Se eu não tivesse ido procurar, eu nunca saberia. E o usuário — que no
> caso era eu mesmo — só teria concluído que o produto é ruim.

**[Langfuse ao vivo — demo segura]**

> Deixa eu mostrar o painel real. Olha a lista de traces desses dias. Cada
> linha aqui é uma interação que **deixou rastro**. O que a gente está
> procurando não está aqui — e é justamente esse o ponto.

**CORTE:** após "esse é o ponto".

---

## 4.2 — Diagnosticando a causa

**TELA:** slides da evidência + VS Code + terminal (evals ao vivo).

**FALA (diagnóstico por eliminação):**

> Sem evidência, sobra o raciocínio por eliminação.
>
> A mensagem chegou — o Telegram confirmou. Então o servidor recebeu o
> pacote. Se recebeu e não deixou rastro, existe um caminho no código que
> **sai sem logar, sem gravar e sem responder**.
>
> Quantos caminhos assim podem existir? Fui procurar. E era um só.

**[slide: o antes, uma linha só]**

```js
if (!message || !message.text) return; // foto/audio: fora do escopo desta fase
```

> Uma linha. Se a mensagem não tem texto — foto, áudio, documento — a função
> retorna e pronto.
>
> E olha o comentário ao lado: **estava documentado**. Eu sabia. Eu escrevi
> isso conscientemente, achando que era uma limitação aceitável de escopo.
>
> A lição não é "faltou pensar". É outra: **o pecado não é não saber fazer.
> É não dizer que não sabe.** Todo sistema tem limite. O problema é o limite
> que se manifesta como silêncio.

**FALA (o episódio irmão — os 8 microssegundos):**

> E tem um segundo caso, do dia anterior, que completa o quadro. Nesse
> outro, apareceram **dois** erros no log, quase idênticos.

**[slide: as duas linhas de log com os timestamps]**

> Olha a diferença de tempo entre eles: **8 microssegundos**.
>
> Nenhuma chamada de rede acontece em 8 microssegundos. É fisicamente
> impossível. Então a segunda linha não é uma nova tentativa que falhou: é o
> **aviso de erro falhando dentro do tratamento do primeiro erro** — e, ao
> estourar, ele engoliu o erro original.
>
> O tratamento de erro apagou a evidência do erro.
>
> Junta os dois casos e você tem os dois modos de cegueira: num, a
> informação foi **destruída**; no outro, ela **nunca existiu**. E a correção
> dos dois é da mesma família: nenhum caminho pode terminar em silêncio.

**FALA (a terceira falha — o truncamento, com a evidência dura):**

> A terceira é a minha favorita, porque ela tem a cadeia causal inteira
> visível no trace. Deixa eu mostrar.

**[slides da evidência — os quatro elos]**

> **Elo um:** a saída do modelo tem exatamente **1.024 tokens**. Que é
> exatamente o teto configurado. Saída batendo no teto na mosca não é
> coincidência — é a assinatura do truncamento.
>
> **Elo dois:** onde ele cortou. A resposta termina assim: *"Vou registrar o
> uso desses itens agora."* E o bloco seguinte era a chamada da ferramenta
> que registra o uso. O modelo anunciou a ação e foi cortado **no meio de
> executá-la**.
>
> **Elo três:** a chamada de ferramenta ficou órfã — emitida pela metade, sem
> o resultado correspondente.
>
> **Elo quatro:** a requisição seguinte morre. E olha a mensagem literal da
> API:
>
> ```
> 400: tool_use ids were found without tool_result blocks
> immediately after: toolu_01HgWZ8...
> ```
>
> Agora a parte que eu acho mais instrutiva: **isso começou cosmético.** Por
> semanas, o truncamento só cortava uma frase no fim da resposta. Feio, sem
> gravidade.
>
> Aí a minha despensa cresceu. Mais itens, mais tokens de entrada, e o ponto
> do corte se moveu — até cair dentro de uma chamada de ferramenta. Aí virou
> crash.
>
> **Mesmo código. Mesma configuração. Só os dados mudaram de tamanho.** Isso
> é degradação sem ninguém mexer em nada — exatamente o que eu prometi no
> Capítulo 1.

**FALA (evals como instrumento de diagnóstico):**

> E aqui eu quero fechar o ciclo com o Capítulo 2, porque diagnóstico não é
> só ler código. É medir.

**COMANDOS (ao vivo, seguro):**

```bash
node evals/run-evals.js --limit 3
```

> Lembra do critério de integridade de execução? Olha o número: **0,33** nas
> duas operações de geração. Dois de cada três traces estruturalmente
> quebrados.
>
> Esse número muda a natureza do problema. Sem ele, eu tenho "um bug que eu
> vi uma vez". Com ele, eu tenho **prevalência** — e prevalência é o que
> transforma uma anedota em decisão de produto.
>
> O eval não me deu a solução. Ele me deu a dimensão. E é isso que você
> precisa para justificar prioridade numa reunião.

**CORTE:** após "numa reunião".

---

## 4.3 — Corrigindo antes do usuário

**TELA:** slide antes/depois + Telegram ao vivo.

**FALA:**

> Agora a correção. E eu quero que você repare no **tipo** dela, porque é
> mais modesta do que você imagina — e é justamente por isso que ela é boa.
>
> Eu não ensinei o bot a ler foto. Não naquele momento. Eu fiz ele **dizer
> que não sabia**.

**[slide: antes/depois lado a lado]**

> Do lado esquerdo, o antes: uma linha, um return, silêncio.
>
> Do lado direito, o depois: o produto identifica que tipo de coisa chegou,
> **registra isso no log** — então agora existe rastro — e responde:
>
> *"Ainda não sei ler foto de cupom — leitura por imagem é a próxima camada.
> Por enquanto me manda o link do QR code da nota, ou o texto dela."*
>
> A capacidade técnica é **exatamente a mesma** nos dois lados. O produto
> continua sem saber ler a foto. Mas olha o que mudou para quem usa:

**[slide: a tabela de comparação]**

> | | Antes | Depois |
> |---|---|---|
> | O usuário sabe o que houve? | não | sim |
> | Deixa rastro no log? | não | sim |
> | Sabe o que fazer em seguida? | não | sim |
> | É mensurável? | impossível | contável |
>
> **Admitir a limitação já é uma correção.**
>
> E tem um ganho que não é de experiência, é operacional: o que era
> invisível virou **dado**. Antes, eu não tinha como saber quantas pessoas
> tentaram mandar foto. Agora eu tenho — e é assim que eu decido se vale
> construir a leitura de imagem.
>
> A correção honesta não é só mais gentil. Ela é o que gera a informação
> para a decisão seguinte.

**FALA (as outras duas correções do mesmo pacote):**

> Junto com essa, mais duas mudanças, ambas sobre não perder informação.
>
> A primeira: o erro passou a ser desembrulhado. Aquele `fetch failed`
> genérico, que não dizia nada, agora vem com a causa real e o host
> envolvido.
>
> A segunda: **avisar o usuário nunca mais pode derrubar o fluxo.** O envio
> da mensagem de erro ganhou tratamento próprio, isolado. É a correção
> direta dos 8 microssegundos — agora o erro original sobrevive no log em
> vez de ser substituído pelo erro do aviso.

**[DEMO AO VIVO — mandar a foto do cupom no Telegram]**

> E aqui está o produto hoje, com tudo isso já no ar. Vou mandar a mesma
> foto de cupom que em agosto não produzia reação nenhuma.
>
> *(mandar a foto)*
>
> Olha a diferença. Ele responde. Ele diz o que está fazendo. E — porque a
> gente foi além da correção honesta — ele agora **lê o cupom de verdade**,
> que é o assunto do próximo vídeo.

**CORTE:** após a resposta do bot aparecer.

**SE DER ERRADO:** se o Telegram não responder ao vivo, siga com o slide do
antes/depois — a lição está completa nele. Mostre o painel web com o item
tendo entrado no estoque como prova alternativa.

---

## 4.4 — Simulando o ciclo completo

**TELA:** painel web + slides.

**FALA (a capacidade nova):**

> Dizer "não sei" é honesto. Mas em algum momento é melhor saber. E aí veio
> a camada seguinte: ler a nota fiscal a partir da foto.
>
> E aqui tem uma história de produto que eu acho que vale mais do que a
> funcionalidade.

**[slide: o desenho derrubado]**

> O desenho original era óbvio: o modelo de visão olha a foto do cupom e lê
> os quarenta e quatro dígitos da chave da nota. Direto. É o tipo de coisa
> que a gente promete numa reunião sem ter testado.
>
> **Esse desenho foi derrubado por teste.** A SEFAZ exige, junto com a
> chave, um código de segurança que **só existe dentro do QR code** — não
> está impresso em lugar nenhum do papel.
>
> Nenhum modelo de visão do mundo lê o que não está escrito.
>
> A solução real ficou outra: ler o QR code, e usar a visão apenas como
> degrau de recuo quando o QR não for legível. Menos elegante do que a
> promessa, e funciona.
>
> Guarda essa história, porque ela é o padrão mais comum de produto com IA:
> **a demo mental funciona sempre; o teste é que decide.**

**[DEMO AO VIVO — painel web]**

> Olha o painel agora, com os itens que entraram pela foto — com dado
> oficial da SEFAZ, não com o que um modelo achou que estava escrito no
> papel.

**FALA (a consequência — o ciclo se fechando):**

> E agora a parte que fecha o curso.
>
> Com a leitura por foto, a taxa de erro **sobe**. Cupom amassado, foto
> tremida, luz ruim. Antes o produto não errava nisso — porque não fazia.
> Agora ele faz, e às vezes erra.
>
> Toda capacidade nova traz superfície de erro nova. É por isso que a tela
> de revisão, que eu venho adiando desde o começo do projeto, deixou de ser
> luxo e virou necessidade.
>
> Repara no ciclo completo: detectei uma falha, diagnostiquei a causa,
> corrigi com honestidade, entreguei a capacidade — e a capacidade gerou um
> risco novo, que volta pro começo.
>
> **Isso não é o processo dando errado. Isso é o processo.**

**FALA (a confissão — o bug preservado):**

> E eu quero terminar este capítulo com uma confissão, porque seria muito
> fácil editar isso fora e fingir que está tudo resolvido.
>
> Tem uma falha que eu **não** corrigi. E ela é a mais interessante das
> quatro.

**[slide: o episódio C, entrada e saída]**

> Alguém em casa mandou: *"Comemos 3 porções de lasagna, 1 e 1/2 para cada!"*
>
> E o modelo classificou isso **perfeitamente**. Olha a saída: tipo relato
> de refeição, fonte caseira, item "lasagna", quantidade 3. Ele até resolveu
> que "um e meio para cada", com duas pessoas, dá três.
>
> Zero erro do modelo.

**[DEMO AO VIVO — o painel]**

> E agora olha o estoque no painel, hoje, dezoito dias depois: **cinco
> porções de cinco**. Nenhuma foi baixada.
>
> A causa? O prato está gravado como "lasanha", com "nh". O relato veio
> "lasagna", com "gn". A busca não casou. Não é acento, não é maiúscula — é
> grafia mesmo.
>
> E tudo "funcionou": o relato foi gravado, o registro da refeição foi
> gravado, o bot reagiu com joinha na mensagem. Estado errado, zero alarme.
>
> **O modelo acertou e o código errou.** É o caso mais importante do curso,
> porque contraria a intuição de todo mundo: a gente monitora o modelo
> achando que ele é a parte frágil, e o erro veio do código determinístico,
> que é a parte em que a gente confia.
>
> A única forma de detectar isso era **cruzar o trace com o estado
> resultante**. Nenhum log, nenhum alerta, nenhum eval de resposta pegaria.

**FALA (por que não corrigi):**

> E por que eu não corrigi?
>
> Não é preguiça. É que eu ainda não sei qual é a correção certa. Fazer a
> busca mais tolerante resolve esse caso e cria outros — "arroz" casando com
> "arroz doce", por exemplo, e aí o erro fica pior e mais difícil de ver.
>
> A saída provável não é um algoritmo mais esperto. É o sistema
> **perguntar** quando estiver em dúvida — que é o que ele já faz em outra
> parte do produto, quando alguém porciona sem dizer a quantidade.
>
> Operar produto em produção é também isso: distinguir o bug que você
> corrige hoje do bug que você ainda precisa entender. Os dois são decisões
> legítimas. Fingir que o segundo não existe é que não é opção.

**CORTE:** após "não é opção".

---

## 4.5 — O que aprendemos? (texto)

- Detectar é a parte mais difícil: a pior falha não é a que grita, é a que
  não deixa rastro — e nenhum monitor avisa sobre uma ausência.
- Diagnóstico por eliminação funciona quando não há evidência; e às vezes o
  próprio timestamp entrega o mecanismo (8 microssegundos).
- Uma falha pode começar cosmética e virar crash sem ninguém mexer no
  código — basta os dados crescerem.
- Evals dão a **prevalência**, que é o que transforma anedota em decisão.
- Admitir a limitação já é uma correção — e converte o invisível em dado
  mensurável, que alimenta a decisão seguinte.
- O modelo pode acertar e o código errar: monitorar só o modelo não basta.
- Toda capacidade nova traz superfície de erro nova. O ciclo não termina.
- Nem todo bug deve ser corrigido agora — mas todo bug deve ser **decidido**.

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

**TELA:** slide antes/depois (de `apoio/antes-depois-codigo.md`).

**FALA:**

> Transparência em produto com IA não é aviso legal no rodapé. É o produto
> dizer, **no momento certo**, o que ele sabe e o que não sabe fazer.
>
> E o exemplo mais concreto do curso inteiro é o que a gente viveu no
> capítulo passado.

**[slide: o antes e o depois lado a lado]**

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

# Apêndice — depois da gravação

**Não há nada a restaurar.** O formato linear não altera o produto durante a
gravação: nenhum checkout, nenhum deploy, nenhuma troca de branch. O estado
em que você terminar é o mesmo em que começou.

Só confirme, por hábito, que produção continua no ar:

```bash
curl.exe -s -o NUL -w "producao: HTTP %{http_code}
" https://chef.workshopee.com.br
```

## O que ficou preservado de propósito

Duas coisas continuam sem correção, e **as duas são conteúdo**, não dívida
esquecida:

- **O match de nome** (`lasanha` × `lasagna`) — as 5 porções seguem
  intactas no estoque. É o caso do modelo acertando e o código errando, que
  fecha a Aula 4.
- **O truncamento por `max_tokens`** — a evidência está em
  `apoio/evidencia-preservada.md`. Corrigir agora tiraria da Aula 3 o
  exemplo mais limpo de degradação sem mudança de código.

Se em algum momento você decidir corrigir qualquer um dos dois, avise antes:
o truncamento aparece em três vídeos (3.4, 4.2 e o fechamento do 4.4) e o
match de nome em dois (3.4 e 4.4).

## Histórico das versões do produto

Os PRs mergeados em 09/09 continuam sendo o registro do antes:

- [PR #4](https://github.com/Djegao/alura-produto-ficticio/pull/4) — a
  resposta honesta ao que não sabe fazer
- [PR #6](https://github.com/Djegao/alura-produto-ficticio/pull/6) — a
  leitura de nota fiscal por foto