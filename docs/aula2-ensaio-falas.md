# Aula 2 — script de ensaio: o que fazer e o que dizer, slide a slide

Documento de ensaio casado com [`slides/aula2-alura.pptx`](../slides/aula2-alura.pptx)
(16 slides). Mesma estrutura da Aula 1: **Tela**, **Fazer**, **Dizer**.

**Voz desta aula**: você é product builder, não engenheiro. Nenhum critério
é código — cada um deve ser uma pergunta que qualquer pessoa da equipe
consegue responder olhando a resposta, sem programar.

**Continuação direta da Aula 1**: mesmo produto, mesmo estado — as
**Chamada 1** e **Chamada 2** já foram feitas e suas respostas guardadas. A
**Chamada 3** (única chamada nova desta aula) acontece dentro do vídeo 2.3.

---

## Antes do REC

### Estado necessário

| Item | Como deixar |
|---|---|
| Branch | **`aula1-2/produto-virgem`**, mesmo checkout da Aula 1 |
| Produto | mesmo estado em que a Aula 1 terminou — estoque e preferência intactos, não zere de novo |
| Registros da Aula 1 | tenha as respostas das Chamada 1 e Chamada 2 abertas ou impressas — você vai reler as duas nesta aula |

### A terceira chamada — texto exato

**Chamada 3** (vídeo 2.3, prompt v2 — deixe configurado assim desde o fim da Aula 1):
> "Quero fazer algo com o leite que tenho."

Teste esta chamada **fora de câmera antes de gravar**, junto com a Aula 1 —
o ensaio da 2.4 (leitura de padrões) depende de saber, com antecedência, se
ela respeitou ou não a restrição "sem lactose". Ajuste a fala da 2.4 para
bater com o que realmente aconteceu — não invente o resultado.

### Janelas para alt+tab

1. `localhost:3300` (o produto) · 2. `aula2-alura.pptx` · 3. Registro das Chamada 1/2 · 4. Este ensaio

---

## Vídeo 2.1 — Parece certo não é o mesmo que estar certo

### Slide 1 — Capa

**Dizer**:
> "Na aula passada eu fiz dois pedidos ao Chef Caseiro e as duas respostas
> pareceram boas. Hoje eu paro de sentir e começo a construir um jeito de
> saber — sem precisar reler cada resposta pra sempre."

### Slide 2 — Divisor 2.1

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

### Slide 3 — Onde a Aula 1 parou

**Tela**: mostre rapidamente as respostas guardadas da Chamada 1 e Chamada 2.

**Dizer**:
> "Essas foram as duas respostas da aula passada. Eu as li, achei razoáveis,
> e segui em frente. Mas 'achei razoável' foi só a minha opinião, lendo uma
> vez. Hoje eu vou transformar essa opinião num critério — algo que eu
> consiga aplicar de novo, sempre do mesmo jeito."

### Slide 4 — Se tudo passa, o critério está fácil demais

**Dizer**:
> "Uma coisa que parece contraintuitiva: se cem por cento das respostas
> passam no seu critério, isso não é motivo de comemorar — é sinal de
> alerta. Provavelmente o critério não está pegando nada de verdade. Decidir
> quanto de falha eu aceito é uma decisão de produto minha. Não existe erro
> zero de graça."

---

## Vídeo 2.2 — Escrevendo os primeiros critérios

### Slide 5 — Divisor 2.2

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 6 — Um critério bom é uma pergunta que qualquer um responde

**Dizer**:
> "Critério ruim: 'a resposta é boa'. Ninguém consegue julgar isso do mesmo
> jeito duas vezes — cada pessoa vai achar uma coisa diferente. Critério
> bom: 'a sugestão usa só o que realmente existe no estoque que ela
> consultou?'. Esse eu consigo apontar o sim ou o não, olhando a resposta.
> Sempre que der, eu prefiro sim ou não a uma nota de um a dez — nota vira
> opinião disfarçada de número."

### Slide 7 — Os dois critérios que valem mais pro Chef Caseiro

**Tela**: opcional — anote os dois critérios num bloco de notas visível.

