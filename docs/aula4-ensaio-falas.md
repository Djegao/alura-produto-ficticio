# Aula 4 — script de ensaio: o que fazer e o que dizer, slide a slide

> ✅ **Reescrito em 14/09** para o formato de evidência congelada — o mesmo
> método validado nas Aulas 2 e 3. **Sem checkout de branch, sem deploy ao
> vivo, sem reprodução ao vivo de bug no Telegram.** As correções dos PRs
> #4 e #6 já estão mergeadas e em produção desde 12/09; a Aula 4 narra o
> antes/depois com a evidência real que já foi extraída, não reproduz nada
> na hora.

Documento de ensaio casado com
[`slides/aula4-alura.pptx`](../slides/aula4-alura.pptx) (19 slides). Cada
entrada traz **Tela** (o que está à vista), **Fazer** (ação concreta, quando
houver) e **Dizer** (fala sugerida, não decorada — é para soar como você).

**Voz desta aula**: a mesma das Aulas 2 e 3 — você é product builder, não
engenheiro. Observa, junta evidência e pergunta (a Claude, nos episódios
A/B/C). Nenhum slide fala em arquivo, linha ou nome de função — e a fala
também não deve, exceto quando citada como resposta de uma conversa real com
o Claude.

Fonte da evidência:
[`apoio/evidencia-preservada.md`](./apoio/evidencia-preservada.md) (episódios
do truncamento e da lasanha, extraídos em 09/09),
[`apoio/antes-depois-codigo.md`](./apoio/antes-depois-codigo.md) (o código
antes/depois das correções) e
[`apoio/evidencia-porcionamento-patinho.md`](./apoio/evidencia-porcionamento-patinho.md)
(o episódio D, achado ao vivo em 14/09). Nenhum número aqui foi inventado.

---

## Antes do REC

### Estado necessário

| Item | Como deixar |
|---|---|
| Branch | **`gravacao/aulas-3-e-4-material`** — única branch de trabalho |
| Produção | com os PRs #4 e #6 mergeados — responde 401, sem falhas ativas de canal |
| Langfuse | autenticado; a janela de retenção (~30 dias) já comeu o trace do truncamento (12/08) — use a evidência congelada, não tente reabrir |

Confirme antes de gravar:

```bash
curl.exe -s -o NUL -w "producao: HTTP %{http_code}\n" https://chef.workshopee.com.br
```

**401 é bom.** Não há mais checkout nem deploy para verificar — o estado do
produto é o mesmo do início ao fim da aula.

### O que ainda está genuinamente ativo hoje

Duas falhas continuam no ar, sem correção — e são as duas que sustentam esta
aula:

1. **O match de nome (episódio C, lasanha × lasagna).** Preservado de
   propósito. O trace original (22/08) sai da retenção por volta de
   **21/09** — a evidência já está congelada, então isso não é urgente, mas
   não tente reabrir o trace ao vivo perto dessa data.
2. **O porcionamento sem memória de conversa (episódio D, achado em
   14/09).** Ainda em aberto — nenhuma decisão tomada sobre corrigir. Se
   for demonstrar o estoque na tela, **não tente reproduzir o episódio D ao
   vivo mandando mensagem real no Telegram**: qualquer relato de refeição
   que nomeie a lasanha também baixa as porções (a correção do episódio D,
   se vier a existir, e o comportamento de match do episódio C são
   independentes — mas os dois mexem no mesmo prato).

### Janelas para alt+tab

1. `aula4-alura.pptx` · 2. Este ensaio (local ou GitHub web — não some mais
   do disco, não precisa ser aba separada) · 3. Painel do produto
   (`chef.workshopee.com.br`, autenticado), só para os episódios que pedem
   tela do estoque.

### Os divisores azuis são a claquete da edição

Os cinco slides de fundo azul chapado (4.1, 4.2, 4.3, 4.4, 4.5) não são só
transição pedagógica: **é por eles que o editor corta os vídeos**. O azul
full-bleed com número grande no centro existe para ser achável na varredura
da timeline.

O que isso exige de você, em cada um dos cinco:

- **Segure 2 segundos em silêncio** com a claquete em tela antes de começar a
  falar. Sem essa folga, o editor não tem onde cortar sem comer sua primeira
  palavra.
- **Nunca pule o divisor** para "ganhar tempo" — sem ele o vídeo não tem
  marca de início.
- **Não fale por cima da transição.** Entre, respire, e só então comece.

