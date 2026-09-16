# Aula 2 — leitura única (deck + fala, 4 vídeos + texto final)

**Vocabulário: Mediador / Musa Balance** (decisão do Diego, 03/09). O produto
desta aula é o Agente Mediador — ele não sugere, ele **medeia** entre os dois
atores da casa: o chef (orçamento, saúde, desperdício) e a musa (o desejo
gastronômico).

| Vídeo | Título (espelho oficial) | Tempo |
|---|---|---|
| 2.1 | O que são evals? | 10 min |
| 2.2 | Critérios de qualidade | 12 min |
| 2.3 | Claude como avaliador | 12 min |
| 2.4 | Primeiro conjunto de evals | 15 min |
| 2.5 | O que aprendemos? | **texto** — [`aula2-o-que-aprendemos.md`](aula2-o-que-aprendemos.md) |

Deck: [`slides/aula2-alura-live.pptx`](../slides/aula2-alura-live.pptx) — 47
slides, **todos com a fala na nota de apresentação**. Este documento é a mesma
fala em formato de leitura corrida.

**Os builds progressivos** (43–50 do deck mestre viraram 5 cópias aqui):
slides 3–7, 9–12, 18–22 e 39–42 são a mesma tela revelando uma linha por vez.
A nota é idêntica nas cópias — leia inteira na primeira e vá revelando.

---

## Antes do REC

| Item | Como deixar |
|---|---|
| Terminal | aberto na raiz do repo, fonte grande |
| Langfuse | **ligado** — `.\scripts\observabilidade.ps1 status` tem que dizer `LIGADA` |
| `evals/criterios.md` | aberto no editor, pronto pro 2.2 |
| Deck | `aula2-alura-live.pptx` em apresentação |

⚠️ **Depois de gravar: `.\scripts\observabilidade.ps1 off`** — a Aula 3 precisa
do Langfuse desligado pro contraste do vídeo 3.2.

⚠️ **Não abra a interface do Langfuse.** O nome aparece no cabeçalho do
script, e citar de passagem tudo bem — navegar por ela é o 3.2.

---

# 🎬 Vídeo 2.1 — O que são evals? (10 min)

**[Capa]**

> "Na aula passada eu terminei com um mapa de riscos do meu produto. Hoje eu
> transformo esse mapa em alguma coisa que eu consiga checar toda semana, sem
> depender da minha memória."

**[Divisor 2.1 — claquete]**

**[Build: A gente encontrou os riscos. E agora?]** — 5 cópias

> "Acabamos de fazer o nosso primeiro mapa de riscos. E olha que interessante:
> a gente já encontrou coisas que deram errado de verdade.
>
> Agora imagina que amanhã eu mude o prompt do Mediador. Eu posso ter
> melhorado uma coisa e quebrado outra. Posso ter corrigido a classificação de
> fonte e, sem perceber, piorado a capacidade dele de identificar um
> trade-off.
>
> Como eu vou saber?
>
> Eu posso testar manualmente. Uma vez. Duas vezes. Mas isso não me dá
> garantia de que o produto continua fazendo aquilo que eu espero.
>
> Então eu preciso de uma maneira sistemática de verificar isso
> continuamente. E é exatamente aqui que entram os Evals."

**[Slide: Evals: transformar qualidade em evidência]**

> "Eu quero uma definição que você consiga repetir pra outra pessoa amanhã.
>
> Eval é um processo sistemático pra verificar se o produto está se comportando
> como eu espero.
>
> E deixa eu tirar do caminho a confusão mais comum: isso não é QA, e não é
> teste de software. Teste compara com o resultado esperado — dois mais dois
> tem que dar quatro, sempre, e se eu rodar de novo dá quatro de novo.
>
> O Mediador não faz isso. O mesmo pedido, na mesma semana, gera texto
> diferente cada vez. E repara no pulo do gato: **as duas versões podem estar
> certas.**
>
> Se eu escrever um teste que espera uma frase específica, ele falha na segunda
> execução e não me ensina nada."

**[Build: O funil que sustenta qualquer eval]** — 4 cópias

