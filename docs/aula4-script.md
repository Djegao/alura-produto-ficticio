# Aula 4 — Slide · Script

Documento mestre da Aula 4. Mesmo formato das Aulas 2 e 3: o que está na
tela, depois o que eu falo.

**Rascunho para debate (16/09).** Nada aqui foi aprovado, e o deck só é
gerado depois do debate — mesma convenção da Aula 3.

Fonte da base: [`aula4-ensaio-falas.md`](aula4-ensaio-falas.md) (14/09,
formato de evidência congelada, sem checkout nem deploy ao vivo). Evidência:
[`apoio/evidencia-preservada.md`](apoio/evidencia-preservada.md),
[`apoio/antes-depois-codigo.md`](apoio/antes-depois-codigo.md),
[`apoio/evidencia-porcionamento-patinho.md`](apoio/evidencia-porcionamento-patinho.md)
(episódio D), [`aula4-roteiro-falha-telegram.md`](aula4-roteiro-falha-telegram.md)
(episódios A e B, história completa).

**Decisão (16/09): sem Episódio E.** O teto do Mediador (padrão
identificado na Aula 3, causa não diagnosticada) foi cogitado como um
quinto episódio nesta aula, mas a decisão final foi manter a aula enxuta —
quatro episódios, não cinco. O teto do Mediador segue como pendência
registrada, citada no checklist da Aula 5, sem investigação dedicada aqui.

| Vídeo | Título (espelho) | Estado |
|---|---|---|
| 4.1 | Detectando degradação | 🟡 rascunho para debate |
| 4.2 | Diagnosticando a causa | 🟡 rascunho para debate |
| 4.3 | Corrigindo antes do usuário | 🟡 rascunho para debate |
| 4.4 | Simulando o ciclo completo | 🟡 rascunho para debate |
| 4.5 | O que aprendemos | 🟡 rascunho para debate |

**Fio condutor:** a Aula 3 fechou com *"Eu já enxergo. Agora falta agir."*
A Aula 4 fecha o ciclo: detectar, diagnosticar, corrigir — e mostra que toda
correção cria uma consequência nova pra observar, o que abre a Aula 5
(guardrails, transparência e LGPD).

---

# 4.1 — Detectando degradação

Antes de gravar: confirmar produção em 401 (`curl.exe -s -o NUL -w
"producao: HTTP %{http_code}\n" https://chef.workshopee.com.br`). Sem
checkout, sem deploy — o produto termina a aula no mesmo estado em que
começa. Números desta seção revalidados com `node scripts/aula3-retrato-langfuse.js`
em 16/09 (mesmo recorte da Aula 3, ver `apoio/aula3-dados-congelados.md`).

## Slide 1 (hero, capa)
**Do instrumental à realidade**
Detectar, diagnosticar, corrigir

**Script**
Nas três primeiras aulas a gente construiu o instrumental: critérios de
qualidade, evals, e observabilidade com o Langfuse. Hoje esse instrumental
encontra a realidade. Vou abrir a operação real do meu produto — em
produção, com dado real — e fazer o ciclo completo: detectar uma falha,
diagnosticar a causa, corrigir antes do usuário perceber.

Já adianto o placar: encontrei quatro falhas reais fazendo exatamente
isso. Duas eu corrigi. Duas eu decidi manter, de propósito — e uma delas
apareceu sozinha, dois dias atrás, sem eu estar procurando, enquanto eu
simplesmente usava o meu próprio produto.

## Slide 2 (divisor)
**4.1 Detectando degradação**

**Script**
Primeira parte: detectar. E detectar é mais difícil do que parece, porque a
falha interessante quase nunca grita.

## Slide 3 (statement)
**O produto está no ar. Duas falhas estão dentro dele agora.**

🔴 Abrir `chef.workshopee.com.br` e mostrar o produto funcionando: a faixa
de estado, o feed, o estoque. Nenhum comando — a força do slide é o
contraste entre "parece saudável" e "tem duas falhas ativas".

**Script**
Antes de procurar defeito, olha o produto. Está no ar, responde, tem dado
real, e cada sugestão dessas custou dinheiro de verdade em chamada de
modelo. Nenhum alarme disparou. Ninguém abriu chamado.

