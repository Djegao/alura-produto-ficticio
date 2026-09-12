# Aula 2 — Slide · Script

Documento mestre da Aula 2. Formato: o que está na tela, depois o que eu falo.
Bases de slide e orçamento de caracteres ficam em [`aula2-bases.md`](aula2-bases.md).
Demos congeladas em [`apoio/aula2-demos-congeladas.md`](apoio/aula2-demos-congeladas.md).
Deck inicial gerado deste script em 03/09: [`slides/Aula 2 6498 - inicial.pptx`](../slides/Aula%202%206498%20-%20inicial.pptx)
(42 slides, script nas notas; finalização no Google Slides).

| Vídeo | Título | Tempo | Estado |
|---|---|---|---|
| 2.1 | O que são evals? | 10 min | ✅ aprovado |
| 2.2 | Critérios de qualidade | 12 min | ✅ aprovado |
| 2.3 | Claude como avaliador | 12 min | ✅ aprovado |
| 2.4 | Primeiro conjunto de evals | 15 min | ✅ aprovado |
| 2.5 | O que aprendemos? | texto | [`aula2-o-que-aprendemos.md`](aula2-o-que-aprendemos.md) |

---

# 2.1 — O que são evals?

## Slide 1 (divisor)
**2.1 O que são evals?**

## Slide 2 (hero)
**Evals**
O primeiro pilar do run

**Script**
Na aula passada eu fechei o relatório de riscos do Musa Balance. E a gente viu os três pilares que sustentam o run: evals, observabilidade e conformidade.

Hoje eu pego o primeiro. E vou começar do jeito mais simples: lembrando qual era a pergunta dele.

## Slide 3 (statement)
**A IA está fazendo o que deveria?**

**Script**
Essa é a pergunta do primeiro pilar. Qualidade, precisão, aderência ao que eu esperava.

Essa aula inteira é essa pergunta.

E repara: ela não é sobre construir. Construir eu já fiz. O produto está no ar, a minha casa usa. Ela é sobre o run. Sobre o que acontece depois que eu parei de olhar.

## Slides 4, 5, 6 (build, foto do corredor)
**Build and Run**
E se eu mudar o produto amanhã?
- Melhoro uma coisa e quebro outra.
- Um comportamento que eu tinha como garantido some.
- Um erro corrigido volta. E volta pior.

**Script**
O relatório de riscos fala do que pode dar errado. É hipótese. Agora eu quero uma pergunta mais incômoda: e se eu mudar o produto amanhã?

Porque eu vou mudar. Vou mexer no prompt do Mediador, vou trocar o modelo, vou ajustar uma regra. Isso é o trabalho. E tem três jeitos disso dar errado.

*(linha 1)* O primeiro é o mais traiçoeiro. Eu melhoro uma coisa e quebro outra. Corrijo como ele classifica a refeição e, sem perceber, pioro como ele identifica um trade-off. Eu testei o que eu mudei. Não testei o que eu não mudei.

*(linha 2)* O segundo é pior, porque não tem sintoma. Um comportamento que eu tinha como garantido simplesmente some. Ninguém recebe erro. O Mediador continua respondendo, educado, bonito. Só que parou de fazer uma coisa que fazia. E eu só descubro quando alguém da casa reclama. Ou não descubro.

*(linha 3)* E o terceiro: um erro que eu já consertei volta. E volta pior, porque agora eu confio que aquilo está resolvido. Não estou mais olhando pra lá.

## Slide 7 (statement)
**Testar uma vez responde sobre aquele momento.**

**Script**
A resposta natural é: eu testo. Abro o produto, faço um pedido, leio. Uma vez. Duas.

Só que testar uma vez responde sobre aquele momento. Aquele pedido, aquele estoque, aquele humor do modelo naquele minuto. E produto é o que acontece nos outros dias.

Então eu preciso de um jeito sistemático de verificar isso. Não uma vez. Continuamente. É aqui que entram os evals.

## Slide 8 (lista)
**Evals: qualidade em evidência**
- Processo sistemático: o produto faz o que eu espero?
- Não é teste de software. Teste pergunta "é igual?". Eval pergunta "é bom?".
- Critério reproduzível, que eu aprimoro semana a semana.

**Script**
Quero uma definição que você consiga repetir pra alguém amanhã.

Eval é um processo sistemático pra verificar se o produto se comporta como eu espero. Sistemático é a palavra. Não é eu abrindo o produto quando lembro.

E deixa eu tirar a confusão mais comum do caminho. Isso não é QA. Não é teste de software. Teste compara com o resultado esperado. Dois mais dois dá quatro, sempre. Rodo de novo, dá quatro de novo.