> "Todo eval que eu construo tem os mesmos quatro passos, e eles vêm nesta
> ordem.
>
> Primeiro o **cenário**: o que eu estou tentando avaliar. No caso do Mediador,
> o casal pediu uma mediação de cardápio pra semana.
>
> Segundo o **critério**: o que eu espero que ele faça naquele cenário. E
> repara que isso é uma decisão minha, de produto — não é o modelo que define.
>
> Terceiro a **resposta**: o que ele fez de verdade. Não o que eu imagino que
> ele faça, o que está gravado.
>
> E quarto a **evidência**: atendeu ou não atendeu, com uma justificativa que
> eu consiga apontar.
>
> Guarda esse funil, porque a aula inteira mora dentro dele."

**[Slide: Não estamos avaliando o modelo]**

> "Antes de escrever qualquer critério, uma frase que eu quero que fique
> gravada.
>
> **Não estamos avaliando o modelo. Estamos avaliando o comportamento esperado
> do produto.**
>
> Parece detalhe de linguagem e não é — muda o que você escreve.
>
> Se eu avalio o modelo, eu escrevo critério genérico: a resposta é coerente? o
> texto está bem escrito?
>
> Se eu avalio o produto, eu escrevo o que este produto prometeu pra esta casa:
> ele expôs o trade-off? usou o número que a ferramenta devolveu?
>
> O segundo tipo de critério eu consigo defender numa reunião. O primeiro,
> não."

**[Slide: Se tudo passa, o critério está fácil demais]**

> "Um aviso que economiza semanas, e ele é contraintuitivo.
>
> É muito tentador comemorar quando cem por cento das respostas passam no seu
> critério. Eu já fiz isso. Levei o número verde pra reunião e todo mundo bateu
> palma.
>
> Só que cem por cento de aprovação é sinal de alerta, não de sucesso. Quase
> sempre quer dizer que o critério está tão frouxo que qualquer resposta passa
> — inclusive as ruins.
>
> A regra que eu carrego: **um critério bom precisa reprovar alguma coisa.** Se
> ele nunca reprova, ele não está medindo, está decorando.
>
> E aí vem a decisão mais de produto desta aula: quanto de falha eu aceito?
> Porque zero erro custa modelo mais caro, resposta mais lenta, e um produto
> que recusa tanto que a pessoa desinstala. **Essa conta é minha. Não é do
> modelo.**"

---

# 🎬 Vídeo 2.2 — Critérios de qualidade (12 min)

**[Divisor 2.2 — claquete]**

**[Slide: De opinião a critério verificável]**

> "No funil do vídeo passado a gente viu Cenário, Critério, Resposta,
> Evidência. Hoje a gente para exatamente no **Critério**.
>
> É o passo mais fácil de fazer errado — e é o único dos quatro que não precisa
> de código nenhum.
>
> Isso é bom e é perigoso ao mesmo tempo. É bom porque qualquer pessoa do time
> consegue escrever critério. É perigoso porque qualquer pessoa consegue
> escrever critério ruim — e critério ruim parece critério."

**[Slide: O cenário: o pote vazio e o gato miando]**

> "Deixa eu te dar um cenário concreto, porque critério no abstrato não se
> escreve bem.
>
> Pote vazio, gato miando, e a casa querendo pedir entrega. Só que tem porção
> caseira parada na geladeira, feita no fim de semana.
>
> Eu, como chef, penso em desperdício e em orçamento. A musa quer comer o que
> deu vontade. E olha: **os dois têm razão.** Não existe lado errado nessa
> conversa.
>
> É exatamente pra esse conflito que o Mediador existe. Então é daqui que os
> critérios têm que nascer — da promessa do produto, não de uma lista de boas
> práticas que eu baixei da internet."

**[Build: Os critérios que nascem desse cenário]** — 5 cópias

> "E aqui estão os critérios que nascem desse cenário. Repara que dá pra
> apontar o sim ou o não em todos.
>
> Ele mencionou que existem porções caseiras não consumidas? Ou fingiu que a
> geladeira estava vazia?
>
> Ele citou o delivery recente como parte do motivo? Porque essa é a informação
> que muda a conversa.
>
> Ele decidiu sozinho o que a casa deve fazer? Se decidiu, ele parou de ser
> mediador. No momento em que ele diz 'não peça entrega', ele virou mais um app
> de dieta que a pessoa desinstala.
>
> Ele usou número real — porções restantes, dias desde o preparo — ou falou por
> alto?
>
> E o último, que é o meu favorito: ele inventou um prazo de validade que não
> veio de cálculo em código? Porque um número inventado que *parece* certo é a
> pior classe de erro que existe aqui. É indistinguível de um número certo até
> alguém conferir."

