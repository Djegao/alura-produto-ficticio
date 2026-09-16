# O que você leva desta aula — casos reais, em linguagem direta

Documento iterativo, um caso por vez, escrito para quem está construindo o
próprio produto com IA e não vem de formação técnica. Cada seção termina
com algo que você pode aplicar no seu produto hoje, não só assistir.

---

## Caso 1 — "Deu erro duas vezes" quase nunca significa dois problemas

**O que aconteceu de verdade, no meu produto, em produção:** mandei uma
nota fiscal pelo bot do Telegram. Nada aconteceu — sem resposta, sem item
novo no estoque. Fui olhar o log do servidor e achei isto:

```
01:30:11.106373641 | Erro capturando mensagem do Telegram: fetch failed
01:30:11.106381240 | Erro processando a mensagem: fetch failed
```

Duas linhas de erro, a poucos microssegundos de distância. A reação mais
comum aqui — e a minha primeira reação também — é pensar "ok, deu dois
problemas diferentes, preciso investigar os dois". **Essa reação está
errada na maioria das vezes, e é importante você saber por quê.**

### Por que são um erro só, não dois

Repare no horário: a diferença entre as duas linhas é de **8
microssegundos**. Isso é tempo demais curto pra qualquer chamada de rede de
verdade acontecer duas vezes — nem para o Telegram, nem para nenhum outro
serviço externo. Uma chamada de rede real leva no mínimo alguns
milissegundos, geralmente mais.

Então a segunda linha não pode ser um segundo problema independente. O que
aconteceu foi uma cadeia: algo falhou de verdade (linha 1), o próprio
código tentou avisar alguém sobre essa falha, e essa tentativa de aviso
*também* falhou — porque dependia da mesma coisa que já estava com
problema (a conexão de rede). A informação que explicaria a causa real do
problema foi substituída pela informação de que o aviso não saiu.

**Isso é um padrão que se repete em praticamente qualquer sistema que
tenta "avisar sobre um erro" dentro do próprio tratamento do erro.** Se o
seu produto tem qualquer bloco de código no formato "se der erro, avisa o
usuário" (um `try/catch`, uma automação no n8n/Make, um agente que chama
uma ferramenta de notificação), ele pode ter exatamente esse problema: o
aviso engolindo a evidência do erro original.

### O jeito certo de diagnosticar isso — sem saber programar

Você não precisa entender o código para perceber isso. Precisa saber fazer
a pergunta certa. O que eu fiz, literalmente: colei as duas linhas de log
numa conversa com o Claude e perguntei **"isso são dois problemas ou um
só?"**. A resposta vinda da leitura do timestamp foi a mesma explicação que
você acabou de ler.

Esse é o ponto central da Aula 4: você não precisa ler código pra
diagnosticar uma falha em produção. Você precisa **juntar a evidência
certa** (aqui, os dois logs com o timestamp completo) e **perguntar bem**.

### Template reutilizável — leve isso para o seu produto

Sempre que o seu produto tiver um log com duas ou mais mensagens de erro
muito parecidas, acontecendo quase ao mesmo tempo, cole no Claude algo
assim:

> "Aqui estão N linhas de erro do meu produto, com timestamp completo:
> [cole as linhas].
> Isso representa N problemas diferentes ou é o mesmo problema aparecendo
> mais de uma vez? Olhe especificamente a diferença de tempo entre as
> linhas antes de responder."

E a pergunta de verificação que você deve fazer sempre, para qualquer
produto que "avisa" alguém quando algo dá errado:

> "O código que avisa o usuário sobre um erro está protegido para não
> apagar a evidência do erro original, se o próprio aviso falhar?"

### O que isso muda na prioridade do seu backlog

Erro que não se explica é o tipo de risco mais barato de evitar e mais caro
de ignorar: ele não trava seu produto, só te deixa cego bem na hora em que
você mais precisa enxergar. Se você tem qualquer fluxo de notificação de
erro no seu produto (Slack, e-mail, WhatsApp, Telegram), vale a pena
perguntar ao Claude, hoje, se esse fluxo está protegido dessa forma — é
geralmente uma correção pequena, e o custo de não ter isso só aparece
quando você mais precisa dele: no meio de um incidente real.

---

## Caso 2 — "Não aconteceu nada" pode ser o pior tipo de erro que existe

**O que aconteceu de verdade:** no dia seguinte ao Caso 1, mandei a mesma
nota fiscal de novo pelo Telegram. De novo, nada aconteceu. Mas dessa vez
foi diferente — não tinha nem sequer um erro pra olhar. Fui checar cinco
lugares:

