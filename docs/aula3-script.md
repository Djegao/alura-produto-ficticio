# Aula 3 — Slide · Script

Documento mestre da Aula 3. O formato é o mesmo da Aula 2: o que está na tela, depois o que eu falo.
**Rascunho para debate (16/09).** Nada aqui foi aprovado, e o deck só é gerado depois do debate.

- Decisões em aberto, auditoria do material antigo e riscos: [`aula3-avaliacao-e-plano.md`](aula3-avaliacao-e-plano.md)
- Todos os números e evidências (16/09, 14h54): [`apoio/aula3-dados-congelados.md`](apoio/aula3-dados-congelados.md)
- Pré-flight, "se der errado" e o que o aluno leva: [`apoio/aula3-preflight-e-apoio.md`](apoio/aula3-preflight-e-apoio.md)
- Bases de slide e orçamento de caracteres: [`aula3-bases.md`](aula3-bases.md)
- Persona de referência: [`persona-ai-product-builder.md`](persona-ai-product-builder.md)

| Vídeo | Título (espelho) | Tempo | Estado |
|---|---|---|---|
| 3.1 | O que é observabilidade? | ~7 min | 🟡 rascunho para debate |
| 3.2 | Conhecendo o Langfuse | ~11 min | 🟡 rascunho para debate |
| 3.3 | Lendo os dados de produção | ~10 min | 🟡 rascunho para debate |
| 3.4 | Padrões de falha | ~12 min | 🟡 rascunho para debate |

Tempo estimado pela fala (864 / 1.021 / 1.169 / 1.194 palavras, a ~140 por minuto), mais demos e trocas de janela: **~40 min**. O CSV não informa tempo pra Aula 3; a Aula 2 teve 49 min.
| 3.5 | O que aprendemos? | texto | [`aula3-o-que-aprendemos.md`](aula3-o-que-aprendemos.md) (rascunho) |

**Fio condutor:** a Aula 2 fechou com *"Eu sei o que procurar. Agora falta enxergar."* A Aula 3 fecha com *"Eu já enxergo. Agora falta agir."*, que abre a Aula 4 (detectar, diagnosticar, corrigir).

**⚠️ Calendário:** o plano gratuito do Langfuse mostra 30 dias. A partir de **21/09**, metade da janela some (8 das 10 mediações). Os slides trazem os números congelados de 16/09; os trechos de fala que mudam se a gravação for depois disso estão marcados com *(se gravar a partir de 21/09)*.

---

# 3.1 — O que é observabilidade?

Antes de gravar: nenhuma demo neste vídeo. Langfuse fechado.

## Slide 1 (divisor)
**3.1 O que é observabilidade?**

## Slide 2 (hero)
**Observabilidade**
O segundo pilar do run

**Script**
Na aula passada eu terminei com uma frase: eu sei o que procurar, agora falta enxergar.

Eu tinha critério, tinha juiz, tinha um conjunto de evals. E tinha um buraco que eu mesmo apontei no último slide: tudo aquilo só roda quando eu mando rodar.

Hoje eu pego o segundo pilar. E começo do mesmo jeito que comecei o primeiro: lembrando qual era a pergunta dele.

## Slide 3 (statement)
**O que está acontecendo com meu produto?**

**Script**
Essa é a pergunta da observabilidade. Não é "a resposta está boa?". Essa era a dos evals.

Essa aqui é mais ampla, e mais incômoda. O que está acontecendo com o meu produto agora? Uso, erro, tempo de resposta, custo. A saúde dele.

E repara no "agora". O eval eu rodo quando quero. O produto não espera eu querer.

## Slides 4, 5, 6 (build, foto do corredor)
**Enquanto eu não olho**
O produto não para quando eu paro.
- Toda sexta, ele escolhe a receita.
- O Telegram recebe mensagem a qualquer hora do dia.
- E o eval só roda quando eu mando.

**Script**
Deixa eu te mostrar o tamanho disso no meu produto.

*(linha 1)* Toda sexta de manhã, o Musa Balance escolhe sozinho a receita premium da semana. Olha o feed de um canal de receitas, cruza com o estoque e manda no grupo da casa. Ninguém aperta botão. Eu não estou lá.

*(linha 2)* O Telegram recebe mensagem a qualquer hora. Uma compra, um jantar, um desejo pro sábado. Cada mensagem passa por uma inteligência que entende o que a pessoa quis dizer e mexe no estoque.

*(linha 3)* E o eval, que eu construí com tanto cuidado, roda quando eu lembro de rodar.

Então a pergunta é simples. Quando uma dessas coisas dá errado sem eu estar olhando, como eu saberia?

## Slide 7 (statement)
**Observar é conseguir reconstruir.**

**Script**
A primeira resposta de quase todo mundo é: eu olho o log. E log ajuda. Mas log é um evento solto. "Deu erro aqui." E ele só existe se alguém lembrou de escrever aquela linha.

Observabilidade é outra coisa. É eu conseguir reconstruir, depois, sem ter estado lá, o caminho inteiro. O que chegou, o que o produto fez, em que ordem, quanto custou, como terminou.