**🔴 AÇÃO** — abra `evals/criterios.md` no editor e deixe visível.

**[Slide: Todo critério tem quatro partes]**

> "Esse formato tem quatro partes, e as quatro são obrigatórias. Se faltar uma,
> o critério vaza por algum lado.
>
> **Nome.** Parece burocracia e não é: é o que vai ser gravado toda vez que o
> critério for aplicado. Sem nome estável, eu não consigo comparar a semana
> passada com esta. E comparar no tempo é o ponto inteiro.
>
> **Pergunta.** E o teste de fogo é esse: uma pessoa consegue responder olhando
> a interação, sem abrir o repositório? Se pra responder ela precisa do código,
> o critério está escrito na linguagem errada.
>
> **Escala.** Binário ou de zero a um — daqui a pouco eu falo de como escolher.
>
> **E por que erra caro.** Essa é a que todo mundo pula, e é a mais importante
> das quatro."

**[Slide: Binário ou 0 a 1: como eu escolho]**

> "A regra da escala é mais simples do que parece.
>
> **Binário é pra falha categórica.** Ou ele deixou a escolha em aberto, ou ele
> decidiu sozinho. Não existe deixar setenta por cento em aberto. Se a falha
> não tem meio-termo na vida real, ela não pode ter meio-termo na régua.
>
> **A escala de zero a um é pra quando 'meio certo' existe de verdade.** Ele
> citou números, mas soltos, sem ligar à escolha — isso não é a mesma coisa que
> não citar nada, e também não é o que eu queria.
>
> E na dúvida, prefira binário. Escala contínua vira opinião disfarçada de
> número: o meu zero vírgula sete é o zero vírgula oito seu, e ninguém sabe o
> que separa os dois."

**[Slide: "Por que erra caro" é o filtro que corta a lista pela metade]**

> "Essa quarta parte parece burocracia de documentação. É o oposto: é o que
> separa um critério de uma curiosidade.
>
> **Um critério que não custa nada quando falha não merece ser um eval.**
>
> E repara que ele não é neutro — ele é negativo. Toda vez que eu rodo o
> conjunto, ele gasta tempo, gasta dinheiro, e ocupa uma linha do relatório que
> alguém tem que ler.
>
> O exercício é escrever o custo em uma frase concreta: se isso falhar,
> acontece tal coisa, e o prejuízo é esse. Se você não conseguir escrever essa
> frase, o critério provavelmente não deveria existir."

**[Slide: Agora eu tenho mais do que uma opinião]**

> "Olha o que mudou.
>
> Antes eu lia a mediação e achava razoável. E 'razoável' era eu, lendo uma
> vez, com o humor que eu estava naquele dia.
>
> Agora eu tenho critério. E o teste é esse: qualquer pessoa da casa aplica e
> chega no mesmo sim ou no mesmo não que eu cheguei. **Se precisa de mim pra
> julgar, não é critério, é gosto.**
>
> E com critério eu consigo decidir o que fazer a seguir — que é pra isso que
> medir serve. Medir sem decidir nada depois é relatório, não é produto."

---

# 🎬 Vídeo 2.3 — Claude como avaliador (12 min)

**[Divisor 2.3 — claquete]**

**[Slide: Ler à mão funciona — até não funcionar]**

> "Eu tenho critério escrito. Agora eu preciso aplicar.
>
> E o primeiro jeito é o óbvio: eu leio. Pego a mediação, olho o que o produto
> tinha em mãos, respondo sim ou não pra cada critério.
>
> E eu quero ser justo com esse método, porque ele é subestimado: **com três
> mediações, ler uma por uma é o melhor investimento que existe.** Foi lendo à
> mão que eu descobri o que medir. Não pule essa etapa achando que é primitiva.
>
> O problema é que ela não escala — e não escala de um jeito específico. Com
> trezentas eu não leio, isso é óbvio. Mas o caso que realmente mata é o do
> meio: com trinta por semana, eu leio na segunda, leio na terça, e paro na
> quarta.
>
> E aí eu tenho um processo de qualidade que existe no documento e não existe
> na prática."