- Resposta no Telegram: nada.
- Log do servidor: nenhuma linha.
- Ferramenta de observabilidade (Langfuse): nenhum registro.
- Banco de dados: nada.
- E perguntei direto pro Telegram: "você entregou essa mensagem pra mim?"
  A resposta foi sim — zero erro de entrega.

### Por que isso é mais perigoso do que um erro que aparece

Um erro que aparece no seu log, mesmo feio, é uma pista. Alguém pode ver,
pode investigar, pode até configurar um alerta pra isso. **Uma ausência não
avisa ninguém.** Não existe uma ferramenta que te avisa "ei, uma coisa que
deveria ter acontecido não aconteceu" — a menos que alguém já tenha
pensado nesse cenário específico antes e programado essa checagem. Esse é,
sem exagero, o tipo de falha mais caro de descobrir sozinho: ela não
incomoda ninguém até o dia em que alguém percebe, por acaso, que uma coisa
que devia ter acontecido, não aconteceu.

### Como cheguei na causa, sem ler uma linha de código

Usei o raciocínio por eliminação — e você consegue fazer o mesmo com
qualquer produto seu, mesmo sem saber programar:

1. O canal (Telegram) confirma que entregou. Então **não é** problema de
   rede ou de conexão.
2. Não existe nenhum log, nem de erro. Então **não é** uma exceção comum —
   até um erro comum costuma deixar um rastro.
3. Se recebeu e não gerou rastro nenhum, só sobra uma explicação: em algum
   lugar do código existe uma decisão de "se for esse tipo de coisa, não
   faz nada" — e essa decisão não avisa ninguém que tomou essa escolha.

A causa real: era uma foto do cupom fiscal, não um link de texto, e naquele
momento o produto simplesmente não sabia processar fotos — e, pior,
**não dizia isso**. Ele só ficava calado.

### A correção não foi "aprender a ler foto" — foi aprender a admitir

Isso é o ponto que eu mais quero que você leve. A correção que eu apliquei
não foi ensinar o produto a entender fotos (isso veio depois, numa segunda
correção). A primeira e mais importante foi ensinar ele a dizer **"eu não
sei fazer isso ainda"** em vez de ficar em silêncio. Tecnicamente, é
simples: qualquer bloco do tipo "se não for esse formato que eu já trato,
ignora" precisa virar "se não for esse formato, avisa que não sabe tratar
ainda". A dificuldade não é técnica — é lembrar de pensar em todo caso que
seu produto pode não saber lidar.

### O que eu encontrei de novo enquanto documentava isso — e não corrigi ainda

Uma coisa importante de mostrar: corrigir o caso que você encontrou **não
garante que você fechou a categoria inteira do problema**. Ao revisar o
código com calma, achei mais dois lugares no mesmo produto com o mesmo tipo
de silêncio — um deles trata cliques em botões antigos do bot, o outro
trata tipos de mensagem que nem foto nem texto (o Telegram manda vários
tipos que o produto nunca imaginou receber). Os dois ainda estão sem
correção — registrados, priorizados, mas não mexidos, porque a decisão de
corrigir não é minha sozinha nesse momento; é combinada.

### Template reutilizável — o checklist dos 5 lugares

Sempre que uma ação no seu produto "não acontecer" sem nenhum erro visível,
confira nesta ordem antes de suspeitar de qualquer coisa complicada:

1. O canal de entrada confirma que a mensagem/evento chegou até você?
   (No caso do Telegram, isso é o `getWebhookInfo`; em outras integrações,
   costuma existir um "log de entrega" equivalente.)
2. Existe alguma linha de log do seu servidor sobre esse evento?
3. Existe algum registro na sua ferramenta de observabilidade?
4. O dado esperado está no banco?
5. Alguma resposta chegou pro usuário, mesmo que genérica?

Se a resposta for "chegou, mas as próximas quatro são não" — você não tem
um bug de rede nem de modelo. Você tem um **caminho de código que decide
ignorar em silêncio**, e a correção certa quase nunca é "ensinar a fazer" —
é "ensinar a admitir que não sabe fazer ainda".

### O prompt que você pode reusar