Isso vale para os cinco decks do curso, não só para a Aula 4.

### Avisos que se repetem na aula

- **O log só fala em caso de erro.** Nunca diga "o log está vazio, logo nada
  aconteceu" — com uma requisição bem-sucedida ele fica igualmente vazio.
  Detalhe completo no episódio B.
- **Nada aqui é bug acidental — nem coincidência.** O episódio C foi
  preservado de propósito. O episódio D não foi procurado; apareceu usando
  o produto de verdade, na noite de 14/09. Diga isso em voz alta.
- **Ao citar o Claude nos episódios A/B/C, não corrija a resposta dele no
  ar.** Se ele for por outro caminho, redirecione com pergunta, não com a
  resposta pronta — a aula é sobre conduzir o diagnóstico, não sobre acertar
  de primeira.

---

## Vídeo 4.1 — Detectando degradação

### Slide 1 — Capa

**Tela**: capa do deck.
**Fazer**: nada além de apresentar. Não mostre terminal ainda.

**Dizer**:
> "Nas três primeiras aulas a gente construiu o instrumental: critérios de
> qualidade, evals, e observabilidade com o Langfuse. Hoje esse instrumental
> encontra a realidade. Eu vou abrir a operação real do meu produto — em
> produção, com dados reais — e a gente vai fazer o ciclo completo: detectar
> uma falha, diagnosticar a causa, e corrigir antes do usuário perceber. Já
> adianto: encontrei quatro falhas reais fazendo exatamente isso. Duas eu
> corrigi. Uma eu decidi manter, de propósito. E a quarta apareceu ontem à
> noite, sem eu estar procurando — enquanto eu simplesmente usava o meu
> próprio produto."

### Slide 2 — Divisor 4.1

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

**Tela**: divisor azul.
**Dizer**:
> "Primeira parte: detectar. E detectar é mais difícil do que parece, porque
> a falha interessante quase nunca grita."

### Slide 3 — O estado em produção hoje

**Tela**: slide de bullets. Depois abra **chef.workshopee.com.br** e mostre o
produto funcionando: a faixa de estado, o feed, o estoque.
**Fazer**: nenhum comando. Deixe o produto na tela — a força do slide é o
contraste entre "parece saudável" e "tem três falhas ativas".

**Dizer**:
> "Antes de procurar defeito, olha o produto. Está no ar, responde, tem dado
> real, e cada sugestão dessas custou dinheiro de verdade em chamada de
> modelo. Nenhum alarme disparou. Ninguém abriu chamado. E eu vou te dizer
> uma coisa: neste momento, enquanto a gente olha essa tela, existem **duas
> falhas ativas** aqui dentro — uma que eu decidi manter de propósito, e
> outra que eu descobri ontem, sem estar nem procurando. As duas estão bem
> na sua frente e você não tem como ver. É esse o problema da aula: falha que
> não grita é a regra, não a exceção. Detectar é trabalho ativo — não é
> esperar o alarme."

**Cuidado**: não abra o GitHub aqui. O aluno não precisa saber como você
organiza branch e pull request — isso é o seu fluxo de trabalho, não o
conteúdo. O que importa é o problema e o dado.

### Slide 4 — Eixo de custo, por operação

> Números revalidados em 14/09 — mesmo recorte da Aula 3, pra continuidade.
> Confira de novo perto da gravação (o Langfuse retém ~30 dias, a janela
> anda).

**Tela**: slide claro com a tabela.
**Fazer**: nenhum comando. Deixe a tabela na tela enquanto fala.

**Dizer**:
> "Isso aqui não é estimativa, é o que o Langfuse registrou, no mesmo recorte
> que eu mostrei na aula passada: trinta e oito interações, um dólar e
> cinquenta e três no total. Repare na primeira linha. O Mediador de cardápio
> rodou dez vezes — de trinta e oito. Pouco mais de um quarto das chamadas.
> E ele come nove de cada dez dólares da conta. Quatorze centavos por
> chamada, cinquenta e seis segundos de latência."

### Slide 5 — 26% das chamadas, 90% da conta

**Dizer**:
> "Essa assimetria é o primeiro sinal de degradação que a gente consegue ver
> sem nenhum usuário reclamar. E ela muda decisão de produto: não adianta
> otimizar o agente de ingestão, que é barato e roda quase metade das vezes.
> Custo e latência viram eixos que você troca ao vivo — foi o que eu fiz na
> aula passada, trocando o modelo de classificação e comparando na hora."