O Mediador não funciona assim. O mesmo pedido, na mesma semana, gera um texto diferente cada vez. E o pulo do gato: as duas versões podem estar certas. Se eu escrevo um teste esperando uma frase específica, ele falha na segunda execução e não me ensina nada.

Teste pergunta "é igual ao esperado?". Eval pergunta "é bom?".

E a terceira parte: é critério. Uma coisa que eu escrevo, que outra pessoa consegue aplicar, e que eu melhoro toda semana. Critério é o próximo vídeo. Antes, a estrutura onde ele mora.

## Slide 9 (funil)
**O funil de qualquer eval**
1. Cenário · 2. Critério · 3. Resposta · 4. Evidência

**Script**
Todo eval tem os mesmos quatro passos, nesta ordem.

Cenário: o que eu estou tentando avaliar. Não uma pergunta genérica. Uma situação específica. No Musa Balance: o casal pediu uma mediação de cardápio pra semana.

Critério: o que eu espero que ele faça ali. Que exponha o trade-off. Que use o número que a ferramenta devolveu. E aqui está o que quase ninguém fala: isso é decisão minha, de produto. Não é o modelo que define o que é bom.

Resposta: o que ele fez de verdade. Não o que eu imagino. O que está gravado.

Evidência: atendeu ou não atendeu, com uma justificativa que eu consiga apontar.

Guarda esse funil. A aula inteira mora nele. O próximo vídeo é o passo dois. Os dois últimos são os passos três e quatro.

## Slide 10 (statement)
**Não estamos avaliando o modelo.**

**Script**
Antes de escrever qualquer critério, uma frase pra ficar gravada: não estamos avaliando o modelo. Estamos avaliando o comportamento esperado do produto.

Parece detalhe de linguagem. Não é. Muda o que você escreve.

Se eu avalio o modelo, escrevo critério genérico. A resposta é coerente? O texto está bem escrito? Qualquer produto do mundo passa nisso.

Se eu avalio o produto, escrevo o que este produto prometeu pra esta casa. Expôs o trade-off? Usou o número da ferramenta? Deixou a escolha com o casal?

O segundo eu defendo numa reunião. O primeiro, não.

## Slide 11 (lista)
**Se tudo passa, desconfie**
- 100% de aprovação é sinal de alerta, não de sucesso.
- Um critério bom precisa reprovar alguma coisa. Se nunca reprova, não está medindo.
- Quanto de falha eu aceito é decisão de produto. Zero erro não existe de graça.

**Script**
Um último aviso, e ele é contraintuitivo.

É muito tentador comemorar quando cem por cento das respostas passam. Eu já fiz isso. Levei o número verde pra reunião, todo mundo bateu palma.

Só que cem por cento é sinal de alerta. Quase sempre quer dizer que o critério está tão frouxo que qualquer resposta passa. Inclusive as ruins.

Um critério bom precisa reprovar alguma coisa. Se nunca reprova, não está medindo. Está decorando.

E aí vem a decisão mais de produto desta aula: quanto de falha eu aceito? Zero erro custa modelo mais caro, resposta mais lenta, e um produto que recusa tanto que a pessoa desinstala. Essa conta é minha. Não é do modelo.

No próximo vídeo a gente escreve os critérios. Em português, sem código, a partir de um cenário que aconteceu na minha cozinha.

---

# 2.2 — Critérios de qualidade

Antes de gravar: [`evals/criterios.md`](../evals/criterios.md) aberto no editor, fonte grande, na seção **Operação: mediar-cardapio**.

## Slide 1 (divisor)
**2.2 Critérios de qualidade**

## Slide 2 (só os dois cards; apagar a caixa "Cenário: pote vazio" e a lista da direita)
**De opinião a critério verificável**
OPINIÃO: "Acho que a resposta está adequada."
↓
CRITÉRIO VERIFICÁVEL: "O que eu esperaria ver? O que eu não aceitaria ver?"

**Script**
No funil a gente viu cenário, critério, resposta, evidência. Hoje a gente para no critério.

É o passo mais fácil de fazer errado. E o único que não precisa de código. Isso é bom e é perigoso. Bom porque qualquer pessoa do time consegue escrever critério. Perigoso porque qualquer pessoa consegue escrever critério ruim. E critério ruim parece critério.

O ponto de partida é sempre o mesmo. Eu leio uma resposta e acho que está adequada. Isso é opinião.

Pra virar critério, eu respondo duas perguntas antes de ler a próxima. O que eu esperaria ver? E o que eu não aceitaria ver?