**[Build: Do critério ao julgamento]** — 3 cópias

> "E a ideia é essa: o Claude entra num papel completamente diferente do que
> ele tinha até agora neste produto.
>
> Até agora ele **gerava** — ele escrevia a mediação. Agora ele **julga**. É o
> mesmo modelo com um trabalho oposto: ele não produz nada novo, ele lê uma
> execução que já aconteceu e emite um parecer.
>
> E olha o que ele recebe: o trace inteiro. O pedido original, a resposta
> final, quais ferramentas foram chamadas e o que cada uma devolveu.
>
> Repara que isso é bem mais do que eu olho quando leio à mão. Eu leio a
> resposta. Ele enxerga o caminho inteiro — inclusive se o produto consultou o
> estoque e depois ignorou o resultado da consulta.
>
> É um árbitro que nunca cansa e que não julga diferente na sexta-feira."

**[Slide: O que transforma o modelo em juiz]**

> "Só que apontar o modelo pra uma resposta e perguntar 'isso tá bom?' não
> produz um juiz. Produz um elogiador. Modelo de linguagem é agradável por
> construção — ele vai achar quase tudo razoável.
>
> O que transforma o modelo em juiz é o conjunto de regras que eu dou pra ele.
> Vou ler as três que mais importam.
>
> **Primeira: julgue só com base no material.** Se a informação não está no que
> ele recebeu, ela não existe pro julgamento. Isso corta pela raiz a tendência
> dele de preencher lacuna com o que é plausível.
>
> **Segunda: toda nota precisa de evidência citável.** 'A resposta foi boa' não
> vale como razão.
>
> **E a terceira, que é a minha favorita: seja severo com falha silenciosa.**
> Repara que essa é uma instrução de valor, não uma instrução técnica. Eu estou
> dizendo pro juiz o que este produto considera grave. E é isso que 'simular o
> julgamento de um especialista' quer dizer: especialista tem critério de
> gravidade, não só de correção."

**[Slide: Nota sem evidência não vale nada]**

> "Deixa eu insistir na segunda regra, porque ela muda a natureza da coisa.
>
> Cada critério devolve dois campos, e os dois são obrigatórios: o valor e a
> justificativa. E a justificativa tem que citar o material — um trecho da
> resposta, o nome de uma ferramenta, um número que apareceu.
>
> Isso não é capricho de documentação. **É o que me deixa discordar do juiz.**
>
> Pensa comigo: se ele me devolve 'nota zero vírgula três' e mais nada, eu
> tenho duas opções e as duas são ruins. Aceitar na fé, ou refazer o trabalho à
> mão pra conferir.
>
> Se ele me devolve 'zero vírgula três porque a resposta não menciona as
> porções que estão na geladeira', eu levo cinco segundos pra verificar. E se
> ele estiver errado, eu descubro — e aí eu conserto o critério.
>
> Um juiz que eu não consigo auditar não é melhor que nenhum juiz. É pior,
> porque me dá confiança falsa."

**[Slide: O juiz não faz conta]**

> "Agora uma decisão de desenho que eu recomendo pra qualquer eval que você for
> construir.
>
> Antes de chamar o Claude, o **código** apura os fatos objetivos. Quais
> ferramentas rodaram. Quantos tokens saíram em cada chamada. Se alguma
> observação ficou em nível de erro. Se a saída final veio vazia.
>
> Isso tudo entra no material que o juiz recebe, já pronto, marcado como fato.
> E a instrução pra ele é explícita: isso é verdade apurada, use e não refaça
> conta nenhuma.
>
> Por que isso importa tanto? Porque comparar número é exatamente o tipo de
> coisa que modelo de linguagem faz mal — e faz com confiança.
>
> A regra que eu levo pra qualquer projeto: **aritmética é trabalho de código,
> julgamento é trabalho do modelo.** Misturar os dois é como a maioria dos
> evals estraga sem ninguém notar."

**[Slide: Prompt não é contrato]**

