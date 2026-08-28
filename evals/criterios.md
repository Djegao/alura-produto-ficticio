# Critérios de qualidade — Chef Caseiro

> Material didático do **vídeo 2.2 (Critérios de qualidade)** do curso
> "Evals, observabilidade e conformidade". Este arquivo é escrito em
> linguagem de **produto**, não de código: qualquer pessoa do time deveria
> conseguir pegar uma resposta do Chef Caseiro e julgar cada critério abaixo
> sem abrir o repositório.
>
> Quem executa esses critérios é `evals/run-evals.js` (Claude-as-judge, com
> `tool_choice` forçado — ver §11.3 do `SDD.md`). Os nomes entre `crases`
> são exatamente os nomes dos Scores gravados no Langfuse.

---

## Como ler um critério

Todo critério aqui tem quatro partes, e as quatro são obrigatórias:

| Parte | Por que existe |
|---|---|
| **Nome** | é o nome do Score no Langfuse — sem nome estável não dá pra ver qualidade ao longo do tempo (Aula 3) |
| **Pergunta** | tem que ser respondível por uma pessoa olhando a interação, sem saber programar |
| **Escala** | binário (0 ou 1) quando a falha é categórica; 0–1 contínuo quando existe "meio certo" |
| **Por que erra caro** | um critério que não custa nada quando falha não merece ser um eval |

**Critério ruim:** "a resposta é boa."
**Critério bom:** "a sugestão cita apenas itens que apareceram no resultado
de `consultar_estoque` daquela mesma interação."

A diferença não é rigor de linguagem — é que o segundo tem uma evidência
concreta pra apontar quando falha.

---

## Critério transversal (vale para as três operações)

### `execucao_integra` — binário

**Pergunta:** a operação chegou ao fim inteira, sem erro estrutural e sem
resposta cortada no meio?

**Como julgar:** olhe se o trace terminou em erro, se a saída final está
vazia, e se alguma chamada ao modelo gastou **exatamente** o teto de tokens
configurado (1024, 2048 ou 512, conforme o ponto do código). Tokens de saída
iguais ao teto é a assinatura clássica de truncamento — não é coincidência.

**Por que erra caro:** este é o critério que vem **antes** de todos os
outros. Não adianta perguntar se a receita respeitou as restrições da casa
se a resposta parou no meio da palavra. E desde 2026-08-12 isso deixou de
ser cosmético no Chef Caseiro: o corte pode acontecer no meio de uma chamada
de ferramenta, deixando um `tool_use` órfão que derruba a requisição
seguinte com `400` da Anthropic (SDD §11.4, trace
`57debf7a71533fdc6a9e7a982595ba7c`). Uma falha estrutural que passa
despercebida vira "o produto está lento hoje" no suporte, não "o produto
está quebrado".

**Nota didática:** o sinal de truncamento é calculado **em código** antes de
o juiz ver o material — comparar tokens com o teto é aritmética, e a regra
de ouro do projeto é que a LLM não faz aritmética. O juiz recebe o sinal
pronto e julga o que fazer com ele.

---

## Operação: `sugerir-receita`

O agente original do Chef Ops (prompts v1 e v2). Recebe um pedido em texto
livre ("o que faço pro jantar hoje?") e responde com uma sugestão, podendo
consultar estoque e preferências e registrar o consumo.

### `fidelidade_ao_estoque` — 0 a 1

**Pergunta:** a sugestão usa apenas itens que realmente existem no estoque
consultado naquela interação, nas quantidades que existem?

**Escala:** 1.0 = todos os ingredientes principais vieram do estoque real;
0.5 = a maioria veio, mas há um ou dois itens assumidos como "todo mundo tem
em casa" (sal, azeite) sem estarem lá; 0.0 = a receita foi escrita de cabeça
e o estoque foi decorativo.

**Por que erra caro:** é a promessa central do produto. Um assistente que
sugere o que cozinhar com o que você tem em casa, e que sugere algo que você
não tem, é pior que nenhum assistente — a pessoa vai até a cozinha, descobre
que falta, e não confia mais na próxima sugestão. É também o critério que
distingue "consultou a ferramenta" de "usou o resultado da ferramenta": o
trace pode mostrar a chamada e a resposta ignorar o retorno.

