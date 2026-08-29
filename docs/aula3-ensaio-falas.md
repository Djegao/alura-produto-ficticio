# Aula 3 — script de ensaio: o que fazer e o que dizer, slide a slide

Documento de ensaio casado com [`slides/aula3-alura.pptx`](../slides/aula3-alura.pptx)
(20 slides). Mesma estrutura do ensaio da Aula 4: **Tela** (o que está à
vista), **Fazer** (ação concreta) e **Dizer** (fala sugerida).

**Voz desta aula**: você é product builder, não engenheiro. Você observa,
junta evidência e pergunta. Nenhum slide fala em arquivo, linha, biblioteca
ou variável de ambiente — e a fala também não deve.

---

## Antes do REC

### Estado necessário

| Item | Como deixar |
|---|---|
| Branch | **`master`** — o deck e o script só existem aqui |
| `.env` | **não existe nesta máquina** — o passo `preparar` cria |
| Produção | está com o código da nota por foto (herdado da Aula 4). Não atrapalha: esta aula lê dados, não depende das falhas |
| Langfuse | `us.cloud.langfuse.com`, projeto do Chef Caseiro, autenticado |

### Preparação — rode antes de gravar, não no ar

```bash
powershell -File scripts/observabilidade.ps1 preparar
```

Isso gera o `.env` a partir das variáveis do Railway. Confirme:

```bash
powershell -File scripts/observabilidade.ps1 status
```

Esperado: **LIGADA**. Se disser "sem .env", o `preparar` não rodou.

### 🔴 Três armadilhas que só existem nesta aula

1. **O servidor precisa reiniciar entre o "antes" e o "depois".** O script
   avisa, mas é fácil esquecer no ar: `Ctrl+C` e `npm start` de novo, **toda
   vez** que você ligar ou desligar. Sem reiniciar, nada muda e a demo não
   prova nada.
2. 🔴 **NÃO use o Telegram nesta aula. Use o painel em `localhost:3300`.**
   O webhook do Telegram aponta para `chef.workshopee.com.br` — produção no
   Railway, que tem as variáveis do Langfuse dela e **nunca é desligada** pelo
   script. Se você desligar a observabilidade e mandar pelo Telegram, o trace
   **vai aparecer assim mesmo**, e a demo prova o contrário do que você quer.
   Verificado em 29/08: o trace do teste veio de um container Linux
   (`host.name: a58c1e8a58c4`), não desta máquina. O servidor local só vê o
   que entra pelo painel.
3. **O local escreve no MESMO banco de produção.** Não é ambiente separado.
   Se você mandar uma frase no painel local, ela entra nos dados reais. Use
   sempre **aquisição** — *"comprei tomate"* — e **nunca** um relato que cite
   um prato: isso mexe no estoque de porções.

### O lag de 45 segundos é o inimigo do ritmo

O registro leva ~45 s para aparecer no Langfuse. Não fique olhando a tela
esperando. **Faça a ação, volte para os slides, fale por um minuto, e só
depois vá ao Langfuse.** Avise a turma do lag antes — senão a ausência
parece erro.

### Janelas para alt+tab

1. Terminal (na pasta do repo) · 2. `localhost:3300` (o produto local) ·
3. Langfuse · 4. `aula3-alura.pptx` · 5. Este ensaio no GitHub web

---

## Vídeo 3.1 — O que é observabilidade?

### Slide 1 — Capa

**Dizer**:
> "Na aula passada a gente definiu critérios de qualidade e montou os
> primeiros evals. Só que evals você roda quando quer. Hoje o assunto é o que
> acontece quando você não está olhando — porque o produto está no ar, e ele
> continua trabalhando enquanto você dorme. Eu vou abrir os dados reais do
> Chef Caseiro: quanto ele custou, quanto ele demora, e o que já deu errado
> sem ninguém perceber."

### Slide 2 — Divisor 3.1

**Claquete**: segure 2 s em silêncio antes de falar — é aqui que a edição corta.

### Slide 3 — Eu não vejo o que meu produto faz

**Dizer**:
> "Deixa eu começar pelo desconforto. Enquanto eu construía, eu via tudo:
> testava, olhava a resposta, ajustava. Aí o produto foi pro ar, e ele passou
> a conversar com gente que eu não vejo, na hora em que eu não estou. E aí eu
> descubro que 'ver o log' não resolve — log é um evento solto, e só existe se
> alguém lembrou de registrar aquilo. O que eu preciso é diferente: eu preciso
> conseguir reconstruir **por que** aconteceu, depois, sem ter estado lá."

### Slide 4 — A regra que eu adotei