Não é saber que algo aconteceu. É conseguir explicar por quê.

Deixa eu te mostrar com uma sexta-feira de verdade.

## Slide 8 (tabela)
**Sexta, 28 de agosto**
A receita premium, reconstruída pelo rastro.

| Horário | O que o rastro mostra | Tempo |
|---|---|---|
| 11h35 | ❌ erro: chave de acesso inválida | 0,9 s |
| 12h35 | ❌ erro: chave de acesso inválida | 4,1 s |
| 13h55 | ✅ receita escolhida: Beef Wellington | 10,7 s |

**Script**
Na aula bônus eu recusei duas perguntas como eval: "a receita saiu no prazo?" e "alguma semana ficou sem receita?". Recusei porque não são julgamento, são conta de data. E deixei anotado que eram pendência de observabilidade. Olha onde a resposta mora.

Nas sextas seguintes, a receita saiu às sete e dezoito da manhã. Nessa sexta, 28 de agosto, o produto passou a manhã fora do ar e só voltou às dez e trinta e quatro. E fora do ar não deixa rastro nenhum: essa parte da manhã simplesmente não existe aqui.

Às onze e trinta e cinco, o job tentou. Erro: chave de acesso inválida. A chave que o produto usa pra falar com a inteligência tinha sido revogada, e eu ainda não tinha trocado. Às doze e trinta e cinco, tentou de novo. Mesmo erro. Às doze e cinquenta e quatro eu troquei a chave. E às treze e cinquenta e cinco a receita saiu.

Então, saiu no prazo? Não. Saiu mais de seis horas e meia depois do horário de costume, com dois erros no caminho. E ninguém me mandou mensagem nenhuma. Se eu quero saber hoje o que aconteceu naquela manhã, eu não dependo da minha memória. Está gravado.

*(um detalhe pra guardar)* A receita que saiu às treze e cinquenta e cinco foi o Beef Wellington. Na sexta seguinte, ele foi escolhido de novo. É a repetição que o eval da aula bônus pegou.

## Slide 9 (3 colunas)
**O que eu preciso gravar**
De cada interação, três coisas. Sem elas, não dá pra reconstruir.

| O caminho | A conta | O desfecho |
|---|---|---|
| O que ele fez antes de responder? | Quanto custou e quanto tempo levou? | Terminou inteira, cortada ou com erro? |
| Cada consulta e cada ferramenta, com o que entrou e o que saiu de cada passo. | Tokens, dinheiro e segundos, passo a passo. É daqui que sai a conta do mês. | Erro, resposta cortada, saída vazia. E, quando existir, a nota do eval da Aula 2. |
| Ex.: consultou estoque, validade e orçamento. | Ex.: 14 centavos e 56 segundos por mediação. | Ex.: 2.048 tokens de saída: bateu no teto. |

**Script**
Então, o que eu preciso gravar? Três coisas, de cada interação.

O caminho. O que ele fez antes de responder. Consultou o estoque? A validade? O orçamento? Com o que entrou e o que saiu de cada passo. Sem o caminho, eu vejo a resposta e não sei de onde ela veio.

A conta. Quanto custou e quanto tempo levou, passo a passo, porque é assim que eu descubro pra onde vai o dinheiro.

E o desfecho. Terminou inteira? Deu erro? Veio cortada no meio? E, quando existir, a nota que o eval da aula passada escreve de volta.

Repara nos exemplos. Nenhum é inventado, e todos voltam nesta aula. O caminho é o próximo vídeo. A conta é o 3.3. E aquele "2.048 tokens: bateu no teto" é o 3.4.

## Slide 10 (statement)
**Nenhuma chamada da IA sem rastro.**

**Script**
Quando eu entendi isso, eu adotei uma regra no meu produto. E ela é radical de propósito: nenhuma chamada da inteligência pode acontecer sem deixar rastro. Nenhuma.

Não é enfeite pra depois. Está escrita na especificação do produto como requisito, do mesmo tamanho que "precisa de senha pra entrar".

E tem um detalhe que quase me pegou. O rastro precisa ligar antes de todo o resto. Se ele liga tarde, o que aconteceu antes dele some. E some em silêncio.

## Slide 11 (statement)
**Desligar o rastro não quebra o produto.**

**Script**
E aqui está o motivo de quase todo mundo adiar isso.

Se eu desligo a observabilidade, o produto continua funcionando. O usuário não percebe nada. Ninguém abre chamado dizendo "seu produto está sem rastro".

Quem fica cego sou eu. E é isso que muda a forma de operar. Sem rastro, eu descubro o problema quando alguém reclama. Com rastro, eu descubro olhando o dado. Às vezes antes de alguém perceber.

No próximo vídeo eu desligo na sua frente. E ligo de novo.

---

# 3.2 — Conhecendo o Langfuse

Antes de gravar: pré-flight do 3.2 em [`apoio/aula3-preflight-e-apoio.md`](apoio/aula3-preflight-e-apoio.md). O resumo: observabilidade **LIGADA**, servidor local **parado**, Langfuse aberto na lista de interações, as duas frases de teste validadas fora do ar, e o **Telegram fora da demo**.

