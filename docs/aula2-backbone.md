# Aula 2 — backbone para montagem manual

**Vocabulário: Mediador / Musa Balance.** Continuidade direta da Aula 1 gravada
(28 slides do `Cópia de Evals, Conformidade, Observabilidade v1.pptx`).

Como usar: cada slide abaixo diz **qual slide da Aula 1 duplicar** como base e
**qual campo recebe qual texto**. Duplicar preserva foto, malha, ícones e
tipografia — é o mesmo design, não uma imitação.

---

## O kit de bases (slides da Aula 1)

| Base | Layout | Campos (nº da forma no PowerPoint) | Orçamento de caracteres |
|---|---|---|---|
| **22** | Divisor azul | `4` = título | ~33 |
| **5** | Hero com foto | `3` = título · `4` = subtítulo | 12–20 · 16–25 |
| **6** | Citação | `6` = citação · `7` = autor | ~95 · ~33 |
| **10** | Statement grande (2 fotos) | `5` = frase | **≤ 45** |
| **16** | Lista 3 + pergunta + foto | `2` = título · `17` = pergunta · `7`,`11`,`19` = itens | 13–20 · ~38 · 36 / 57 / 40 |
| **27** | Lista 3 + foto | `2` = título · `7`,`11`,`14` = itens | ~32 · 62 / 93 / 108 |
| **21** | 3 colunas | `17` título · `18` sub · `20`,`21`,`22` rótulos · `23`,`24`,`25` perguntas · `8`,`12`,`15` parágrafos · `32`,`33`,`34` caixas "Ex." | 24 · 65 · 5–14 · 32–44 · ~100 · ~55 |

> ⚠️ **Respeite o orçamento de caracteres.** As caixas foram dimensionadas
> para o texto original; passar muito do tamanho faz o texto vazar por cima do
> item seguinte. Foi o erro que apareceu duas vezes no teste.

---

## Antes do REC

- `.\scripts\observabilidade.ps1 status` → tem que dizer **LIGADA**
- `evals/criterios.md` aberto no editor
- Terminal na raiz do repo, fonte grande
- **Não abrir a interface do Langfuse** — é o vídeo 3.2

## Depois do REC

- `.\scripts\observabilidade.ps1 off` — a Aula 3 precisa do contraste

---

# 2.1 — O que são evals? (10 min)

### 1 · base 22 — divisor
`4`: **2.1 O que são evals?**

### 2 · base 5 — hero
`3`: **Evals** · `4`: **O primeiro pilar do run**

> "Na aula passada eu fechei o relatório de riscos do Musa Balance, e a gente
> viu os três pilares que sustentam o run. Hoje eu pego o primeiro deles."

### 3 · base 10 — statement
`5`: **A IA está fazendo o que deveria?**

> "Essa é a pergunta do primeiro pilar, do jeito que ela apareceu na tela da
> aula passada. Foco em qualidade, precisão, segurança e aderência ao
> esperado. Essa aula inteira é essa pergunta. E repara: ela não é sobre
> construir. Construir eu já fiz, o produto está no ar. Ela é sobre o run."

### 4 · base 16 — lista
`2`: **Build and Run** · `17`: **E se eu mudar o produto amanhã?**
- `7`: Uma mudança melhora uma resposta e piora outra.
- `11`: Um comportamento que eu tinha como garantido pode sumir.
- `19`: Um erro que eu já corrigi volta. E volta pior.

> "O relatório de riscos fala do que **pode** dar errado — é hipótese sobre o
> futuro. Agora imagina que amanhã eu mude o prompt do Mediador.
> O primeiro jeito de dar errado é o mais traiçoeiro: eu posso ter melhorado
> uma coisa e quebrado outra. Posso ter corrigido a classificação de fonte e,
> sem perceber, piorado a capacidade dele de identificar um trade-off.
> O segundo é pior, porque não tem sintoma: um comportamento que eu tinha como
> garantido simplesmente some. Ninguém recebe erro.
> E o terceiro: um erro que eu já consertei volta — e costuma voltar pior,
> porque agora eu confio que aquilo está resolvido."

### 5 · base 10 — statement
`5`: **Testar uma vez responde sobre aquele momento.**

> "Eu posso testar manualmente. Uma vez. Duas vezes. Mas testar uma vez
> responde sobre aquele momento — e produto é o que acontece nos outros dias.
> Eu preciso de uma maneira sistemática de verificar isso continuamente. E é
> exatamente aqui que entram os evals."

