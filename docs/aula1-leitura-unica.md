# Aula 1 — leitura única (deck + fala, 6 vídeos)

Um documento só, pra ler direto. Cada bloco tem o que está na tela e o que
falar. As duas únicas ações ao vivo estão marcadas com 🔴 — fora isso, é
só ler e seguir.

---

## 🎬 Vídeo 1.1 — A cena que se repete

**[Capa]**

> "Esse é o primeiro produto agêntico que a gente constrói juntos neste
> curso. Ele está completamente zerado — nenhuma sugestão, nenhum dado.
> Antes de mexer em qualquer coisa, eu quero te mostrar uma cena que se
> repete com quase todo mundo que constrói produto com IA."

**[Divisor — claquete, 2s de silêncio]**

**[Slide: Funcionou lindo na demo. E depois?]**
- Você monta uma funcionalidade com IA. Testa três vezes, três vezes funciona. Você entrega.
- Uma semana depois, alguém pergunta: "aquela mudança que você fez ajudou ou atrapalhou?"
- **E você não sabe responder. Não porque não trabalhou — porque não tinha como medir.**

> "Você monta uma funcionalidade com IA. Testa três vezes na sua frente, as
> três funcionam bonito. Você entrega, todo mundo comemora. Uma semana
> depois, alguém pergunta: 'aquela mudança que você fez, ajudou ou
> atrapalhou?' E você trava. Não porque você não trabalhou — porque não
> tinha como medir."

**[Slide: O que separa quem evolui rápido]**
- A tentação é focar no que dá pra controlar: qual modelo usar, qual framework, qual banco de dados.
- **Só que builders que dão certo raramente falam de ferramenta. Eles falam de medição.**
- Eles sabem, a cada mudança, se o produto ficou melhor ou pior. O resto do trabalho fica mais fácil por causa disso.

> "A tentação, nessa hora, é focar no que dá pra controlar: qual modelo
> usar, qual ferramenta adotar. Só que quem realmente evolui rápido nesse
> tipo de produto quase não fala de ferramenta. Fala de medição. Eles sabem,
> a cada mudança, se o produto ficou melhor ou pior — e isso é o que faz o
> resto do trabalho ficar mais fácil."

---

## 🎬 Vídeo 1.2 — Os três pilares desta jornada

**[Divisor — claquete, 2s de silêncio]**

**[Slide: Três perguntas que sustentam um produto de IA]**
- **Evals: como eu sei que a resposta é boa, sem reler cada uma à mão?**
- **Observabilidade: como eu enxergo o que está acontecendo, sem estar olhando o tempo todo?**
- **Conformidade: como eu garanto que o produto não passa de limites que protegem quem usa?**

> "Esse curso inteiro gira em torno de três perguntas. A primeira: como eu
> sei que a resposta é boa, sem reler cada uma à mão? A segunda: como eu
> enxergo o que está acontecendo, sem estar olhando o tempo todo? E a
> terceira: como eu garanto que o produto não passa de limites que protegem
> quem usa? Evals, observabilidade, conformidade."

**[Slide: Os três se alimentam um do outro]**
- Não são etapas separadas — um eval mal feito deixa passar a falha que só a observabilidade encontra depois.
- E uma falha sem guardrail vira o tipo de incidente que a conformidade deveria ter barrado antes.
- **Esta aula começa pela primeira pergunta. É onde tudo o mais se apoia.**

> "Eles não são etapas separadas que você faz uma vez e esquece. Um eval mal
> feito deixa passar uma falha que só a observabilidade vai encontrar
> depois. E uma falha sem proteção vira o tipo de incidente que a
> conformidade deveria ter barrado antes. Esta aula começa pela primeira
> pergunta — evals — porque é onde tudo o mais se apoia."

---

## 🎬 Vídeo 1.3 — Conhecendo o Chef Caseiro

**[Divisor — claquete, 2s de silêncio]**

