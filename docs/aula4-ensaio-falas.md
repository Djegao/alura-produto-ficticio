# Aula 4 — script de ensaio: o que fazer e o que dizer, slide a slide

Documento de ensaio para a gravação de 29/08, casado com
[`slides/aula4-alura.pptx`](../slides/aula4-alura.pptx) (19 slides). Cada
entrada traz **Tela** (o que está à vista), **Fazer** (ação concreta) e
**Dizer** (fala sugerida, não decorada — é para soar como você).

Fonte do conteúdo: [`RUNBOOK-gravacao-29-08.md`](./RUNBOOK-gravacao-29-08.md),
[`aula4-roteiro-falha-telegram.md`](./aula4-roteiro-falha-telegram.md) e
[`aula4-inventario-conteudo.md`](./aula4-inventario-conteudo.md). Nenhum número
aqui foi inventado.

> ⚠️ **Este arquivo some do disco durante a Aula 4.** Nos Atos 3 e 4 você faz
> checkout das branches do PR #4 e #6, que não têm os documentos novos. Abra
> este ensaio **no GitHub web**, numa aba separada, antes de começar.

---

## Antes do REC

Estado verificado hoje, 29/08, às 12h — os cinco sinais estão verdes:

| Sinal | Estado |
|---|---|
| Produção | HTTP **401** (Basic Auth), serviço Online |
| Lasanha | **5/5 porções**, 7 dias de preparo |
| Webhook Telegram | 0 pendentes, sem erro |
| `return` mudo em `master` | presente (`telegram.js:163`) |
| PRs #4 e #6 | abertos |

**A faixa de estado do painel foi populada hoje** para a demo não ficar vazia:

- **Vencendo**: espinafre (2 dias), brócolis (5), vagem (6), couve-flor (6)
- **Semana**: teto de 21.000 kcal / R$ 600, saldo cheio
- **Porções vivas**: a lasanha, 5/5 — que é o episódio C

### ✅ A foto do cupom — resolvido e testado ao vivo

O Ato 1 abre com **você mandando a foto do cupom no Telegram**. Isso foi
**verificado hoje às 15h46 UTC**: a foto chegou no grupo e a falha reproduziu
com a assinatura completa do episódio B —

| Onde olhar | Resultado do teste |
|---|---|
| Resposta no Telegram | nada |
| Log do Railway | nenhuma linha além do boot do container |
| Feed (`pensamentos`) | último registro é de 24/08 — nada de hoje |
| Estoque | inalterado |
| `getWebhookInfo` | 0 pendentes, nenhum erro |

Mande **do celular** direto no grupo: funciona e fica mais natural em vídeo.

#### Qual cupom usar — importa a partir do Ato 4

| Cupom | Ato 1 | Ato 4 |
|---|---|---|
| **Supermercado** (café, chocolate, wafer) | ✅ | ✅ **use este** |
| **Tinta / material de construção** | ✅ | ❌ rende zero itens |

O extrator descarta o que não é comida — [`nota-fiscal.js:44`](../nota-fiscal.js):
*"Ignore produtos que nao sao comida ou bebida para cozinhar (limpeza,
higiene, embalagens, produtos de casa em geral)."* Com uma nota de tinta, o
Ato 4 chega no clímax e o estoque não enche. Para o Ato 1 tanto faz, porque o
bot ignora qualquer foto — o conteúdo é irrelevante ali.

#### Duas checagens que só você pode fazer

1. **O QR precisa decodificar.** O PR #6 depende do link dentro do QR code
   (é o achado: a SEFAZ-SP exige um hash que não está impresso no cupom).
   Aponte a câmera do celular para o cupom e confirme que o link da SEFAZ
   abre. Se não abrir, o Ato 4 não fecha.
2. **🔴 Cubra CPF antes de filmar.** O cupom de tinta traz um CPF de
   consumidor e o nome da vendedora. Dado pessoal em quadro num curso
   publicado é problema — ainda mais neste curso, cuja Aula 5 é sobre LGPD.
   O cupom do supermercado não tem CPF de consumidor.

### Janelas para alt+tab, na ordem de uso