## Slide 3 (lista com pergunta)
**Um cenário real**
Fim de dia. Ninguém quer cozinhar.
- A casa quer pedir entrega hoje.
- Tem porção caseira parada na geladeira, do fim de semana.
- Chef: desperdício. Musa: vontade.

**Script**
Critério no abstrato não se escreve bem. Então um cenário que aconteceu na minha cozinha.

Fim de dia, ninguém quer cozinhar. A casa querendo pedir entrega. Só que tem porção caseira parada na geladeira, feita no fim de semana.

Eu, chef, penso em desperdício e orçamento. A musa quer comer o que deu vontade. E olha: os dois têm razão. Não existe lado errado nessa conversa. É pra esse conflito que o Mediador existe.

Então é daqui que os critérios nascem. Da promessa do produto. Não de uma lista de boas práticas que eu baixei da internet.

## Slide 4 (lista)
**Os critérios que nascem daí**
- Menciona que existem porções caseiras não consumidas?
- Cita o delivery recente como parte do motivo?
- Não decide sozinho: expõe o conflito e deixa a escolha em aberto?

**Script**
Repara que dá pra apontar o sim ou o não em todos. Esse é o teste.

Ele mencionou que existem porções caseiras? Ou fingiu que a geladeira estava vazia? Isso é fato. Ou a porção aparece na resposta, ou não aparece.

Ele citou o delivery recente como parte do motivo? Essa é a informação que muda a conversa. A casa pediu entrega ontem. Isso pesa.

E o terceiro é de posicionamento. Ele decidiu sozinho o que a casa deve fazer? Se decidiu, parou de ser mediador. No momento em que ele diz "não peça entrega", virou mais um app de dieta que a pessoa desinstala.

## Slide 5 (lista)
**Dois que pegam número inventado**
- Usa números reais: porções restantes, dias desde o preparo?
- Não inventa prazo de validade que não veio de cálculo em código?
- Um número inventado que parece certo é indistinguível de um certo até alguém conferir.

**Script**
E tem dois critérios que existem pra pegar um tipo específico de erro.

Ele usou número real? Quantas porções restam, quantos dias desde o preparo? Ou falou por alto? Um mediador sem número não medeia, opina. E opinião não resolve conflito entre duas pessoas que já sabem o que querem.

E o meu favorito: ele inventou um prazo de validade que não veio de cálculo em código?

Porque um número inventado que parece certo é a pior classe de erro que existe aqui. É indistinguível de um número certo até alguém conferir. E como o Mediador fala com autoridade, a casa age em cima dele. Come uma coisa que passou. Ou joga fora uma coisa que estava boa.

## Slide 6 (3 colunas)
**Um critério tem 4 partes**
As quatro são obrigatórias. Se faltar uma, o critério vaza.

| Nome | Pergunta | Escala |
|---|---|---|
| Como ele se chama? | Uma pessoa consegue responder? | Binário ou de 0 a 1? |
| É o que vai ser gravado toda vez. Sem nome estável, não dá pra comparar esta semana com a próxima. | Respondível olhando a interação, sem abrir o repositório. Se precisa do código, está na língua errada. | Binário quando a falha é categórica. De 0 a 1 quando "meio certo" existe de verdade. |
| Ex.: mediou_sem_decidir | Ex.: deixou a escolha com o casal? | Ex.: não existe respeitar 70% de uma alergia. |

**Script**
Agora o formato. Um critério tem quatro partes. As quatro são obrigatórias. Se faltar uma, ele vaza por algum lado.

Nome. Parece burocracia. Não é. É o que vai ser gravado toda vez que o critério for aplicado. Sem nome estável, eu não comparo a semana passada com esta. E comparar no tempo é o ponto inteiro.

Pergunta. O teste de fogo: uma pessoa consegue responder olhando a interação, sem abrir o repositório? Se precisa do código, o critério está na língua errada.

Escala. Binário quando a falha é categórica. De zero a um quando "meio certo" existe de verdade. Não existe respeitar setenta por cento de uma alergia.

E tem uma quarta. Não coube na tela. É a mais importante, e é a que separa critério de curiosidade.

## Slide 7 (contraste, duas colunas)
**Se falhar, o que acontece?**

| Usou emoji? | Inventou a validade? |
|---|---|
| Tem nome. Dá pra responder olhando. É binário. | Tem nome. Dá pra responder olhando. É binário. |
| Se falhar: nada acontece. | Se falhar: a casa come comida estragada ou joga fora comida boa. |
| Curiosidade. | Eval. |