**[Slide: O produto que vamos construir junto]**
- O Chef Caseiro sugere o que cozinhar com o que a casa já tem — sem inventar ingrediente, sem ignorar restrição.
- Por trás da sugestão tem uma inteligência que decide sozinha: será que preciso checar o estoque antes de responder?
- **Hoje ele está zerado. Nenhuma sugestão ainda, nenhum dado — para eu te mostrar cada passo, ao vivo, do início.**

> "Esse é o Chef Caseiro. Ele sugere o que cozinhar com o que a casa já tem
> — sem inventar ingrediente, sem ignorar restrição. Por trás da sugestão
> tem uma inteligência que decide sozinha se precisa checar o estoque antes
> de responder. Hoje ele está zerado assim de propósito — nenhuma sugestão
> ainda — pra eu te mostrar cada passo, ao vivo, desde o início."

**[Slide: O que essa inteligência pode fazer]**
- Ela pode consultar o que está no estoque, antes de sugerir qualquer prato.
- Ela pode consultar as restrições da casa — alergia, dieta, o que a família não gosta.
- **E ela decide, sozinha, quando usar cada uma dessas capacidades. Ninguém escreveu um roteiro fixo para ela seguir.**

> "Ela pode consultar o que está no estoque antes de sugerir qualquer prato.
> Pode consultar as restrições da casa — alergia, dieta, o que a família não
> come. E ela decide sozinha quando usar cada uma dessas capacidades.
> Ninguém escreveu um roteiro fixo pra ela seguir passo a passo."

---

## 🎬 Vídeo 1.4 — O primeiro pedido, ao vivo

**[Divisor — claquete, 2s de silêncio]**

**[Slide: Vamos fazer o primeiro pedido juntos]**
- Eu vou cadastrar o que tenho em casa e uma restrição — por exemplo, "sem lactose".
- E vou pedir uma sugestão de janta, do jeito que eu pediria pra uma pessoa.
- **Preste atenção no que ela faz antes de responder: ela para pra consultar, ou já sai sugerindo?**

> "Eu já deixei preparado o que essa casa tem: arroz, feijão, frango,
> alface, leite — e uma restrição, sem lactose. Agora eu vou pedir uma
> sugestão, do jeito que eu pediria pra uma pessoa."

**🔴 AÇÃO — Chamada 1**: no cliente de API, mande
`"O que eu faço pro jantar hoje?"` (v1, já é o padrão). Leia a resposta em
voz alta — ela vai vir completa, com a receita inteira.

> "Presta atenção no que ela fez antes de responder — ela parou pra
> consultar alguma coisa, ou já saiu sugerindo direto?"

**[Slide: A pergunta que fica no ar]**
- **A sugestão parece boa. Mas "parece boa" é uma opinião minha, no momento em que eu li — nada mais que isso.**
- Ela respeitou mesmo a restrição? Usou só o que eu realmente tenho? Eu não sei dizer com certeza — só senti que sim.
- E essa é exatamente a cena do começo desta aula, acontecendo com o meu próprio produto.

> "A sugestão parece boa. Mas 'parece boa' é só a minha opinião, lendo uma
> vez, agora. Ela respeitou mesmo a restrição do leite? Usou só o que eu
> realmente tenho? Eu não sei dizer com certeza — só senti que sim. E essa é
> exatamente a cena do começo desta aula, acontecendo com o meu próprio
> produto."

---

## 🎬 Vídeo 1.5 — Duas formas de pedir a mesma coisa

**[Divisor — claquete, 2s de silêncio]**

**[Slide: O mesmo produto, dois jeitos de instruir]**
- Existem duas formas de orientar essa inteligência. Uma é mais solta: pede para ajudar, sem exigir nada específico antes.
- A outra é mais rígida: exige que ela confira o estoque e as restrições antes de sugerir qualquer coisa.
- **Vou fazer o mesmo pedido nas duas formas e comparar o que muda na resposta.**