> "Meu produto recebeu [o evento], confirmado pelo [canal/ferramenta], mas
> não gerou nenhum log, nenhum registro na minha ferramenta de
> observabilidade, nenhuma escrita no banco e nenhuma resposta ao usuário.
> Existe algum ponto no código que trata esse tipo de entrada retornando
> sem fazer nada e sem avisar? Se sim, aponte onde, e verifique se existe
> outro ponto parecido no mesmo arquivo que também retorna sem logar."

A última frase do prompt é a mais importante — é ela que pede pro Claude
procurar **a categoria inteira do problema**, não só o caso específico que
você já sabe que está quebrado.

---

## Caso 3 — Quando a IA acerta 100% e o seu produto ainda assim erra

**O que aconteceu de verdade:** mandei pelo Telegram "Comemos 3 porções de
lasagna, 1 e 1/2 para cada!". O bot reagiu com 👍. Perfeito, certo? Só que
fui checar o estoque depois e ele continuava intacto: 5 de 5 porções.

O detalhe que torna esse caso valioso é que, quando eu fui olhar o que a
IA tinha entendido daquela mensagem, estava **tudo certo**: reconheceu que
era uma refeição em casa, extraiu o nome do prato, e ainda fez a conta
sozinha — "1 e 1/2 para cada" com duas pessoas dá 3 porções. Sem erro
nenhum.

### O reflexo que você precisa desmontar

Quando alguma coisa dá errado num produto com IA, o reflexo quase
automático é pensar "o prompt está mal escrito" ou "o modelo é ruim
demais". **Nesse caso, os dois estavam certos.** Quem errou foi uma parte
do código que não tem nada de inteligência artificial: a comparação de
texto que decide se o prato que a pessoa mencionou é o mesmo prato que já
existe cadastrado.

A pessoa escreveu "lasagna" (like em inglês, bem comum escrever assim sem
perceber). O prato estava salvo como "lasanha". Pra qualquer ser humano,
são a mesma palavra. Pra uma comparação de texto simples — do tipo "essa
palavra está contida dentro dessa outra?" — as duas grafias são
completamente diferentes, porque a diferença não é um acento nem
maiúscula/minúscula: é a própria sequência de letras (`gn` contra `nh`).

### Por que "deixa eu só deixar o match mais esperto" não é resposta óbvia aqui

Você pode estar pensando: "ok, então é só deixar a comparação mais
flexível". Esse é exatamente o instinto certo — e exatamente por isso vale
a pena parar e pensar antes de aplicar. Numa cozinha, tornar a comparação
"mais tolerante" cria um problema novo: grão-de-bico e grão passam a
parecer o mesmo item; leite e leite condensado, também; farinha de trigo e
farinha de rosca, idem. São itens **diferentes de verdade**, e ficariam
mais parecidos entre si (em termos de letras) do que "lasagna" está de
"lasanha". Resolver um falso negativo criando um monte de falsos positivos
não é vitória — é trocar um risco visível por um invisível.

Por isso, aqui, **eu decidi documentar e não corrigir ainda**. Não é
preguiça — é reconhecer que a solução óbvia tem um efeito colateral real, e
que vale mais a pena decidir isso com calma do que aplicar rápido e criar
um problema pior.

### O que isso ensina sobre prioridade no seu próprio produto

Nem todo bug merece ser corrigido na hora que você encontra. Às vezes a
ação certa é: registrar o que aconteceu, registrar as opções de solução que
você já enxerga, registrar o risco de cada uma — e decidir depois, com
calma, em vez de "resolver" de improviso e descobrir o efeito colateral em
produção. Documentar uma decisão de **não** corrigir ainda é, ela mesma,
uma entrega válida do seu trabalho.

### Template reutilizável — antes de aplicar um "fix óbvio"

Sempre que a correção parecer óbvia demais rápido demais, pergunte ao
Claude:

> "Antes de eu aplicar essa correção, quero que você pense em pelo menos
> dois exemplos reais do meu domínio onde essa mesma mudança criaria um
> falso positivo — ou seja, onde ela juntaria duas coisas que na verdade
> são diferentes. Se você não conseguir pensar em nenhum exemplo
> plausível, me diga isso também."

Esse prompt não te dá a resposta pronta — te dá a pausa certa antes de uma
decisão que parece pequena, mas não é.

---

## Caso 4 — Quando cada mensagem está certa e a conversa inteira falha