## Slide 1 (divisor)
**3.2 Conhecendo o Langfuse**

## Slide 2 (lista)
**Onde o rastro vai morar**
- Na nuvem do Langfuse: liga em minutos, e o dado fica com eles.
- No seu servidor, com Docker: controle total, mas sem alta disponibilidade, escala nem backup.
- Na sua própria nuvem, em produção de verdade: quando o produto já provou valor e o dado é sensível.

**Script**
A ferramenta que eu uso pra isso é o Langfuse. E, antes de abrir a tela, uma decisão que parece técnica e é de negócio: onde esse rastro vai morar?

*(linha 1)* O primeiro caminho é a nuvem deles. Cria a conta, cria o projeto, pega as chaves, e em minutos o dado está chegando. A contrapartida: o dado do seu produto fica na infraestrutura deles.

*(linha 2)* O segundo é rodar você mesmo, com Docker. Controle total de onde o dado mora. Mas a própria documentação deles é honesta: é uma máquina só, sem alta disponibilidade, sem escala, sem backup. Serve pra testar, não pra sustentar produto.

*(linha 3)* E o terceiro é a versão de produção na sua própria nuvem, pra quando o produto já provou valor.

Por que isso importa agora? Porque o rastro guarda o que o usuário escreveu. Se o seu produto lida com dado de cliente, onde o rastro mora é uma decisão de conformidade. Guarda esse fio, que ele volta na Aula 5. Neste curso, eu uso a nuvem deles.

## Slide 3 (statement)
**Grátis até 50 mil registros por mês.**

**Script**
E, antes de você criar conta: quanto custa.

O plano gratuito dá cinquenta mil registros por mês. Registro é qualquer coisa que chega lá: uma interação, um passo dentro dela, uma nota.

Pra você ter uma ideia, o meu produto tem hoje duzentos e cinquenta e nove registros no painel. Meio por cento do plano gratuito. Você não precisa pagar nada pra fazer o que eu faço nesta aula.

Mas tem um limite que importa mais que esse, e ele vai aparecer daqui a pouco: no plano gratuito, você só enxerga os últimos trinta dias.

## Slide 4 (3 colunas)
**Três palavras na tela**
O que você vai ler em inglês, e o que cada palavra quer dizer.

| Trace | Observation | Score |
|---|---|---|
| Interação: do pedido até a resposta. | Passo: o que aconteceu lá dentro. | Nota: o que o eval achou daquilo. |
| É a unidade que você abre primeiro. Uma mensagem no Telegram vira uma; uma mediação vira outra. | Cada chamada ao modelo e cada ferramenta, com o que entrou, o que saiu, quanto custou e quanto levou. | O eval da Aula 2 escreve a avaliação de volta, grudada na interação que ele julgou. |
| Ex.: uma mediação de cardápio. | Ex.: a consulta ao estoque. | Ex.: execução íntegra: 0. |

🔴 Langfuse, lista de interações. Abrir a mensagem "comprei maçãs" (29/08, 13h12) e mostrar os 2 passos. Depois abrir a mediação `1ecca5e6` (03/09, 16h36) e mostrar a árvore. Não ler a resposta dela.

**Script**
Agora sim, a tela. Ela está em inglês, então vão três palavras, com o que cada uma quer dizer.

Trace é a interação, do pedido até a resposta. É o que você abre primeiro.

Observation é o passo. Cada coisa que aconteceu lá dentro: cada chamada ao modelo, cada ferramenta. Com o que entrou, o que saiu, quanto custou e quanto levou.

E Score é a nota. Lembra do eval da aula passada? Ele escreve a avaliação de volta, aqui, grudada na interação que ele julgou.

*(alt+tab pro Langfuse, abre "comprei maçãs")* Olha essa aqui: uma mensagem que chegou pelo Telegram. "Comprei maçãs." Dois passos. O agente, e uma chamada ao modelo pra entender que aquilo era uma compra.

*(abre 1ecca5e6)* E agora uma mediação de cardápio. Olha o tamanho da árvore. Consultou o estoque, a validade, as preferências, o orçamento, os relatos da semana. Verificou o que tinha disponível. Chamou o modelo quatro vezes.

Eu não vou ler a resposta dessa agora. Guarda o horário: três de setembro, quatro e trinta e seis da tarde. Ela volta no último vídeo desta aula.

## Slide 5 (statement)
**Uma mensagem, 2 passos. Uma mediação, 12.**

**Script**
Guarda essa diferença, porque ela vira dinheiro no próximo vídeo.

Uma mensagem curta: dois passos. Essa mediação: doze. E tem mediação aqui com quinze.

Cada passo é uma coisa que eu consigo abrir e conferir. É isso que eu quero dizer com reconstruir: eu não estava olhando às quatro e meia da tarde do dia três, e mesmo assim eu sigo o caminho inteiro.

## Slide 6 (lista)
**Ligando no seu produto**
- Crie o projeto e gere as chaves nas configurações.
- São três valores: duas chaves e o endereço. Você cola na configuração do seu produto.
- O rastro precisa ligar antes de todo o resto. Se ligar tarde, o que veio antes some sem aviso.