### 6 · base 27 — lista
`2`: **Evals: transformar qualidade em evidência**
- `7`: Processo sistemático pra verificar se o produto se comporta como eu espero.
- `11`: Não é QA e não é teste de software: teste pergunta "é igual ao esperado?", eval pergunta "é bom?".
- `14`: É critério que pode ser reproduzido e aprimorado de forma repetível.

> "Eu quero uma definição que você consiga repetir pra outra pessoa amanhã.
> Eval é um processo sistemático pra verificar se o produto está se comportando
> como eu espero. E deixa eu tirar do caminho a confusão mais comum: isso não é
> QA e não é teste de software. Teste compara com o resultado esperado — dois
> mais dois tem que dar quatro, sempre, e se eu rodar de novo dá quatro de
> novo. O Mediador não faz isso: o mesmo pedido, na mesma semana, gera texto
> diferente cada vez. E o pulo do gato — **as duas versões podem estar
> certas**."

### 7 · base 21 — 3 colunas
`17`: **O funil de qualquer eval** · `18`: Três passos, sempre nesta ordem — e só o do meio é decisão minha.

| | Cenário | Critério | Evidência |
|---|---|---|---|
| **rótulo** (`20`/`21`/`22`) | Cenário | Critério | Evidência |
| **pergunta** (`23`/`24`/`25`) | O que eu estou tentando avaliar? | O que eu espero que ele faça? | Atendeu ou não atendeu? |
| **parágrafo** (`8`/`12`/`15`) | A situação específica que eu escolhi observar. Não uma pergunta genérica. | O que eu espero que o produto faça ali. Decisão de produto, não do modelo. | O que ele fez de fato, confrontado com o critério. Fato, não impressão. |
| **Ex.** (`32`/`33`/`34`) | Ex.: o casal pede uma mediação de cardápio pra semana. | Ex.: expor o trade-off com o número que a ferramenta devolveu. | Passou ou não passou — com justificativa apontável. |

> "Todo eval que eu construo tem os mesmos passos, e eles vêm nesta ordem.
> Primeiro o cenário: o que eu estou tentando avaliar. No Musa Balance, o casal
> pediu uma mediação de cardápio pra semana.
> Segundo o critério: o que eu espero que ele faça naquele cenário. E aqui está
> a parte que quase ninguém fala — **isso é uma decisão minha, de produto**.
> Não é o modelo que define.
> E terceiro a evidência: atendeu ou não atendeu, com justificativa apontável.
> Guarda esse funil, porque a aula inteira mora dentro dele."

### 8 · base 10 — statement
`5`: **Não estamos avaliando o modelo.**

> "Antes de escrever qualquer critério, uma frase que eu quero que fique
> gravada: não estamos avaliando o modelo, estamos avaliando **o comportamento
> esperado do produto**. Parece detalhe de linguagem e não é — muda o que você
> escreve. Se eu avalio o modelo, eu escrevo critério genérico: a resposta é
> coerente? o texto está bem escrito? Se eu avalio o produto, eu escrevo o que
> ele prometeu pra esta casa: expôs o trade-off? usou o número que a ferramenta
> devolveu? O segundo eu consigo defender numa reunião. O primeiro, não."

### 9 · base 27 — lista
`2`: **Se tudo passa, o critério está fácil demais**
- `7`: 100% de aprovação é sinal de alerta, não de sucesso.
- `11`: Um critério bom precisa reprovar alguma coisa. Se nunca reprova, não está medindo.
- `14`: Quanto de falha eu aceito é decisão de produto. Não existe "zero erro" de graça.

> "É muito tentador comemorar quando cem por cento das respostas passam. Eu já
> fiz isso — levei o número verde pra reunião e todo mundo bateu palma. Só que
> cem por cento de aprovação é sinal de alerta: quase sempre quer dizer que o
> critério está tão frouxo que qualquer resposta passa, inclusive as ruins.
> E aí vem a decisão mais de produto desta aula: quanto de falha eu aceito?
> Porque zero erro custa modelo mais caro, resposta mais lenta, e um produto
> que recusa tanto que a pessoa desinstala. **Essa conta é minha, não do
> modelo.**"

---

# 2.2 — Critérios de qualidade (12 min)

### 10 · base 22 — divisor
`4`: **2.2 Critérios de qualidade**