**Script**
A quarta parte é uma pergunta: se esse critério falhar, o que acontece?

Deixa eu te mostrar com dois critérios lado a lado.

"Usou emoji?" Tem nome. Qualquer pessoa responde olhando a resposta. É binário. Passa nas três primeiras partes. Agora a quarta: se ele falhar, o que acontece? Nada. Ninguém come errado, ninguém gasta a mais, ninguém desinstala. Isso não é eval. É curiosidade.

"Inventou a validade?" Tem nome, dá pra responder olhando, é binário. E se falhar? A casa come comida estragada. Ou joga fora comida boa. Isso é eval.

Os dois parecem critério. Só um custa alguma coisa quando falha. E o que não custa não é neutro: toda rodada ele gasta tempo, gasta dinheiro, e ocupa uma linha do relatório que alguém tem que ler. Ele rouba atenção do que importa.

O exercício é escrever a resposta em uma frase concreta. Se você não consegue escrever a frase, o critério não deveria existir.

## Slide 8 (lista)
**Binário ou de zero a um?**
- Binário pra falha categórica: ou deixou a escolha, ou decidiu.
- De 0 a 1 quando "meio certo" existe: citou números, mas soltos, sem ligar à escolha.
- Na dúvida, binário. Escala contínua vira opinião disfarçada de número: meu 0,7 é o seu 0,8.

**Script**
A regra da escala é mais simples do que parece.

Binário é pra falha categórica. Ou ele deixou a escolha em aberto, ou decidiu sozinho. Não existe deixar setenta por cento em aberto. Se a falha não tem meio-termo na vida real, não pode ter meio-termo na régua.

De zero a um é pra quando "meio certo" existe. Ele citou números, mas soltos, sem ligar à escolha. Não é a mesma coisa que não citar nada. E também não é o que eu queria.

Na dúvida, binário. Escala contínua vira opinião disfarçada de número. O meu zero vírgula sete é o zero vírgula oito seu. E ninguém sabe o que separa os dois.

## Slide 9 (divisor de ação)
**2.2.1 Os critérios no produto**

🔴 Alt+tab pro editor. Ler o `mediou_sem_decidir` inteiro. Apontar as quatro partes com o mouse. Os outros quatro, só mostrar.

**Script**
Esses critérios existem de verdade no produto. Olha aqui. É um arquivo de texto, em português. Não tem código nenhum.

Esse é o `mediou_sem_decidir`. Nome: é assim que ele vai ser gravado toda vez. Pergunta: o agente apresentou o conflito e deixou a escolha explícita para o casal, sem proibir, julgar ou decidir sozinho? Escala: binário. E se falhar, o que acontece: *(lê o parágrafo)*. "Degrada em silêncio quando alguém troca o modelo ou melhora o prompt."

Os outros quatro seguem o mesmo formato. Trade-off com números. Números vieram de ferramenta. Falta virou trade-off. E um que vem antes de todos, que eu explico no último vídeo.

Qualquer pessoa da casa lê isso e aplica numa mediação. Sem me perguntar nada.

## Slide 10 (statement)
**Se precisa de mim pra julgar, não é critério.**

**Script**
Olha o que mudou. Antes eu lia a mediação e achava razoável. E "razoável" era eu, lendo uma vez, com o humor daquele dia.

Agora eu tenho critério. E o teste é esse: qualquer pessoa da casa aplica e chega no mesmo sim ou no mesmo não que eu. Se precisa de mim pra julgar, não é critério. É gosto.

Só que tem um problema. Cinco critérios escritos. Treze mediações gravadas. Alguém precisa aplicar. Por enquanto, esse alguém sou eu, lendo uma por uma.

No próximo vídeo eu passo esse trabalho pra frente.

---

# 2.3 — Claude como avaliador

Antes de gravar: terminal na raiz do repo, fonte grande, Langfuse ligado
(`.\scripts\observabilidade.ps1 status`). Não abrir a interface do Langfuse.

## Slide 1 (divisor)
**2.3 Claude como avaliador**

## Slide 2 (lista com pergunta)
**Ler à mão**
Funciona. Até não funcionar.
- Com três mediações, ler é o melhor.
- Com trinta por semana, eu paro na quarta-feira.
- O critério não escala sozinho.

**Script**
Eu tenho critério escrito. Agora preciso aplicar.

O primeiro jeito é o óbvio: eu leio. Pego a mediação, olho o que o produto tinha em mãos, respondo sim ou não pra cada critério.