**O que aconteceu de verdade:** isso não foi um teste — aconteceu comigo,
usando meu próprio produto, numa sexta à noite. Preparei um hambúrguer,
contei pro bot: nome do prato, peso de cada porção, quantas porções. O bot
fez uma pergunta razoável de volta. Eu respondi, no formato exato que ele
mesmo sugeriu. Ele perguntou de novo, de um jeito diferente, como se eu não
tivesse acabado de responder. Tentei mais uma vez, só com o nome do prato.
E ele desistiu — virou um emoji, silêncio, fim. O hambúrguer que eu de fato
cozinhei nunca entrou no controle de estoque.

### A parte que quebra o hábito mental mais comum

Fui direto conferir cada uma das quatro mensagens, uma por uma, no meu
histórico técnico (o "trace" de cada chamada à IA). E o resultado foi
desconfortável: **as quatro estavam certas.** A primeira mensagem foi
entendida certo. A segunda extraiu o nome do prato certinho. A terceira e a
quarta também não tiveram nenhum erro de interpretação. Zero erro, zero
exceção, em nenhuma das quatro.

Isso derruba o reflexo que a gente usa quase sempre pra explicar falha em
produto de IA: "o problema é o prompt" ou "o modelo não entendeu". Aqui, a
inteligência acertou nas quatro vezes — inclusive fazendo pequenas
inferências corretas. E o resultado, ainda assim, foi zero: nada foi
registrado.

### Onde estava o problema, então

Cada mensagem, sozinha, fazia sentido. O que faltou foi o produto lembrar
que existia uma pergunta em aberto esperando resposta. Quando respondi
"porcionei em 2 unidades de 220g e 2 de 160g" — uma resposta direta, do
jeito que qualquer pessoa responderia — eu não repeti "hambúrguer de
patinho", porque óbvio, tínhamos acabado de falar sobre isso. Mas o sistema
que interpreta cada mensagem faz isso **sem nenhuma memória do que veio
antes**. Pra ele, cada mensagem é o início de uma conversa nova. Então
minha resposta direta virou uma mensagem sem sentido pra classificar, e a
pergunta que veio de volta foi ainda mais confusa — porque, do ponto de
vista do sistema, ele nem sabia que já tinha perguntado antes.

Isso é uma categoria de problema diferente das duas primeiras: não é um
erro dentro de uma interação — é uma peça que **nunca foi construída**: o
produto simplesmente não guarda o fio da conversa entre uma mensagem e a
próxima.

### Por que isso é importante pra qualquer produto seu com chat

Se o seu produto usa IA pra conversar com o usuário em mais de uma
mensagem — e a maioria dos produtos de IA hoje faz isso — vale muito a pena
testar exatamente esse cenário: faça uma pergunta que force o seu produto a
perguntar de volta, e depois responda como uma pessoa normal responderia
(direto, sem repetir contexto óbvio). Se a resposta direta quebra o fluxo,
você tem esse mesmo problema.

### Um jeito de resolver sem precisar de "memória de conversa completa"

A solução mais óbvia parece ser "dar memória da conversa inteira pra IA" —
mas isso custa mais caro, é mais lento, e cria um novo tipo de risco (a IA
passa a ter que interpretar mais coisa, com mais chance de se confundir).
No meu caso, achei um caminho mais barato: meu produto **já tinha** um
jeito de "lembrar" de uma pergunta pendente em outro fluxo (uma pergunta
sobre orçamento, que usa um botão de escolha em vez de texto livre — o
botão carrega consigo a referência de qual pergunta ele responde). A
correção que estou priorizando é reaproveitar essa mesma ideia pro caso do
porcionamento: guardar, por um tempinho, que existe uma pergunta pendente
específica — e checar essa pendência antes de tratar a próxima mensagem
como se fosse assunto novo. Resolve o caso real sem precisar dar à IA
acesso à conversa inteira.

### Template reutilizável — o teste da "resposta direta"

Pegue qualquer pergunta que seu produto faça de volta ao usuário durante
uma conversa. Responda como uma pessoa normal responderia — direto, sem
repetir o que já foi dito. Se quebrar, pergunte ao Claude:

> "Meu produto perguntou [pergunta] e eu respondi [resposta direta, sem
> repetir contexto]. A resposta não foi entendida como continuação da
> pergunta. Antes de sugerir dar memória de conversa completa pro
> classificador, veja se meu produto já tem algum mecanismo — como um
> botão, um ID de referência, ou um campo de 'pendente' — que eu possa
> reaproveitar para amarrar essa resposta à pergunta certa, sem aumentar o
> escopo do que a IA precisa interpretar."

---

*(os próximos casos entram aqui, um de cada vez)*