> "E a última decisão, que é a que mais gente aprende do jeito difícil.
>
> Pra somar as notas, eu preciso que a resposta do juiz venha estruturada, não
> em prosa. A tentação é escrever no prompt: 'responda em JSON com as notas de
> cada critério'.
>
> E isso funciona. Quase sempre. E 'quase sempre' não serve — porque quando ele
> resolve responder em prosa, não sobra nota nenhuma pra somar, e eu só
> descubro quando o relatório vem vazio.
>
> A solução não é escrever o pedido com mais ênfase. É estrutural: a chamada da
> ferramenta é **forçada pela API**. O modelo não tem a opção de responder em
> prosa.
>
> Guarda essa frase, porque ela vale muito além de eval: **prompt não é
> contrato. Prompt é pedido.** Quando você precisa de garantia, a garantia tem
> que estar na estrutura."

**🔴 AÇÃO — o juiz julgando uma mediação real.** No terminal:

```bash
node evals/run-evals.js --dry-run --limit 1 --operacao mediar-cardapio
```

**Tempo: ~15 s.** Enquanto roda:

> "Repara no que está acontecendo. Ele está montando o material — pedido,
> resposta, ferramentas, e os sinais que o código já apurou — e mandando pro
> juiz. Cada linha que aparece é um critério julgado, com a evidência do lado."

Quando terminar, **leia duas justificativas em voz alta** e comente o que o
juiz enxergou que você não tinha visto.

---

# 🎬 Vídeo 2.4 — Primeiro conjunto de evals (15 min)

**[Divisor 2.4 — claquete]**

**[Slide: Conjunto não é lista de tudo — é escolha]**

> "Agora a gente monta o conjunto. E 'conjunto' é a palavra certa: não é uma
> lista de tudo que dá pra medir, é uma escolha do que vale medir primeiro.
>
> A tentação natural, e eu já caí nela, é escrever vinte critérios pra cobrir
> todo cenário imaginável. Dá uma sensação ótima de rigor.
>
> E o resultado é sempre o mesmo: **um eval que cobre tudo não é rodado por
> ninguém.** Ele fica lento, fica caro, e vira aquele relatório de quarenta
> linhas que alguém abre na primeira semana e nunca mais.
>
> Priorizar não é atalho, é parte do trabalho."

**[Slide: O critério que vem antes de todos os outros]**

> "Antes dos critérios de qualidade, tem um que vem antes de todos.
>
> A execução chegou ao fim inteira? Sem erro, sem saída vazia, sem resposta
> cortada no meio?
>
> Por que ele vem primeiro? Porque não adianta perguntar se o Mediador expôs o
> trade-off se a resposta parou no meio da palavra. Todos os outros critérios
> pressupõem que existe uma resposta pra julgar.
>
> E esse é o único que o código consegue quase inteiro sozinho. Existe uma
> assinatura de corte que é quase infalível: quando os tokens de saída batem
> **exatamente** no teto configurado, aquilo não é coincidência.
>
> Repara na divisão de trabalho de novo: o código detecta o sinal, e o juiz
> decide o que fazer com ele."

**[Build: O conjunto do Mediador]** — 4 cópias

> "São os mesmos critérios que a gente escreveu no cenário do gato, agora com
> nome e escala.
>
> **Trade-off com números**: ele expôs o custo real de cada opção, com número
> concreto? Porque um mediador sem número não medeia, opina. E opinião não
> resolve conflito entre duas pessoas que já sabem o que querem.
>
> **Números vieram de ferramenta**: todo número citado saiu de uma consulta de
> verdade, ou o modelo estimou? Binário, sem meio-termo. Porque como o Mediador
> fala com autoridade, a gente age em cima do número. Se ele estiver inventado,
> a casa toma decisão errada com confiança.
>
> **Mediou sem decidir**: esse é um critério de posicionamento. No momento em
> que ele diz 'não peça entrega', ele deixou de ser o produto que eu construí.
>
> **E falta virou trade-off**: faltou ingrediente e ele ofereceu substituição
> com o que tem em casa, em vez de simplesmente cancelar? Falta de item é o
> caso mais comum da vida real. Um produto que responde 'não dá' toda vez é
> inútil exatamente na semana em que a casa mais precisa dele."

**[Slide: O Mediador não está sozinho]**