E quero ser justo com esse método, porque ele é subestimado. Com três mediações, ler uma por uma é o melhor investimento que existe. Foi lendo à mão que eu descobri o que medir. Não pule essa etapa achando que é primitiva.

O problema é que ela não escala. E não escala de um jeito específico. Com trezentas eu não leio, isso é óbvio. O caso que mata é o do meio. Com trinta por semana, eu leio na segunda, leio na terça, e paro na quarta.

E aí eu tenho um processo de qualidade que existe no documento e não existe na prática.

## Slide 3 (3 colunas)
**Do critério ao veredito**
O Claude entra num papel oposto ao que ele tinha até agora.

| Trace | Julgamento | Veredito |
|---|---|---|
| O que aconteceu de fato? | O critério foi atendido? | Atendeu ou não atendeu? |
| Uma execução real: pedido, resposta final, cada ferramenta chamada e o que devolveu. | O árbitro confronta a execução com o critério. Sempre do mesmo jeito. | Nota por critério, com a evidência que sustenta cada uma. |
| Ex.: bem mais do que eu olho quando leio à mão. | Ex.: LLM as a judge. | Ex.: um árbitro que não cansa na sexta. |

**Script**
A ideia é essa: o Claude entra num papel oposto ao que ele tinha neste produto.

Até agora ele gerava. Escrevia a mediação. Agora ele julga. Mesmo modelo, trabalho contrário. Ele não produz nada novo. Lê uma execução que já aconteceu e emite um parecer.

E olha o que ele recebe: o trace inteiro. O pedido original, a resposta final, quais ferramentas foram chamadas e o que cada uma devolveu.

Isso é bem mais do que eu olho quando leio à mão. Eu leio a resposta. Ele enxerga o caminho inteiro. Inclusive se o produto consultou o estoque e depois ignorou o resultado.

É um árbitro que não cansa e não julga diferente na sexta-feira.

## Slide 4 (lista)
**O que faz do modelo um juiz**
- Julgue só com base no material. Não suponha nada.
- Toda nota precisa de evidência citável. Justificativa genérica é justificativa inválida.
- Seja severo com falha silenciosa: um estado errado que ninguém percebeu é pior que um erro barulhento.

**Script**
Só que apontar o modelo pra uma resposta e perguntar "isso tá bom?" não produz um juiz. Produz um elogiador. Modelo de linguagem é agradável por construção. Ele vai achar quase tudo razoável.

O que transforma o modelo em juiz é o conjunto de regras que eu dou. Essas três estão no prompt do juiz, literalmente.

Primeira: julgue só com base no material. Se a informação não está no que ele recebeu, ela não existe. Isso corta a tendência dele de preencher lacuna com o que é plausível.

Segunda: toda nota precisa de evidência citável. "A resposta foi boa" não vale como razão.

Terceira, a minha favorita: seja severo com falha silenciosa. Repara que essa é uma instrução de valor, não técnica. Eu estou dizendo pro juiz o que este produto considera grave. É isso que "simular o julgamento de um especialista" quer dizer. Especialista tem critério de gravidade, não só de correção.

## Slide 5 (statement)
**Nota sem evidência não vale nada.**

**Script**
Deixa eu insistir na segunda regra, porque ela muda a natureza da coisa.

Cada critério devolve dois campos, os dois obrigatórios: o valor e a justificativa. E a justificativa tem que citar o material. Um trecho da resposta, o nome de uma ferramenta, um número que apareceu.

Isso não é capricho. É o que me deixa discordar do juiz.

Se ele me devolve "zero vírgula três" e mais nada, eu tenho duas opções, as duas ruins. Aceitar na fé. Ou refazer o trabalho à mão.

Se ele me devolve "zero vírgula três porque a resposta não menciona as porções que estão na geladeira", eu confiro em cinco segundos. E se ele estiver errado, eu descubro. E conserto o critério.

Um juiz que eu não consigo auditar não é melhor que nenhum juiz. É pior. Me dá confiança falsa.

## Slide 6 (lista)
**O juiz não faz conta**
- Primeiro o código apura os fatos: ferramentas, tokens, erros.
- Isso entra no material já pronto, marcado como fato. O juiz usa e não recalcula.
- Aritmética é trabalho de código. Julgamento é trabalho do modelo.

**Script**
Uma decisão de desenho que eu recomendo pra qualquer eval que você construir.

Antes de chamar o Claude, o código apura os fatos objetivos. Quais ferramentas rodaram. Quantos tokens saíram. Se alguma etapa deu erro. Se a saída final veio vazia.

Isso entra no material que o juiz recebe, já pronto, marcado como fato. E a instrução é explícita: isso é verdade apurada, use e não refaça conta nenhuma.