🔴 Langfuse: configurações do projeto → chaves de API. Mostrar onde ficam, sem revelar a chave secreta.

**Script**
E pra ligar isso no seu produto?

*(linha 1)* Você cria o projeto aqui, e nas configurações gera as chaves. *(mostra a tela, sem abrir a secreta)*

*(linha 2)* São três valores: duas chaves e o endereço do servidor. Você cola na configuração do seu produto. E essas chaves são segredo: nunca vão pro código, nunca vão pro chat.

*(linha 3)* E a regra de ordem: o rastro liga antes de todo o resto. Se você está construindo com um assistente de código, é exatamente isso que você pede pra ele. Eu deixei o pedido pronto no material de apoio desta aula.

É a parte mais fácil da aula inteira. E é a que mais gente deixa pra depois, porque nada quebra enquanto ela não está ligada.

## Slide 7 (divisor de ação)
**3.2.1 Antes e depois**

🔴 No terminal, na pasta do produto:

```
powershell -File scripts/observabilidade.ps1 off
npm start
```

Apontar as duas linhas amarelas [WARN] da subida. No produto local (localhost:3300, nunca pelo Telegram), mandar na conversa: "Bateu vontade de pastel de feira". Depois, no Langfuse: nada.

**Script**
Então vamos provar. Eu desligo a observabilidade do meu produto, rodando aqui na minha máquina, e subo de novo.

*(aponta o terminal)* Olha o que apareceu. Duas linhas amarelas: não tem chave configurada, o envio vai falhar. Esse é o aviso. Uma vez, na hora de ligar.

*(no produto)* Agora eu uso o produto normalmente. "Bateu vontade de pastel de feira." Ele entende que é um desejo e anota no feed. Funciona igual.

*(no Langfuse)* E aqui? Nada. A interação aconteceu, e não sobrou rastro nenhum.

## Slide 8 (statement)
**O aviso existe. Mora onde ninguém lê.**

**Script**
Eu quero ser justo com a ferramenta: ela avisou. Duas linhas, na hora de subir.

Só que repara onde. Num terminal. Em produção, isso vai parar num log de servidor que ninguém abre, no meio de centenas de linhas, no dia em que alguém mexeu numa configuração.

O usuário não percebe. O produto não reclama. E o aviso fica num lugar que ninguém lê. É por isso que isso nunca parece urgente, até o dia em que você precisa do dado e ele não existe.

## Slide 9 (divisor de ação)
**3.2.2 Ligando de volta**

🔴 Ctrl+C no terminal. Depois:

```
powershell -File scripts/observabilidade.ps1 on
npm start
```

Sem linha amarela na subida. No produto local, mandar: "Bateu vontade de caldo de cana". Voltar pro slide 10 e falar por um minuto. Só então abrir o Langfuse: a interação está lá, com os 2 passos.

**Script**
Agora eu ligo de volta. Paro o servidor, devolvo as chaves, subo de novo. Repara: nenhuma linha amarela.

*(no produto)* Mesma coisa: "Bateu vontade de caldo de cana."

E aqui eu preciso te avisar de uma coisa antes que você ache que quebrou.

## Slide 10 (statement)
**Tempo real não é instantâneo.**

**Script**
O registro leva uns quarenta e cinco segundos pra aparecer. Eu medi isso no meu produto. Não é erro, é fila: o dado sai daqui, é processado do lado de lá, e só então fica consultável.

Se você olhar na hora e não achar, vai achar que a configuração deu errado. Não deu. Espera.

E isso vale pra qualquer coisa que você automatizar em cima desse dado. Se o seu processo lê o registro logo depois de criar, ele precisa esperar também.

*(volta pro Langfuse)* Agora sim. Olha ela aqui: a mesma ação de um minuto atrás, inteira, com os dois passos.

## Slide 11 (statement)
**A diferença está no que eu consigo ver.**

**Script**
O produto fez exatamente a mesma coisa nas duas vezes. Entendeu a frase, anotou o desejo, respondeu.

A diferença não está no produto. Está no que eu consigo ver.

E agora que eu vejo cada interação, no próximo vídeo eu paro de olhar uma de cada vez.

---

# 3.3 — Lendo os dados de produção

Antes de gravar: Langfuse no painel inicial, janela de 30 dias. Rode `node scripts/aula3-retrato-langfuse.js` e confira se os números batem com os slides. *(Se gravar a partir de 21/09, os slides 3 a 9 continuam valendo como foto de 16/09; troque as falas marcadas.)*

## Slide 1 (divisor)
**3.3 Lendo os dados de produção**

## Slide 2 (statement)
**Uma conversa por vez não mostra o produto.**

**Script**
Até aqui eu abri uma interação por vez. Isso é ótimo pra entender um caso. E é péssimo pra entender o produto.

Porque produto é o conjunto. É o que acontece nos outros dias, lembra? Então agora eu paro de ler uma por uma e olho tudo junto. Com quatro perguntas: o volume, o dinheiro e a espera, os erros, e a qualidade ao longo do tempo.