### 11 · base 10 — statement
`5`: **De opinião a critério verificável**

> "No funil do vídeo passado a gente viu cenário, critério, evidência. Hoje a
> gente para exatamente no **critério**. É o passo mais fácil de fazer errado —
> e é o único que não precisa de código nenhum. Isso é bom e é perigoso ao
> mesmo tempo: bom porque qualquer pessoa do time consegue escrever critério;
> perigoso porque qualquer pessoa consegue escrever critério ruim, e critério
> ruim parece critério."

### 12 · base 16 — lista
`2`: **O cenário** · `17`: **Pote vazio, gato miando.**
- `7`: A casa quer pedir entrega hoje.
- `11`: E tem porção caseira parada na geladeira, feita no fim de semana.
- `19`: O chef pensa em desperdício. A musa quer o que deu vontade.

> "Critério no abstrato não se escreve bem, então deixa eu dar um cenário
> concreto. Pote vazio, gato miando, e a casa querendo pedir entrega. Só que
> tem porção caseira parada na geladeira, feita no fim de semana. Eu, como
> chef, penso em desperdício e em orçamento. A musa quer comer o que deu
> vontade. E olha: **os dois têm razão**. Não existe lado errado nessa conversa
> — é exatamente pra esse conflito que o Mediador existe. Então é daqui que os
> critérios têm que nascer: da promessa do produto."

### 13 · base 27 — lista  *(primeiros 3 critérios)*
`2`: **Os critérios que nascem desse cenário**
- `7`: Menciona que existem porções caseiras não consumidas?
- `11`: Cita o relato de delivery recente como parte do motivo?
- `14`: Não decide sozinho o que a casa deve fazer — expõe e deixa a escolha em aberto?

> "Repara que dá pra apontar o sim ou o não em todos — esse é o teste.
> Ele mencionou que existem porções caseiras não consumidas, ou fingiu que a
> geladeira estava vazia? Ele citou o delivery recente como parte do motivo?
> Porque essa é a informação que muda a conversa.
> E o terceiro é de posicionamento: ele decidiu sozinho o que a casa deve
> fazer? Se decidiu, ele parou de ser mediador. No momento em que ele diz 'não
> peça entrega', ele virou mais um app de dieta que a pessoa desinstala."

### 14 · base 27 — lista  *(os outros 2 + o fecho)*
`2`: **E os dois que pegam número inventado**
- `7`: Usa números reais — porções restantes, dias desde o preparo?
- `11`: Não inventa prazo de validade que não veio de cálculo em código?
- `14`: Um número inventado que parece certo é indistinguível de um número certo até alguém conferir.

> "Ele usou número real — porções restantes, dias desde o preparo — ou falou
> por alto? Um mediador sem número não medeia, opina. E opinião não resolve
> conflito entre duas pessoas que já sabem o que querem.
> E o último, que é o meu favorito: ele inventou um prazo de validade que não
> veio de cálculo em código? Porque um número inventado que **parece** certo é
> a pior classe de erro que existe aqui. É indistinguível de um número certo
> até alguém conferir — e como o Mediador fala com autoridade, a casa age em
> cima dele."

### 15 · base 21 — 3 colunas *(as partes de um critério; a 4ª entra na fala)*
`17`: **Todo critério tem 4 partes** · `18`: E as quatro são obrigatórias — se faltar uma, o critério vaza.

| | Nome | Pergunta | Escala |
|---|---|---|---|
| **rótulo** | Nome | Pergunta | Escala |
| **pergunta** | Como esse critério se chama? | Uma pessoa consegue responder? | Binário ou de 0 a 1? |
| **parágrafo** | É o que vai ser gravado toda vez. Sem nome estável, não dá pra comparar no tempo. | Tem que ser respondível olhando a interação, sem abrir o repositório. | Binário quando a falha é categórica; 0 a 1 quando "meio certo" existe. |
| **Ex.** | Ex.: `mediou_sem_decidir` | Ex.: deixou a escolha com o casal? | Ex.: não existe respeitar 70% de uma alergia. |