Por quê? Porque comparar número é exatamente o que modelo de linguagem faz mal. E faz com confiança.

A regra que eu levo pra qualquer projeto: aritmética é trabalho de código. Julgamento é trabalho do modelo. Misturar os dois é como a maioria dos evals estraga sem ninguém notar.

## Slide 7 (statement)
**Prompt não é contrato.**

**Script**
E a última decisão. A que mais gente aprende do jeito difícil.

Pra somar as notas, eu preciso que a resposta do juiz venha estruturada. Não em prosa. A tentação é escrever no prompt: "responda em JSON com as notas de cada critério".

E isso funciona. Quase sempre. E "quase sempre" não serve. Quando ele resolve responder em prosa, não sobra nota nenhuma pra somar. E eu só descubro quando o relatório vem vazio.

A solução não é escrever o pedido com mais ênfase. É estrutural. A chamada da ferramenta é forçada pela API. O modelo não tem a opção de responder em prosa.

Guarda essa frase, porque vale muito além de eval: prompt não é contrato. Prompt é pedido. Quando você precisa de garantia, a garantia tem que estar na estrutura.

## Slide 8 (divisor de ação)
**2.3.1 O juiz julga uma mediação**

🔴 No terminal:

```
node evals/run-evals.js --dry-run --trace 9f8bb3c520bca952adff5825cf213c84
```

~15 s. É a mediação do risoto de camarão de 22/08. Notas esperadas: integridade 0 · trade-off 0,5 · números de ferramenta 1 · mediou sem decidir 1 · falta virou trade-off 0.

**Script**
Chega de teoria. Vou pegar uma mediação real, de agosto, e mandar o juiz julgar.

*(enquanto roda)* Repara no que está acontecendo. Ele está montando o material. Pedido, resposta, ferramentas, e os sinais que o código já apurou. E mandando pro juiz. Cada linha que aparecer é um critério julgado, com a evidência do lado.

*(quando terminar)* Olha isso. Uma mediação só. O casal quer um risoto de camarão no sábado.

Números vieram de ferramenta: um. Todos os números que ele citou batem com o que a ferramenta devolveu. Um quilo de camarão, duzentos gramas de manteiga. O juiz conferiu um por um.

Mediou sem decidir: um. Ele apresentou o conflito do vinho e perguntou pro casal o que prefere.

Integridade: zero. A resposta foi cortada no meio da frase. O código viu que os tokens bateram no teto, e o juiz confirmou.

E agora a linha que vale a aula. Falta virou trade-off: zero. Lê a justificativa: *(lê)* "o texto afirma que o alho já foi colocado na lista de compras, mas nenhuma ferramenta de lista foi chamada".

## Slide 9 (statement)
**Ele enxerga o caminho inteiro.**

**Script**
O Mediador escreveu "já coloquei o alho na lista de compras". Se eu estivesse lendo à mão, eu acreditaria. Está escrito com convicção.

O juiz não acreditou. Porque ele não lê só a resposta. Ele lê o trace. E no trace a ferramenta de lista de compras não aparece. A frase é bonita e a ação não aconteceu.

Isso é falha silenciosa. Ninguém recebeu erro. A casa vai ao mercado achando que o alho está na lista. E não está.

Foi por isso que eu pedi pro juiz ser severo com esse tipo de coisa. E foi por isso que eu dei a ele o caminho inteiro, não só o texto.

Agora eu tenho um juiz. No próximo vídeo eu monto o conjunto: quais critérios, quais operações, e o que eu decidi não medir.

# 2.4 — Primeiro conjunto de evals

Antes de gravar: terminal na raiz do repo, fonte grande, Langfuse ligado.
Depois de gravar: `.\scripts\observabilidade.ps1 off` (a Aula 3 precisa do contraste).

## Slide 1 (divisor)
**2.4 Primeiro conjunto de evals**

## Slide 2 (statement)
**Conjunto é escolha, não lista.**

**Script**
Agora a gente monta o conjunto. E "conjunto" é a palavra certa. Não é uma lista de tudo que dá pra medir. É uma escolha do que vale medir primeiro.

A tentação, e eu já caí nela, é escrever vinte critérios pra cobrir todo cenário imaginável. Dá uma sensação ótima de rigor.

E o resultado é sempre o mesmo: um eval que cobre tudo não é rodado por ninguém. Fica lento, fica caro, e vira aquele relatório de quarenta linhas que alguém abre na primeira semana e nunca mais.

Priorizar não é atalho. É parte do trabalho.

