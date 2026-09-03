# Aula 1 — script de ensaio: o que fazer e o que dizer, slide a slide

Documento de ensaio casado com [`slides/aula1-alura.pptx`](../slides/aula1-alura.pptx)
(20 slides). Mesma estrutura das aulas anteriores: **Tela** (o que está à
vista), **Fazer** (ação concreta) e **Dizer** (fala sugerida).

**Voz desta aula**: você é product builder, não engenheiro. Você observa,
junta evidência e pergunta. Nenhum slide fala em arquivo, linha, `agent.js`
ou nome de tabela — e a fala também não deve.

**Regra operacional desta gravação**: só existem **três chamadas reais** ao
produto nas Aulas 1 e 2, todas pré-combinadas — nada de improviso ao vivo com
a IA. **As três já foram testadas em 03/09** contra o Supabase novo
(`kujsmqihnvwbfzdbdhmt`), com o estoque e a preferência exatos descritos
abaixo. As respostas reais estão citadas nas falas dos slides 16 (Aula 1) e
10/13 (Aula 2) — **não são exemplos hipotéticos**. Se você regravar o teste
antes de gravar o vídeo e a resposta vier diferente, ajuste a fala — não
mantenha uma citação que não bate com o que o modelo respondeu de verdade.

---

## Antes do REC

### Estado necessário

| Item | Como deixar |
|---|---|
| Branch | **`aula1-2/produto-virgem`**, neste checkout (`aula1-virgem/`) |
| Produto | ✅ testado em 03/09 e **já zerado de volta** (`GET /api/estoque` confirmado `[]`) — pronto pra gravar |
| `.env` | ✅ já existe — Supabase próprio (`kujsmqihnvwbfzdbdhmt`), `ANTHROPIC_API_KEY`/`WORKSPACE_ID` reaproveitados do produto antigo |
| Prompt ativo | volta pra **v1** sozinho — é `currentConfig` em memória em `server.js`, e o servidor do teste já foi encerrado. Ao rodar `npm start` de novo, começa em v1. |

### As três chamadas — texto exato

Cadastre isto **antes de gravar o vídeo 1.4** (não ao vivo, para não gastar
tempo de tela com formulário):

**Estoque:**
| Item | Quantidade | Unidade | Estado | Guarda |
|---|---|---|---|---|
| Arroz | 1 | kg | base | seco |
| Feijão | 500 | g | base | seco |
| Frango | 600 | g | ingrediente | perecível |
| Alface | 1 | unidade | ingrediente | perecível |
| Leite | 1 | L | ingrediente | perecível |

**Preferência:** `sem lactose`

**Chamada 1** (vídeo 1.4, prompt v1 — configuração padrão, não precisa trocar nada):
> "O que eu faço pro jantar hoje?"

**Chamada 2** (vídeo 1.5, troque para prompt v2 na configuração, mesmo texto):
> "O que eu faço pro jantar hoje?"

**Chamada 3** (Aula 2, vídeo 2.3 — prompt v2, pedido novo, feito pra tensionar a restrição):
> "Quero fazer algo com o leite que tenho."

Guarde as três respostas (print ou copiar o texto) — você vai reler a
Chamada 3 na Aula 2 pra julgar contra os critérios que a própria Aula 2
ensina a escrever.

### Janelas para alt+tab

1. Cliente de API (Postman, apontando pra `localhost:3300`) · 2. `aula1-alura.pptx` · 3. Este ensaio

---

## Vídeo 1.1 — A cena que se repete

### Slide 1 — Capa

**Dizer**:
> "Esse é o primeiro produto agêntico que a gente constrói juntos neste
> curso. Ele está completamente zerado — nenhuma sugestão, nenhum dado.
> Antes de mexer em qualquer coisa, eu quero te mostrar uma cena que se
> repete com quase todo mundo que constrói produto com IA."

### Slide 2 — Divisor 1.1

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

### Slide 3 — Funcionou lindo na demo. E depois?