> "São quatro partes, e as quatro são obrigatórias.
> **Nome** — parece burocracia e não é: é o que vai ser gravado toda vez. Sem
> nome estável, eu não comparo esta semana com a próxima.
> **Pergunta** — o teste de fogo: uma pessoa responde olhando a interação, sem
> abrir o repositório? Se precisa do código, está escrito na linguagem errada.
> **Escala** — binário quando a falha é categórica; de zero a um quando 'meio
> certo' existe de verdade. Na dúvida, binário: escala contínua vira opinião
> disfarçada de número.
> E tem uma quarta, que não coube na tela e é a mais importante: **por que erra
> caro**."

### 16 · base 10 — statement
`5`: **Por que erra caro**

> "Essa quarta parte parece burocracia de documentação. É o oposto: é o que
> separa um critério de uma curiosidade. **Um critério que não custa nada
> quando falha não merece ser um eval** — e ele não é neutro, é negativo,
> porque toda rodada ele gasta tempo, gasta dinheiro e ocupa uma linha que
> alguém tem que ler. O exercício é escrever o custo em uma frase concreta. Se
> você não conseguir escrever essa frase, o critério não deveria existir."

### 17 · base 10 — statement
`5`: **Agora eu tenho mais do que opinião**

> "Antes eu lia a mediação e achava razoável — e 'razoável' era eu, lendo uma
> vez, com o humor daquele dia. Agora eu tenho critério. E o teste é esse:
> qualquer pessoa da casa aplica e chega no mesmo sim ou no mesmo não que eu.
> **Se precisa de mim pra julgar, não é critério, é gosto.** E com critério eu
> consigo decidir o que fazer a seguir — que é pra isso que medir serve."

---

# 2.3 — Claude como avaliador (12 min)

### 18 · base 22 — divisor
`4`: **2.3 Claude como avaliador**

### 19 · base 16 — lista
`2`: **Ler à mão** · `17`: **Funciona — até não funcionar.**
- `7`: Com três mediações, ler uma por uma é o melhor investimento que existe.
- `11`: Com trezentas eu não leio. E com trinta por semana, eu paro na quarta-feira.
- `19`: O critério não escala sozinho.

> "Eu tenho critério escrito, agora preciso aplicar. E o primeiro jeito é o
> óbvio: eu leio. E eu quero ser justo com esse método, porque ele é
> subestimado — com três mediações, ler uma por uma é o melhor investimento que
> existe. Foi lendo à mão que eu descobri o que medir. Não pule essa etapa
> achando que é primitiva.
> O problema é que ela não escala, e de um jeito específico: com trezentas eu
> não leio, isso é óbvio. Mas o caso que mata é o do meio — com trinta por
> semana, eu leio na segunda, leio na terça, e paro na quarta. E aí eu tenho um
> processo de qualidade que existe no documento e não existe na prática."

### 20 · base 21 — 3 colunas
`17`: **Do critério ao julgamento** · `18`: O Claude entra num papel oposto ao que ele tinha até agora.

| | Trace | Julgamento | Veredito |
|---|---|---|---|
| **rótulo** | Trace | Julgamento | Veredito |
| **pergunta** | O que aconteceu de fato? | O critério foi atendido? | Atendeu ou não atendeu? |
| **parágrafo** | Uma execução real: pedido, resposta final, cada ferramenta chamada e o que devolveu. | O árbitro confronta a execução com o critério — sempre do mesmo jeito. | Nota por critério, com a evidência que sustenta cada uma. |
| **Ex.** | Ex.: bem mais do que eu olho quando leio à mão. | Ex.: LLM as a judge. | Ex.: um árbitro que não cansa na sexta-feira. |

> "Até agora o Claude **gerava** — escrevia a mediação. Agora ele **julga**.
> Mesmo modelo, trabalho oposto: ele não produz nada novo, lê uma execução que
> já aconteceu e emite um parecer.
> E olha o que ele recebe: o trace inteiro. O pedido original, a resposta
> final, quais ferramentas foram chamadas e o que cada uma devolveu. Isso é bem
> mais do que eu olho quando leio à mão — eu leio a resposta, ele enxerga o
> caminho inteiro. Inclusive se o produto consultou o estoque e depois ignorou
> o resultado."

### 21 · base 27 — lista
`2`: **O que transforma o modelo em juiz**
- `7`: Julgue só com base no material — não suponha nada que não esteja ali.
- `11`: Toda nota precisa de evidência citável. Justificativa genérica é justificativa inválida.
- `14`: Seja severo com falha silenciosa: um estado errado que ninguém percebeu é pior que um erro barulhento.