1. Telegram Web (grupo da casa) · 2. Langfuse · 3. Terminal no repo ·
4. Este ensaio + RUNBOOK no GitHub web · 5. `aula4-alura.pptx` ·
6. chef.workshopee.com.br autenticado

**Não** deixe a aba de Pull Requests aberta. Número de PR e ordem de branch
são o seu fluxo de trabalho, não o conteúdo da aula — se aparecerem em
quadro, o aluno tenta entender e se perde do problema.

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

### Quatro avisos que se repetem na aula

- **Lag do Langfuse: ~45 s** entre a chamada e o trace ficar consultável.
  Avise a turma **antes** de mostrar a tela, senão alguém acha que sumiu.
- **O log só fala em caso de erro.** Nunca diga "o log está vazio, logo nada
  aconteceu" — com uma requisição bem-sucedida ele fica igualmente vazio.
  Detalhe completo no Ato 1.
- **Nada aqui é bug acidental.** As quatro falhas foram preservadas de
  propósito. Diga isso em voz alta pelo menos uma vez.
- **`railway up` não foi testado nesta máquina.** Ele aparece pela primeira
  vez no Ato 3. Se travar, o plano B é rodar local com `railway run npm start`
  e narrar o deploy em vez de executá-lo.

---

## Vídeo 4.1 — Detectando degradação

### Slide 1 — Capa

**Tela**: capa do deck.
**Fazer**: nada além de apresentar. Não mostre terminal ainda.

**Dizer**:
> "Nas três primeiras aulas a gente construiu o instrumental: critérios de
> qualidade, evals, e observabilidade com o Langfuse. Hoje esse instrumental
> encontra a realidade. Eu vou abrir a operação real do Chef Caseiro — em
> produção, com dados reais — e a gente vai fazer o ciclo completo: detectar
> uma falha, diagnosticar a causa, e corrigir antes do usuário perceber. E
> eu adianto: o produto está quebrado agora, enquanto eu falo. De propósito."

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
> uma coisa: neste momento, enquanto a gente olha essa tela, existem **três
> falhas ativas** aqui dentro. Uma delas está bem na sua frente e você não
> tem como ver. É esse o problema da aula: falha que não grita é a regra,
> não a exceção. Detectar é trabalho ativo — não é esperar o alarme."

**Cuidado**: não abra o GitHub aqui. O aluno não precisa saber como você
organiza branch e pull request — isso é o seu fluxo de trabalho, não o
conteúdo. O que importa é o problema e o dado.

### Slide 4 — Eixo de custo, por operação

**Tela**: slide claro com a tabela.
**Fazer**: nenhum comando. Deixe a tabela na tela enquanto fala.

**Dizer**:
> "Isso aqui não é estimativa, é o que o Langfuse registrou: 68 traces, de 27
> de julho a 22 de agosto, um dólar e sessenta e cinco no total. Repare na
> primeira linha. O Mediador de cardápio rodou dez vezes — de sessenta e
> oito. É quinze por cento das chamadas. E ele come sessenta e oito por cento
> da conta. Onze centavos por chamada, quarenta e cinco segundos de latência."

### Slide 5 — 15% das chamadas, 68% da conta

**Dizer**:
> "Essa assimetria é o primeiro sinal de degradação que a gente consegue ver
> sem nenhum usuário reclamar. E ela muda decisão de produto: não adianta
> otimizar o agente de ingestão, que é barato e roda trinta vezes. O mesmo
> agente de ingestão, aliás, já rodou nos dois modelos, mesma tarefa e mesmo
> prompt: o Haiku saiu 1,9 vez mais barato e 2,5 vezes mais rápido que o
> Sonnet. Custo e latência viram eixos que você troca ao vivo — e a gente vai
> trocar."

### Ainda no 4.1 — Ato 1: **a falha ao vivo**

Este é o momento sem slide. Vá para o Telegram.

**Fazer**, nesta ordem. **O passo 1 é o que dá força a todo o resto** — sem
ele, você não tem com o que comparar:

1. **Telegram** → mande uma mensagem de **texto**: *"comprei tomate"*.
   Funciona: o bot reage, o item entra no estoque.
2. **Painel** → mostre o pensamento novo no feed.
3. **Langfuse** → mostre o trace dessa mensagem.
4. **Telegram** → agora mande a **foto do cupom**. Nada acontece.
5. **Painel** → feed inalterado. **Langfuse** → nenhum trace novo.
6. **Terminal** → `railway logs --http --lines 20` ← **é este, não o log do app**
7. **Terminal** → `getWebhookInfo` → 0 pendentes, sem erro.

```bash
railway logs --http --lines 20
```

```bash
curl.exe "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

> ⚠️ **Sempre com `--lines`.** Sem esse flag o `railway logs` entra em
> *streaming* e fica anexado esperando linhas novas — parece que o terminal
> travou. Não travou; só não há mais nada para chegar. (`Ctrl+C` sai.) Com
> `--lines` ele busca o histórico, imprime e devolve o prompt. Rode de dentro
> da pasta do repo, onde o projeto está linkado.

O quadro que se forma na tela:

| | Texto ("comprei tomate") | Foto do cupom |
|---|---|---|
| Resposta do bot | ✅ | ❌ |
| Feed / banco | ✅ | ❌ |
| Trace no Langfuse | ✅ | ❌ |
| `POST /telegram/webhook` (log HTTP) | 200, chegou | 200, chegou |
| Log da aplicação | **vazio** | **vazio** |

**⚠️ Corrigido em 29/08 — o log do webhook NÃO discrimina sucesso de falha.**
Na primeira versão deste ensaio eu tratei o "200 em poucos milissegundos"
como prova de que nada tinha acontecido. Está errado, e o próprio código
desmente: [`server.js:638-641`](../server.js) responde 200 **imediatamente**,
antes de processar qualquer coisa —

> ```text
> // Responde 200 imediatamente — o Telegram reenvia o update se demorar ou
> // se receber erro. O processamento real acontece depois, fora do request.
> res.sendStatus(200);
> ```

Ou seja: **as duas linhas do log HTTP saem parecidas**, tenha a mensagem sido
processada com sucesso ou não. O log do webhook só prova uma coisa —
**que a mensagem chegou até a porta**. O que aconteceu depois da porta só o
feed e o Langfuse contam.

Isso vira o ponto pedagógico, não um problema a esconder: **uma resposta
rápida não é prova de sucesso — é só uma confirmação de recebimento.** É
uma armadilha real de observabilidade, e vale a pena dizer isso em voz alta
na aula.

> ⚠️ **Sobre o log — corrigido em 29/08, leia antes de gravar.** É tentador
> dizer "o log está vazio, logo nada aconteceu". **Isso é falso**, e um aluno
> atento derruba ao vivo: o produto **só escreve log quando dá erro**. Em
> [`telegram.js`](../telegram.js) todos os `console.*` estão em caminho de
> falha (linhas 21, 101, 231, 255, 286), e [`server.js`](../server.js) só
> loga o boot. Com a mensagem de texto, **que funcionou perfeitamente**, o
> log fica exatamente igual.
>
> O que o log vazio realmente prova é mais estreito: **nenhuma exceção foi
> lançada**. Quem distingue sucesso de silêncio é a tríade *trace + escrita
> no banco + resposta*. Use o log como o quarto elemento, não como o
> primeiro.

**Dizer** (depois do texto funcionar, ao mandar a foto):
> "Agora presta atenção, porque eu vou mandar a mesma coisa por outro
> formato. Foto do cupom... e a gente espera. Nada. Sem reação, sem resposta,
> sem item no estoque. Do lado de quem usa, o produto simplesmente ignorou.
> Vamos procurar o rastro: o feed, que há um minuto registrou o tomate, não
> registrou nada. Langfuse: tinha trace do tomate, não tem trace da foto. E o
> log de HTTP? Chegou — igualzinho ao do tomate. Duzentos, poucos
> milissegundos. E é aqui que eu preciso ser honesto com vocês: esse número
> não me ajuda. Esse produto sempre responde rápido pro Telegram, antes de
> processar qualquer coisa — se ele demorasse, o Telegram ia achar que deu
> erro e mandaria a mensagem de novo. Então o duzentos rápido só prova uma
> coisa: que a mensagem chegou até a porta. O que aconteceu depois da porta,
> só o feed e o Langfuse contam — e os dois estão em silêncio. Essa é uma
> armadilha real, e vale guardar: **resposta rápida não é prova de sucesso,
> é só confirmação de recebimento.** Então a pergunta que abre esta aula é:
> se o canal confirma a entrega, e nada do que vem depois deixa rastro, onde
> está a mensagem?"

#### Os únicos comandos que você digita neste ato

Tudo o mais é clique, leitura de tela ou fala. **Rode de dentro da pasta do
repo** — o link do Railway é por diretório:

```bash
cd "C:\Users\PC Studio 2\Desktop\6498 Evals\alura-produto-ficticio"
```

```bash
railway logs --http --lines 20
```

```bash
curl.exe "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