**Dizer**:
> "Você monta uma funcionalidade com IA. Testa três vezes na sua frente, as
> três funcionam bonito. Você entrega, todo mundo comemora. Uma semana
> depois, alguém pergunta: 'aquela mudança que você fez, ajudou ou
> atrapalhou?' E você trava. Não porque você não trabalhou — porque não
> tinha como medir."

### Slide 4 — O que separa quem evolui rápido

**Dizer**:
> "A tentação, nessa hora, é focar no que dá pra controlar: qual modelo
> usar, qual ferramenta adotar. Só que quem realmente evolui rápido nesse
> tipo de produto quase não fala de ferramenta. Fala de medição. Eles sabem,
> a cada mudança, se o produto ficou melhor ou pior — e isso é o que faz o
> resto do trabalho ficar mais fácil."

---

## Vídeo 1.2 — Os três pilares desta jornada

### Slide 5 — Divisor 1.2

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 6 — Três perguntas que sustentam um produto de IA

**Dizer**:
> "Esse curso inteiro gira em torno de três perguntas. A primeira: como eu
> sei que a resposta é boa, sem reler cada uma à mão? A segunda: como eu
> enxergo o que está acontecendo, sem estar olhando o tempo todo? E a
> terceira: como eu garanto que o produto não passa de limites que protegem
> quem usa? Evals, observabilidade, conformidade."

### Slide 7 — Os três se alimentam um do outro

**Dizer**:
> "Eles não são etapas separadas que você faz uma vez e esquece. Um eval mal
> feito deixa passar uma falha que só a observabilidade vai encontrar
> depois. E uma falha sem proteção vira o tipo de incidente que a
> conformidade deveria ter barrado antes. Esta aula começa pela primeira
> pergunta — evals — porque é onde tudo o mais se apoia."

---

## Vídeo 1.3 — Conhecendo o Chef Caseiro

### Slide 8 — Divisor 1.3

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 9 — O produto que vamos construir junto

**Tela**: cliente de API (Postman ou similar), apontando pra
`localhost:3300` — sem nenhuma chamada salva ainda.

**Nota de produto**: o Chef Caseiro, neste ponto do curso, não tem tela
própria. Ele é conversado por chamada direta — é assim que o v1/v2 sempre
funcionou neste projeto. Uma interface visual é trabalho futuro, fora do
escopo destas duas aulas.

**Dizer**:
> "Esse é o Chef Caseiro. Ele sugere o que cozinhar com o que a casa já tem
> — sem inventar ingrediente, sem ignorar restrição. Por trás da sugestão
> tem uma inteligência que decide sozinha se precisa checar o estoque antes
> de responder. Hoje ele está zerado assim de propósito — nenhuma sugestão
> ainda — pra eu te mostrar cada passo, ao vivo, desde o início."

### Slide 10 — O que essa inteligência pode fazer

**Dizer**:
> "Ela pode consultar o que está no estoque antes de sugerir qualquer prato.
> Pode consultar as restrições da casa — alergia, dieta, o que a família não
> come. E ela decide sozinha quando usar cada uma dessas capacidades.
> Ninguém escreveu um roteiro fixo pra ela seguir passo a passo."

---

## Vídeo 1.4 — O primeiro pedido, ao vivo

### Slide 11 — Divisor 1.4

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 12 — Vamos fazer o primeiro pedido juntos

**Tela**: cliente de API, mostrando `GET /api/estoque` e
`GET /api/preferencias` já retornando o que foi cadastrado fora de câmera
(ver "Antes do REC").

**Fazer**: mostre rapidamente a resposta dessas duas chamadas (arroz,
feijão, frango, alface, leite; e a preferência "sem lactose"). Depois, faça
a **Chamada 1** pré-combinada.

**Dizer**:
> "Eu já deixei preparado o que essa casa tem: arroz, feijão, frango,
> alface, leite — e uma restrição, sem lactose. Agora eu vou pedir uma
> sugestão, do jeito que eu pediria pra uma pessoa."

*(mande "O que eu faço pro jantar hoje?" e leia a resposta)*

> "Presta atenção no que ela fez antes de responder — ela parou pra
> consultar alguma coisa, ou já saiu sugerindo direto?"

### Slide 13 — A pergunta que fica no ar