> "Existem duas formas de orientar essa inteligência. A que eu usei agora há
> pouco é mais solta: pede pra ajudar, sem exigir nada específico antes. Vou
> trocar pra uma configuração mais rígida — que exige que ela confira o
> estoque e as restrições antes de sugerir qualquer coisa — e fazer
> exatamente o mesmo pedido."

**🔴 AÇÃO — Chamada 2**: troque a configuração pra **v2**
(`POST /api/config` com `{"promptVersion":"v2"}`), mande o mesmo texto
`"O que eu faço pro jantar hoje?"`. A resposta vai vir seca — só confirma
que registrou o uso, sem descrever o prato.

**[Slide: O que eu observei na comparação]**
- Na forma solta, a resposta veio completa: a receita inteira, passo a passo, e até por que o leite ficou de fora.
- Na forma rígida, ela fez tudo certo por dentro — mas a resposta final foi seca: só confirmou que registrou o uso.
- **As duas respeitaram a restrição. Só uma me contou o que eu ia comer — e isso eu não esperava antes de comparar.**

> "Compara as duas. A primeira, em v1, veio completa: ela me contou a
> receita inteira — frango grelhado com arroz, feijão e salada de alface —
> com modo de preparo passo a passo, e até me explicou por que deixou o
> leite de fora: por causa da restrição. A segunda, em v2, foi seca: só
> disse 'pronto, registrei o uso dos itens', sem me contar qual receita era.
> As duas respeitaram a restrição — mas só uma delas me disse o que eu ia
> comer.
>
> Nenhuma das duas é 'a errada' — são dois comportamentos possíveis do mesmo
> produto. E repara: eu só consegui notar essa diferença porque comparei
> lado a lado. Se eu tivesse visto só uma das duas, teria achado normal."

---

## 🎬 Vídeo 1.6 — O ciclo que faz a diferença

**[Divisor — claquete, 2s de silêncio]**

**[Slide: Avaliar, entender, mudar — e de novo]**
- Todo produto de IA que evolui rápido gira o mesmo ciclo: avaliar a qualidade, entender o que saiu errado, mudar o comportamento.
- **Quanto mais rápido e barato for avaliar, mais vezes esse ciclo gira — e mais rápido o produto melhora.**
- Hoje eu só consegui fazer a primeira volta pela metade: eu senti que a sugestão foi boa, mas não tenho como provar.

> "Todo produto de IA que evolui rápido gira o mesmo ciclo: avaliar a
> qualidade, entender o que saiu errado, mudar o comportamento — e girar de
> novo. Quanto mais rápido e barato for avaliar, mais vezes esse ciclo gira,
> e mais rápido o produto melhora. Hoje eu só fiz a primeira volta pela
> metade: eu senti que as respostas foram boas, mas não tenho como provar."

**[Slide: O que aprendemos]**
- O problema não é ter dúvida se uma mudança ajudou — é não ter como responder essa dúvida.
- Conheci o Chef Caseiro zerado e vi as duas formas de instruir a mesma inteligência.
- **Na próxima aula, eu paro de sentir se a sugestão foi boa e começo a construir uma forma de saber.**

> "O problema não é ter dúvida se uma mudança ajudou — é não ter como
> responder essa dúvida. Eu conheci o Chef Caseiro zerado e vi as duas
> formas de instruir a mesma inteligência. Na próxima aula, eu paro de
> sentir se a sugestão foi boa e começo a construir uma forma de saber."

**[Fechamento: "Eu senti que foi bom. Na próxima aula, eu vou saber."]**

> "Eu senti que foi bom. Na próxima aula, eu vou saber. Até lá."

---

**Lembrete rápido**: só duas ações em toda a aula — 🔴 na 1.4 e 🔴 na 1.5.
As duas já foram testadas hoje contra este banco. Você sabe o que vai
acontecer.