E eu vou te dizer uma coisa: neste momento, enquanto a gente olha essa
tela, existem **duas falhas ativas** aqui dentro. As duas eu decidi
manter, de propósito — pra continuarem sendo exemplo real, não hipótese.
As duas estão bem na sua frente e você não tem como ver. É esse o problema
da aula: falha que não grita é a regra, não a exceção. Detectar é trabalho
ativo — não é esperar o alarme.

## Slide 4 (tabela)
**42 interações, US$ 1,54**
Mesmo recorte da Aula 3 — revalidado em 16/09.

| O que o produto faz | Vezes | Custo por vez | % da conta |
|---|---|---|---|
| Mediar o cardápio | 10 | US$ 0,138 | 89,6% |
| Receita premium da semana | 6 | US$ 0,012 | 4,5% |
| Entender uma mensagem | 21 | US$ 0,003 | 4,3% |
| Ler nota fiscal | 4 | US$ 0,006 | 1,6% |
| Um teste meu | 1 | US$ 0 | 0% |

**Script**
Isso aqui não é estimativa. É o que o Langfuse registrou, no mesmo recorte
que eu mostrei na aula passada: quarenta e duas interações, um dólar e
cinquenta e quatro no total. Repara na primeira linha. O Mediador de
cardápio rodou dez vezes — um quarto das chamadas. E ele come nove de cada
dez dólares da conta.

## Slide 5 (statement)
**24% das chamadas. 90% da conta.**

**Script**
Essa assimetria é o primeiro sinal de degradação que a gente consegue ver
sem nenhum usuário reclamar. E ela muda decisão de produto: não adianta
otimizar o agente de ingestão, que é barato e roda quase metade das vezes.

Custo e latência viram eixos que você troca ao vivo no seu próprio produto
— entender qual eixo pesa mais é o primeiro passo antes de qualquer troca.

## Slide 6 (lista)
**A falha que não deixou rastro**
Cinco lugares onde eu procurei — e nenhum tinha nada.
- Resposta no Telegram: nada.
- Log da aplicação: nenhuma linha.
- Trace no Langfuse: nenhum trace.
- Banco de dados: nada.
- O Telegram confirma a entrega — zero pendência, zero erro.

**Script**
Deixa eu te contar como eu encontrei a primeira. Um dia desses eu mandei
uma foto de um cupom fiscal pro bot, pelo Telegram — coisa mais normal do
mundo pra quem usa o produto. E não aconteceu nada. Nenhuma resposta,
nenhuma reação, nenhum item novo no estoque.

Comecei a procurar o rastro. Resposta no Telegram: nada. Log da aplicação:
nenhuma linha. Trace no Langfuse: nenhum trace. Banco de dados: nada.

E aí eu fiz a pergunta óbvia pro próprio Telegram: você entregou essa
mensagem? E a resposta foi sim — zero pendência, zero erro de entrega.

Junta tudo: o canal confirma que entregou, e o meu produto não tem
absolutamente nenhum registro de ter recebido nada. Se o dado confirma a
entrega e o meu sistema não tem rastro nenhum — onde essa mensagem foi
parar?

## Slide 7 (statement)
**Ausência não dispara alarme.**

**Script**
Essa é a categoria de falha mais perigosa que existe. Um erro que grita tem
stack trace, tem alerta, alguém acorda. Uma ausência não dispara nada — não
existe monitor que avise que uma coisa que deveria ter acontecido não
aconteceu, a menos que alguém já tenha pensado nisso antes. Eu vou voltar
nesse caso já já.

---

# 4.2 — Diagnosticando a causa

Antes de gravar: janela do Claude pronta pra colar evidência ao vivo (mesmo
padrão da Aula 2.5). Não corrigir o Claude no ar — se ele for por outro
caminho, redirecionar com pergunta, não com a resposta pronta.

## Slide 8 (divisor)
**4.2 Diagnosticando a causa**

**Script**
Segunda parte: diagnosticar. E eu quero separar bem três coisas que
costumam ser confundidas: problema de prompt, problema de dados e problema
de modelo.

## Slide 9 (statement + Claude)
**Episódio A — dois erros, ou um só?**

🔴 Colar estas duas linhas no Claude (log real, 21/08,
`aula4-roteiro-falha-telegram.md:16-18`), com a pergunta "isso são dois
problemas ou um só?". Deixar a resposta aparecer e ler a conclusão.