**Dizer**:
> "Então eu adotei uma regra, e ela é radical de propósito: nenhuma chamada da
> inteligência pode acontecer sem deixar rastro. Nenhuma. Não é enfeite, não é
> 'depois eu vejo' — é a condição para eu conseguir responder qualquer
> pergunta lá na frente. E tem um detalhe que quase me pegou: se o rastro
> começa tarde, o que aconteceu antes some. E some em silêncio, que é o pior
> jeito de sumir."

### Slide 5 — Desligar o rastro não quebra o produto

**Tela**: slide → terminal → `localhost:3300`.

**Fazer** — este é o "antes":

```bash
powershell -File scripts/observabilidade.ps1 off
```

```bash
npm start
```

No produto local, mande **"comprei tomate"**. Funciona normalmente.

**Dizer**:
> "E aqui está a armadilha que faz todo mundo adiar isso. Eu vou desligar a
> observabilidade agora... e olha o produto: funciona igual. Mando 'comprei
> tomate', ele entende, ele registra o item. O usuário não perceberia
> absolutamente nada. Ninguém vai abrir um chamado dizendo 'seu produto está
> sem observabilidade'. Quem fica cego sou eu. É por isso que isso nunca é
> urgente — até o dia em que alguma coisa dá errado e você não tem como saber
> o que foi."

---

## Vídeo 3.2 — Conhecendo o Langfuse

### Slide 6 — Divisor 3.2

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 7 — Três palavras para navegar

**Tela**: slide → Langfuse, lista de interações.

**Fazer**: abra uma interação antiga e mostre os passos por dentro.

**Dizer**:
> "Antes de olhar número, três palavras — e são só três. A primeira,
> **interação**: uma conversa inteira, do pedido até a resposta. É essa a
> unidade que você abre. A segunda, **passo**: cada coisa que aconteceu dentro
> dela — consultar o estoque, pensar, responder. Olha aqui: essa interação
> teve quatro passos, e eu consigo abrir cada um e ver o que entrou e o que
> saiu. E a terceira é **nota** — que é onde a aula passada encontra esta
> aqui. Lembra dos evals que a gente montou? Eles escrevem a avaliação de
> volta, aqui dentro. Hoje são trinta e nove notas, espalhadas em nove
> interações. Então eu não vejo só o que o produto fez: eu vejo o que ele fez
> **e** o quanto aquilo foi bom. Isso é o que eu quero dizer com reconstruir:
> eu não estava aqui quando aconteceu, e mesmo assim eu sigo o caminho todo."

### Slide 8 — Ligando no seu produto

**Tela**: slide → Langfuse, área de configurações do projeto.

**Dizer**:
> "E ligar isso no seu produto é decepcionantemente simples. As chaves saem
> daqui mesmo, das configurações do projeto. São três valores, você copia e
> cola no arquivo de configuração do seu produto, e acabou. É a parte mais
> fácil da aula inteira — e é a que mais gente deixa para depois, porque não
> parece urgente. Aí quando fica urgente, o dado que você queria já não
> existe."

### Slide 9 — Antes e depois, ao vivo

**Tela**: Langfuse (mostrando que o tomate **não** apareceu) → terminal → produto.

**Fazer** — este é o "depois":

1. **Langfuse**: mostre que a interação do tomate não está lá. Nada.
2. Terminal: `Ctrl+C` para parar o servidor.

```bash
powershell -File scripts/observabilidade.ps1 on
```

```bash
npm start
```

3. No produto, mande **outra aquisição** — *"comprei cebola"*.
4. **Volte para os slides e fale por um minuto** enquanto o registro sobe.
5. Só então volte ao Langfuse: a interação está lá, inteira.

**Dizer** (antes de ligar):
> "Vamos conferir o que aconteceu com aquele tomate. Langfuse... nada. A
> interação existiu, o produto funcionou, o item entrou no estoque — e não
> sobrou rastro nenhum. Agora eu ligo de volta."

**Dizer** (depois de ligar e mandar a cebola):
> "Mandei de novo, agora com a observabilidade ligada. E aqui eu preciso
> avisar de uma coisa que assusta quem está começando: o registro leva uns
> quarenta e cinco segundos para aparecer. Não é erro, é fila. Se você olhar
> agora e não achar, você vai achar que quebrou. Então vamos falar de outra
> coisa e voltar aqui daqui a pouco."

*(volte aos slides, fale, e retorne)*

> "Agora sim. Olha ela aqui — a mesma ação de um minuto atrás, registrada
> inteira, com cada passo. A diferença entre as duas não está no produto: o
> produto fez exatamente a mesma coisa. A diferença está no que **eu** consigo
> ver."

---

## Vídeo 3.3 — Lendo os dados de produção

### Slide 10 — Divisor 3.3

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 11 — 61 interações, US$ 1,88 acumulado

**Tela**: slide da tabela. Se quiser, Langfuse com o painel de custos aberto.

