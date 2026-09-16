# Aula 1 — leitura única (deck + fala, 6 vídeos)

**Versão de produção (03/09).** Substitui a leitura-única do produto virgem,
que foi descontinuado. Tudo acontece em `chef.workshopee.com.br` — nenhum
Postman, nenhum terminal em tela.

Deck: [`slides/aula1-alura-live.pptx`](../slides/aula1-alura-live.pptx) (21 slides).

Um documento só, pra ler direto. Cada bloco tem o que está na tela e o que
falar. As ações ao vivo estão marcadas com 🔴.

---

## Antes do REC

| Item | Como deixar |
|---|---|
| Aba 1 | `chef.workshopee.com.br` logado (Basic Auth já passado), painel na home |
| Aba 2 | o deck `aula1-alura-live.pptx` em apresentação |
| Configurações | gaveta **fechada**, modelo em `claude-sonnet-5` (é o padrão) |
| Feed | rolado até o topo, sem nada digitado no composer |

**Não abrir** a aba de Langfuse nem falar o nome dele: Langfuse é Aula 3.
**Não mexer** em nota fiscal nem em receita premium: são Aulas 4 e 5.

---

## 🎬 Vídeo 1.1 — A cena que se repete

**[Capa]**

> "Esse é o primeiro produto agêntico que a gente vai investigar juntos
> neste curso. Ele não é uma maquete de slide: está no ar, com dado real, e
> a minha casa usa ele de verdade, todo dia. Mas antes de eu te mostrar
> qualquer tela, eu quero te contar uma cena que se repete com quase todo
> mundo que constrói produto com IA. Talvez ela já tenha acontecido com
> você."

**[Divisor 1.1 — claquete]**

**[Slide: Funcionou lindo na demo. E depois?]**

> "Você monta uma funcionalidade com IA. Testa três vezes na sua frente, as
> três funcionam bonito. Você mostra pra equipe, todo mundo acha ótimo, você
> entrega. Uma semana depois, alguém pergunta uma coisa simples: 'aquela
> mudança que você fez, ajudou ou atrapalhou?'
>
> E você trava. Repara que o problema não é falta de trabalho — você
> trabalhou. O problema é que você não tinha como medir. Você entregou
> baseado em três testes que você mesmo escolheu, num dia só, e quando
> alguém pediu evidência, não tinha evidência nenhuma pra dar. Só memória.
>
> E o pior é que a pergunta é justa. Quem perguntou não está te cobrando má
> fé — está te cobrando uma informação que qualquer outro tipo de produto
> teria. Se fosse uma mudança de checkout, você olharia a conversão. Se
> fosse performance, você olharia o tempo de resposta. Em produto de IA, a
> gente costuma olhar... a própria impressão."

**[Slide: O que separa quem evolui rápido]**

> "E aí vem a tentação, que eu já caí várias vezes: focar no que dá pra
> controlar. Qual modelo eu uso. Qual framework. Qual banco de dados. Coisas
> que dão uma sensação boa de progresso, porque são decisões que a gente
> sabe tomar.
>
> Só que quando você olha quem realmente evolui rápido nesse tipo de
> produto, essa galera quase não fala de ferramenta. Fala de medição. Eles
> sabem, a cada mudança que fazem, se o produto ficou melhor ou pior — e
> sabem isso rápido, no mesmo dia, não no fim do trimestre.
>
> E aí acontece uma coisa meio contraintuitiva: quando você resolve a
> medição, todo o resto do trabalho fica mais fácil. Trocar de modelo deixa
> de ser aposta. Mexer no prompt deixa de ser fé. Você passa a ter um jeito
> de responder 'ficou melhor' com um número em vez de com uma sensação."

---

## 🎬 Vídeo 1.2 — Os três pilares desta jornada

**[Divisor 1.2 — claquete]**

**[Slide: Três perguntas que sustentam um produto de IA]**

> "Esse curso inteiro gira em torno de três perguntas.
>
> A primeira: como eu sei que a resposta é boa, sem reler cada uma à mão?
> Porque reler à mão funciona quando você tem dez respostas. Não funciona
> quando você tem dez mil. Essa pergunta é a dos **evals**.
>
> A segunda: como eu enxergo o que está acontecendo, sem estar olhando o
> tempo todo? O produto roda quando você está dormindo. Alguém pediu alguma
> coisa às três da manhã e recebeu uma resposta — você precisa conseguir
> olhar aquilo depois. Essa é a **observabilidade**.
>
> E a terceira: como eu garanto que o produto não passa de limites que
> protegem quem usa? Um produto de comida que ignora uma alergia não é um
> produto ruim, é um produto perigoso. Essa é a **conformidade**."