## Slide 3 (lista com pergunta)
**Antes de tudo**
A execução chegou ao fim inteira?
- Sem erro, sem saída vazia, sem corte.
- Sem resposta inteira, nenhum outro critério faz sentido.
- Saída no teto de tokens é corte.

**Script**
Antes dos critérios de qualidade, tem um que vem antes de todos. E vale pras três operações do produto.

A execução chegou ao fim inteira? Sem erro, sem saída vazia, sem resposta cortada no meio?

Por que primeiro? Porque todos os outros critérios pressupõem que existe uma resposta pra julgar. Não adianta perguntar se o Mediador expôs o trade-off se ele parou no meio da palavra.

E esse é o único que o código quase resolve sozinho. Quando os tokens de saída batem exatamente no teto configurado, aquilo não é coincidência. É corte.

Repara na divisão de trabalho de novo. O código detecta o sinal. O juiz decide o que fazer com ele.

## Slide 4 (lista)
**O conjunto do Mediador**
- Trade-off com números: expôs o custo real de cada opção?
- Números vieram de ferramenta: todo número saiu de uma consulta, ou o modelo estimou? Binário.
- Mediou sem decidir: apresentou o conflito e deixou a escolha com o casal?

**Script**
São os critérios do cenário da entrega, agora com nome e escala.

Trade-off com números. Ele expôs o custo real de cada opção, com número concreto? Um mediador sem número não medeia, opina. De zero a um, porque "citou números mas soltos" existe.

Números vieram de ferramenta. Todo número que ele citou saiu de uma consulta de verdade? Ou o modelo estimou? Binário, sem meio-termo. Um número inventado já contamina a mediação inteira. E como o Mediador fala com autoridade, a casa age em cima dele.

Mediou sem decidir. Esse é de posicionamento, não de qualidade de texto. No momento em que ele diz "não peça entrega", deixou de ser o produto que eu construí. E é o tipo de coisa que degrada em silêncio quando alguém melhora o prompt.

## Slide 5 (statement)
**A falta nunca cancela a proposta.**

**Script**
E tem um quarto. Faltou ingrediente e ele ofereceu substituição com o que tem em casa, ou mandou o item pra lista de compras? Em vez de simplesmente cancelar?

Falta de item é o caso mais comum da vida real. Um produto que responde "não dá" toda vez é inútil exatamente na semana em que a casa mais precisa dele.

A regra do produto é explícita: a falta nunca cancela a proposta. Ela vira trade-off.

E esse critério existe por um motivo específico. Essa regra mora no prompt. E prompt não é contrato.

## Slide 6 (lista)
**O Mediador não está sozinho**
- A casa fala com o produto o dia inteiro.
- Critérios próprios: entendeu o tipo certo? preencheu número que ninguém disse?
- Cada operação promete algo diferente. Então cada uma falha diferente.

**Script**
O Mediador não é a única coisa que este produto faz. E o conjunto tem que cobrir o resto.

A casa fala com ele o dia inteiro. "Comprei dois quilos de arroz." "Comemos a lasanha." "Joguei fora aquele resto."

Esse caminho de entrada tem os critérios dele. Ele entendeu que aquilo era uma compra, e não um desejo? Ele preencheu algum número que ninguém disse?

Esse segundo é perigoso de um jeito particular. Se eu digo "comi um prato de lasanha" e o modelo estima seiscentas e cinquenta calorias, o orçamento da semana virou ficção. E ficção que ninguém sabe que é ficção, porque está gravada no banco igual a um número real.

A regra do produto: campo não dito fica vazio, e o sistema pergunta.

Repara no padrão. Cada operação promete uma coisa diferente. Então cada uma falha diferente. Critério genérico não pega nenhuma delas.

## Slide 7 (lista)
**O que eu decidi não medir**
- "Foi agradável": não é julgável de forma repetível.
- Tom e simpatia: barato quando erra. Pode entrar na terceira rodada, não na primeira.
- Latência e custo: são métricas, não critérios de qualidade. Já são coletados sozinhos.

**Script**
E agora a parte que eu acho que mais ensina: o que eu decidi não medir. A lista do que fica de fora diz tanto sobre o produto quanto a lista do que entra.

"A mediação foi agradável." Fora. Não é julgável de forma repetível. E o produto nem promete isso.

Tom e simpatia. Fora, por enquanto. É barato quando erra. Pode entrar na terceira rodada.

Latência e custo. Fora, e esse é o mais contraintuitivo, porque os dois importam muito. Mas são métricas, não critérios de qualidade. São coletados sozinhos, automaticamente. Medir de novo aqui só polui o resultado.

