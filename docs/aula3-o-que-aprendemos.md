# 3.5 — O que aprendemos?

> **Rascunho (16/09), fecha depois do debate** de
> [`aula3-avaliacao-e-plano.md`](./aula3-avaliacao-e-plano.md).
>
> **Tipo de conteúdo: Explicação (texto).** Pelo espelho do curso, este item
> não é vídeo: é o texto que fecha a Aula 3 na plataforma. Foi escrito pra ser
> lido depois dos quatro vídeos, não pra ser narrado.

Nesta aula eu saí de "eu sei o que procurar" e cheguei a enxergar o meu
produto funcionando sem mim: o que ele faz, quanto custa, quanto demora, onde
falha e onde a falha se esconde.

## Observar é reconstruir

Log é um evento solto, e só existe se alguém lembrou de escrever aquela linha.
Observabilidade é conseguir **reconstruir depois**, sem ter estado lá, o
caminho inteiro de uma interação.

De cada interação, três coisas precisam ficar gravadas:

| O que gravar | A pergunta que responde |
|---|---|
| **O caminho** | o que o produto fez antes de responder? |
| **A conta** | quanto custou e quanto tempo levou? |
| **O desfecho** | terminou inteira, cortada ou com erro? E qual foi a nota do eval? |

A regra que eu adotei é radical de propósito: **nenhuma chamada da IA sem
rastro**, com o rastro ligado antes de todo o resto. Desligar o rastro não
quebra o produto. Quebra a sua capacidade de saber o que ele faz.

## O Langfuse em três palavras

| Na tela | Quer dizer |
|---|---|
| **Trace** | a interação inteira, do pedido à resposta |
| **Observation** | cada passo lá dentro: chamada ao modelo, ferramenta |
| **Score** | a nota que o eval escreve de volta na interação |

Antes de ligar, uma decisão de conformidade: **onde o rastro vai morar**. Na
nuvem do Langfuse, no seu servidor ou na sua nuvem, porque ele guarda o que o
usuário escreveu. E o custo: o plano gratuito dá 50 mil registros por mês e
**30 dias** de acesso ao dado.

Dois avisos práticos. Sem as chaves, o aviso existe, mas mora num terminal que
ninguém lê. E tempo real não é instantâneo: o registro leva uns 45 segundos pra
aparecer.

## Quatro perguntas pro painel

| Pergunta | O que eu aprendi olhando o meu |
|---|---|
| **O que ele mais faz?** | o mais usado (entender mensagem, metade de tudo) não é o mais caro. E pico que vem de teste e de demonstração não é adoção |
| **Onde estão o dinheiro e a espera?** | o Mediador é um quarto das chamadas e **90% da conta**. A média esconde quem espera mais: com poucos casos, olhe o pior caso |
| **Quantas terminaram inteiras?** | o vermelho mente pros dois lados: erro que não é falha infla a taxa, e falha que não é erro passa sem alarme |
| **Melhorou desde a semana passada?** | uma rodada de notas é uma foto, não um filme. Sem eval rodando toda semana, não dá pra responder |

E o dado bruto tem **prazo de validade**. Em uma semana, metade do meu painel
some. O que sobrevive é o que você anota.

## Um padrão tem assinatura

Das dez mediações do meu produto, sete não dispararam alarme no painel, e **só uma
chegou inteira**. Os sintomas eram quatro (erro, texto vazio, texto cortado,
uma palavra só), e a assinatura era uma: **tokens de saída iguais ao teto
configurado**, em nove de dez casos. Isso custou 77% da conta do produto.

Três perguntas pra achar padrão em qualquer produto:

1. **Assinatura:** que sinal se repete, mesmo quando o sintoma muda?
2. **Frequência:** é um caso ou é regra? Conte, e diga o tamanho da amostra.
3. **Ponto cego:** onde o sem-alarme pode estar mentindo? Cruze o rastro com o
   estado final, com a mensagem seguinte e com o que deveria ter deixado
   rastro e não deixou.

E degradação nem sempre é alguém estragando alguma coisa: o mesmo código, com
mais dado, pode falhar pior.

## O que ainda falta

Eu enxergo, mas só quando abro o painel. Ninguém me chama quando a qualidade
cai. Ver a assinatura de um padrão não diz a causa. E nada do que apareceu
aqui foi corrigido.

É onde a Aula 4 começa: detectar sem depender de lembrar, diagnosticar a causa
e corrigir antes do usuário perceber.