**[Slide: Os três se alimentam um do outro]**

> "E uma coisa importante: esses três não são etapas separadas que você faz
> uma vez e risca da lista.
>
> Um eval mal feito deixa passar uma falha que só a observabilidade vai
> encontrar depois, em produção, com usuário real na frente. E uma falha sem
> proteção nenhuma vira o tipo de incidente que a conformidade deveria ter
> barrado antes de acontecer. Eles se cobrem uns aos outros.
>
> Esta aula começa pela primeira pergunta — evals — porque é onde tudo o
> mais se apoia. Sem critério, você não tem o que observar; e sem observar,
> você não sabe onde precisa de proteção."

---

## 🎬 Vídeo 1.3 — Conhecendo o Chef Caseiro

**[Divisor 1.3 — claquete]**

**[Slide: O produto que vamos investigar juntos]**

> "Agora deixa eu te apresentar o produto. Ele se chama Chef Caseiro, e a
> ideia dele é simples de explicar: ele sugere o que cozinhar com o que a
> casa já tem. Sem inventar ingrediente que não existe, e sem ignorar as
> restrições da casa.
>
> E eu preciso ser honesto com você sobre uma coisa: esse não é um produto
> de demonstração que eu montei pra gravar esta aula. Ele está no ar, ele
> tem dado real dentro, e a minha casa usa ele. Isso importa pro curso, e
> muito — porque produto que ninguém usa nunca falha de um jeito
> interessante. Ele só falha do jeito que você previu."

**🔴 AÇÃO — Tour da tela.** Alt+tab pro `chef.workshopee.com.br`. Percorra,
sem pressa, falando por cima:

1. **A faixa de estado**, no topo — porções vivas, o que está vencendo, o
   saldo da semana.
2. **O feed** — o que a casa falou, em ordem, com quem falou.
3. **A despensa** — abra e deixe a lista de itens à vista.

> "Isso aqui em cima é o estado da cozinha: quantas porções de comida pronta
> existem agora, o que está perto de vencer, como está o saldo da semana.
> Nada disso é a IA falando — é tudo calculado em código, a partir do que
> aconteceu.
>
> Isso aqui embaixo é o feed: cada coisa que alguém da casa falou, na ordem
> em que falou. E aqui na despensa é o que a casa tem de verdade, agora.
>
> Repara que eu ainda não te mostrei nenhuma inteligência artificial. Eu te
> mostrei um produto. Isso é de propósito — a IA aqui é um pedaço do
> produto, não o produto inteiro."

**[Slide: O que essa inteligência pode fazer]**

> "Agora sim, a parte inteligente. Por trás da sugestão tem um modelo que
> pode fazer duas coisas antes de responder qualquer coisa pra mim.
>
> Ele pode consultar o que está no estoque — abrir a despensa, ver o que
> tem. E ele pode consultar as restrições da casa: alergia, dieta, o que a
> família simplesmente não come.
>
> E aqui está a parte que faz esse produto ser agêntico, e não só uma tela
> com um chat: **ele decide sozinho quando usar cada uma dessas
> capacidades.** Ninguém escreveu um roteiro fixo dizendo 'primeiro consulta
> o estoque, depois consulta as restrições, depois responde'. Ele pode
> consultar as duas, uma só, ou nenhuma — e sair respondendo direto.
>
> Guarda isso, porque é a raiz de metade dos problemas deste curso: quando o
> produto decide sozinho, você perde a garantia de que ele vai decidir igual
> da próxima vez."

**[Slide: O estoque real não é uma lista limpa]**

**🔴 AÇÃO** — deixe a despensa na tela enquanto fala este slide, rolando
devagar pela lista.