```
2026-08-22T01:30:11.106373641Z | Erro capturando relato/desejo/aquisicao via Telegram: fetch failed
2026-08-22T01:30:11.106381240Z | Erro processando update do Telegram: fetch failed
```

**Script**
Contexto primeiro. Ler nota fiscal pelo Telegram é o caminho que eu quero
que a casa use de verdade — ninguém vai abrir o painel web toda vez que
chega em casa com sacola de mercado. No dia 21 de agosto eu mandei uma
nota que eu já sabia ser complicada: um link de QR code de uma nota que o
site da SEFAZ demora pra resolver. Se esse caminho falhar em silêncio, o
produto perde a única forma barata de manter o estoque atualizado sem
digitação manual — e ninguém vai saber que perdeu.

No dia seguinte eu fiz o que eu faço depois de qualquer dia de uso mais
pesado: abri o log de produção pra conferir se passou tudo bem. E essas
duas linhas me chamaram atenção — não porque gritavam, mas porque duas
linhas de erro pra uma coisa só já é estranho.

Eu tenho duas linhas de erro aqui. Minha primeira leitura foi a óbvia:
aconteceram dois problemas. Só que tem uma coisa esquisita — olha o
horário das duas. A diferença entre elas é de oito microssegundos. Eu não
sei o que essa mensagem de erro quer dizer, e sinceramente não é o meu
trabalho saber. O meu trabalho é perceber que tem algo estranho e levar
para quem sabe.

*(cole no Claude e leia a resposta)*

Olha o que ele me diz. Não foram dois erros. Foi um só — e o segundo é o
próprio produto tentando me avisar do primeiro, e falhando nessa tentativa.
Quando ele falhou em avisar, ele apagou a informação do erro original. Ou
seja: o aviso comeu a evidência. Guarda essa, porque o próximo caso é o
oposto exato.

## Slide 10 (statement + Claude)
**Episódio B — a falha perfeitamente silenciosa**

🔴 Colar este bloco no Claude (evidência real, 22/08,
`aula4-roteiro-falha-telegram.md:44-52`), com a pergunta "por que uma
mensagem entregue com sucesso não deixou rastro nenhum?".

```
Resposta no Telegram: nada
Log do Railway: nenhuma linha
Trace no Langfuse: nenhum trace
Banco (pensamentos/estoque): nada
getWebhookInfo do Telegram: pending_update_count: 0, last_error: nenhum
```

**Script**
Depois do episódio anterior, eu não corrigi nada ainda — eu quis tentar um
caminho diferente pra resolver a mesma nota difícil. Em vez do link do QR,
mandei foto do cupom direto pro bot. É exatamente o comportamento que eu
quero incentivar: "não sei mandar do jeito certo, deixa eu tentar de
outro jeito" — e é assim que qualquer usuário real ia reagir também.

E esse é diferente, e é o mais assustador. No caso anterior eu pelo menos
tinha erro pra olhar — duas linhas, estranhas, mas linhas. Aqui não tem
nada. Zero log. Isso significa que, se eu não tivesse ficado esperando uma
resposta e desconfiado do silêncio, esse caso nunca teria virado
investigação — ele teria sido só "ah, deve ter sido bug, mando de novo
depois". É o tipo de falha que sobrevive indefinidamente num produto real,
porque ninguém escreve ticket pra "nada aconteceu".

O Telegram confirma que entregou. Não existe registro nenhum da conversa.
E o meu produto respondeu "recebido" — só que esse "recebido" ele manda
sempre, antes de processar qualquer coisa, então não prova nada sozinho.

*(cole no Claude e leia a resposta)*

E aqui está: existe um caminho dentro do produto em que ele recebe a
mensagem, percebe que é um formato que não sabe ler — uma foto — e sai
calado. Não erra, não avisa, não registra. Repara no que é o pecado aqui:
não é ele não saber ler foto. É ele **não dizer** que não sabe.

## Slide 11 (statement + painel + Claude)
**Episódio C — a conta bateu, o estoque não**

🔴 Antes: confirmar a lasanha em **5/5** no painel via `GET
/api/estado-cozinha` (não confiar em ensaio anterior). Depois, colar este
bloco no Claude (evidência real, 22/08, `apoio/evidencia-preservada.md`),
perguntando quem errou.