## Slide 3 (tabela)
**42 interações, US$ 1,54**
Meu produto de 21/08 a 14/09. Foto tirada em 16/09.

| O que o produto faz | Vezes | Custo por vez | % da conta |
|---|---|---|---|
| Mediar o cardápio | 10 | US$ 0,138 | 89,6% |
| Receita premium da semana | 6 | US$ 0,012 | 4,5% |
| Entender uma mensagem | 21 | US$ 0,003 | 4,3% |
| Ler nota fiscal | 4 | US$ 0,006 | 1,6% |
| Um teste meu | 1 | US$ 0 | 0% |

🔴 Opcional: Langfuse, painel inicial. Mostrar o custo total e o gráfico de interações no tempo.

**Script**
Isso aqui não é exemplo inventado. É o meu produto, no ar, num recorte de três semanas e meia.

Quarenta e duas interações. Um dólar e cinquenta e quatro centavos no total. É pouco, porque é uma casa só.

Agora olha a primeira linha. Mediar o cardápio aconteceu dez vezes e custou quatorze centavos por vez. Entender uma mensagem aconteceu vinte e uma vezes, e custa três décimos de centavo cada.

*(se gravar a partir de 21/09)* E se você abrir o meu painel hoje, esses números já não estão lá. Eu explico por quê daqui a pouco.

## Slide 4 (statement)
**24% das chamadas. 90% da conta.**

**Script**
E aí aparece uma conclusão que eu não teria de outro jeito. O Mediador é um quarto das chamadas do meu produto. E nove de cada dez dólares que eu pago.

Ele não é o mais usado. O mais usado é entender mensagem, metade de tudo. O Mediador é o mais caro por uso, de longe.

E isso muda decisão de produto. Se eu quiser baratear, não adianta mexer no que roda metade das vezes, porque aquilo é quase de graça. E você nunca chega nessa conclusão lendo uma conversa por vez.

É esse tipo de frase que eu levo pra uma reunião de prioridade. Não "acho que está caro". É "um quarto das chamadas, noventa por cento da conta".

Guarda o número: dez mediações. No próximo vídeo eu abro as dez.

## Slide 5 (lista com pergunta)
**O que o volume conta**
Pico é sucesso? Silêncio é saúde?
- Metade de tudo caiu em 20 horas.
- Depois, dias inteiros sem nenhuma interação.
- Produto fora do ar não deixa rastro.

**Script**
Primeira pergunta: o volume.

*(linha 1)* Metade de tudo o que o meu produto fez nessas três semanas e meia caiu em menos de vinte horas: a noite de 21 e o dia 22 de agosto. Sucesso? Não. Foi eu preparando e dando uma aula ao vivo com o produto. Pico que vem de teste e de demonstração não é adoção. Se eu olhasse só o gráfico, ia comemorar.

*(linha 2)* E depois, dias inteiros sem nada. De cinco a dez de setembro, zero.

*(linha 3)* E aqui tem uma armadilha. Silêncio pode ser ninguém usando. Ou pode ser o produto fora do ar. Lembra da sexta, dia 28? A manhã inteira fora do ar, e o painel não mostra nada. O rastro só existe quando o produto está de pé pra gravar.

Então, como eu saberia a diferença? Não por aqui. Pra saber se o produto está no ar, eu preciso de alguém de fora batendo na porta de tempos em tempos. Observabilidade de IA não substitui isso.

## Slide 6 (tabela)
**Média esconde quem espera mais.**
Tempo de resposta, em segundos.

| | Média | Metade das vezes, até | Pior caso |
|---|---|---|---|
| Mediar o cardápio | 56 s | 50 s | 113 s |
| Entender uma mensagem | 1,5 s | 1,2 s | 3,3 s |

**Script**
Segunda pergunta: a espera.

A média do Mediador é cinquenta e seis segundos. Parece que todo mundo espera quase um minuto. Não é verdade. Metade das vezes ele respondeu em até cinquenta. E teve uma vez que levou cento e treze.

A média esconde exatamente quem mais se irritou. Por isso o painel do Langfuse mostra percentis. O p50 é a metade das vezes. O p95 é o tempo que só cinco por cento passam. Com mil interações, olhe o p95. Com dez, como eu tenho aqui, olhe o pior caso, porque o p95 é praticamente ele.

E guarda esse cento e treze. Ele tem uma história, e ela é surpreendente.

## Slide 7 (tabela)
**Seis vermelhos. Um não era falha.**
Interações que o painel marcou como erro.

| Quantas | Onde | O que era |
|---|---|---|
| 3 | Mediar o cardápio | erro técnico: a requisição caiu |
| 2 | Receita premium | chave de acesso inválida, na sexta dia 28 |
| 1 | Ler nota por foto | o produto explicando o que faltava |

**Script**
Terceira pergunta: os erros. E aqui o painel ajuda, porque erro técnico ele pinta de vermelho sozinho. Eu tenho seis.

Três são o Mediador caindo com erro técnico. Dois são aquela sexta da chave inválida.