> "E agora eu quero te mostrar uma coisa que normalmente ninguém mostra numa
> aula, porque não é bonito. Esse é o estoque real. São quarenta e um itens
> aqui dentro, e ele é bagunçado.
>
> Olha só: 'arroz' aparece em quatro registros diferentes. Um deles está
> zerado — quantidade zero, e continua na lista. Tem 'feijão carioca' e tem
> 'feijao', sem cedilha e sem til, dois registros, o mesmo grão. Tem
> 'macarrão espaguete' e tem 'macarrao'. Tem três molhos de tomate, um deles
> vazio.
>
> Isso não é descuido meu na hora de gravar — isso é o que acontece com
> qualquer produto real depois de algumas semanas de uso, com mais de uma
> pessoa cadastrando coisa, e com uma parte vindo de nota fiscal
> automaticamente.
>
> Guarda essa imagem, porque ela vai voltar na próxima aula. Ela é o motivo
> de uma pergunta que parece trivial — 'ela usou só o que eu tenho?' — ser
> muito mais difícil de responder do que parece."

---

## 🎬 Vídeo 1.4 — Um pedido de verdade, ao vivo

**[Divisor 1.4 — claquete]**

**[Slide: Vou pedir do jeito que eu pediria pra uma pessoa]**

> "Chega de eu falar. Vamos fazer um pedido de verdade, agora, você olhando.
>
> E eu vou pedir do jeito mais desinteressante possível: sem prompt especial,
> sem truque de engenharia de prompt, sem instrução escondida. Um pedido de
> jantar em português, do jeito que qualquer pessoa da casa falaria.
>
> As restrições já estão cadastradas aqui há semanas — evitar carne de
> porco, e preferência por vinho tinto seco. Eu não vou repetir isso no
> pedido. Se o produto for bom, ele vai atrás sozinho.
>
> Presta atenção numa coisa específica enquanto roda: **o que ele faz antes
> de responder.** Ele para pra consultar alguma coisa, ou já sai sugerindo?"

**🔴 AÇÃO — Pedido 1.** No composer, como **chef**, escreva:

> `Tô com vontade de comer algo especial hoje à noite.`

Envie. O texto vira um **desejo** no feed. Clique em **🍳 Mediar com a
casa**. Enquanto roda (leva alguns segundos), narre:

> "Repara que ele está demorando um pouquinho. Isso não é lentidão de
> internet — é ele indo buscar coisa. Cada segundo aqui é ele decidindo se
> precisa abrir a despensa, abrindo, lendo as restrições, e só então
> montando a resposta."

Quando a resposta aparecer, **leia em voz alta, inteira**, e depois comente
o que ela fez:

> "Olha o que ela sugeriu. [lê a sugestão] E olha os ingredientes que ela
> escolheu — todos daqui, do que a casa tem. E repara que não tem carne de
> porco em lugar nenhum. Ela foi lá, leu a restrição, e respeitou."

**[Slide: A pergunta que fica no ar]**

> "E agora eu vou fazer uma coisa meio chata comigo mesmo.
>
> A sugestão parece boa. Eu li, achei razoável, e minha vontade natural é
> seguir em frente satisfeito. Mas 'parece boa' é o quê, exatamente? É uma
> opinião minha, no momento em que eu li, com o humor que eu estava. Nada
> mais que isso.
>
> Deixa eu te fazer as perguntas difíceis. Ela respeitou mesmo todas as
> restrições, ou só a que eu lembrei de olhar? Ela usou só o que eu
> realmente tenho — inclusive aquele arroz que está zerado, que aparece na
> lista mas não existe na cozinha? E se eu pedir de novo daqui a cinco
> minutos, vem igual?
>
> Eu não sei responder nenhuma das três. Eu só senti que estava bom.
>
> E olha só onde a gente chegou: essa é exatamente a cena do começo desta
> aula. Só que não é com um produto abstrato de exemplo. É comigo, no meu
> próprio produto, agora, com você olhando."

---

## 🎬 Vídeo 1.5 — O mesmo pedido, outro motor

**[Divisor 1.5 — claquete]**

**[Slide: Todo produto de IA tem eixos que dá pra girar]**

> "Todo produto de IA tem eixos que você pode girar.
>
> O primeiro é o **modelo** que gera a resposta — qual inteligência está
> atendendo. O segundo é a **instrução** que orienta esse modelo: o que você
> pediu pra ele fazer, e com quanto rigor. E o terceiro são os **dados** que
> ele consulta — a despensa, as restrições, o histórico.
>
> Guarda esses três, porque na Aula 4 a gente vai usar exatamente eles pra
> descobrir a causa de uma falha: foi o prompt, foi o dado, ou foi o modelo?
>
> Hoje eu vou girar um eixo só, o mais fácil de ver: o modelo. Neste produto
> eu troco ele ao vivo, aqui na barra de configuração, sem deploy nenhum e
> sem tocar em código. Mesmo pedido, mesmo estoque, mesmas restrições —
> outro motor."