### `respeito_as_restricoes` — binário

**Pergunta:** a sugestão respeita todas as restrições e preferências
alimentares da casa retornadas por `consultar_preferencias`?

**Por que erra caro:** restrição alimentar não é preferência estética — pode
ser alergia. É o único critério desta lista onde uma falha isolada pode
causar dano físico, e por isso é binário: não existe "respeitou 70% da
restrição". É também o critério que a Aula 5 (conformidade) reaproveita: um
produto que sugere amendoim para quem declarou alergia é um problema de
conformidade, não de qualidade.

### `consumo_registrado` — binário

**Pergunta:** se a interação consultou o estoque e propôs uma receita que o
consome, o agente registrou esse consumo (`registrar_itens_usados`)?

**Por que erra caro:** este é o achado §11.3 do SDD virado eval. O prompt v2
*pede em linguagem natural* para o agente registrar o consumo — e o Claude
regularmente escrevia a receita com quantidades específicas e simplesmente
não chamava a ferramenta. O custo é silencioso e cumulativo: **o estado do
estoque depende desse registro**. Cada consumo não registrado deixa o
inventário mais otimista que a realidade, e todas as sugestões seguintes
herdam esse erro. Ninguém vê nada quebrar; a despensa só vai ficando errada.

A correção real não foi melhorar o prompt, foi forçar a chamada via
`tool_choice`. O eval continua existindo para provar que a garantia
estrutural está de pé — e para pegar o dia em que alguém a remover.

---

## Operação: `mediar-cardapio`

O Agente Mediador da v3 "Musa Balance". Não sugere: **medeia** entre dois
atores da casa com objetivos parcialmente conflitantes (Diego, que cuida de
orçamento/saúde/desperdício; a Musa, que traz o desejo gastronômico).

### `trade_off_com_numeros` — 0 a 1

**Pergunta:** a mediação expõe o custo real de cada opção com números
concretos (reais, dias de validade, porções), em vez de conselho genérico?

