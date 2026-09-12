# Ensaio — 2.4 Primeiro conjunto de evals

Slides 31 a 42. Duração alvo: **12 a 15 min**.
Demo no slide 38, `--dry-run`, terminal. Sem Langfuse na tela.

---

## ⚠ ANTES DE GRAVAR — um resolvido, um em aberto

### 1. O trace do vinho — RESOLVIDO em 12/09

Ele falhava em cerca de metade das execuções: o juiz chamava a ferramenta e
devolvia a avaliação **sem um dos critérios**, e o pipeline abortava aquele
trace em vez de inventar nota.

**Foi adicionado retry** no `run-evals.js`: se faltar critério, ele pede de
novo, até três vezes. Nenhuma nota muda — ou a avaliação vem completa, ou
repete. Validado com três rodadas seguidas, todas com sucesso (uma precisou de
três tentativas, outra de duas, outra acertou de primeira).

**Pode aparecer em quadro** uma linha cinza assim:

```
(juiz nao devolveu "execucao_integra" — tentando de novo: 2/3)
```

Não é problema, é o slide 28 se provando ao vivo. Se aparecer, comente em uma
frase e siga:

> "Olha ali — o juiz chamou a ferramenta mas esqueceu um campo, e o pipeline
> pediu de novo. Forçar a chamada garante que ele responda estruturado; não
> garante que ele preencha tudo."

### 2. EM ABERTO — o slide 40 cita "zero vírgula quatro" e o valor varia

`ancoragem_no_texto` deu **0,30** hoje. É critério de escala contínua, varia na
casa decimal. **Não diga o número antes de ver.** Fale o que é estável:
*"três itens comprados, um só foi registrado"*.

---

## Números congelados — rodada de 12/09

**Mediações (as duas do slide 39):**

- `652b3803`, 16:01 — integridade 1 · trade-off **0,70** · números 1 · mediou 1 · falta 1
- `d807057b`, 11:16 — **zero nos cinco**

A tabela do slide 39 confere inteira. Pode apontar com segurança.

**Ingestão:**

- `724d2cf3` (lasanha) — **1,00 nos quatro critérios**
- `fc52a27f` (vinho) — ancoragem 0,30 · sem invenção numérica 0 · tipo 1 · integridade 1

Média geral fica em torno de **0,6**. Leva ~60 s com os quatro traces.

---

## Slide 31 — divisor

Só anuncia.

---

## Slide 32 — Conjunto é escolha, não lista

**FALA**

Agora a gente monta o conjunto. E "conjunto" é a palavra certa, não "lista".

Lista é tudo que dá pra medir. Conjunto é o que você escolheu medir, sabendo o
que ficou de fora.

Se você sair daqui com trinta critérios, você não vai rodar nenhum.

---

## Slide 33 — Antes de tudo

**FALA**

Antes dos critérios de qualidade, tem um que vem antes de todos: a execução
chegou ao fim inteira?

Sem erro, sem saída vazia, sem corte.

E a razão é boba de tão simples: não adianta perguntar se a receita respeitou a
restrição da casa se a resposta parou no meio da palavra.

Saída no teto de tokens é corte. Não é coincidência — é assinatura.

Esse critério você vai ver reprovar daqui a pouco, ao vivo.

---

## Slide 34 — Três perguntas pro seu conjunto

> **Slide reescrito em 12/09** para ser agnóstico. Saiu "O conjunto do
> Mediador" com os nomes dos meus critérios; entraram as três perguntas que
> geram critério em qualquer produto. Texto novo em
> `docs/apoio/slide34-novo.txt`.

**FALA**

Esse slide não é sobre o meu produto. É a parte que você leva pro seu.

Quando eu fui montar o conjunto, eu não comecei escrevendo critério. Eu comecei
fazendo três perguntas sobre a operação. E elas funcionam pra qualquer coisa
que você esteja construindo.

**[aponta: A promessa]**

Primeira: o que essa operação existe pra fazer? Qual é a promessa dela pro
usuário?

Porque o primeiro critério é sempre esse — ela cumpriu a promessa, ou entregou
outra coisa?