**Dizer**:
> "A sugestão parece boa. Mas 'parece boa' é só a minha opinião, lendo uma
> vez, agora. Ela respeitou mesmo a restrição do leite? Usou só o que eu
> realmente tenho? Eu não sei dizer com certeza — só senti que sim. E essa é
> exatamente a cena do começo desta aula, acontecendo com o meu próprio
> produto."

---

## Vídeo 1.5 — Duas formas de pedir a mesma coisa

### Slide 14 — Divisor 1.5

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 15 — O mesmo produto, dois jeitos de instruir

**Tela**: cliente de API, chamando `POST /api/config`.

**Fazer**: troque a configuração para o prompt **v2** (`POST /api/config`
com `{"promptVersion":"v2"}`) e faça a **Chamada 2** pré-combinada — o
mesmo texto da Chamada 1.

**Dizer**:
> "Existem duas formas de orientar essa inteligência. A que eu usei agora há
> pouco é mais solta: pede pra ajudar, sem exigir nada específico antes. Vou
> trocar pra uma configuração mais rígida — que exige que ela confira o
> estoque e as restrições antes de sugerir qualquer coisa — e fazer
> exatamente o mesmo pedido."

*(mande "O que eu faço pro jantar hoje?" de novo e leia a resposta)*

### Slide 16 — O que eu observei na comparação

**Dizer**:
> "Compara as duas. A primeira, em v1, veio completa: ela me contou a
> receita inteira — frango grelhado com arroz, feijão e salada de alface —
> com modo de preparo passo a passo, e até me explicou por que deixou o
> leite de fora: por causa da restrição. A segunda, em v2, foi seca: só
> disse 'pronto, registrei o uso dos itens', sem me contar qual receita era.
> As duas respeitaram a restrição — mas só uma delas me disse o que eu ia
> comer.
>
> Nenhuma das duas é 'a errada' — são dois comportamentos possíveis do mesmo
> produto. E repara: eu só consegui notar essa diferença porque comparei
> lado a lado. Se eu tivesse visto só uma das duas, teria achado normal."

**Nota**: essa é a resposta real, testada em 03/09. v1 respondeu com receita
completa e explicação; v2 respondeu apenas "Pronto! Registrei o uso dos
itens no estoque. Esse jantar aproveita bem o que você já tem em casa, é
nutritivo e não usa nenhum ingrediente com lactose." — mesmo tendo
consultado estoque e preferências e usado exatamente os mesmos itens. Se
você regravar o teste e a diferença vier outra, ajuste a fala pra descrever
o que realmente aconteceu.

---

## Vídeo 1.6 — O ciclo que faz a diferença

### Slide 17 — Divisor 1.6

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 18 — Avaliar, entender, mudar — e de novo

**Dizer**:
> "Todo produto de IA que evolui rápido gira o mesmo ciclo: avaliar a
> qualidade, entender o que saiu errado, mudar o comportamento — e girar de
> novo. Quanto mais rápido e barato for avaliar, mais vezes esse ciclo gira,
> e mais rápido o produto melhora. Hoje eu só fiz a primeira volta pela
> metade: eu senti que as respostas foram boas, mas não tenho como provar."

### Slide 19 — O que aprendemos

**Dizer**:
> "O problema não é ter dúvida se uma mudança ajudou — é não ter como
> responder essa dúvida. Eu conheci o Chef Caseiro zerado e vi as duas
> formas de instruir a mesma inteligência. Na próxima aula, eu paro de
> sentir se a sugestão foi boa e começo a construir uma forma de saber."

### Slide 20 — Fechamento

**Dizer**:
> "Eu senti que foi bom. Na próxima aula, eu vou saber. Até lá."

---

## Depois de gravar

Guarde as respostas das **Chamada 1** e **Chamada 2** (texto ou print) — a
Aula 2 relê os dois casos, e a Aula 2 também usa a **Chamada 3**, que ainda
não foi feita neste ponto. Não gere a Chamada 3 antes da hora: ela precisa
acontecer dentro do fluxo da Aula 2 para a fala de error analysis fazer
sentido.