**🔴 AÇÃO — Pedido 2.** Abra **Configurações**, troque o modelo de
`claude-sonnet-5` para `claude-haiku-4-5` (a troca grava sozinha, na hora).
Feche a gaveta, volte ao **mesmo desejo** no feed e clique **🍳 Mediar com
a casa** de novo.

Enquanto roda:

> "Repara que eu não mudei o pedido. Não mudei o estoque, não mudei as
> restrições, não mudei uma vírgula do que eu pedi. A única coisa diferente
> entre a resposta anterior e essa que está vindo agora é qual modelo está
> respondendo."

Quando chegar, **leia a segunda resposta em voz alta** e compare item a item
com a primeira. Aponte na tela: o prato, os ingredientes, o tamanho, o tom.

**[Slide: Duas respostas — e nenhuma régua pra escolher]**

> "Compara as duas comigo. [aponta as diferenças reais que apareceram]
>
> Mudou o prato. Mudou o jeito de escrever. Mudaram os ingredientes que ela
> escolheu do estoque. Mudou o tamanho da resposta.
>
> E agora vem a pergunta que eu quero que fique doendo um pouquinho: **qual
> das duas é melhor?**
>
> Você provavelmente tem uma preferência. Eu também tenho. Mas repara no que
> a gente está fazendo: escolhendo com o gosto, olhando um exemplo, uma vez.
> E mesmo que a gente concorde agora, na próxima pergunta pode inverter — e
> a gente não ia nem ficar sabendo.
>
> Então o placar da aula está assim: eu girei um eixo do meu produto, vi a
> resposta mudar na minha frente, e **não tenho como dizer se eu melhorei ou
> piorei o produto.** Esse buraco aí é o que o curso inteiro existe pra
> fechar."

**🔴 AÇÃO** — volte o modelo pra `claude-sonnet-5` antes de encerrar (deixa
o produto no estado padrão pras próximas aulas).

---

## 🎬 Vídeo 1.6 — O ciclo que faz a diferença

**[Divisor 1.6 — claquete]**

**[Slide: Avaliar, entender, mudar — e de novo]**

> "Todo produto de IA que evolui rápido gira o mesmo ciclo, e ele tem três
> tempos: avaliar a qualidade do que saiu, entender o que saiu errado, e
> mudar o comportamento. Aí gira de novo.
>
> E tem uma propriedade desse ciclo que vale a pena você guardar: quanto
> mais rápido e mais barato for **avaliar**, mais vezes o ciclo gira. E é o
> número de voltas que faz o produto melhorar, não o tamanho de cada volta.
> Uma equipe que consegue avaliar em dez minutos vai passar na frente de uma
> equipe que precisa de dois dias, mesmo que a segunda seja mais inteligente.
>
> E olha o que eu fiz hoje: eu girei o ciclo pela metade. Eu **mudei o
> comportamento** — troquei o modelo. Mas eu não **avaliei** nada. Eu só
> senti. Então na prática eu não completei nem uma volta."

**[Slide: O que aprendemos]**

> "Fechando.
>
> Primeiro: o problema não é ter dúvida se uma mudança ajudou. Dúvida é
> saudável. O problema é não ter como responder essa dúvida.
>
> Segundo: eu te apresentei um produto agêntico real, no ar, e — o que
> importa mais — o estoque bagunçado que ele consulta de verdade. Quarenta e
> um itens, arroz repetido quatro vezes, um deles zerado.
>
> Terceiro: eu girei um eixo, vi a resposta mudar na minha frente, e não
> soube dizer se ficou melhor.
>
> Na próxima aula eu paro de sentir se a sugestão foi boa e começo a
> construir uma forma de saber. E a gente vai fazer isso do jeito mais
> simples possível — sem ferramenta nova, sem código, escrevendo critério em
> português."

**[Fechamento]**

> "Eu senti que foi bom. Na próxima aula, eu vou saber. Até lá."

---

**Resumo das ações**: tour da tela (1.3) · pedido + Mediar (1.4) · troca de
modelo + Mediar de novo (1.5) · voltar o modelo pro padrão (fim do 1.5).