> "Apontar o modelo pra uma resposta e perguntar 'isso tá bom?' não produz um
> juiz. Produz um elogiador — modelo de linguagem é agradável por construção.
> O que transforma o modelo em juiz é o conjunto de regras.
> Primeira: julgue só com base no material. Se a informação não está no que ele
> recebeu, ela não existe pro julgamento.
> Segunda: toda nota precisa de evidência citável. 'A resposta foi boa' não vale
> como razão.
> E a terceira, minha favorita: seja severo com falha silenciosa. Repara que
> essa é uma instrução de **valor**, não técnica — eu estou dizendo pro juiz o
> que este produto considera grave. É isso que 'simular o julgamento de um
> especialista' quer dizer."

### 22 · base 10 — statement
`5`: **Nota sem evidência não vale nada**

> "Cada critério devolve dois campos obrigatórios: o valor e a justificativa —
> e a justificativa tem que citar o material. Isso não é capricho: **é o que me
> deixa discordar do juiz.** Se ele me devolve 'nota zero vírgula três' e mais
> nada, eu tenho duas opções ruins: aceitar na fé, ou refazer o trabalho à mão.
> Se ele me devolve 'zero vírgula três porque a resposta não menciona as porções
> que estão na geladeira', eu confiro em cinco segundos — e se ele estiver
> errado, eu conserto o critério. Um juiz que eu não consigo auditar não é
> melhor que nenhum juiz: é pior, porque me dá confiança falsa."

### 23 · base 27 — lista
`2`: **O juiz não faz conta**
- `7`: Antes de chamar o Claude, o código apura os fatos: ferramentas, tokens, erros.
- `11`: Isso entra no material já pronto, marcado como fato. O juiz usa e não recalcula.
- `14`: Aritmética é trabalho de código. Julgamento é trabalho do modelo. Misturar estraga o eval em silêncio.

> "Antes de chamar o Claude, o **código** apura os fatos objetivos: quais
> ferramentas rodaram, quantos tokens saíram, se houve erro, se a saída veio
> vazia. Isso entra no material já pronto, marcado como fato, e a instrução é
> explícita: use e não refaça conta nenhuma.
> Por que importa tanto? Porque comparar número é exatamente o que modelo de
> linguagem faz mal — e faz com confiança."

### 24 · base 10 — statement
`5`: **Prompt não é contrato.**

> "Pra somar as notas eu preciso da resposta estruturada. A tentação é escrever
> 'responda em JSON com as notas'. E funciona. Quase sempre. E 'quase sempre'
> não serve — quando ele resolve responder em prosa, não sobra nota nenhuma e a
> rodada inteira se perde, e eu só descubro quando o relatório vem vazio.
> A solução não é escrever o pedido com mais ênfase: é estrutural. A chamada da
> ferramenta é **forçada pela API**; o modelo não tem a opção de responder em
> prosa. Guarda essa frase, porque vale muito além de eval: **prompt não é
> contrato, prompt é pedido.**"

### 🔴 DEMO — o juiz julgando uma mediação real

```bash
node evals/run-evals.js --dry-run --limit 1 --operacao mediar-cardapio
```

**~15 s.** Leia estas duas em voz alta quando aparecerem:

- `execucao_integra 0.00` — *"a saída final está cortada no meio da frase
  'Ovos brancos'; o restante (custos, trade-offs, pergunta final) nunca chega
  a existir."*
- `numeros_de_tool 1.00` — *"o único número que aparece (2,5 kg de macarrão)
  corresponde exatamente ao retorno de `verificar_disponibilidade`."*

> "O mesmo truncamento tirou zero num critério e **um** no outro — e os dois
> estão certos. Zero em integridade porque a resposta foi cortada; um em
> 'números vieram de ferramenta' porque o número que sobrou estava correto.
> É por isso que critério não é redundante. Com um critério só, eu teria uma
> nota que não me diz o que fazer. Com os dois, eu sei onde está o problema:
> não é invenção, é corte."

---

# 2.4 — Primeiro conjunto de evals (15 min)

### 25 · base 22 — divisor
`4`: **2.4 Primeiro conjunto de evals**

### 26 · base 10 — statement
`5`: **Conjunto é escolha, não lista**

