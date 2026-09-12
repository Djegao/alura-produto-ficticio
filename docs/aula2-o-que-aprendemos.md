# 2.5 — O que aprendemos?

> **Tipo de conteúdo: Explicação (texto).** Segundo o espelho do curso, este
> item não é vídeo — é o texto que fecha a Aula 2 na plataforma. Escrito pra
> ser lido depois dos quatro vídeos, não pra ser narrado.

Nesta aula eu saí de "a mediação pareceu razoável" e cheguei a um conjunto de
critérios que qualquer pessoa da casa consegue aplicar — e que o Claude
consegue aplicar no meu lugar quando o volume crescer.

## Um eval não é um teste

Teste de software compara com o resultado esperado: dois mais dois tem que dar
quatro, sempre. O Mediador não funciona assim — o mesmo pedido gera texto
diferente a cada execução, e **as duas versões podem estar certas**.

Teste pergunta *"é igual ao esperado?"*. Eval pergunta *"é bom?"*. São
instrumentos diferentes porque são perguntas diferentes.

E a palavra que sustenta o resto: **contínua**. O modelo muda sem eu pedir, o
dado apodrece sozinho, e alguém sempre "melhora" o prompt. O eval não é uma
auditoria antes do lançamento — é um instrumento que fica ligado.

## O funil de quatro passos

Todo eval mora dentro desta sequência:

| Passo | A pergunta |
|---|---|
| **1. Cenário** | o que eu estou tentando avaliar? |
| **2. Critério** | o que eu espero que ele faça nesse cenário? |
| **3. Resposta** | o que o produto fez de verdade naquela execução? |
| **4. Evidência** | atendeu ou não atendeu — com justificativa apontável |

O vídeo 2.2 parou exatamente no **Critério**: é o passo mais fácil de fazer
errado, e o único dos quatro que não precisa de código nenhum.

E a âncora que vale pros quatro passos: **não estamos avaliando o modelo, e
sim o comportamento esperado do produto.** Se eu avalio o modelo, escrevo
critério genérico. Se eu avalio o produto, escrevo o que ele prometeu pra esta
casa — e esse eu consigo defender numa reunião.

## Um critério tem quatro partes

| Parte | Por que é obrigatória |
|---|---|
| **Nome** | sem nome estável, não dá pra comparar esta semana com a próxima |
| **Pergunta** | respondível por uma pessoa olhando a interação, sem abrir o repositório |
| **Escala** | binário quando a falha é categórica; 0 a 1 quando "meio certo" existe |
| **Se falhar, o que acontece?** | o custo da falha em uma frase; um critério que não custa nada quando falha rouba atenção dos que custam |

Do cenário da entrega (fim de dia, ninguém quer cozinhar, e tem porção caseira
parada na geladeira) nasceram cinco critérios que dá pra
apontar o sim ou o não em todos — inclusive o mais importante deles: *ele
decidiu sozinho o que a casa deve fazer?* No momento em que o Mediador diz
"não peça entrega", ele deixou de ser o produto que eu construí.

E se cem por cento das respostas passam no seu critério, isso é sinal de
alerta, não de sucesso: **um critério que nunca reprova não está medindo.**

## O Claude como avaliador

O mesmo modelo que gera pode julgar, num papel invertido: ele recebe o trace
inteiro — pedido, resposta final, ferramentas chamadas e o que cada uma
devolveu — e emite um parecer critério a critério.

Três decisões de desenho fazem esse árbitro funcionar:

1. **Nota sem evidência não vale nada.** Cada critério devolve valor *e*
   justificativa citando o material. É o que me deixa **discordar** do juiz —
   um avaliador que eu não consigo auditar me dá confiança falsa, não
   segurança.
2. **O juiz não faz conta.** Os fatos objetivos (ferramentas chamadas, tokens
   de saída, erros no caminho) são apurados em código e entregues prontos.
   Aritmética é trabalho de código; julgamento é trabalho do modelo.
3. **Prompt não é contrato.** Pedir "responda em JSON" funciona quase sempre —
   e quase sempre não serve. Quando você precisa de garantia, ela tem que
   estar na estrutura da chamada, não no texto do pedido.

## Um conjunto é uma escolha, não uma lista

**Um eval que cobre tudo não é rodado por ninguém.** Priorizar é parte do
trabalho: comece pelas operações do produto — o Mediador promete uma coisa, o
caminho de entrada promete outra — e dentro de cada uma escolha os cenários
mais críticos e os erros mais custosos.

Antes de qualquer critério de qualidade vem um de integridade: **a execução
chegou ao fim inteira?** Não adianta perguntar se o Mediador expôs o trade-off
se a resposta parou no meio da palavra.

E a lista do que eu decidi **não** medir diz tanto quanto a do que entrou.
"A mediação foi agradável" ficou de fora porque não é julgável de forma
repetível — e porque o produto não promete isso. Latência e custo ficaram de
fora porque são métricas, não critérios de qualidade.

## O que este conjunto ainda não faz

Ele julga as execuções que eu escolhi, quando eu mando rodar. Ninguém está
sendo avisado de nada.

Se a qualidade cair numa terça-feira de madrugada, eu descubro quando lembrar
de rodar de novo. Ter critério é metade do trabalho; a outra metade é enxergar
o produto continuamente, sem depender da minha memória.

É onde a Aula 3 começa.