```
Mensagem no Telegram: "Comemos 3 porções de lasagna, 1 e 1/2 para cada!"

O que o modelo devolveu:
{
  "tipo": "relato_refeicao",
  "descricao": "Comeram 3 porções de lasagna ao total, 1 e 1/2 porção para cada pessoa",
  "data": "2026-08-22",
  "fonte_refeicao": "caseira",
  "item_nome": "lasagna",
  "item_quantidade": 3
}

Estoque, verificado agora:
{ "name": "lasanha", "portions_total": 5, "portions_remaining": 5 }
```

**Script**
Aqui o contexto é diferente dos dois primeiros: não tem erro nenhum
envolvido, é o dia a dia normal da casa. E é exatamente por isso que
importa tanto — o Mediador e a lista de compras decidem em cima do número
que está gravado no estoque. Se esse número mentir, a próxima sugestão de
cardápio parte de um dado errado sem ninguém saber, e a casa pode acabar
comprando comida que já tinha, ou o Mediador sugerindo um prato achando
que sobrou lasanha que já acabou.

Esse aqui desmonta um reflexo que quase todo mundo tem. Eu avisei pelo
Telegram: comemos três porções de lasagna, uma e meia para cada. O bot
reagiu com joinha. Perfeito. Eu só fui conferir o estoque por hábito — não
porque desconfiei de nada, o joinha não dá motivo pra desconfiar. E foi aí
que vi: continua com cinco porções. E quando eu vou ver o registro, ele
entendeu **tudo** certo — que era refeição em casa, que era lasanha, que
eram três porções. Ele até fez a conta do "uma e meia para cada". A
inteligência acertou. Então quem errou?

*(cole no Claude e leia a resposta)*

Eu escrevi "lasagna", com G, e o prato estava salvo como "lasanha", com NH.
Pra mim são a mesma palavra. Pro produto, não eram — e ele não deu baixa. E
o mais perigoso: nada falhou visivelmente. Eu recebi joinha. Se eu não
tivesse ido conferir o estoque, eu nunca saberia.

*(não corrigir esse caso — fica quebrado de propósito, é o gancho da Aula 5)*

## Slide 12 (statement + Claude)
**Episódio D — o hambúrguer que sumiu**

🔴 Colar este bloco no Claude (conversa e traces reais, 14/09,
`apoio/evidencia-porcionamento-patinho.md`), perguntando por que a
interação inteira falhou mesmo com as quatro classificações corretas — e,
na sequência, se o problema foi prompt, dados ou modelo.

```
A conversa (Telegram, 18h17–18h18):
[18:17] Diego: O que vamos comer na sexta?
🤔 (reação, sem texto)
[18:18] Diego: Preparei hambúrguer de patinho, 220g pra mim e 160g pra esposa.
  Tá pronto no congelador, dois de cada. Adicionar ao estoque da geladeira
[18:18] bot: 🤔 Quantas porções rendeu a hambúrguer de patinho? Só quem
  cozinhou sabe — me manda "porcionei hambúrguer de patinho em N".
[18:18] Diego: Porcionei em 2 unidades de 220g e 2 unidades de 160g
[18:18] bot: 🤔 Porcionou o quê, e em quantas porções?
[18:18] Diego: O hambúrguer de patinho
🤔 (reação, sem texto — fim da conversa)

Os quatro traces (classificação de cada mensagem):
1) "O que vamos comer na sexta?" -> {"tipo": "desejo"} — correto
2) "Preparei hambúrguer de patinho, 220g..." -> {"tipo": "porcionamento",
   "item_nome": "hambúrguer de patinho"} — item_quantidade AUSENTE (faltou
   número explícito de unidades); guardrail disparou pergunta, nada gravado
3) "Porcionei em 2 unidades de 220g e 2 unidades de 160g" -> {"tipo":
   "porcionamento"} — item_nome AUSENTE (resposta direta, sem repetir o
   nome do prato); nada gravado
4) "O hambúrguer de patinho" -> {"tipo": "desejo"} — reclassificado como
   desejo, não como resposta pendente; conversa encerra sem gravar nada

Estado final (schema, filtro "%patinho%"):
{ "name": "carne moída patinho", "quantity": 2, "unit": "kg", "state": "base" }
-- nenhum item com state="preparado" e name~"hambúrguer de patinho"
```