**Dizer**:
> "Isso aqui não é exemplo inventado: é o meu produto, no ar, de trinta e um
> de julho a vinte e oito de agosto. Sessenta e uma interações, um dólar e
> oitenta e oito centavos no total. Parece pouco — e é pouco, porque é uma
> casa só. Mas repara na primeira linha: mediar o cardápio aconteceu doze
> vezes e custou doze centavos por vez. E demora cinquenta e um segundos. As
> outras linhas custam centavos de centavo."

### Slide 12 — 20% das chamadas, 76% da conta

**Dizer**:
> "E aí aparece a conclusão que eu não teria de outro jeito. O Mediador é um
> quinto das chamadas do meu produto — e três quartos de tudo que eu pago. Ele
> não é o mais usado. Ele é o mais caro por uso. Isso muda decisão de produto:
> se eu quiser baratear, não adianta mexer na parte que roda trinta e quatro
> vezes, porque ela é quase de graça. E olha que tipo de conclusão é essa: eu
> nunca chegaria nela olhando uma conversa por vez. Só olhando o conjunto."

### Slide 13 — Mesma tarefa, dois modelos

**Dizer**:
> "E tem uma decisão que fica fácil quando você tem o dado. A mesma tarefa,
> exatamente a mesma, rodou nos dois modelos. O mais caro custa quase o dobro
> e demora quase três vezes mais. Para essa tarefa específica — que é só
> entender uma frase curta — o resultado é o mesmo. Então é escolha óbvia. Mas
> repara: ela só é óbvia **porque eu tenho a medição**. Sem isso, é palpite."

---

## Vídeo 3.4 — Padrões de falha

### Slide 14 — Divisor 3.4

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 15 — Quatro falhas que eu achei olhando

**Dizer**:
> "Agora a parte que eu mais gosto, porque é onde a observabilidade deixa de
> ser bonita e vira útil. Eu encontrei quatro falhas reais no meu produto — e
> encontrei todas olhando, não porque alguém reclamou. Uma resposta cortada no
> meio de uma palavra. Um erro engolido, em que o produto teve problema,
> devolveu uma lista vazia e seguiu como se nada tivesse acontecido. Duas
> falhas no canal do Telegram: uma que apagou a própria evidência, e outra que
> não deixou evidência nenhuma. E a quarta, que é a mais perturbadora: uma em
> que a inteligência acertou tudo, e mesmo assim o estoque ficou errado."

### Slide 16 — A resposta cortada no meio

**Tela**: slide → Langfuse, mostrando uma resposta truncada se você tiver o exemplo aberto.

**Dizer**:
> "Essa é a mais fácil de reconhecer, e por isso é a melhor para começar: a
> resposta simplesmente para no meio de uma palavra. Não tem erro, não tem
> aviso — ela só termina. Isso acontece quando o pedido cresce e a resposta
> não cabe mais no limite que eu mesmo configurei lá atrás, quando a despensa
> era menor. E eu deixei sem corrigir de propósito, porque reproduzir isso ao
> vivo é o conteúdo da próxima aula."

### Slide 17 — O que as quatro têm em comum

**Dizer**:
> "E o que essas quatro têm em comum é o que eu quero que fique desta aula.
> Nenhuma delas gritou. Nenhum usuário reclamou de nenhuma. Não teve alarme,
> não teve tela vermelha. Cada uma precisou de alguém olhando o dado certo,
> com a pergunta certa. E esse alguém, no seu produto, é você — não tem outra
> pessoa para fazer isso."

---

## Vídeo 3.5 — O que aprendemos

### Slide 18 — Divisor 3.5

**Claquete**: segure 2 s em silêncio antes de falar.

### Slide 19 — O que aprendemos

**Dizer**:
> "Recapitulando. Observabilidade é reconstruir a causa, não só registrar o
> evento. Interação e passo são o vocabulário que você precisa para navegar o
> painel sozinha. Com dado real dá para ver para onde o dinheiro está indo — e
> onde trocar de modelo compensa. E quatro falhas documentadas, nenhuma
> descoberta por reclamação de usuário."

### Slide 20 — Fechamento

**Dizer**:
> "Ver o dado não é abstrato: vira uma conta que fecha. Na próxima aula a
> gente pega essas falhas e faz o ciclo completo — detectar, diagnosticar e
> corrigir, com o produto no ar. Até lá."

---

## Depois de gravar

**Apague o `.env`.** Ele foi criado com segredos de produção e ficou em disco
nesta máquina:

```bash
Remove-Item .env, .env.langfuse-guardado -ErrorAction SilentlyContinue
```

E confirme que a observabilidade ficou **LIGADA** em produção — o `off` mexeu
só no `.env` local, mas vale conferir antes de seguir para a próxima aula:

```bash
powershell -File scripts/observabilidade.ps1 status
```