E olha o teste: se você não consegue dizer a promessa em uma frase, você ainda
não tem critério. Você tem funcionalidade.

**[aponta: A verossimilhança]**

Segunda: a verossimilhança. E olha, é uma palavra grande pra uma ideia bem
simples: onde é que esse produto pode chutar de um jeito que *parece* certo?

Todo produto com IA tem esse lugar. Número, prazo, valor, nome de pessoa.

E essa é a pior classe de erro que existe, porque ninguém desconfia. Um número
inventado é indistinguível de um número certo até alguém ir conferir.

**[aponta: O papel]**

Terceira: qual é o papel que essa operação não pode abandonar?

Todo produto tem um limite que, se ele cruzar, deixa de ser aquele produto. Um
assistente que decide sozinho virou outra coisa. Um resumidor que começa a
opinar virou outra coisa.

Isso é requisito de posicionamento. E é o tipo de coisa que degrada em silêncio
quando alguém troca o modelo ou melhora o prompt.

**[aterrissa rápido, sem ler nome por nome]**

No meu caso essas três viraram: expôs o custo com número, todo número veio de
ferramenta, e deixou a escolha com o casal.

Mas repara: os nomes são meus. As três perguntas são suas.

**[convite]**

Pausa o vídeo aqui, se quiser. Pega a operação principal do seu produto e
responde as três. Você sai daqui com três critérios escritos.

---

## Slide 35 — A falta nunca cancela a proposta

**FALA**

E tem um quarto, que é uma regra de produto virada critério.

Faltou ingrediente. O agente ofereceu substituição com o que existe, ou mandou
pra lista de compras? Ou simplesmente disse "não dá"?

A regra aqui é explícita: a falta nunca cancela a proposta. Vira trade-off.

Um mediador que responde "não dá" na semana em que a pessoa mais precisa dele é
inútil.

---

## Slide 36 — O Mediador não está sozinho

**FALA**

O Mediador não é a única coisa que este produto faz. A casa fala com ele o dia
inteiro, pelo chat.

E cada operação promete uma coisa diferente, então cada uma tem critério
próprio.

A ingestão entendeu o tipo certo? Preencheu número que ninguém disse?

Repara no padrão: o critério nasce da promessa da operação. Não existe conjunto
genérico que sirva pra tudo.

---

## Slide 37 — O que eu decidi não medir

**FALA**

E agora a parte que eu acho que mais ensina: o que eu decidi não medir.

"Foi agradável" — não é julgável de forma repetível, e o produto não promete
isso.

Tom e simpatia — é barato quando erra. Pode entrar na terceira rodada, não na
primeira.

Latência e custo — são métricas, não critérios de qualidade. A ferramenta já
coleta sozinha. Medir de novo aqui só polui.

Priorizar é parte do trabalho. Um eval que cobre tudo não é rodado por ninguém.

---

## Slide 38 — 2.4.1 O conjunto inteiro

**TELA:** terminal já na pasta do projeto, fonte grande.

```
node evals/run-evals.js --dry-run --trace d807057bd0808ca94dc63c8a0970f328,652b38032d3ce3953b4758e607c40223,fc52a27f08c7cd11be8e0894d1e34ccf,724d2cf3a53efbfa29ad53fde19a3cda
```

**FALA (antes de rodar)**

Agora o conjunto inteiro. Quatro interações reais: duas mediações e dois relatos
que a casa mandou pelo chat.

**[enquanto roda, ~60 s]**

Cada bloco é uma interação. Cada linha, um critério, com a nota, a barra e a
justificativa do lado.

Repara que ele agrupa por operação. As mediações são julgadas com os critérios
do Mediador, os relatos com os da ingestão. Conjunto não é uma régua só.

**[quando terminar, role de volta até as duas mediações]**

> **Ordem conferida:** os ids no comando estão na ordem **manhã → tarde**, a
> mesma da tabela do slide 39. O terminal imprime `[1/2]` = 11:16 e `[2/2]` =
> 16:01. Aponte na tela da esquerda pra direita que bate com o slide.