**Script**
O quarto eu não fui atrás — e por isso o contexto de negócio aqui é o mais
direto de todos: eu era o próprio usuário, fazendo a coisa mais comum do
mundo pra esse produto, que é registrar o que acabou de cozinhar. Isso
importa porque é o mesmo mecanismo que sustenta o guardrail "pergunte, não
chute": se ele falhar desse jeito, o porcionamento simplesmente não entra
no estoque, e a mediação do dia seguinte decide o cardápio achando que a
geladeira tem menos comida do que realmente tem.

Aconteceu comigo, no dia 14 de setembro, à noite, usando o meu próprio
produto pra valer. Eu preparei um hambúrguer, contei pro bot: nome do
prato, peso de cada porção, quantas porções. Ele fez uma pergunta
razoável — quantas porções rendeu. Eu respondi, no formato que ele mesmo
sugeriu. Ele perguntou de novo, agora de um jeito diferente, como se eu
não tivesse acabado de responder. Foi nesse momento que percebi que algo
estava errado — não porque deu erro, mas porque a pergunta repetida não
fazia sentido pra quem estava do outro lado da conversa. Tentei mais uma
vez, só o nome do prato. E ele desistiu — virou um emoji, silêncio, fim.

Fui direto no Langfuse pegar os quatro registros dessa conversa, e trouxe
pro Claude, junto com o estoque de antes e depois.

*(cole os quatro traces no Claude e leia a resposta)*

Presta atenção no que ele acabou de me mostrar: **as quatro classificações
estão perfeitas.** Zero erro, zero exceção. O hambúrguer que eu de fato
cozinhei? Nunca entrou no estoque. Quatro mensagens reais, uma ação física
de verdade — resultado líquido zero, sem uma falha visível em lugar
nenhum.

E agora eu quero voltar na pergunta que eu fiz no início da aula: o
problema está no prompt, nos dados, ou no modelo? Pergunta pro Claude:
qual dessas três explica o que aconteceu aqui?

*(deixe o Claude responder — a resposta esperada, em substância: nenhuma
das três explica sozinha. O prompt de cada chamada estava correto, os
dados de cada mensagem eram claros, o modelo acertou nas quatro. A causa é
arquitetural — o sistema não guarda memória de conversa entre mensagens.)*

Nenhuma das três. E é por isso que esse caso é diferente dos outros. Nos
episódios A, B e C, o produto em volta do modelo errou de um jeito que eu
conseguia apontar. Aqui, o produto nem chega a errar sozinho — ele só nunca
teve a peça que faltava: lembrar da própria pergunta que ele mesmo fez.

## Slide 13 (statement)
**O que os quatro casos têm em comum**

**Script**
Repara no que eu fiz nos quatro. Em nenhum deles eu abri código pra
descobrir o problema. Eu observei, juntei evidência e perguntei. Nos dois
primeiros o produto falhou em avisar. No terceiro ele avisou que tinha dado
certo, e não tinha — que é pior. E no quarto, cada peça isolada estava
certa, e a soma delas ainda assim falhou completamente.

Reflexo comum quando algo dá errado num produto com IA: "o problema é o
prompt". Nos quatro casos aqui, a inteligência acertou — inclusive no
quarto, quatro vezes seguidas. Quem errou foi o produto em volta dela. E
às vezes nem existe um "errou" pontual: existe uma peça que nunca foi
construída. Cuidar disso é trabalho de quem constrói o produto — é o seu
trabalho.

---

# 4.3 — Corrigindo antes do usuário

## Slide 14 (divisor)
**4.3 Corrigindo antes do usuário**

**Script**
Diagnóstico feito. Agora corrigir — duas correções, nesta ordem, as duas já
no ar.

## Slide 15 (statement, antes/depois)
**Ensinar o produto a dizer "não sei"**