> "O Mediador não é a única coisa que este produto faz, e o conjunto tem que
> cobrir o resto.
>
> A casa fala com ele o dia inteiro: 'comprei dois quilos de arroz', 'comemos a
> lasanha', 'joguei fora aquele resto'.
>
> Esse caminho de entrada tem os critérios dele. Ele entendeu que aquilo era
> uma compra e não um desejo? Ele preencheu algum número que ninguém disse?
>
> E esse segundo é perigoso de um jeito particular. Se eu digo 'comi um prato
> de lasanha' e o modelo estima seiscentas e cinquenta calorias, o orçamento da
> semana virou ficção. E ficção que ninguém sabe que é ficção, porque está
> gravada no banco igualzinho a um número real.
>
> A regra do produto é: campo não dito fica vazio, e o sistema **pergunta**.
>
> Repara no padrão: cada operação promete uma coisa diferente, então cada uma
> falha diferente. Critério genérico não pega nenhuma delas."

**[Slide: O que eu deliberadamente não medi]**

> "E agora a parte que eu acho que mais ensina: o que eu decidi **não** medir.
> Porque a lista do que fica de fora diz tanto sobre o produto quanto a lista
> do que entra.
>
> 'A mediação foi agradável' — fora. Não é julgável de forma repetível, e o
> produto nem promete isso.
>
> Tom e simpatia da resposta — fora, por enquanto. É barato quando erra. Pode
> entrar na terceira rodada.
>
> Latência e custo — fora, e esse é o mais contraintuitivo, porque os dois
> importam muito. Mas eles são **métricas**, não critérios de qualidade. São
> coletados sozinhos, automaticamente. Medir de novo aqui só polui o resultado
> com número que já existe em outro lugar.
>
> Repara no padrão: cada exclusão tem um motivo. E o motivo nunca é 'não deu
> tempo'."

**🔴 AÇÃO — o conjunto inteiro.** No terminal:

```bash
node evals/run-evals.js --dry-run --limit 2
```

**Tempo**: ~15 s por interação. Com `--limit 2` são 6 interações ≈ **1min30**.
Sem `--limit`, o padrão é 4 por operação = 12 interações ≈ **3 min** — bom
demais de resultado, longo demais de tela parada. Use `--limit 2` na gravação.

**[Slide: Nota baixa é o conjunto funcionando]**

> "Olha o resultado.
>
> A primeira coisa que eu quero dizer sobre nota baixa: **isso não é o conjunto
> falhando, é o conjunto funcionando.** Lembra do começo da aula — se cem por
> cento passasse, eu ia desconfiar do critério. Ele existe pra reprovar.
>
> Segunda coisa: leia sempre a justificativa junto da nota. A nota me diz que
> tem problema. A justificativa me diz **o que fazer a respeito**. E as duas
> coisas são muito diferentes.
>
> E a terceira, que é onde mora o valor de verdade: repara em quais critérios
> reprovaram **juntos**. Não é uma lista de problemas independentes. Dois ou
> três padrões costumam responder pela maioria — e é neles que vale trabalhar
> primeiro."

**[Slide: O que este conjunto ainda não faz]**

> "E pra fechar, eu quero ser honesto sobre o tamanho do que a gente construiu.
> Porque é bastante — e é menos do que parece.
>
> Este conjunto julga as execuções que eu escolhi, quando eu mando rodar.
> Ninguém está sendo avisado de nada. Não tem alarme, não tem vigilância.
>
> Se a qualidade cair numa terça-feira de madrugada, eu descubro quando eu
> lembrar de rodar de novo. Se eu esquecer duas semanas, eu tenho duas semanas
> de produto ruim que ninguém viu.
>
> Ter critério é metade do trabalho. A outra metade é enxergar o produto
> continuamente, sem eu precisar lembrar. **É esse buraco que a próxima aula
> preenche.**"

**[Fechamento]**

> "Eu sei o que procurar. Agora falta enxergar. Até lá."

---

## Depois do REC

```bash
.\scripts\observabilidade.ps1 off
```

---

**Resumo das ações**: abrir `criterios.md` (2.2) · rodar o juiz numa mediação
com `--limit 1 --operacao mediar-cardapio` (2.3) · rodar o conjunto com
`--limit 2` (2.4) · desligar o Langfuse depois de gravar.