E o sexto não é falha. Alguém mandou a foto de uma nota fiscal. O produto leu a chave da nota e respondeu: "a SEFAZ de São Paulo exige o QR code, manda outra foto com o QR". O produto fez exatamente o que devia. E o registro ficou marcado como erro.

Parece detalhe, e não é. Se eu medir a saúde do produto pela quantidade de vermelho, esse caso infla a minha taxa de erro. Um alarme de "os erros subiram" ia disparar porque alguém tirou foto sem o QR code.

Então existe vermelho a mais. E vermelho a menos? Essa é a pergunta do fim deste vídeo.

## Slide 8 (statement)
**Uma foto não é um filme.**

**Script**
Quarta pergunta: a qualidade ao longo do tempo. E aqui eu tenho que ser honesto com você.

Eu tenho trinta e nove notas no painel. Todas escritas no mesmo dia, 28 de agosto, numa rodada só do eval. Isso é uma foto. Qualidade ao longo do tempo é um filme: precisa de nota escrita toda semana, pra comparar esta semana com a anterior.

E o meu eval roda quando eu mando. É o buraco que eu mesmo apontei no fim da aula passada, agora com dado na tela.

Então, se a qualidade do meu produto piorou desde agosto, como eu saberia? Hoje, não saberia. E é exatamente isso que a próxima aula precisa resolver.

## Slide 9 (tabela)
**Dado bruto tem prazo de validade.**
Plano gratuito: 30 dias. O mesmo painel, daqui a uma semana.

| | Hoje, 16/09 | Dia 22/09 |
|---|---|---|
| Interações | 42 | 21 |
| Custo na tela | US$ 1,54 | US$ 0,46 |
| Mediações | 10 | 2 |
| O Mediador na conta | 90% | 77% |

**Script**
E tem mais uma coisa que eu descobri preparando esta aula. Talvez a mais subestimada de todas.

O plano gratuito guarda trinta dias. E metade do meu dado veio daquelas vinte horas de agosto. Então, na segunda-feira que vem, metade do meu painel some de uma vez. Das dez mediações, sobram duas. E a frase bonita, noventa por cento da conta, vira setenta e sete.

*(se gravar a partir de 21/09)* Então, na segunda-feira passada, metade do meu painel sumiu de uma vez. *(alt+tab)* Olha: é o painel da direita. A tabela que eu te mostrei agora há pouco só existe porque eu anotei.

Eu já perdi dado assim. Em agosto eu anotei que o modelo menor fazia a mesma classificação de mensagem uma vez e nove mais barato e duas vezes e meia mais rápido. Esse número decidiu como o meu produto funciona hoje. No painel, ele não existe mais. Existe no meu documento.

O que sobrevive é o que você anota. Se a sua estratégia é "está tudo guardado lá, eu vejo depois", depois pode não estar mais.

## Slide 10 (tabela)
**Quatro perguntas pro seu painel**
A parte que você leva pro seu produto.

| Pergunta | Onde olhar |
|---|---|
| O que ele mais faz? | Contagem por operação |
| Onde estão o dinheiro e a espera? | Custo e pior caso, por operação |
| Quantas terminaram inteiras? | Erro, e também resposta cortada ou vazia |
| Melhorou desde a semana passada? | Nota ao longo do tempo |

**Script**
Esse slide não é sobre o meu produto. É o que você leva pro seu.

Toda semana, quatro perguntas. O que ele mais faz? Conta por operação. Onde estão o dinheiro e a espera? Custo e pior caso, por operação. Quantas terminaram inteiras? E aqui não é só o vermelho: é também o que veio cortado ou vazio. E melhorou desde a semana passada? Pra essa, você precisa de nota ao longo do tempo.

No meu produto, hoje: metade é entender mensagem. Noventa por cento do dinheiro está no Mediador. Seis vermelhos, um que não era falha. E a quarta eu não sei responder.

Pausa o vídeo aqui, se quiser. Abre o painel do seu produto e responde as quatro. Se alguma você não consegue responder, é ali que está faltando rastro.

## Slide 11 (statement)
**E o que não disparou alarme, está bem?**

**Script**
Eu tenho dez mediações. Três deram erro. Sete não dispararam nada.

Pergunta simples: as sete sem alarme estão bem?

No próximo vídeo eu abro as dez.

---

# 3.4 — Padrões de falha

Antes de gravar: Langfuse com a mediação `1ecca5e6` à mão (03/09, 16h36). A tabela das dez mediações e a conferência no banco estão congeladas em [`apoio/aula3-dados-congelados.md`](apoio/aula3-dados-congelados.md) §5. **Não mandar nada no Telegram durante a gravação.**

## Slide 1 (divisor)
**3.4 Padrões de falha**

## Slide 2 (tabela)
**As dez mediações**
O que o painel pintou, e o que apareceu na tela.

| Quantas | No painel | O que apareceu na tela |
|---|---|---|
| 3 | vermelho (erro) | "Erro na mediação", com um código técnico |
| 2 | sem alarme | "(proposta registrada sem texto)" |
| 3 | sem alarme | um texto que para no meio: "…mussarela de búfala" |
| 1 | sem alarme | uma palavra só: "Consultei" |
| 1 | sem alarme | a mediação inteira |