Sem deploy: a correção já está no ar desde 12/09 (PR #4).

**Script**
E aqui está a parte que eu mais gosto. Eu **não** ensinei ele a ler foto.
Ele continuava sem saber ler. O que eu fiz foi ensinar ele a dizer que não
sabe. Antes, uma linha de código só: chegava foto, o produto saía calado.
Depois, a mesma foto — e ele responde: "ainda não sei ler foto de cupom, me
manda o link do QR ou o texto". A capacidade técnica é exatamente a mesma
nos dois lados. O que mudou foi só ele ter dito. E de quebra, aquele
primeiro caso também sumiu: o aviso de erro nunca mais vai apagar a
informação do erro original. Admitir a limitação já é uma correção. O
problema nunca foi não saber ler — foi não dizer.

## Slide 16 (statement)
**Agora sim: ensinar a ler a nota**

🔴 Painel do produto, com um item entrado por nota fiscal em foto.

**Script**
Depois veio a segunda correção: ensinar ele a ler de verdade. E repara na
ordem — primeiro o produto aprendeu a dizer "não sei", depois aprendeu a
saber. Se eu tivesse feito ao contrário, eu teria consertado o sintoma e
deixado o buraco.

E aqui eu preciso ser honesto sobre uma coisa: o desenho que eu imaginei
primeiro não funcionou. Eu achei que bastava a inteligência ler os números
impressos no cupom. Não bastava — o dado oficial só vem pelo link que está
dentro do QR code, e nenhum modelo de visão lê o que não está escrito. Quem
teve a ideia fui eu, e quem descobriu que ela não parava em pé fui eu,
testando. Isso é parte do trabalho, não é fracasso.

---

# 4.4 — Simulando o ciclo completo

## Slide 17 (divisor)
**4.4 Simulando o ciclo completo**

**Script**
Ciclo fechado. Agora a consequência — porque toda correção cria alguma
coisa nova para observar.

## Slide 18 (statement)
**O que essa correção criou**

🔴 Se quiser, painel com os itens novos no estoque.

**Script**
Eu resolvi um problema e criei outro. Agora que entra foto, entra mais
coisa errada no estoque — mais formato, mais leitura, mais chance de item
torto. E aí aquela tela de conferir antes de salvar, que parecia luxo,
virou a próxima coisa a construir. Não porque eu achei: porque a
consequência apareceu.

E tem o outro lado: aquele caso da lasanha continua quebrado neste momento,
e eu escolhi não corrigir. A saída óbvia seria o produto **perguntar**
quando estiver em dúvida, em vez de chutar o nome mais parecido.

Só que — e é aqui que os dois casos se encontram — **esse mecanismo já
existe** no meu produto. É exatamente o que tentou acontecer com o
hambúrguer, no episódio quatro. E não resolveu nada; só produziu mais
pergunta, até o produto desistir sozinho. Então a saída óbvia para um
problema pode já estar quebrada em outro lugar, e eu só vou descobrir isso
olhando os dois juntos.

## Slide 19 (lista)
**Dois riscos, conhecidos e registrados**
- O match de nome (lasanha × lasagna): sem correção, de propósito.
- O porcionamento sem memória de conversa (o hambúrguer): sem correção,
  ainda em aberto.

**Script**
Risco que eu conheço e registro é uma coisa; risco escondido é outra. Os
dois que eu decidi manter até aqui estão anotados, com data, com trace, com
o motivo de eu não ter mexido. É exatamente aí que a próxima aula começa.

---

# 4.5 — O que aprendemos

## Slide 20 (divisor)
**4.5 O que aprendemos**

**Script**
Recapitulando.

## Slide 21 (statement)
**Quatro falhas reais. Nenhuma gritou.**

**Script**
Quatro falhas reais, e nenhuma delas gritou. Três eu fui atrás olhando; a
quarta apareceu sozinha, usando o próprio produto. Eu quero que você
repare no como: em nenhum momento eu li código pra descobrir o problema.
Eu observei, juntei a evidência e perguntei. A inteligência acertou nos
quatro casos — inclusive no mais difícil, quatro vezes seguidas — e ainda
assim o resultado falhou. Quem errou, ou quem nunca chegou a existir, foi
o produto em volta do modelo. Cuidar disso é trabalho de quem constrói o
produto. Corrigir antes do usuário perceber é possível, mas só quando o
dado de produção está visível para você.

## Slide 22 (hero, fechamento)
**Nenhuma falha gritou sozinha.**
Todas foram encontradas olhando.

**Script**
Nenhuma falha gritou sozinha. Todas foram encontradas olhando. Na próxima
aula a gente fecha o curso com o terceiro pilar: guardrails, transparência
e LGPD — e o checklist onde esses riscos que eu escolhi aceitar viram
registro, não segredo. Até lá.
