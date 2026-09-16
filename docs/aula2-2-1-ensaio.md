# Ensaio — 2.2.1 Os critérios no produto

Duração alvo: **4 a 5 min**. Divisor de ação do vídeo 2.2.
Tela única: `evals/criterios.md`. Sem terminal, sem navegador.

Papel deste bloco: o arquivo é uma **cheatsheet de evals** que o aluno leva
para casa. Panorâmica e método, não mergulho. A análise profunda de traces é
o 2.4.1, onde o juiz já foi apresentado.

---

## Antes do REC

Abra `evals/criterios.md` **no topo**, não na linha 118. Mudou em relação ao
plano anterior: como agora é panorâmica, você começa pela anatomia e desce.

Confira a branch: `gravacao/aulas-3-e-4-material`. Em qualquer outra o arquivo
é a versão antiga, sem a seção do Mediador.

Nome do produto uniformizado em 12/09 — o arquivo inteiro diz Musa Balance.

Deixe o arquivo **fechado de dobra**, sem seleção de texto e sem o painel de
busca aberto. A primeira impressão tem que ser "é um documento", não "é uma
IDE".

---

## TELA

Alt+Tab para o editor. `evals/criterios.md`, topo do arquivo, linha 1 visível.

---

## FALA

**[arquivo parado no topo]**

Esses critérios existem de verdade no produto. Não é slide, não é exemplo que
eu escrevi pra aula. Olha aqui.

É um arquivo de texto. Em português. Não tem código nenhum.

E eu quero que você repare no que esse arquivo é, antes de olhar o que tem
dentro. Ele é a documentação dos meus evals. É o que qualquer pessoa que
entrar no projeto lê pra entender o que a gente decidiu medir, e por quê.

**[desce até a linha 17, a anatomia]**

Começa por aqui. Todo critério tem quatro partes, e as quatro são
obrigatórias.

Nome. Pergunta. Escala. E: se falhar, o que acontece?

**[aponta "Nome"]**

O nome é o que vai ser gravado, com esse nome exato, toda vez que rodar.
*(entre parênteses)* Gravado numa ferramenta de observabilidade, o Langfuse —
e a gente mergulha nela na próxima aula, com a atenção que ela merece. Por
ora guarda só isto: sem nome estável, você não consegue comparar qualidade ao
longo do tempo.

**[aponta "Pergunta"]**

A pergunta tem que ser respondível por alguém olhando a interação. Sem saber
programar.

**[aponta "Escala"]**

Binário quando a falha é categórica. De zero a um quando existe meio certo.

**[aponta a quarta linha]**

E a quarta, que é a que mais gente esquece: o custo da falha, em uma frase
concreta. Um critério que não custa nada quando falha não merece existir.

**[desce até a linha 28, os dois exemplos]**

Olha o contraste aqui embaixo. Critério ruim: "a resposta é boa". Critério
bom: "a sugestão cita apenas itens que apareceram no resultado da consulta de
estoque, naquela mesma interação".

A diferença não é caprichar no texto. É que o segundo tem evidência concreta
pra apontar quando falha.

**[rola até a linha 153, `mediou_sem_decidir`]**

Agora um critério inteiro, pra você ver as quatro partes de pé.

Esse é o `mediou_sem_decidir`. O nome, aqui. Binário, aqui do lado — não
existe meio termo.

A pergunta: o agente apresentou o conflito e deixou a escolha explícita para
o casal, sem proibir, julgar ou decidir sozinho?

**[aponta "Se falhar, o que acontece?"]**

E o custo. No momento em que o Mediador diz "não faça o hambúrguer", ele
deixa de ser um mediador e vira mais um app de dieta que a pessoa desinstala.

Isso não é perfumaria. É o produto deixando de ser o produto. E é o tipo de
coisa que degrada em silêncio quando alguém troca o modelo ou melhora o
prompt. Ninguém abre chamado dizendo "o mediador ficou opinativo". A pessoa
só para de usar.

**[rolagem contínua, sem parar em nenhum, da linha 35 até a 240]**

O arquivo inteiro é isso, onze vezes.

Um critério que vale pra tudo, no topo. Depois, agrupados por operação: os
que julgam a sugestão de receita, os que julgam a mediação, os que julgam a
ingestão do que a casa manda pelo chat.

Todos com as mesmas quatro partes. Nenhum com uma linha de código.

**[para na linha 240, "O que deliberadamente não virou critério"]**

E aqui está a seção que eu mais recomendo você copiar pro seu projeto.

O que eu decidi **não** medir.

"A receita é gostosa" — não é julgável de forma repetível, e o produto nem
promete isso. Tom e simpatia — é barato quando erra. Latência e custo — são
métricas, não critérios de qualidade; a ferramenta já coleta sozinha.

**[aponta a última linha]**

E o motivo de tudo isso estar escrito: um eval que cobre tudo não é rodado
por ninguém.

Priorizar é parte do trabalho. Se você sair daqui com uma lista de trinta
critérios, você não vai rodar nenhum.

**[volta o mouse pro corpo do arquivo, sem rolar]**

O teste do arquivo é esse. Qualquer pessoa da casa abre, lê, e consegue
aplicar numa mediação de verdade.

Sem me perguntar nada.

---

## CORTE

Depois de "sem me perguntar nada". Meio segundo com o arquivo parado.

---

## O que este bloco não faz

Não abre o Langfuse, não roda nada e não analisa trace. É de propósito. O
`652b3803` e o `d807057b` já são a espinha do 2.4.1 e da tabela "Mesmo
pedido, mesmo dia" — se você antecipar o contraste aqui, o 2.4 perde a
melhor cena da aula.

---

## Se travar

Frase âncora: **"É um arquivo de texto, em português, sem código nenhum."**
Reabre o raciocínio de qualquer ponto.

Errou um nome de critério? Não volte para corrigir. Diga o certo na frase
seguinte. A edição resolve.