Qualquer outra coisa que apareça neste documento em fonte de código —
`POST /api/telegram/webhook 200 3ms`, `GET /api/estado-cozinha 200 1819ms` —
é **saída de tela**, para ler e apontar, nunca para digitar.

#### Preparação de tela — deixe pronto ANTES de gravar o ato

| Janela | Estado exato |
|---|---|
| Telegram Web | grupo **Musa Balance** aberto, campo de mensagem focado |
| Painel | `chef.workshopee.com.br` já autenticado, **na aba do feed**, rolado até o topo |
| Langfuse | `us.cloud.langfuse.com` → projeto do Chef Caseiro → **Tracing → Traces**, ordenado por mais recente |
| Terminal | **dentro de `alura-produto-ficticio`** (o link do Railway é por diretório), prompt limpo |

#### Onde olhar em cada ferramenta

- **Painel** → o tomate aparece como um item novo no topo do feed, tipo
  `aquisicao`, e o item entra na despensa.
- **Langfuse** → o trace mais recente no topo da lista. Abra e mostre que ele
  tem as chamadas de modelo dentro. O da foto simplesmente **não existe** —
  não há o que abrir.
- **Terminal** → na saída do `--http`, as linhas do webhook são
  `POST /api/telegram/webhook`. Elas saem **parecidas** para o tomate e para
  a foto — o produto responde rápido nos dois casos, por desenho. Não use
  essa linha para provar nada; use-a só para mostrar que a mensagem chegou.

#### ⚠️ Armadilhas — as três primeiras quebram o ato ao vivo