> "'Conjunto' é a palavra certa: não é uma lista de tudo que dá pra medir, é
> uma escolha do que vale medir primeiro. A tentação — e eu já caí nela — é
> escrever vinte critérios pra cobrir todo cenário imaginável. Dá uma sensação
> ótima de rigor. E o resultado é sempre o mesmo: **um eval que cobre tudo não
> é rodado por ninguém.** Fica lento, fica caro, e vira aquele relatório de
> quarenta linhas que alguém abre na primeira semana e nunca mais. Priorizar
> não é atalho, é parte do trabalho."

### 27 · base 16 — lista
`2`: **Antes de tudo** · `17`: **A execução chegou ao fim inteira?**
- `7`: Sem erro, sem saída vazia, sem resposta cortada no meio.
- `11`: Não adianta perguntar se ele expôs o trade-off se a resposta parou no meio da palavra.
- `19`: Token de saída igual ao teto é assinatura de corte.

> "Antes dos critérios de qualidade tem um que vem antes de todos, e vale pras
> três operações: a execução chegou ao fim inteira?
> Por que primeiro? Porque todos os outros critérios pressupõem que existe uma
> resposta pra julgar.
> E esse é o único que o código quase resolve sozinho: quando os tokens de
> saída batem **exatamente** no teto configurado, aquilo não é coincidência.
> Repara na divisão de trabalho de novo — o código detecta o sinal, o juiz
> decide o que fazer com ele."

### 28 · base 27 — lista
`2`: **O conjunto do Mediador**
- `7`: Trade-off com números — expôs o custo real de cada opção, ou deu conselho genérico?
- `11`: Números vieram de ferramenta — todo número saiu de uma consulta, ou o modelo estimou? Binário.
- `14`: Mediou sem decidir — apresentou o conflito e deixou a escolha com o casal?

> "São os mesmos critérios do cenário do gato, agora com nome e escala.
> Trade-off com números: um mediador sem número não medeia, opina — e opinião
> não resolve conflito entre duas pessoas que já sabem o que querem.
> Números vieram de ferramenta: binário, sem meio-termo, porque um número
> inventado já contamina a mediação inteira. Como o Mediador fala com
> autoridade, a casa age em cima dele.
> Mediou sem decidir: critério de **posicionamento**, não de qualidade de
> texto. É o tipo de coisa que degrada em silêncio quando alguém 'melhora' o
> prompt."

### 29 · base 10 — statement
`5`: **A falta nunca cancela a proposta**

> "E tem um quarto: faltou ingrediente e ele ofereceu substituição com o que
> tem em casa, em vez de simplesmente cancelar? Falta de item é o caso mais
> comum da vida real. Um produto que responde 'não dá' toda vez é inútil
> exatamente na semana em que a casa mais precisa dele. A regra aqui é
> explícita: **a falta nunca cancela a proposta, ela vira trade-off.**"

### 30 · base 27 — lista
`2`: **O Mediador não está sozinho**
- `7`: A casa fala com o produto o dia inteiro: "comprei dois quilos de arroz", "comemos a lasanha".
- `11`: Esse caminho de entrada tem os critérios dele: entendeu o tipo certo? preencheu número que ninguém disse?
- `14`: Campo não dito fica vazio, e o sistema pergunta. Cada operação promete algo diferente, então cada uma falha diferente.

> "O conjunto tem que cobrir o resto. A casa fala com o produto o dia inteiro,
> e esse caminho de entrada tem os critérios dele: ele entendeu que aquilo era
> uma compra e não um desejo? Ele preencheu algum número que ninguém disse?
> Esse segundo é perigoso de um jeito particular: se eu digo 'comi um prato de
> lasanha' e o modelo estima seiscentas e cinquenta calorias, o orçamento da
> semana virou ficção. E ficção que ninguém sabe que é ficção, porque está
> gravada no banco igualzinho a um número real."

### 31 · base 27 — lista
`2`: **O que eu deliberadamente não medi**
- `7`: "A mediação foi agradável" — não é julgável de forma repetível, e o produto não promete isso.
- `11`: Tom e simpatia — barato quando erra. Pode entrar na terceira rodada, não na primeira.
- `14`: Latência e custo — são métricas, não critérios de qualidade. Já são coletados sozinhos.

> "A lista do que ficou de fora diz tanto sobre o produto quanto a do que
> entrou. Repara no padrão: cada exclusão tem um motivo — e o motivo nunca é
> 'não deu tempo'."

### 🔴 DEMO — o conjunto inteiro

```bash
node evals/run-evals.js --dry-run --limit 2
```