**Script**
Abri as dez, uma por uma. E cruzei o que o painel mostra com o que apareceu na tela do produto.

Três com vermelho, que a gente já viu: deu erro, e a tela mostrou erro.

Duas sem alarme em que a tela mostrou "proposta registrada sem texto". Parece aceitável, né? Fui conferir no banco. A proposta estava vazia. A tela disse que registrou, e não tinha nada registrado.

Três sem alarme em que o texto para no meio. Uma termina em "mussarela de búfala". Sem ponto, sem nada. Outra para em "ovos brancos", no meio de uma lista de ingredientes.

Uma sem alarme cuja resposta inteira foi uma palavra: "Consultei". Lembra da mediação que eu abri no 3.2 e pedi pra você guardar o horário? É essa. Dezoito centavos, cinquenta e cinco segundos, e uma palavra.

E uma, só uma, chegou inteira.

Três dessas você já viu na aula passada, uma de cada vez: o risoto e as duas carbonaras do mesmo dia. Na hora, cada uma parecia um caso. Juntas, contam outra história.

## Slide 3 (statement)
**Sete sem alarme. Só uma inteira.**

**Script**
Sete sem alarme. Só uma inteira.

Se eu confiasse só na falta de vermelho, eu diria que o Mediador falha três vezes em dez. Ele falha nove em dez.

E nenhuma das seis quebradas sem alarme gerou erro, alerta, nada. Na lista, elas estão exatamente iguais à inteira. Nenhum sinal diferente.

## Slide 4 (statement)
**Quatro sintomas. Uma assinatura.**

🔴 Langfuse: abrir `1ecca5e6`, clicar na terceira chamada ao modelo e mostrar os tokens de saída (2.048). Depois, a chamada que força o registro da proposta (1.024).

**Script**
E aqui mora a ideia central deste vídeo. Repara que eu tenho quatro sintomas diferentes: erro, texto vazio, texto cortado e uma palavra só. Se eu organizasse pelo sintoma, eu teria quatro problemas.

Só que os nove têm a mesma assinatura. *(alt+tab)* Olha a "Consultei". A terceira chamada ao modelo: dois mil e quarenta e oito tokens de saída. É exatamente o teto que eu configurei. Não é coincidência: a resposta não coube e foi cortada. E a chamada seguinte, a que força o registro da proposta: mil e vinte e quatro. O teto dela.

Nas nove quebradas, alguma chamada bateu exatamente no teto. Na inteira, nenhuma.

Lembra do critério de execução íntegra, na Aula 2? Tokens iguais ao teto é corte. O eval pegava isso um caso por vez. O painel mostra que é regra.

Um padrão não é um tipo de sintoma. É uma assinatura que se repete.

## Slide 5 (lista)
**Onde e quando**
- Onde: só no Mediador. Nas outras operações, zero no teto.
- Quando: em todos os dias que teve mediação — 21 e 22 de agosto, 3 de setembro.
- Quanto: US$ 1,19 — 77% da conta do produto inteiro — pagou mediações que não chegaram inteiras.

**Script**
Com a assinatura na mão, eu consigo responder onde e quando o produto piora.

*(linha 1)* Onde: só no Mediador. Entender mensagem, receita premium, nota fiscal: nenhuma chamada no teto. Nenhuma de vinte e nove. É um problema de um lugar, não do produto todo.

*(linha 2)* Quando: nos três dias em que teve mediação. Não é um dia ruim. É uma condição.

*(linha 3)* E quanto. Lembra dos noventa por cento da conta? Um dólar e dezenove foi pra mediações que não chegaram inteiras. Setenta e sete por cento da conta do meu produto inteiro.

Então a conclusão do vídeo anterior muda de figura. Não é só "o Mediador é caro". É "a maior parte do que eu pago não chega inteira na tela".

## Slide 6 (statement)
**A mais lenta foi a única inteira.**

**Script**
E agora aqueles cento e treze segundos do vídeo anterior.

O pior caso de espera do Mediador é justamente a única mediação que chegou inteira. Ela chamou o modelo cinco vezes, em pedaços menores, e nenhuma bateu no teto. As cortadas ficaram entre quarenta e sessenta e poucos segundos. Não porque eram mais eficientes. Porque pararam antes.

Com dez casos, isso é pista, não é lei. Mas pensa no que teria acontecido se eu fosse otimizar o produto olhando só o tempo médio de resposta: eu ia comemorar exatamente as que estavam quebradas.

Por isso as quatro perguntas do vídeo anterior andam juntas. Espera sem desfecho engana.

## Slide 7 (statement)
**Mesmo código. Dado maior. Falha pior.**

**Script**
E esse padrão tem uma história de degradação que eu vi acontecer numa parte mais antiga do produto.

Em agosto, a sugestão de receita também tinha um teto. No começo, o corte era cosmético: a resposta terminava no meio de uma palavra. Feio, mas funcionava.