### Slide 6 — A falha que não deixou rastro

> Substitui a demonstração ao vivo no Telegram (não é mais reproduzível: o
> episódio B foi corrigido pelo PR #4, já mergeado). A evidência é real,
> capturada em 22/08 e preservada em
> [`apoio/evidencia-preservada.md`](./apoio/evidencia-preservada.md).

**Tela**: slide com a tabela dos cinco lugares onde procurei.

**Dizer**:
> "Deixa eu te contar como eu encontrei a primeira. Um dia desses eu mandei
> uma foto de um cupom fiscal pro bot, pelo Telegram — coisa mais normal do
> mundo pra quem usa o produto. E não aconteceu nada. Nenhuma resposta,
> nenhuma reação, nenhum item novo no estoque.
>
> Comecei a procurar o rastro. Resposta no Telegram: nada. Log da
> aplicação: nenhuma linha. Trace no Langfuse: nenhum trace. Banco de
> dados: nada.
>
> E aí eu fiz a pergunta óbvia pro próprio Telegram: você entregou essa
> mensagem? E a resposta foi sim — zero pendências, zero erro de entrega.
>
> Junta tudo: o canal confirma que entregou, e o meu produto não tem
> absolutamente nenhum registro de ter recebido nada. Se o dado confirma a
> entrega e o meu sistema não tem rastro nenhum — onde essa mensagem foi
> parar?"

**Dizer** (fechando o gancho, sem resolver ainda):
> "Essa é a categoria de falha mais perigosa que existe. Um erro que grita
> tem stack trace, tem alerta, alguém acorda. Uma ausência não dispara nada
> — não existe monitor que avise que uma coisa que deveria ter acontecido
> não aconteceu, a menos que alguém já tenha pensado nisso antes. Eu vou
> voltar nesse caso já já."

---

## Vídeo 4.2 — Diagnosticando a causa

### Slide 7 — Divisor 4.2

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

**Dizer**:
> "Segunda parte: diagnosticar. E eu quero separar bem três coisas que
> costumam ser confundidas: problema de prompt, problema de dados e problema
> de modelo."

### Slide 8 — Episódio A: dois erros, ou um só?

**Tela**: slide → **Claude** (deixe a janela pronta antes do vídeo).

**Fazer**: leia as duas linhas de erro em voz alta, **cole no Claude** e faça a
pergunta do slide. Deixe a resposta aparecer na tela enquanto você lê junto
com a turma.

**Dizer**:
> "Eu tenho duas linhas de erro aqui. E a minha primeira leitura foi a óbvia:
> aconteceram dois problemas. Só que tem uma coisa esquisita — olha o horário
> das duas. A diferença entre elas é de oito milionésimos de segundo. Eu não
> sei o que essa mensagem de erro quer dizer, e sinceramente não é o meu
> trabalho saber. O meu trabalho é perceber que tem algo estranho e levar
> para quem sabe. Então eu pego as duas linhas e pergunto."

*(cole no Claude e leia a resposta)*

> "Olha o que ele me diz. Não foram dois erros. Foi um só — e o segundo é o
> próprio produto tentando me avisar do primeiro, e falhando nessa tentativa.
> Quando ele falhou em avisar, ele apagou a informação do erro original. Ou
> seja: o aviso comeu a evidência. Guarda essa, porque o próximo caso é o
> oposto exato."

**Cuidados**:

- **Não corrija o Claude no ar.** Se ele for por outro caminho, redirecione
  com pergunta — *"e o intervalo de tempo entre as duas, te diz alguma coisa?"* —
  em vez de dar a resposta. A aula é sobre conduzir, não sobre acertar.
- Se a resposta vier longa, **leia só a conclusão**. Rolar tela em silêncio
  mata o ritmo.

### Slide 9 — Episódio B: a falha perfeitamente silenciosa

**Tela**: slide → Claude.

**Fazer**: junte na tela as evidências já mostradas no slide 6 (sem
resposta, sem item no feed, sem trace no Langfuse, mas entrega confirmada
pelo Telegram), cole no Claude, faça a pergunta.

**Dizer**:
> "Esse é diferente, e é o mais assustador. No caso anterior eu pelo menos
> tinha erro para olhar. Aqui não tem nada. O Telegram confirma que entregou.
> Não existe registro nenhum da conversa — nem no feed, nem no Langfuse. E o
> meu produto respondeu 'recebido' — só que esse 'recebido' ele manda sempre,
> antes de processar qualquer coisa, então não prova nada sozinho. A mensagem
> entrou, e depois disso sumiu sem deixar rastro."

*(cole no Claude e leia a resposta)*

> "E aqui está: existe um caminho dentro do produto em que ele recebe a
> mensagem, percebe que é um formato que não sabe ler — uma foto — e sai
> calado. Não erra, não avisa, não registra. Repara no que é o pecado aqui:
> não é ele não saber ler foto. É ele **não dizer** que não sabe."

**Cuidados**:

- **Não abra o GitHub nem o editor de código.** Se o Claude citar arquivo e
  linha, tudo bem — leia a explicação dele, não o código.
- Esse é o momento mais forte da aula. Não corra.

### Slide 10 — Episódio C: a conta bateu, o estoque não

**Tela**: slide → painel (faixa de estado, lasanha em 5/5) → Claude.

**Fazer**: mostre a lasanha ainda em **5/5** no painel, cole o registro da
conversa no Claude, pergunte.

**Dizer**:
> "Esse aqui desmonta um reflexo que quase todo mundo tem. Eu avisei pelo
> Telegram: comemos três porções de lasagna, uma e meia para cada. O bot
> reagiu com joinha. Perfeito. Só que olha o estoque: continua com cinco
> porções. E quando eu vou ver o registro, ele entendeu **tudo** certo — que
> era refeição em casa, que era lasanha, que eram três porções. Ele até fez a
> conta do 'uma e meia para cada'. A inteligência acertou. Então quem errou?"

*(cole no Claude e leia a resposta)*

> "Eu escrevi 'lasagna', com G, e o prato estava salvo como 'lasanha', com
> NH. Para mim são a mesma palavra. Para o produto, não eram — e ele não deu
> baixa. E o mais perigoso: nada falhou visivelmente. Eu recebi joinha. Se eu
> não tivesse ido conferir o estoque, eu nunca saberia."

**Cuidados**:

- **Não corrija esse caso.** Ele fica quebrado de propósito e é o gancho da
  Aula 5. Diga isso em voz alta.
- **Confirme que a lasanha está em 5/5 antes de gravar** — verifique
  `GET /api/estado-cozinha` na hora, não confie em ensaios anteriores.
- 🔴🔴 **O episódio C não é 100% reprodutível ao vivo — risco real, verificado
  em 29/08.** Um teste mandou exatamente a frase do roteiro ("...lasagna...")
  e o **classificador corrigiu a ortografia sozinho** na saída estruturada
  (`item_nome: "lasanha"`, com NH) — o que fez o match funcionar e baixar o
  estoque de verdade (5 → 2). Não foi erro de digitação: o texto de entrada
  usava "lasagna" igualzinho ao roteiro; o modelo que normalizou ao
  classificar. Em 22/08 (o incidente original, documentado no `CLAUDE.md`) o
  modelo preservou "lasagna" e o bug apareceu — mesma frase, resultado
  diferente. É não-determinismo do classificador, fora do seu controle.
  **Planos**:
  1. Se for demonstrar ao vivo, **tenha plano B pronto**: as evidências já
     capturadas em 22/08, em
     [`aula4-inventario-conteudo.md`](./aula4-inventario-conteudo.md), para
     narrar por cima se a reprodução ao vivo não bater.
  2. Se quiser tentar mesmo assim, **valide nos bastidores antes de gravar**
     — mande a frase, confira no Langfuse se `item_nome` saiu como
     "lasagna" (bug) ou "lasanha" (corrigido). Só grave a tomada se bateu.
  3. Se o match funcionar sem querer de novo, restaure com um `PATCH` direto
     no Supabase em `pantry_items` (`portions_remaining: 5`) — o bug do
     código continua intacto, é só o dado que precisa voltar.

### Slide 11 — Episódio D: o hambúrguer que sumiu

> Achado em **14/09**, ao vivo, sem ensaio — a evidência mais fresca do
> curso. Completa em
> [`apoio/evidencia-porcionamento-patinho.md`](./apoio/evidencia-porcionamento-patinho.md).

**Tela**: slide → **Claude** (mesma janela dos episódios A/B/C).

**Fazer**: reconstrua os quatro balões da conversa real (estão no slide),
cole os quatro traces no Claude, pergunte por que a interação inteira
falhou mesmo com as quatro classificações corretas.

**Dizer**:
> "O quarto eu não fui atrás. Aconteceu comigo, ontem à noite, usando o meu
> próprio produto pra valer. Eu preparei um hambúrguer, contei pro bot: nome
> do prato, peso de cada porção, quantas porções. Ele fez uma pergunta
> razoável — quantas porções rendeu. Eu respondi, no formato que ele mesmo
> sugeriu. Ele perguntou de novo, agora de um jeito diferente, como se eu não
> tivesse acabado de responder. Tentei mais uma vez, só o nome do prato. E
> ele desistiu — virou um emoji, silêncio, fim.
>
> Fui direto no Langfuse pegar os quatro registros dessa conversa, e trouxe
> pro Claude, junto com o estoque de antes e depois."

*(cole os quatro traces no Claude e leia a resposta)*

> "Presta atenção no que ele acabou de me mostrar: **as quatro classificações
> estão perfeitas.** Zero erro, zero exceção. O hambúrguer que eu de fato
> cozinhei? Nunca entrou no estoque. Quatro mensagens reais, uma ação física
> de verdade — resultado líquido zero, sem uma falha visível em lugar
> nenhum."

**Dizer** (o giro — framework quebrando):
> "E agora eu quero voltar na pergunta que eu fiz no início da aula: o
> problema está no prompt, nos dados, ou no modelo? Pergunta pro Claude: qual
> dessas três explica o que aconteceu aqui?"

*(deixe o Claude responder — a resposta esperada, em substância, é que
nenhuma das três explica sozinha: o prompt de cada chamada estava correto,
os dados de cada mensagem eram claros, o modelo acertou nas quatro. A causa é
arquitetural — o sistema não guarda memória de conversa entre mensagens.)*

> "Nenhuma das três. E é exatamente por isso que esse caso é diferente dos
> outros três. Nos episódios A, B e C, o produto em volta do modelo errou de
> um jeito que eu conseguia apontar. Aqui, o produto em volta do modelo nem
> chega a errar sozinho — ele só nunca teve a peça que faltava: lembrar da
> própria pergunta que ele mesmo fez."

**Cuidados**:

- **Não corrija esse caso no ar.** Ainda não há decisão tomada sobre
  consertar — é conteúdo em aberto, como o episódio C.
- **Não tente reproduzir mandando mensagem real no Telegram.** É o mesmo
  aviso do início da aula: qualquer interação real de porcionamento ou de
  relato de refeição pode mexer no estoque de verdade.

---

### Slide 12 — O que os quatro casos têm em comum

**Dizer**:
> "Repara no que eu fiz nos quatro. Em nenhum deles eu abri código para
> descobrir o problema. Eu observei, juntei evidência e perguntei. Nos dois
> primeiros o produto falhou em avisar. No terceiro ele avisou que tinha dado
> certo, e não tinha — que é pior. E no quarto, cada peça isolada estava
> certa, e a soma delas ainda assim falhou completamente.
>
> Reflexo comum, quando algo dá errado num produto com IA: 'o problema é o
> prompt'. Nos quatro casos aqui, a inteligência acertou — inclusive no
> quarto, quatro vezes seguidas. Quem errou foi o produto em volta dela. E
> às vezes nem existe um 'errou' pontual: existe uma peça que nunca foi
> construída. Cuidar disso é trabalho de quem constrói o produto — é o seu
> trabalho."

---

## Vídeo 4.3 — Corrigindo antes do usuário

### Slide 13 — Divisor 4.3

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

**Dizer**:
> "Diagnóstico feito. Agora corrigir — e são duas correções, nesta ordem, as
> duas indo para o ar agora."

### Slide 14 — Ensinar o produto a dizer "não sei"

> Sem deploy: a correção já está no ar desde 12/09. Antes/depois completo
> em [`apoio/antes-depois-codigo.md`](./apoio/antes-depois-codigo.md).

**Tela**: slide com o antes e o depois lado a lado.

**Dizer**:
> "E aqui está a parte que eu mais gosto. Eu **não** ensinei ele a ler foto.
> Ele continuava sem saber ler. O que eu fiz foi ensinar ele a dizer que não
> sabe. Antes, uma linha de código só: chegava foto, o produto saía calado.
> Depois, a mesma foto — e ele responde: 'ainda não sei ler foto de cupom, me
> manda o link do QR ou o texto'. A capacidade técnica é exatamente a mesma
> nos dois lados. O que mudou foi só ele ter dito. E de quebra, aquele
> primeiro caso também sumiu: o aviso de erro nunca mais vai apagar a
> informação do erro original. Admitir a limitação já é uma correção. O
> problema nunca foi não saber ler — foi não dizer."

### Slide 15 — Agora sim: ensinar a ler a nota

**Tela**: painel do produto, com um item entrado por nota fiscal em foto.

**Dizer**:
> "Depois veio a segunda correção: ensinar ele a ler de verdade. E repara na
> ordem — primeiro o produto aprendeu a dizer 'não sei', depois aprendeu a
> saber. Se eu tivesse feito ao contrário, eu teria consertado o sintoma e
> deixado o buraco. E aqui eu preciso ser honesto sobre uma coisa: o desenho
> que eu imaginei primeiro não funcionou. Eu achei que bastava a inteligência
> ler os números impressos no cupom. Não bastava — o dado oficial só vem pelo
> link que está dentro do QR code, e nenhum modelo de visão lê o que não está
> escrito. Quem teve a ideia fui eu, e quem descobriu que ela não parava em
> pé fui eu, testando. Isso é parte do trabalho, não é fracasso."

---

## Vídeo 4.4 — Simulando o ciclo completo

### Slide 16 — Divisor 4.4

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

**Dizer**:
> "Ciclo fechado. Agora a consequência — porque toda correção cria alguma
> coisa nova para observar."

### Slide 17 — O que essa correção criou

**Tela**: slide. Se quiser, painel com os itens novos no estoque.

**Dizer**:
> "Eu resolvi um problema e criei outro. Agora que entra foto, entra mais
> coisa errada no estoque — mais formato, mais leitura, mais chance de item
> torto. E aí aquela tela de conferir antes de salvar, que parecia luxo,
> virou a próxima coisa a construir. Não porque eu achei: porque a
> consequência apareceu.
>
> E tem o outro lado: aquele caso da lasanha continua quebrado neste momento,
> e eu escolhi não corrigir. A saída óbvia seria o produto **perguntar**
> quando estiver em dúvida, em vez de chutar o nome mais parecido.
>
> Só que — e é aqui que os dois casos se encontram — **esse mecanismo já
> existe** no meu produto. É exatamente o que tentou acontecer com o
> hambúrguer, no episódio quatro. E não resolveu nada; só produziu mais
> pergunta, até o produto desistir sozinho. Então a saída óbvia para um
> problema pode já estar quebrada em outro lugar, e eu só vou descobrir isso
> olhando os dois juntos. Risco que eu conheço e registro é uma coisa; risco
> escondido é outra. E é exatamente aí que a próxima aula começa."

---

## Vídeo 4.5 — O que aprendemos

### Slide 18 — Divisor 4.5

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

**Dizer**: (transição curta)
> "Recapitulando."

### Slide 19 — O que aprendemos

**Dizer**:
> "Quatro falhas reais, e nenhuma delas gritou. Três eu fui atrás olhando; a
> quarta apareceu sozinha, usando o próprio produto. E eu quero que você
> repare no como: em nenhum momento eu li código para descobrir o problema.
> Eu observei, juntei a evidência e perguntei. A inteligência acertou nos
> quatro casos — inclusive no mais difícil, quatro vezes seguidas — e ainda
> assim o resultado falhou. Quem errou, ou quem nunca chegou a existir, foi
> o produto em volta do modelo. Cuidar disso é trabalho de quem constrói o
> produto. Corrigir antes do usuário perceber é possível, mas só quando o
> dado de produção está visível para você."

### Slide 20 — Fechamento

**Dizer**:
> "Nenhuma falha gritou sozinha. Todas foram encontradas olhando. Na próxima
> aula a gente fecha o curso com o terceiro pilar: guardrails, transparência
> e LGPD — e o checklist onde esses riscos que eu escolhi aceitar viram
> registro, não segredo. Até lá."

---

## Depois de gravar

**Não há nada a restaurar.** Nenhum checkout, nenhum deploy aconteceu durante
a gravação — o produto termina no mesmo estado em que começou.

Confira, por hábito:

```bash
curl.exe -s -o NUL -w "producao: HTTP %{http_code}\n" https://chef.workshopee.com.br
```

Os dois riscos que continuam abertos — o match de nome (episódio C) e a
perda de contexto no porcionamento (episódio D) — seguem sem decisão. Se
decidir corrigir algum dos dois, avise antes: os dois aparecem em múltiplos
vídeos desta aula e da Aula 3.