1. **O painel NÃO atualiza sozinho. Aperte F5.** Não há polling, SSE nem
   WebSocket em [`public/app.js`](../public/app.js) — verificado. Se você
   mostrar o feed sem recarregar, o tomate **não estará lá**, e você vai
   parecer estar provando o contrário do que quer. (Isso é decisão explícita
   de produto, registrada no `CLAUDE.md`: virou exercício de aula sobre
   observabilidade. Se quiser, use o próprio F5 como piada — "esse recarregar
   aqui é assunto da próxima aula".)
2. **Langfuse tem ~45 s de lag.** Mande o "comprei tomate" **no começo do
   ato** e só volte ao Langfuse depois de ter feito outra coisa. Nunca mande
   e olhe em seguida: você vai mostrar uma lista sem o trace e desmentir a si
   mesmo. Avise a turma do lag antes, sempre.
3. **`railway logs` sem `--lines` fica em streaming** e parece travar (não
   travou — está escutando; `Ctrl+C` sai). Use sempre
   `railway logs --http --lines 20`, de dentro da pasta do repo.
3b. **🔴 O log HTTP tem retenção curta — minutos, não a aula inteira.**
   Verificado ao vivo: tráfego de ~30 min atrás já não aparecia mais no
   `--http --lines`, e tráfego gerado na hora apareceu na mesma hora. Rode o
   comando **logo depois** de mandar a foto — não deixe outras falas ou
   passos entre o envio e a checagem, ou a linha pode já ter expirado do
   buffer. Se sair vazio, não é bug: mande a foto de novo e confira em
   seguida.
4. **Não use o tempo do webhook como prova de nada.** Ele responde rápido
   pro tomate e pra foto, sempre — é assim que o produto foi desenhado
   (confirma recebimento antes de processar). Se alguém perguntar "por que
   os dois são rápidos", essa é a resposta, e ela **é** o ponto pedagógico,
   não um furo.
5. **Mande "comprei tomate", não um relato de refeição.** Relato que nomeia um
   prato mexe em `portions_remaining`, e a lasanha precisa continuar em **5/5**
   para o episódio C do vídeo 4.2.
6. **Mande foto, não o link do QR.** Link é texto: cai no classificador de
   conversa e **faz alguma coisa** — o que destrói o silêncio que você está
   demonstrando. O episódio B é especificamente sobre formato não-texto.
7. **Evite recarregar o painel muitas vezes antes do ato.** Cada carga suja o
   log HTTP com uma dezena de `GET`, e você vai ter que caçar o `POST` no meio
   delas na hora de apontar.

#### Se algo sair diferente

- **A foto produziu alguma coisa** (resposta, item, trace): você mandou link
  ou texto junto. Mande de novo, só a imagem, sem legenda.
- **O `POST /api/telegram/webhook` não aparece no log HTTP**: a mensagem não
  chegou ao app. Aí é problema de rede ou de webhook, não é o episódio B —
  confira o `getWebhookInfo` antes de seguir.
- **O tomate não apareceu nem após F5**: pare o ato. Isso é uma falha nova,
  não a preservada. Use as evidências já capturadas em
  [`aula4-inventario-conteudo.md`](./aula4-inventario-conteudo.md) e siga.

---

## Vídeo 4.2 — Diagnosticando a causa

### Slide 6 — Divisor 4.2

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

**Dizer**:
> "Segunda parte: diagnosticar. E eu quero separar bem três coisas que
> costumam ser confundidas: problema de prompt, problema de dados e problema
> de modelo."

### Slide 7 — Episódio A: dois erros, ou um só?

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

### Slide 8 — Episódio B: a falha perfeitamente silenciosa

**Tela**: slide → Claude.

**Fazer**: junte na tela as evidências que você já coletou no Ato 1 (sem
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

### Slide 9 — Episódio C: a conta bateu, o estoque não

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

### Slide 10 — O que os três casos têm em comum

**Dizer**:
> "Repara no que eu fiz nos três. Em nenhum deles eu abri código para
> descobrir o problema. Eu observei, juntei evidência e perguntei. Nos dois
> primeiros o produto falhou em avisar. No terceiro ele avisou que tinha dado
> certo, e não tinha — que é pior. E o ponto que eu quero deixar: quando algo
> dá errado num produto com IA, o reflexo é dizer 'o problema é o prompt'.
> Nos três casos aqui, a inteligência acertou. Quem errou foi o produto em
> volta dela. E cuidar disso é trabalho de quem constrói o produto — é o seu
> trabalho."

---

## Vídeo 4.3 — Corrigindo antes do usuário

### Slide 11 — Divisor 4.3

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

**Dizer**:
> "Diagnóstico feito. Agora corrigir — e são duas correções, nesta ordem, as
> duas indo para o ar agora."

### Slide 12 — Ensinar o produto a dizer "não sei"

**Tela**: slide → terminal (opcional) → Telegram.

**Fazer** — os comandos são seus, não da aula. Se preferir, **esconda o
terminal e narre só o efeito**:

```bash
git checkout aula4/fix-diagnostico-telegram
```

```bash
railway up --service chef-caseiro --detach
```

Enquanto sobe, narre. Quando terminar, **mande a foto de novo**: agora o bot
responde dizendo o que não consegue fazer.

**Dizer**:
> "E aqui está a parte que eu mais gosto. Eu **não** ensinei ele a ler foto.
> Ele continua sem saber ler. O que eu fiz foi ensinar ele a dizer que não
> sabe. Olha só — mando a mesma foto, e agora ele responde: 'ainda não sei ler
> foto de cupom, me manda o link do QR ou o texto'. E de quebra, aquele
> primeiro caso também sumiu: o aviso de erro nunca mais vai apagar a
> informação do erro. Admitir a limitação já é uma correção. O problema nunca
> foi não saber ler — foi não dizer."

**Cuidados**: este é o primeiro `railway up` do dia. Se travar, vá para o
plano B (rodar local) em vez de insistir na tomada.

### Slide 13 — Agora sim: ensinar a ler a nota

**Fazer**:

```bash
git checkout aula4/nota-por-foto
```

```bash
railway up --service chef-caseiro --detach
```

Mande a foto pela **terceira** vez. Os itens entram no estoque.

**Dizer**:
> "Agora sim: vamos ensinar ele a ler. E repara na ordem — primeiro o produto
> aprendeu a dizer 'não sei', depois aprendeu a saber. Se eu tivesse feito ao
> contrário, eu teria consertado o sintoma e deixado o buraco. Manda a foto...
> e olha o estoque enchendo, com o dado oficial da nota. E aqui eu preciso ser
> honesto sobre uma coisa: o desenho que eu imaginei primeiro não funcionou.
> Eu achei que bastava a inteligência ler os números impressos no cupom. Não
> bastava — o dado oficial só vem pelo link que está dentro do QR code. Quem
> teve a ideia fui eu, e quem descobriu que ela não parava em pé fui eu,
> testando. Isso é parte do trabalho, não é fracasso."

---

## Vídeo 4.4 — Simulando o ciclo completo

### Slide 14 — Divisor 4.4

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

**Dizer**:
> "Ciclo fechado. Agora a consequência — porque toda correção cria alguma
> coisa nova para observar."

### Slide 15 — O que essa correção criou

**Tela**: slide. Se quiser, painel com os itens novos no estoque.

**Dizer**:
> "Eu resolvi um problema e criei outro. Agora que entra foto, entra mais
> coisa errada no estoque — mais formato, mais leitura, mais chance de item
> torto. E aí aquela tela de conferir antes de salvar, que parecia luxo,
> virou a próxima coisa a construir. Não porque eu achei: porque a
> consequência apareceu. E tem o outro lado: aquele caso da lasanha continua
> quebrado neste momento, e eu escolhi não corrigir. A saída provável nem é
> um jeito mais esperto de comparar nomes — é o produto **perguntar** quando
> estiver em dúvida. O ponto é: risco que eu conheço e registro é uma coisa;
> risco escondido é outra. E é exatamente aí que a próxima aula começa."

---

## Vídeo 4.5 — O que aprendemos

### Slide 16 — Divisor 4.5

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

**Dizer**: (transição curta)
> "Recapitulando."

### Slide 17 — O que aprendemos

**Dizer**:
> "Três falhas reais, e nenhuma delas gritou. Todas apareceram porque eu fui
> olhar. E eu quero que você repare no como: em nenhum momento eu li código
> para descobrir o problema. Eu observei, juntei a evidência e perguntei. A
> inteligência acertou nos três casos — quem falhou foi o produto em volta
> dela, e cuidar disso é trabalho de quem constrói o produto. Corrigir antes
> do usuário perceber é possível, mas só quando o dado de produção está
> visível para você."

### Slide 18 — Fechamento

**Dizer**:
> "Nenhuma falha gritou sozinha. Todas foram encontradas olhando. Na próxima
> aula a gente fecha o curso com o terceiro pilar: guardrails, transparência
> e LGPD — e o checklist onde esses riscos que eu escolhi aceitar viram
> registro, não segredo. Até lá."

---

## Depois de gravar

```bash
git checkout master
```

Isso traz de volta os documentos e devolve o working tree ao estado de
`master`. **Produção fica com o código do PR #6** — se você quiser reproduzir
os atos numa regravação, é preciso subir a `master` de novo:

```bash
railway up --service chef-caseiro --detach
```

Os quatro itens que eu criei para popular a faixa (espinafre, brócolis, vagem,
couve-flor) podem ser apagados pela rota `/api/estoque/:id`; os IDs estão no
histórico desta sessão. O teto da semana expira sozinho na virada.