Antes de olhar o resumo, eu quero que você olhe as duas primeiras. Porque elas
contam a história sozinhas.

---

## Slide 39 — Mesmo pedido. Mesmo dia.

**FALA**

Mesmo pedido, palavra por palavra. Mesmo produto. Mesmo dia. Cinco horas de
diferença.

**[aponta a coluna da manhã]** De manhã ele não entregou nada. Bateu no teto de
tokens, a saída veio vazia. Zero em tudo.

**[aponta a coluna da tarde]** À tarde ele mediou. Quatrocentos gramas de
macarrão dos dois quilos e meio. Quatro ovos dos trinta. Tudo conferido contra a
ferramenta. O bacon que faltava virou lista de compras com substituto sem porco.
E terminou perguntando: confirmam a substituição, ou preferem a versão
vegetariana?

**[pausa]**

Lembra do que eu falei no primeiro vídeo? Testar uma vez responde sobre aquele
momento.

Se eu tivesse testado de manhã, eu diria que o produto está quebrado. Se tivesse
testado à tarde, diria que está pronto.

Os dois estariam errados.

Isso não é um slide meu tentando te convencer. É o meu produto, no dia vinte e
dois de agosto, provando sozinho.

---

## Slide 40 — Nota baixa é o conjunto funcionando

**FALA**

Agora o resumo. E a primeira coisa sobre nota baixa: isso não é o conjunto
falhando. É o conjunto funcionando.

Lembra do primeiro vídeo: se cem por cento passasse, eu ia desconfiar do
critério. Ele existe pra reprovar.

Segunda coisa: leia sempre a justificativa junto da nota.

**[aponta o relato do vinho]** Olha esse aqui. "Comprei um vinho, um chocolate e
dois pães." A ancoragem no texto caiu. Por quê?

**[lê a justificativa da tela]** Três itens comprados, um registrado. O chocolate
e os pães sumiram dos campos estruturados.

E ninguém recebeu erro. A nota me diz que tem problema. A justificativa me diz o
que fazer.

**[SE o relato do vinho falhar, use isto]** Olha o que aconteceu: esse aqui
falhou. O juiz chamou a ferramenta mas deixou um critério de fora, e o pipeline
preferiu abortar a inventar uma nota. Isso é o comportamento certo — um eval que
engole falha em silêncio é pior que nenhum eval. E vale o contraste com o vídeo
anterior: forçar a chamada garante que ele responda estruturado, não garante que
ele preencha tudo.

**[aponta o relato da lasanha]** E esse aqui é o oposto: nota cheia nos quatro
critérios. O modelo acertou tudo. Guarda esse caso, porque ele volta na próxima
aula — e a história dele não termina bem.

E a terceira, onde mora o valor de verdade: repara em quais critérios reprovaram
juntos. Não é uma lista de problemas independentes. Dois ou três padrões
respondem pela maioria. É neles que vale trabalhar primeiro.

---

## Slide 41 — O que ainda falta

**FALA**

Pra fechar, eu quero ser honesto sobre o tamanho do que a gente construiu.
Porque é bastante. E é menos do que parece.

Este conjunto julga as execuções que eu escolhi, quando eu mando rodar.

Ninguém está sendo avisado de nada. Não tem alarme. Não tem vigilância.

Se a qualidade cair numa terça-feira de madrugada, eu descubro quando lembrar de
rodar de novo. Se eu esquecer duas semanas, são duas semanas de produto ruim que
ninguém viu.

Então o primeiro pilar está de pé. Eu consigo responder se a IA está fazendo o
que deveria.

Mas eram três perguntas. E a segunda é outra: o que está acontecendo com o meu
produto?

É esse buraco que a próxima aula preenche.

---

## Slide 42 — Eu sei o que procurar

**FALA**

Eu sei o que procurar. Agora falta enxergar.

Até lá.

**CORTE.**

---

## Se travar

Frase âncora: **"Conjunto é o que você escolheu medir, sabendo o que ficou de
fora."**

Números que variam (não prometa antes de ver): `trade_off_com_numeros` e
`ancoragem_no_texto`. Os binários são estáveis.