**~1min05.** Resultado real de 03/09: **média 0,56 · 21 scores em 5
interações**, com notas espalhadas (0,20 / 0,50 / 0,70 / 1,00).

**O momento mais forte da aula está aqui.** O `--limit 2` traz dois traces de
`sugerir-receita` com **o mesmo pedido e dois minutos de diferença** (12/08,
13h53 e 13h55):

| Critério | 13:53 | 13:55 |
|---|---|---|
| `execucao_integra` | **1.00** | **0.00** |
| `respeito_as_restricoes` | **1.00** | 0.00 |
| `consumo_registrado` | **1.00** | 0.00 |
| `fidelidade_ao_estoque` | 0.40 | 0.00 |

> "Mesmo pedido, palavra por palavra. Dois minutos de diferença. Um passou em
> três critérios de quatro, o outro tirou zero em todos.
> Lembra do que eu falei no começo? Testar uma vez responde sobre aquele
> momento. Isso não é um slide meu tentando te convencer — é o meu produto, no
> dia doze de agosto, provando isso sozinho. Se eu tivesse testado às treze e
> cinquenta e três, eu ia dizer que estava funcionando. Dois minutos depois eu
> estaria errado."

E o `0.40` da que **deu certo**: *"a receita cita 'tomate', 'cebola' e 'azeite
extravirgem', que não aparecem na lista de `consultar_estoque`."*

> "Essa resposta foi boa: respeitou a restrição, registrou o consumo, chegou
> inteira. Se eu tivesse lido à mão, eu teria aprovado. E o critério pegou uma
> coisa que eu não ia pegar — ela completou com o que 'todo mundo tem em casa'.
> Eu só vi porque escrevi o critério antes."

**Se um trace falhar em cena** (aconteceu no pré-flight):

```
[1/2] 1ecca5e617e2...  FALHOU
  Error: O juiz nao devolveu o criterio "execucao_integra"
```

> "Olha o que aconteceu: o **juiz** falhou. E repara em duas coisas. Primeira:
> o script não engoliu — parou, disse qual trace, disse qual critério faltou.
> Segunda: eu falei que forçar a ferramenta é garantia estrutural. E é — mas
> ela garante que a ferramenta seja **chamada**, não que todo campo venha
> preenchido. Garantia tem limite, e saber onde fica o limite é parte do
> trabalho."

### 32 · base 10 — statement
`5`: **Nota baixa é o conjunto funcionando**

> "Se cem por cento passasse, eu ia desconfiar do critério — ele existe pra
> reprovar. Leia sempre a justificativa junto da nota: a nota diz que tem
> problema, a justificativa diz o que fazer. E repara em quais critérios
> reprovaram **juntos** — dois ou três padrões costumam responder pela maioria."

### 33 · base 16 — lista
`2`: **O que ainda falta** · `17`: **Ninguém está sendo avisado de nada.**
- `7`: Ele julga as execuções que eu escolhi, quando eu mando rodar.
- `11`: Se a qualidade cair numa terça de madrugada, eu descubro quando lembrar de rodar.
- `19`: O primeiro pilar está de pé. Falta o segundo.

> "Eu quero ser honesto sobre o tamanho do que a gente construiu, porque é
> bastante — e é menos do que parece. Não tem alarme, não tem vigilância. Se eu
> esquecer duas semanas, eu tenho duas semanas de produto ruim que ninguém viu.
> Então o primeiro pilar está de pé: eu consigo responder se a IA está fazendo
> o que deveria. Mas lembra que eram três perguntas. A segunda é outra: **o que
> está acontecendo com o meu produto?** É esse buraco que a próxima aula
> preenche."

### 34 · base 5 — hero (fechamento)
`3`: **Eu sei o que procurar.** · `4`: **Agora falta enxergar.**

> "Eu sei o que procurar. Agora falta enxergar. Até lá."

---

## 2.5 — O que aprendemos? (texto, não vídeo)

Está pronto em [`aula2-o-que-aprendemos.md`](aula2-o-que-aprendemos.md) —
precisa de uma passada pra trocar o vocabulário para Mediador/Musa Balance.

---

## Estado do que já foi automatizado

`slides/aula2-musa-balance.pptx` tem os **28 slides da Aula 1 + os 9 slides do
2.1** (itens 1–9 acima) já montados e conferidos. Para continuar à mão: duplique
as bases conforme a tabela e apague os 28 primeiros slides no fim.