**Dizer**:
> "Pro Chef Caseiro, dois critérios valem mais que todos os outros juntos.
> Fidelidade ao estoque: os ingredientes da receita vieram do que ela
> realmente consultou, ou ela inventou algo 'que todo mundo tem em casa'?
> Respeito às restrições: a sugestão respeitou tudo que eu cadastrei —
> alergia, dieta, o que a casa não come? Os dois nascem direto do que o
> produto promete. Se um dos dois falha, a promessa central quebrou."

---

## Vídeo 2.3 — Pedindo ajuda pra gerar casos de teste

### Slide 8 — Divisor 2.3

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 9 — Um pedido não é suficiente pra confiar em nada

**Dizer**:
> "Eu testei com dois pedidos, na aula passada. Isso ainda não prova nada —
> só mostra que funcionou duas vezes, comigo, num dia. Pra realmente
> testar o critério de respeito às restrições, eu preciso de um pedido
> desenhado pra tensionar exatamente esse ponto."

### Slide 10 — Rodando o produto contra a situação

**Tela**: painel, configuração já em v2.

**Fazer**: faça a **Chamada 3** pré-combinada.

**Dizer**:
> "Eu tenho leite no estoque, e a restrição cadastrada é sem lactose. Vou
> pedir algo que usa exatamente esse ingrediente, de propósito, pra ver o
> que ela faz com a tensão entre os dois."

*(mande "Quero fazer algo com o leite que tenho." e leia a resposta)*

> "[Leia a resposta em voz alta e comente o que ela decidiu fazer com o
> leite e a restrição — se ela evitou usá-lo, sugeriu substituto, ou
> ignorou a restrição.]"

**Cuidados**: a fala entre colchetes **depende do resultado real** do seu
teste fora de câmera. Escreva a reação de acordo com o que aconteceu de
verdade — os dois desfechos (respeitou / não respeitou a restrição) são
igualmente úteis como conteúdo de aula, contanto que sejam reais.

---

## Vídeo 2.4 — Lendo o que aconteceu de verdade

### Slide 11 — Divisor 2.4

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 12 — Ainda não tenho um painel — e tudo bem

**Dizer**:
> "Eu ainda não tenho um lugar bonito pra ver tudo isso de uma vez — isso é
> a próxima aula, observabilidade. Por enquanto, eu leio direto o que o
> produto guardou: as três respostas que eu já tenho, uma por uma. Pra cada
> uma, eu escrevo uma nota curta e aberta — o que incomodou, se incomodou
> algo. Nada de categoria fixa ainda."

### Slide 13 — Das notas soltas para um padrão

**Tela**: as três respostas lado a lado, com suas notas.

**Dizer**:
> "Depois de ler as três, eu junto as notas parecidas e dou nome a cada
> grupo — isso é a taxonomia, e ela nasce do dado que eu tenho na frente,
> não de uma lista pronta que eu trouxe de fora. Normalmente, dois ou três
> padrões respondem pela maioria dos problemas. É neles que vale focar
> primeiro."

---

## Vídeo 2.5 — O que aprendemos

### Slide 14 — Divisor 2.5

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 15 — O que aprendemos

**Dizer**:
> "Um critério só serve se qualquer pessoa da equipe conseguir julgá-lo,
> olhando a resposta, sem programar. Testar com um caso só não prova nada —
> um pedido desenhado pra tensionar o critério certo resolve isso rápido.
> Ler as respostas e agrupar em padrões, não em categorias prontas, revela
> onde o produto realmente falha. Hoje eu li tudo à mão, um por um. Isso não
> escala — e é exatamente o problema que a próxima aula resolve."

### Slide 16 — Fechamento

**Dizer**:
> "Eu sei o que procurar. Agora falta enxergar. Até a próxima aula."

---

## Depois de gravar

Guarde as três respostas e as notas de leitura desta aula — elas viram
referência quando a Aula 3 introduzir observabilidade e mostrar como esse
mesmo trabalho de leitura, feito à mão hoje, passa a acontecer num painel.