Repara: cada exclusão tem um motivo. E o motivo nunca é "não deu tempo".

## Slide 8 (divisor de ação)
**2.4.1 O conjunto inteiro**

🔴 No terminal:

```
node evals/run-evals.js --dry-run --trace 652b38032d3ce3953b4758e607c40223,d807057bd0808ca94dc63c8a0970f328,fc52a27f08c7cd11be8e0894d1e34ccf,724d2cf3a53efbfa29ad53fde19a3cda
```

~30 s. Duas mediações e dois relatos de ingestão. Deixar rolar até o resumo.

**Script**
Agora o conjunto inteiro. Quatro interações reais: duas mediações e dois relatos que a casa mandou pelo chat.

*(enquanto roda)* Cada bloco é uma interação. Cada linha, um critério. A nota, a barra, e a justificativa do lado. No fim ele agrega por operação.

*(quando terminar, rolar de volta até as duas mediações)* Antes de olhar o resumo, eu quero que você olhe as duas primeiras. Porque elas contam a história sozinhas.

## Slide 9 (tabela)
**Mesmo pedido. Mesmo dia.**
"Vamos fazer carbonara. Preciso da lista de compras" — 22/08

| Critério | 11:16 | 16:01 |
|---|---|---|
| Execução íntegra | 0 | 1 |
| Trade-off com números | 0 | 0,7 |
| Números de ferramenta | 0 | 1 |
| Mediou sem decidir | 0 | 1 |
| Falta virou trade-off | 0 | 1 |

**Script**
Mesmo pedido, palavra por palavra. Mesmo produto. Mesmo dia. Cinco horas de diferença.

De manhã ele não entregou nada. Bateu no teto de tokens, a saída veio vazia. Zero em tudo.

À tarde ele mediou. Quatrocentos gramas de macarrão dos dois quilos e meio. Quatro ovos dos trinta. Tudo conferido contra a ferramenta. O bacon que faltava foi pra lista de compras com substituto sem porco. E ele terminou perguntando: "confirmam a substituição ou preferem a versão vegetariana?".

Lembra do que eu falei no primeiro vídeo? Testar uma vez responde sobre aquele momento.

Se eu tivesse testado de manhã, diria que o produto está quebrado. Se tivesse testado à tarde, diria que está pronto. Os dois estariam errados. Isso não é um slide meu tentando te convencer. É o meu produto, no dia vinte e dois de agosto, provando sozinho.

## Slide 10 (statement)
**Nota baixa é o conjunto funcionando.**

**Script**
Agora o resumo. E a primeira coisa sobre nota baixa: isso não é o conjunto falhando. É o conjunto funcionando. Lembra do primeiro vídeo. Se cem por cento passasse, eu ia desconfiar do critério. Ele existe pra reprovar.

Segunda coisa: leia sempre a justificativa junto da nota. Olha o relato do vinho. *(aponta)* "Comprei um vinho, um chocolate e dois pães." Ancoragem no texto: zero vírgula quatro. Por quê? Três itens comprados, um registrado. O chocolate e os pães sumiram. Ninguém recebeu erro. A nota me diz que tem problema. A justificativa me diz o que fazer.

E a terceira, onde mora o valor de verdade: repara em quais critérios reprovaram juntos. Não é uma lista de problemas independentes. Dois ou três padrões respondem pela maioria. É neles que vale trabalhar primeiro.

## Slide 11 (lista com pergunta)
**O que ainda falta**
Ninguém está sendo avisado de nada.
- Só roda quando eu mando rodar.
- Se a qualidade cair de madrugada, ninguém me avisa.
- Primeiro pilar de pé. Falta o segundo.

**Script**
Pra fechar, eu quero ser honesto sobre o tamanho do que a gente construiu. Porque é bastante. E é menos do que parece.

Este conjunto julga as execuções que eu escolhi, quando eu mando rodar. Ninguém está sendo avisado de nada. Não tem alarme. Não tem vigilância.

Se a qualidade cair numa terça-feira de madrugada, eu descubro quando lembrar de rodar de novo. Se eu esquecer duas semanas, tenho duas semanas de produto ruim que ninguém viu.

Então o primeiro pilar está de pé. Eu consigo responder se a IA está fazendo o que deveria. Mas eram três perguntas. E a segunda é outra: o que está acontecendo com o meu produto? É esse buraco que a próxima aula preenche.

## Slide 12 (hero, fechamento)
**Eu sei o que procurar.**
Agora falta enxergar.

**Script**
Eu sei o que procurar. Agora falta enxergar. Até lá.