Aí a despensa da casa cresceu. A resposta ficou maior. E o corte passou a cair no meio de uma chamada de ferramenta, e a requisição seguinte morria com erro. Ninguém mexeu em uma linha de código. Só o dado cresceu.

É o mesmo mecanismo das três vermelhas do Mediador: o teto cortando no pior lugar. Degradação nem sempre é alguém estragando alguma coisa. Às vezes é só o produto sendo usado.

## Slide 8 (lista)
**O sem-alarme também mente**
- Estado: o modelo entendeu "lasagna"; o estoque era "lasanha".
- Sequência: quatro respostas certas seguidas, e o hambúrguer nunca entrou no estoque.
- Ausência: uma foto enviada pelo Telegram que não gerou rastro nenhum. Nada pra abrir.

**Script**
A assinatura do teto dá pra ver dentro de uma interação. Mas tem falha sem alarme que mente de um jeito que nenhuma interação sozinha mostra. No meu produto eu achei três.

*(linha 1)* Estado. Alguém contou "comemos três porções de lasagna". O modelo entendeu tudo certo, a interação está perfeita. E o estoque continua com cinco porções, porque o prato está gravado como "lasanha", com NH. Só aparece se eu cruzo o rastro com o estado da despensa.

*(linha 2)* Sequência. No dia 14 de setembro eu preparei hambúrguer e contei pro bot. Quatro mensagens, quatro classificações certas. E o hambúrguer nunca entrou no estoque. Cada interação está perfeita. A falha está entre elas.

*(linha 3)* Ausência. Uma foto de cupom, mandada pelo Telegram. Não gerou log, não gerou rastro, não gerou nada. E ninguém consegue abrir uma interação que não existe.

Eu não vou diagnosticar nenhum dos três agora, isso é a próxima aula. Hoje o ponto é saber onde procurar: no estado, na sequência, e no que deveria ter deixado rastro e não deixou.

## Slide 9 (3 colunas)
**Como achar um padrão**
Três perguntas pro seu painel, antes de qualquer conclusão.

| Assinatura | Frequência | Ponto cego |
|---|---|---|
| Que sinal se repete, com sintoma diferente? | É um caso ou é regra? Quantas vezes? | Onde o sem-alarme pode estar mentindo? |
| Sintomas mudam; a assinatura não. Agrupe pelo sinal que dá pra conferir, não pelo que o usuário viu. | Um caso é história, nove em dez é padrão. Conte antes de concluir, e diga o tamanho da amostra. | Cruze o rastro com o estado final, com a mensagem seguinte e com o que deveria ter deixado rastro. |
| Ex.: tokens de saída iguais ao teto. | Ex.: 9 de 10 mediações. | Ex.: "Consultei", sem alarme. |

**Script**
E, de novo, a parte que é sua. Três perguntas pra achar padrão em qualquer produto.

Assinatura. Que sinal se repete, mesmo quando o sintoma muda? Não agrupe pelo que o usuário viu. Agrupe por um sinal que dá pra conferir. No meu caso, tokens iguais ao teto.

Frequência. É um caso ou é regra? Conte. Um caso é uma história, nove em dez é um padrão. E diga o tamanho da amostra: dez não é mil.

Ponto cego. Onde o sem-alarme pode estar mentindo? Cruze com o estado final, com a mensagem seguinte e com o que deveria ter deixado rastro.

Pausa aqui, se quiser, e aplica no seu painel.

## Slide 10 (statement)
**Nenhuma delas me avisou.**

**Script**
E o que tudo isso tem em comum é o que eu quero que fique desta aula.

Nenhuma dessas falhas me avisou. Nenhum alarme, nenhuma mensagem, nenhum usuário reclamando. A do hambúrguer era eu mesmo usando o meu produto, e na dúvida se o erro era meu.

Cada uma precisou de alguém olhando o dado certo, com a pergunta certa. No seu produto, esse alguém é você.

## Slide 11 (lista com pergunta)
**O que ainda falta**
Eu vejo. Mas só quando eu olho.
- Ninguém me chama quando piora.
- Ver o padrão ainda não diz a causa.
- E nada disso foi corrigido.

**Script**
Pra fechar, deixa eu ser honesto sobre o tamanho do que a gente construiu.

Eu enxergo o meu produto. Sei onde está o dinheiro, onde está a espera, o que o vermelho conta e onde o sem-alarme mente. Mas só quando eu abro o painel.

*(linha 1)* Ninguém me chama quando a qualidade cai numa terça de madrugada.

*(linha 2)* Eu vejo o padrão do Mediador, mas ver a assinatura não diz a causa. Foi o prompt? O dado? O modelo? Ou nenhum dos três?

*(linha 3)* E nada disso foi corrigido. O teto do Mediador continua exatamente onde estava.

## Slide 12 (hero, fechamento)
**Eu já enxergo.**
Agora falta agir.

**Script**
Eu já enxergo. Agora falta agir: detectar sem depender de lembrar, diagnosticar a causa e corrigir antes do usuário perceber. É a próxima aula. Até lá.