**Escala:** 1.0 = cada opção proposta vem com o peso dela quantificado
("+R$45 no orçamento da semana, e as 3 porções de lasanha vencem em 2
dias"); 0.5 = há números, mas soltos, sem ligar à escolha; 0.0 = só
recomendação vaga ("seria melhor economizar essa semana").

**Por que erra caro:** um mediador sem números não medeia, opina — e opinião
não resolve conflito entre duas pessoas que já sabem o que querem. Se o
produto não coloca o preço da escolha na mesa, o casal decide exatamente
como decidiria sem ele, e o produto não fez nada.

### `numeros_de_tool` — binário

**Pergunta:** todos os números citados (saldo do orçamento, dias até vencer,
porções restantes) vieram do retorno de uma ferramenta, ou algum foi
calculado/estimado pelo próprio modelo?

**Por que erra caro:** é a regra de ouro do projeto — **a LLM nunca calcula
prazo, decaimento ou matemática financeira**. Um número inventado que
*parece* certo é a pior classe de erro possível aqui, porque é
indistinguível de um número certo até alguém conferir o extrato. E como o
Mediador fala com autoridade ("você tem R$120 de saldo"), o casal vai agir
em cima do número errado. É binário de propósito: um número inventado já
contamina a mediação inteira.

### `mediou_sem_decidir` — binário

**Pergunta:** o agente apresentou o conflito e deixou a escolha explícita
para o casal, sem proibir, julgar ou decidir sozinho?

**Por que erra caro:** este critério é sobre o produto continuar sendo o
produto. No momento em que o Mediador diz "não faça o hambúrguer", ele deixa
de ser um mediador e vira mais um app de dieta que a pessoa desinstala. É um
requisito de posicionamento tão duro quanto qualquer requisito técnico — e é
o tipo de coisa que degrada em silêncio quando alguém troca o modelo ou
"melhora" o prompt.

### `falta_virou_trade_off` — binário

**Pergunta:** quando faltou um ingrediente, o agente ofereceu substituição
com o que existe no estoque e/ou mandou o item pra lista de compras — em vez
de simplesmente cancelar a proposta?

**Por que erra caro:** falta de item é o caso mais comum da vida real, e um
mediador que responde "não dá" a cada falta é inútil na semana em que a
pessoa mais precisa dele. A regra do produto é explícita: **a falta nunca
cancela a proposta, vira trade-off** (substituição → lista de compras). Este
critério existe porque essa regra mora no prompt, e prompt não é garantia
estrutural.

---

## Operação: `ingerir-relato`

O agente de ingestão. Recebe texto livre de qualquer canal (web ou Telegram)
e classifica em uma das seis intenções (`relato_refeicao`, `desejo`,
`aquisicao`, `desperdicio`, `branqueamento`, `porcionamento`), extraindo os
campos estruturados que alimentam o feed e o estoque.

### `tipo_correto` — binário

**Pergunta:** o tipo escolhido é o que a mensagem realmente quer dizer?

**Por que erra caro:** **classificação errada corrompe o feed e o estoque de
uma vez só**. Cada tipo dispara um efeito diferente em `intencao-efeitos.js`:
`aquisicao` cria item no estoque, `desperdicio` e `relato_refeicao` baixam
porções, `porcionamento` cria um item preparado com N porções. Um "comprei
2kg de arroz" classificado como `desejo` não vira estoque nenhum — e ninguém
recebe erro, o texto só aparece no feed como um desejo esquisito. É o tipo
de falha que só é descoberta semanas depois, quando o inventário não bate
com a geladeira.

### `sem_invencao_numerica` — binário

**Pergunta:** os campos numéricos (`calorias`, `custo`, `item_quantidade`)
foram preenchidos **apenas** quando a pessoa disse o número explicitamente?

**Por que erra caro:** mesma regra de ouro do Mediador, aplicada na entrada
em vez da saída. Se a pessoa disse "comi um prato de lasanha" e o modelo
estima 650 kcal, o orçamento calórico da semana passa a ser ficção — e
ficção que ninguém sabe que é ficção, porque o número está gravado no banco
igualzinho a um número real. A regra do produto é que campo não dito fica
**vazio**, e o sistema **pergunta**. Vale reparar num caso de fronteira já
observado em produção: "4 porções + 1 extra" virou `5` — soma de números
ditos, mas ainda assim aritmética feita pela LLM.

### `ancoragem_no_texto` — 0 a 1

**Pergunta:** os campos extraídos (principalmente `item_nome`) são fiéis ao
que a mensagem realmente diz, sem invenção e sem "correção" criativa?

**Escala:** 1.0 = tudo ancorado literalmente no texto; 0.5 = descrição
levemente enfeitada ou nome normalizado além do necessário; 0.0 = campo
inventado que não tem origem na mensagem.

**Por que erra caro:** este critério nasceu do achado de 22/08, gravado ao
vivo na aula. O relato "comemos 3 porções de **lasagna**" foi classificado
**perfeitamente** — `fonte_refeicao: caseira`, `item_nome: lasagna`,
`item_quantidade: 3` — mas o prato estava gravado no estoque como
**lasanha**, e o casamento de nome feito em código (`ilike`/`nomesCasam`)
não bateu: `gn` × `nh` não é diferença de acento. As porções não foram
baixadas, e **nada falhou visivelmente**: o relato foi gravado, o
`meal_report` foi gravado, o bot mandou 👍, e o estado ficou errado.

É por isso que este critério é 0–1 e não binário, e é por isso que ele é o
critério mais didático da lista: **o modelo acertou e o código
determinístico errou**. Um eval que só olha a saída da LLM daria 1.0 aqui —
com razão. A lição é que eval de qualidade de resposta não substitui
observabilidade do que acontece depois da resposta (Aula 3).

---

## O que deliberadamente **não** virou critério

- **"A receita é gostosa"** — não é julgável de forma repetível, e o produto
  não promete isso.
- **Tom / simpatia da resposta** — barato quando erra; não entra na primeira
  rodada.
- **Latência e custo** — são métricas, não critérios de qualidade. O
  Langfuse já as coleta sozinho; medir de novo aqui só polui o Score.
- **Casamento de nome no estoque** — é lógica determinística em código,
  então o lugar certo de testá-la é um teste, não um eval. O eval só
  registra que a saída da LLM estava correta (ver `ancoragem_no_texto`).

Priorizar é parte do trabalho: **um eval que cobre tudo não é rodado por
ninguém.**
