// Aula 2 — "Evals: avaliando a qualidade das respostas"
//
// VOCABULARIO: Mediador / Musa Balance (decisao do Diego, 03/09). O produto
// desta aula e o Agente Mediador da v3 — ele nao sugere, ele MEDEIA entre os
// dois atores da casa: o chef (orcamento, saude, desperdicio) e a musa (o
// desejo gastronomico). Chef Caseiro / despensa / carbonara NAO aparecem como
// vocabulario de aula; a interacao real usada no 2.3/2.4 e' uma mediacao.
//
// ESTRUTURA: espelho oficial (Curso Alura - Montagem do Curso.csv), 4 videos
// + 2.5 como Explicacao (texto, fora do deck):
//   2.1 O que sao evals?           10 min
//   2.2 Criterios de qualidade     12 min
//   2.3 Claude como avaliador      12 min
//   2.4 Primeiro conjunto de evals 15 min
//
// DIVERGENCIA COM O DECK MESTRE (sinalizada ao Diego, nao corrigida em
// silencio): o slide 41 do mestre diz "2.1 O que sao evals E O QUE E UM BOM
// CRITERIO" e o 59 diz "2.2 Escolhendo criterios". O espelho separa os dois e
// chama o segundo de "Criterios de qualidade". Aqui vale o espelho.
//
// HERDADO DO DECK MESTRE (slides 41-68) — o que ja estava bom e foi mantido:
//   - a abertura "A gente encontrou os riscos. E agora?" fechando em
//     "Produto e o que acontece nos outros dias." (build 43-50)
//   - o FUNIL de 4 passos Cenario -> Criterio -> Resposta -> Evidencia (52-57)
//   - a ancora "nao estamos avaliando o modelo, e sim o comportamento
//     esperado do produto" (aparece 2x no mestre, mantida aqui)
//   - o cenario concreto do 61 (pote vazio + gato miando / trade-off de
//     entrega) e os 5 criterios escritos em cima dele
//   - o diagrama TRACE -> JULGAMENTO -> ATENDEU / NAO ATENDEU (66-68)
//
// NOVO (o mestre para no meio do 2.3): o 2.4 inteiro, vindo de
// evals/criterios.md e evals/run-evals.js.
//
// NUMEROS — todos com fonte, nenhum inventado:
//   - 41 itens de estoque, restricoes "evitar carne de porco" e "preferencia
//     por vinhos tintos secos": producao lida em 03/09, 16h30.
//   - mediacao real de 03/09 que voltou a palavra "Consultei" apos 56s, com a
//     proposta completa presa na tool call: teste ao vivo, trace
//     1ecca5e617e2.
//   - conjunto rodado em 03/09 (--dry-run --limit 1): media 0.27, e os 5
//     criterios do Mediador reprovados com justificativa citavel.
//   - ~15 s por interacao julgada: medido em 03/09.
//   - teto de 2048 tokens no mediarCardapio: agent.js:199.

const F = 'Aula 2 — Evals: avaliando a qualidade das respostas — Evals, observabilidade e conformidade';
module.exports.footer = F;

// Build progressivo: uma linha nova por copia, texto anterior identico.
//
// DIVERGENCIA DELIBERADA da skill narrativa-diego (sinalizada ao Diego): a
// skill descreve o deck mestre, onde a MESMA nota se repete em todas as
// copias. Na pratica isso e impraticavel de apresentar — na primeira copia ha
// UMA linha na tela e a nota fala das cinco, entao quem apresenta le sobre
// conteudo que a plateia ainda nao ve.
//
// Aqui a nota e SEGMENTADA: cada copia recebe a fala da linha que ela revela.
// `falas[i]` corresponde a `bullets[i]`. O primeiro elemento pode trazer um
// lead-in antes de entrar na primeira linha.
function build(eyebrow, title, bullets, falas, extra) {
  if (bullets.length !== falas.length) {
    throw new Error(
      `build("${title}"): ${bullets.length} bullets para ${falas.length} falas — ` +
      'cada cópia do build precisa da fala da linha que ela revela.'
    );
  }
  return bullets.map((_, i) => ({
    type: 'bullets', eyebrow, title, notas: falas[i],
    bullets: bullets.slice(0, i + 1),
    ...(extra || {}),   // ex.: { type: 'contraste', sub, ruim, bom }
  }));
}

module.exports.slides = [
  { type: 'cover',
    title: 'Evals: avaliando\na qualidade\ndas respostas',
    subtitle: 'Aula 2 — de opinião a critério verificável',
    meta: 'Musa Balance — o primeiro pilar do run, na prática',
    notas:
      '“Na aula passada eu fechei o relatório de riscos do Musa Balance.” ' +
      '“Hoje eu pego o primeiro dos três pilares — evals — e transformo aquele relatório em alguma coisa que eu consiga checar toda semana.”' },

  // ===========================================================================
  // 2.1 — O que são evals? (10 min)
  // ===========================================================================
  { type: 'divider', number: '2.1', title: 'O que são evals?' },

  // Ponte com a Aula 1 GRAVADA: ela fecha em "1.4.2 Relatório" e deixa os
  // tres pilares com as perguntas ditas em tela. O 2.1 pega a pergunta do
  // pilar de evals palavra por palavra e continua o quadro "Build and Run".
  { type: 'bullets', eyebrow: 'Vídeo 2.1', title: 'O *run* começou. E a primeira pergunta é esta.',
    bullets: [
      'Na aula passada eu fechei o relatório de riscos e vimos os três pilares que sustentam o run de um produto com IA.',
      'O primeiro pilar responde: *"a IA está fazendo o que deveria?"* — foco em qualidade, precisão e aderência ao esperado.',
      { text: 'Esta aula inteira é essa pergunta. Evals é o instrumento que responde ela sem depender da minha impressão.', bold: true },
    ],
    notas:
      '“Deixa eu emendar exatamente onde a gente parou.” ' +
      '“Na aula passada eu fechei o relatório de riscos do Musa Balance, e antes disso a gente viu os três pilares que sustentam o run de um produto com IA.” ' +
      '“Olha a pergunta do primeiro pilar, do jeito que ela apareceu na tela: a IA está fazendo o que deveria?” ' +
      '“Com foco em qualidade, precisão, segurança e aderência ao esperado.” ' +
      '“Essa aula inteira é essa pergunta.” ' +
      '“E repara que ela não é sobre construir. Construir eu já fiz — o produto está no ar. Ela é sobre o run.”' },

  ...build('Vídeo 2.1', 'O relatório de riscos ficou pronto. E agora?', [
    'Se eu mudar o produto amanhã, como vou saber se ele continua fazendo o que deveria?',
    'Uma mudança pode melhorar uma resposta e piorar outra.',
    'Um comportamento que eu já tinha como garantido pode simplesmente deixar de acontecer.',
    'Um erro que aconteceu hoje pode voltar amanhã. E voltar pior.',
    { text: 'Testar uma vez responde sobre aquele momento. Produto é o que acontece nos outros dias.', bold: true },
  ], [
    '“Acabamos de fazer o nosso primeiro mapa de riscos — e olha que interessante: a gente já encontrou coisas que deram errado de verdade.” ' +
    '“Só que o relatório fala do que PODE dar errado. Ele é uma hipótese sobre o futuro.” ' +
    '“Agora imagina que amanhã eu mude o prompt do Mediador. Como eu vou saber se ele continua fazendo o que deveria?”',

    '“O primeiro jeito de isso dar errado é o mais traiçoeiro: eu posso ter melhorado uma coisa e quebrado outra.” ' +
    '“Posso ter corrigido a classificação de fonte e, sem perceber, piorado a capacidade dele de identificar um trade-off.”',

    '“O segundo é pior ainda, porque não tem sintoma: um comportamento que eu já tinha como garantido simplesmente deixa de acontecer.” ' +
    '“Ninguém recebe erro. A funcionalidade só some.”',

    '“E o terceiro: um erro que eu já consertei volta. E costuma voltar pior, porque agora eu confio que aquilo está resolvido.”',

    '“Então: eu posso testar manualmente. Uma vez. Duas vezes.” ' +
    '“Mas testar uma vez responde sobre aquele momento — e produto é o que acontece nos outros dias.” ' +
    '“Eu preciso de uma maneira sistemática de verificar isso continuamente. E é exatamente aqui que entram os Evals.”',
  ]),

  { type: 'bullets', eyebrow: 'Vídeo 2.1', title: 'Evals: transformar qualidade em evidência',
    bullets: [
      'Eval é um processo sistemático pra verificar se o produto está se comportando como eu espero.',
      'Não é QA e não é teste de software: teste pergunta "é igual ao esperado?", e eval pergunta "é bom?".',
      { text: 'É critério que pode ser reproduzido e aprimorado de forma repetível.', bold: true },
    ],
    notas:
      '“Eu quero uma definição que você consiga repetir pra outra pessoa amanhã.” ' +
      '“Eval é um processo sistemático pra verificar se o produto está se comportando como eu espero.” ' +
      '“E deixa eu tirar do caminho a confusão mais comum: isso não é QA, e não é teste de software.” ' +
      '“Teste compara com o resultado esperado — dois mais dois tem que dar quatro, sempre, e se eu rodar de novo dá quatro de novo.” ' +
      '“O Mediador não faz isso. O mesmo pedido, na mesma semana, gera texto diferente cada vez.” ' +
      '“E repara no pulo do gato: as duas versões podem estar certas.” ' +
      '“Se eu escrever um teste que espera uma frase específica, ele falha na segunda execução e não me ensina nada.”' },

  ...build('Vídeo 2.1', 'O funil que sustenta qualquer eval', [
    '1. Cenário — o que eu estou tentando avaliar? Ex.: o casal pede uma mediação de cardápio pra semana.',
    '2. Critério — o que eu espero que ele faça? Ex.: identificar o trade-off e explicar o impacto com o número que a ferramenta devolveu.',
    '3. Resposta — o que o produto fez de verdade naquela execução?',
    { text: '4. Evidência — atendeu ou não atendeu, com justificativa apontável.', bold: true },
  ], [
    '“Todo eval que eu construo tem os mesmos quatro passos, e eles vêm nesta ordem.” ' +
    '“Primeiro o cenário: o que eu estou tentando avaliar. No caso do Mediador, o casal pediu uma mediação de cardápio pra semana.” ' +
    '“Repara que cenário não é uma pergunta genérica. É uma situação específica que eu escolhi.”',

    '“Segundo, o critério: o que eu espero que ele faça naquele cenário.” ' +
    '“E aqui está a parte que quase ninguém fala: isso é uma decisão minha, de produto. Não é o modelo que define.” ' +
    '“Eu que decido que uma boa mediação identifica o trade-off e usa o número que a ferramenta devolveu.”',

    '“Terceiro, a resposta: o que ele fez de verdade naquela execução.” ' +
    '“Não o que eu imagino que ele faça. Não o que ele fez na demo. O que está gravado.”',

    '“E quarto, a evidência: atendeu ou não atendeu — com uma justificativa que eu consiga apontar.” ' +
    '“Guarda esse funil, porque a aula inteira mora dentro dele. E repara que só o passo dois é opinião minha; os outros três são fato.”',
  ]),

  { type: 'bullets', eyebrow: 'Vídeo 2.1', title: 'Não estamos avaliando o modelo',
    bullets: [
      'O modelo é um componente. Ele é o mesmo modelo que atende milhões de outros produtos, e ele não sabe o que a minha casa combinou.',
      'O que eu avalio é o comportamento esperado do meu produto: o que o Mediador prometeu fazer pra este casal.',
      { text: 'Não estamos avaliando o modelo, e sim o comportamento esperado do produto.', bold: true },
    ],
    notas:
      '“Antes de escrever qualquer critério, uma frase que eu quero que fique gravada.” ' +
      '“Não estamos avaliando o modelo. Estamos avaliando o comportamento esperado do produto.” ' +
      '“Parece detalhe de linguagem e não é — muda o que você escreve.” ' +
      '“Se eu avalio o modelo, eu escrevo critério genérico: a resposta é coerente? o texto está bem escrito?” ' +
      '“Se eu avalio o produto, eu escrevo o que este produto prometeu pra esta casa: ele expôs o trade-off? usou o número que a ferramenta devolveu?” ' +
      '“O segundo tipo de critério eu consigo defender numa reunião. O primeiro, não.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.1', title: 'Se tudo passa, o critério está fácil demais',
    bullets: [
      'É tentador comemorar quando 100% das respostas passam. Eu já comemorei, e estava errado.',
      { text: '100% de aprovação é sinal de alerta, não de sucesso: o critério provavelmente não está pegando nada.', bold: true },
      'E quanto de falha eu aceito é decisão minha, de produto. Não existe "zero erro" de graça.',
    ],
    notas:
      '“Um aviso que economiza semanas, e ele é contraintuitivo.” ' +
      '“É muito tentador comemorar quando cem por cento das respostas passam no seu critério.” ' +
      '“Eu já fiz isso. Levei o número verde pra reunião e todo mundo bateu palma.” ' +
      '“Só que cem por cento de aprovação é sinal de alerta, não de sucesso.” ' +
      '“Quase sempre quer dizer que o critério está tão frouxo que qualquer resposta passa — inclusive as ruins.” ' +
      '“A regra que eu carrego: um critério bom precisa reprovar alguma coisa. Se ele nunca reprova, ele não está medindo, está decorando.” ' +
      '“E aí vem a decisão mais de produto desta aula: quanto de falha eu aceito? Porque zero erro custa modelo mais caro, resposta mais lenta, e um produto que recusa tanto que a pessoa desinstala.” ' +
      '“Essa conta é minha. Não é do modelo.”' },

  // ===========================================================================
  // 2.2 — Critérios de qualidade (12 min)
  // ===========================================================================
  { type: 'divider', number: '2.2', title: 'Critérios de qualidade' },

  { type: 'bullets', eyebrow: 'Vídeo 2.2', title: 'De opinião a critério verificável',
    bullets: [
      'No funil, hoje a gente para exatamente no Critério — é o passo mais fácil de fazer errado.',
      'E é o único dos quatro que não precisa de código nenhum: é escrito em português, por gente de produto.',
      { text: 'Critérios claros transformam julgamento subjetivo em algo que eu consigo checar.', bold: true },
    ],
    notas:
      '“No funil do vídeo passado a gente viu Cenário, Critério, Resposta, Evidência.” ' +
      '“Hoje a gente para exatamente no Critério.” ' +
      '“É o passo mais fácil de fazer errado — e é o único dos quatro que não precisa de código nenhum.” ' +
      '“Isso é bom e é perigoso ao mesmo tempo.” ' +
      '“É bom porque qualquer pessoa do time consegue escrever critério. É perigoso porque qualquer pessoa consegue escrever critério ruim, e critério ruim parece critério.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.2', title: 'O cenário: o pote vazio e o gato miando',
    bullets: [
      'A casa quer pedir entrega. E tem porção caseira parada na geladeira, feita no fim de semana.',
      'O chef pensa em desperdício e orçamento. A musa quer comer o que dá vontade. Os dois têm razão.',
      { text: 'É pra esse conflito que o Mediador existe. Então é dele que os critérios têm que nascer.', bold: true },
    ],
    notas:
      '“Deixa eu te dar um cenário concreto, porque critério no abstrato não se escreve bem.” ' +
      '“Pote vazio, gato miando, e a casa querendo pedir entrega.” ' +
      '“Só que tem porção caseira parada na geladeira, feita no fim de semana.” ' +
      '“Eu, como chef, penso em desperdício e em orçamento. A musa quer comer o que deu vontade.” ' +
      '“E olha: os dois têm razão. Não existe lado errado nessa conversa.” ' +
      '“É exatamente pra esse conflito que o Mediador existe.” ' +
      '“Então é daqui que os critérios têm que nascer — da promessa do produto, não de uma lista de boas práticas que eu baixei da internet.”' },

  ...build('Vídeo 2.2', 'Os critérios que nascem desse cenário', [
    'Menciona explicitamente que existem porções caseiras não consumidas?',
    'Cita o relato de delivery ou restaurante recente como parte do motivo?',
    'Não decide sozinho o que a casa deve fazer — expõe e deixa a escolha em aberto?',
    'Usa números reais (porções restantes, dias desde o preparo) em vez de estimativa vaga?',
    { text: 'Não inventa prazo de validade que não veio de cálculo em código?', bold: true },
  ], [
    '“Primeiro critério: ele mencionou que existem porções caseiras não consumidas? Ou fingiu que a geladeira estava vazia?” ' +
    '“Repara que dá pra apontar o sim ou o não olhando a resposta. Isso é o teste de todo critério desta lista.”',

    '“Segundo: ele citou o delivery recente como parte do motivo?” ' +
    '“Porque essa é a informação que muda a conversa. Sem ela, a proposta dele é um palpite educado.”',

    '“Terceiro, e esse é de posicionamento: ele decidiu sozinho o que a casa deve fazer?” ' +
    '“Se decidiu, ele parou de ser mediador. No momento em que ele diz não peça entrega, ele virou mais um app de dieta que a pessoa desinstala.”',

    '“Quarto: ele usou número real — porções restantes, dias desde o preparo — ou falou por alto?” ' +
    '“Um mediador sem número não medeia, opina. E opinião não resolve conflito entre duas pessoas que já sabem o que querem.”',

    '“E o quinto, que é o meu favorito: ele inventou um prazo de validade que não veio de cálculo em código?” ' +
    '“Porque um número inventado que parece certo é a pior classe de erro que existe aqui.” ' +
    '“É indistinguível de um número certo até alguém conferir — e como ele fala com autoridade, a casa age em cima dele.”',
  ]),

  { type: 'bullets', eyebrow: 'Vídeo 2.2', title: 'Todo critério tem quatro partes',
    bullets: [
      'Nome — é o que vai ser gravado toda vez. Sem nome estável, não dá pra comparar esta semana com a próxima.',
      'Pergunta — respondível por uma pessoa olhando a interação, sem abrir o repositório.',
      'Escala — binário quando a falha é categórica; de 0 a 1 quando "meio certo" existe de verdade.',
      { text: 'Por que erra caro — o custo real quando ele falha. É a parte que todo mundo pula.', bold: true },
    ],
    notas:
      '“Esse formato tem quatro partes, e as quatro são obrigatórias. Se faltar uma, o critério vaza por algum lado.” ' +
      '“Nome. Parece burocracia e não é: é o que vai ser gravado toda vez que o critério for aplicado.” ' +
      '“Sem nome estável, eu não consigo comparar a semana passada com esta. E comparar no tempo é o ponto inteiro.” ' +
      '“Pergunta. E o teste de fogo é esse: uma pessoa consegue responder olhando a interação, sem abrir o repositório?” ' +
      '“Se pra responder ela precisa do código, o critério está escrito na linguagem errada.” ' +
      '“Escala. Binário ou de zero a um — daqui a pouco eu falo de como escolher.” ' +
      '“E por que erra caro. Essa é a que todo mundo pula, e é a mais importante das quatro.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.2', title: 'Binário ou 0 a 1: como eu escolho',
    bullets: [
      'Binário é pra falha categórica: ou ele deixou a escolha em aberto, ou decidiu sozinho. Não tem meio-termo.',
      'A escala de 0 a 1 é pra quando "meio certo" existe: citou números, mas soltos, sem ligar à escolha.',
      { text: 'Na dúvida, binário. Escala contínua vira opinião disfarçada de número — o meu 0,7 é o 0,8 seu.', bold: true },
    ],
    notas:
      '“A regra da escala é mais simples do que parece.” ' +
      '“Binário é pra falha categórica. Ou ele deixou a escolha em aberto, ou ele decidiu sozinho. Não existe deixar setenta por cento em aberto.” ' +
      '“Se a falha não tem meio-termo na vida real, ela não pode ter meio-termo na régua.” ' +
      '“A escala de zero a um é pra quando meio certo existe de verdade. Ele citou números, mas soltos, sem ligar à escolha — isso não é a mesma coisa que não citar nada, e também não é o que eu queria.” ' +
      '“E na dúvida, prefira binário. Escala contínua vira opinião disfarçada de número: o meu zero vírgula sete é o zero vírgula oito seu, e ninguém sabe o que separa os dois.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.2', title: '"Por que erra caro" é o filtro que corta a lista pela metade',
    bullets: [
      'Escreve o custo em uma frase concreta. Se você não conseguir escrever, o critério provavelmente não deveria existir.',
      { text: 'Um critério que não custa nada quando falha rouba atenção dos que custam.', bold: true },
      'Ele não é neutro: toda rodada ele gasta tempo, gasta dinheiro, e ocupa uma linha que alguém tem que ler.',
    ],
    notas:
      '“Essa quarta parte parece burocracia de documentação. É o oposto: é o que separa um critério de uma curiosidade.” ' +
      '“Um critério que não custa nada quando falha não merece ser um eval.” ' +
      '“E repara que ele não é neutro — ele é negativo. Toda vez que eu rodo o conjunto, ele gasta tempo, gasta dinheiro, e ocupa uma linha do relatório que alguém tem que ler.” ' +
      '“O exercício é escrever o custo em uma frase concreta: se isso falhar, acontece tal coisa, e o prejuízo é esse.” ' +
      '“Se você não conseguir escrever essa frase, o critério provavelmente não deveria existir.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.2', title: 'Agora eu tenho mais do que uma opinião',
    bullets: [
      'Antes eu lia a mediação e achava razoável. "Razoável" era eu, lendo uma vez, no meu humor daquele dia.',
      { text: 'Agora eu tenho critério: qualquer pessoa da casa aplica e chega no mesmo sim ou no mesmo não que eu.', bold: true },
      'E com isso eu consigo decidir o que fazer a seguir — que é pra isso que medir serve.',
    ],
    notas:
      '“Olha o que mudou.” ' +
      '“Antes eu lia a mediação e achava razoável. E razoável era eu, lendo uma vez, com o humor que eu estava naquele dia.” ' +
      '“Agora eu tenho critério. E o teste é esse: qualquer pessoa da casa aplica e chega no mesmo sim ou no mesmo não que eu cheguei.” ' +
      '“Se precisa de mim pra julgar, não é critério, é gosto.” ' +
      '“E com critério eu consigo decidir o que fazer a seguir — que é pra isso que medir serve. Medir sem decidir nada depois é relatório, não é produto.”' },

  // ===========================================================================
  // 2.3 — Claude como avaliador (12 min)
  // ===========================================================================
  { type: 'divider', number: '2.3', title: 'Claude como avaliador' },

  { type: 'bullets', eyebrow: 'Vídeo 2.3', title: 'Ler à mão funciona — até não funcionar',
    bullets: [
      'Com três mediações, ler uma por uma é o melhor investimento que existe. É lendo que eu descobri o que medir.',
      'Com trezentas eu não leio. E o caso que mata é o do meio: com trinta por semana, eu leio na segunda e paro na quarta.',
      { text: 'O critério que eu escrevi não escala sozinho. Ele precisa de alguém que aplique sempre do mesmo jeito.', bold: true },
    ],
    notas:
      '“Eu tenho critério escrito. Agora eu preciso aplicar.” ' +
      '“E o primeiro jeito é o óbvio: eu leio. Pego a mediação, olho o que o produto tinha em mãos, respondo sim ou não pra cada critério.” ' +
      '“E eu quero ser justo com esse método, porque ele é subestimado: com três mediações, ler uma por uma é o melhor investimento que existe.” ' +
      '“Foi lendo à mão que eu descobri o que medir. Não pule essa etapa achando que é primitiva.” ' +
      '“O problema é que ela não escala — e não escala de um jeito específico.” ' +
      '“Com trezentas eu não leio, isso é óbvio. Mas o caso que realmente mata é o do meio: com trinta por semana, eu leio na segunda, leio na terça, e paro na quarta.” ' +
      '“E aí eu tenho um processo de qualidade que existe no documento e não existe na prática.”' },

  ...build('Vídeo 2.3', 'Do critério ao julgamento', [
    'Trace — uma execução real do produto: o pedido, a resposta final, e cada ferramenta que ele chamou no meio.',
    'Julgamento — o critério foi atendido naquela execução?',
    { text: 'LLM as a judge — o Claude atua como árbitro e automatiza esse julgamento, sempre do mesmo jeito.', bold: true },
  ], [
    '“Começa pelo trace: uma execução real do produto, já acontecida.” ' +
    '“E não é só a resposta. É o pedido original, a resposta final, quais ferramentas ele chamou e o que cada uma devolveu.” ' +
    '“Repara que isso é bem mais do que eu olho quando leio à mão. Eu leio a resposta; o trace mostra o caminho inteiro — inclusive se ele consultou o estoque e depois ignorou o resultado.”',

    '“Em cima desse trace vem o julgamento: o critério foi atendido naquela execução?” ' +
    '“Uma pergunta, uma execução, uma resposta. É a mesma coisa que eu faria à mão — só que agora com um lugar definido pra acontecer.”',

    '“E é aqui que o Claude entra num papel completamente diferente do que ele tinha neste produto.” ' +
    '“Até agora ele gerava: ele escrevia a mediação. Agora ele julga.” ' +
    '“Mesmo modelo, trabalho oposto — ele não produz nada novo, ele lê e emite um parecer.” ' +
    '“É um árbitro que nunca cansa e que não julga diferente na sexta-feira.”',
  ]),

  { type: 'bullets', eyebrow: 'Vídeo 2.3', title: 'O que transforma o modelo em juiz',
    bullets: [
      'Julgue só com base no material — não suponha nada que não esteja ali.',
      'Toda nota precisa de evidência citável. Justificativa genérica é justificativa inválida.',
      { text: 'Seja severo com falha silenciosa: um estado que ficou errado sem ninguém perceber é pior que um erro barulhento.', bold: true },
    ],
    notas:
      '“Só que apontar o modelo pra uma resposta e perguntar isso tá bom não produz um juiz. Produz um elogiador.” ' +
      '“Modelo de linguagem é agradável por construção. Ele vai achar quase tudo razoável.” ' +
      '“O que transforma o modelo em juiz é o conjunto de regras que eu dou pra ele. Vou ler as três que mais importam.” ' +
      '“Primeira: julgue só com base no material. Se a informação não está no que ele recebeu, ela não existe pro julgamento.” ' +
      '“Isso corta pela raiz a tendência dele de preencher lacuna com o que é plausível.” ' +
      '“Segunda: toda nota precisa de evidência citável. A resposta foi boa não vale como razão.” ' +
      '“E a terceira, que é a minha favorita: seja severo com falha silenciosa.” ' +
      '“Repara que essa é uma instrução de valor, não uma instrução técnica. Eu estou dizendo pro juiz o que este produto considera grave.” ' +
      '“E é isso que simular o julgamento de um especialista quer dizer: especialista tem critério de gravidade, não só de correção.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.3', title: 'Nota sem evidência não vale nada',
    bullets: [
      'Cada critério devolve dois campos obrigatórios: o valor e a justificativa, citando o material.',
      { text: 'É isso que me deixa discordar do juiz. Um avaliador que eu não consigo auditar me dá confiança falsa.', bold: true },
      '"Nota 0,3" eu tenho que aceitar na fé. "0,3 porque a resposta não cita as porções da geladeira" eu confiro em cinco segundos.',
    ],
    notas:
      '“Deixa eu insistir na segunda regra, porque ela muda a natureza da coisa.” ' +
      '“Cada critério devolve dois campos, e os dois são obrigatórios: o valor e a justificativa.” ' +
      '“E a justificativa tem que citar o material — um trecho da resposta, o nome de uma ferramenta, um número que apareceu.” ' +
      '“Isso não é capricho de documentação. É o que me deixa discordar do juiz.” ' +
      '“Pensa comigo: se ele me devolve nota zero vírgula três e mais nada, eu tenho duas opções e as duas são ruins. Aceitar na fé, ou refazer o trabalho à mão pra conferir.” ' +
      '“Se ele me devolve zero vírgula três porque a resposta não menciona as porções que estão na geladeira, eu levo cinco segundos pra verificar.” ' +
      '“E se ele estiver errado, eu descubro — e aí eu conserto o critério.” ' +
      '“Um juiz que eu não consigo auditar não é melhor que nenhum juiz. É pior, porque me dá confiança falsa.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.3', title: 'O juiz não faz conta',
    bullets: [
      'Antes de chamar o Claude, o código apura os fatos: quais ferramentas rodaram, quantos tokens saíram, se houve erro.',
      'Isso entra no material já pronto, marcado como fato. O juiz usa e não recalcula nada.',
      { text: 'Aritmética é trabalho de código. Julgamento é trabalho do modelo. Misturar os dois estraga o eval em silêncio.', bold: true },
    ],
    notas:
      '“Agora uma decisão de desenho que eu recomendo pra qualquer eval que você for construir.” ' +
      '“Antes de chamar o Claude, o código apura os fatos objetivos. Quais ferramentas rodaram. Quantos tokens saíram em cada chamada. Se alguma observação ficou em nível de erro. Se a saída final veio vazia.” ' +
      '“Isso tudo entra no material que o juiz recebe, já pronto, marcado como fato.” ' +
      '“E a instrução pra ele é explícita: isso é verdade apurada, use e não refaça conta nenhuma.” ' +
      '“Por que isso importa tanto? Porque comparar número é exatamente o tipo de coisa que modelo de linguagem faz mal — e faz com confiança.” ' +
      '“A regra que eu levo pra qualquer projeto: aritmética é trabalho de código, julgamento é trabalho do modelo.” ' +
      '“Misturar os dois é como a maioria dos evals estraga sem ninguém notar.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.3', title: 'Prompt não é contrato',
    bullets: [
      'Pra somar as notas eu preciso da resposta estruturada. A tentação é escrever "responda em JSON" e torcer.',
      'Funciona quase sempre. E quando ele resolve responder em prosa, não sobra nota nenhuma e a rodada inteira se perde.',
      { text: 'A garantia é estrutural: a chamada da ferramenta é forçada pela API, não pedida no texto.', bold: true },
    ],
    notas:
      '“E a última decisão, que é a que mais gente aprende do jeito difícil.” ' +
      '“Pra somar as notas, eu preciso que a resposta do juiz venha estruturada, não em prosa.” ' +
      '“A tentação é escrever no prompt: responda em JSON com as notas de cada critério.” ' +
      '“E isso funciona. Quase sempre.” ' +
      '“E quase sempre não serve — porque quando ele resolve responder em prosa, não sobra nota nenhuma pra somar, e eu só descubro quando o relatório vem vazio.” ' +
      '“A solução não é escrever o pedido com mais ênfase. É estrutural: a chamada da ferramenta é forçada pela API. O modelo não tem a opção de responder em prosa.” ' +
      '“Guarda essa frase, porque ela vale muito além de eval: prompt não é contrato. Prompt é pedido.” ' +
      '“Quando você precisa de garantia, a garantia tem que estar na estrutura.”' },

  // ===========================================================================
  // 2.4 — Primeiro conjunto de evals (15 min)
  // ===========================================================================
  { type: 'divider', number: '2.4', title: 'Primeiro conjunto de evals' },

  { type: 'bullets', eyebrow: 'Vídeo 2.4', title: 'Conjunto não é lista de tudo — é escolha',
    bullets: [
      'A tentação é escrever vinte critérios pra cobrir todo cenário imaginável. Dá uma sensação ótima de rigor.',
      { text: 'E um eval que cobre tudo não é rodado por ninguém: fica lento, fica caro, e vira relatório que ninguém abre.', bold: true },
      'A ordem que eu uso é a do próprio objetivo: os cenários mais críticos, e os erros mais custosos.',
    ],
    notas:
      '“Agora a gente monta o conjunto. E conjunto é a palavra certa: não é uma lista de tudo que dá pra medir, é uma escolha do que vale medir primeiro.” ' +
      '“A tentação natural, e eu já caí nela, é escrever vinte critérios pra cobrir todo cenário imaginável.” ' +
      '“E o resultado é sempre o mesmo: um eval que cobre tudo não é rodado por ninguém.” ' +
      '“Ele fica lento, fica caro, e vira aquele relatório de quarenta linhas que alguém abre na primeira semana e nunca mais.” ' +
      '“Priorizar não é atalho, é parte do trabalho.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.4', title: 'O critério que vem antes de todos os outros',
    bullets: [
      'A execução chegou ao fim inteira — sem erro, sem saída vazia, sem resposta cortada no meio?',
      'Não adianta perguntar se ele expôs o trade-off se a resposta parou no meio da palavra.',
      { text: 'É o único que o código quase resolve sozinho: token de saída igual ao teto é assinatura de truncamento.', bold: true },
    ],
    notas:
      '“Antes dos critérios de qualidade, tem um que vem antes de todos.” ' +
      '“A execução chegou ao fim inteira? Sem erro, sem saída vazia, sem resposta cortada no meio?” ' +
      '“Por que ele vem primeiro? Porque não adianta perguntar se o Mediador expôs o trade-off se a resposta parou no meio da palavra.” ' +
      '“Todos os outros critérios pressupõem que existe uma resposta pra julgar.” ' +
      '“E esse é o único que o código consegue quase inteiro sozinho.” ' +
      '“Existe uma assinatura de corte que é quase infalível: quando os tokens de saída batem exatamente no teto configurado, aquilo não é coincidência.” ' +
      '“Repara na divisão de trabalho de novo: o código detecta o sinal, e o juiz decide o que fazer com ele.”' },

  ...build('Vídeo 2.4', 'O conjunto do Mediador', [
    'Trade-off com números — expôs o custo real de cada opção, ou deu conselho genérico?',
    'Números vieram de ferramenta — todo número saiu de uma consulta, ou o modelo estimou?',
    'Mediou sem decidir — apresentou o conflito e deixou a escolha com o casal?',
    { text: 'Falta virou trade-off — faltou item e ele ofereceu substituição, em vez de cancelar a proposta?', bold: true },
  ], [
    '“São os mesmos critérios que a gente escreveu no cenário do gato, agora com nome e escala.” ' +
    '“Trade-off com números: ele expôs o custo real de cada opção, com número concreto?” ' +
    '“Escala de zero a um, porque existe meio-termo aqui: dá pra citar número solto, sem ligar à escolha.”',

    '“Números vieram de ferramenta: todo número citado saiu de uma consulta de verdade, ou o modelo estimou?” ' +
    '“Esse é binário, sem meio-termo. Um número inventado já contamina a mediação inteira.” ' +
    '“Porque o Mediador fala com autoridade — a casa age em cima do número. Se ele estiver errado, a decisão errada vem com confiança.”',

    '“Mediou sem decidir: ele apresentou o conflito e deixou a escolha com o casal?” ' +
    '“Esse é um critério de posicionamento, não de qualidade de texto.” ' +
    '“No momento em que ele diz não peça entrega, ele deixou de ser o produto que eu construí — e isso degrada em silêncio quando alguém melhora o prompt.”',

    '“E falta virou trade-off: faltou ingrediente e ele ofereceu substituição com o que tem em casa, em vez de simplesmente cancelar?” ' +
    '“Falta de item é o caso mais comum da vida real.” ' +
    '“Um produto que responde não dá toda vez é inútil exatamente na semana em que a casa mais precisa dele. A regra aqui é explícita: a falta nunca cancela a proposta, ela vira trade-off.”',
  ]),

  { type: 'bullets', eyebrow: 'Vídeo 2.4', title: 'O Mediador não está sozinho',
    bullets: [
      'A casa também fala com o produto o dia inteiro: "comprei dois quilos de arroz", "comemos a lasanha".',
      'Esse caminho de entrada tem os critérios dele: entendeu o tipo certo? preencheu número que ninguém disse?',
      { text: 'Cada operação promete uma coisa diferente. Por isso cada uma falha de um jeito diferente.', bold: true },
    ],
    notas:
      '“O Mediador não é a única coisa que este produto faz, e o conjunto tem que cobrir o resto.” ' +
      '“A casa fala com ele o dia inteiro: comprei dois quilos de arroz, comemos a lasanha, joguei fora aquele resto.” ' +
      '“Esse caminho de entrada tem os critérios dele. Ele entendeu que aquilo era uma compra e não um desejo? Ele preencheu algum número que ninguém disse?” ' +
      '“E esse segundo é perigoso de um jeito particular. Se eu digo comi um prato de lasanha e o modelo estima seiscentas e cinquenta calorias, o orçamento da semana virou ficção.” ' +
      '“E ficção que ninguém sabe que é ficção, porque está gravada no banco igualzinho a um número real.” ' +
      '“A regra do produto é: campo não dito fica vazio, e o sistema pergunta.” ' +
      '“Repara no padrão: cada operação promete uma coisa diferente, então cada uma falha diferente. Critério genérico não pega nenhuma delas.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.4', title: 'O que eu deliberadamente não medi',
    bullets: [
      '"A mediação foi agradável" — não é julgável de forma repetível, e o produto não promete isso.',
      'Tom e simpatia — barato quando erra. Pode entrar na terceira rodada, não na primeira.',
      { text: 'Latência e custo — são métricas, não critérios de qualidade. Já são coletados sozinhos; medir de novo só polui.', bold: true },
    ],
    notas:
      '“E agora a parte que eu acho que mais ensina: o que eu decidi não medir.” ' +
      '“Porque a lista do que fica de fora diz tanto sobre o produto quanto a lista do que entra.” ' +
      '“A mediação foi agradável — fora. Não é julgável de forma repetível, e o produto nem promete isso.” ' +
      '“Tom e simpatia da resposta — fora, por enquanto. É barato quando erra. Pode entrar na terceira rodada.” ' +
      '“Latência e custo — fora, e esse é o mais contraintuitivo, porque os dois importam muito.” ' +
      '“Mas eles são métricas, não critérios de qualidade. São coletados sozinhos, automaticamente.” ' +
      '“Medir de novo aqui só polui o resultado com número que já existe em outro lugar.” ' +
      '“Repara no padrão: cada exclusão tem um motivo. E o motivo nunca é não deu tempo.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.4', title: 'Nota baixa é o conjunto funcionando',
    bullets: [
      'Lembra do começo da aula: se 100% passasse, eu ia desconfiar do critério. Ele existe pra reprovar.',
      'Leia sempre a justificativa junto da nota. A nota diz que tem problema; a justificativa diz o que fazer.',
      { text: 'E repara em quais critérios reprovaram juntos — dois ou três padrões respondem pela maioria.', bold: true },
    ],
    notas:
      '“Olha o resultado.” ' +
      '“A primeira coisa que eu quero dizer sobre nota baixa: isso não é o conjunto falhando, é o conjunto funcionando.” ' +
      '“Lembra do começo da aula — se cem por cento passasse, eu ia desconfiar do critério. Ele existe pra reprovar.” ' +
      '“Segunda coisa: leia sempre a justificativa junto da nota.” ' +
      '“A nota me diz que tem problema. A justificativa me diz o que fazer a respeito. E as duas coisas são muito diferentes.” ' +
      '“E a terceira, que é onde mora o valor de verdade: repara em quais critérios reprovaram juntos.” ' +
      '“Não é uma lista de problemas independentes. Dois ou três padrões costumam responder pela maioria — e é neles que vale trabalhar primeiro.”' },

  { type: 'bullets', eyebrow: 'Vídeo 2.4', title: 'O que este conjunto ainda não faz',
    bullets: [
      'Ele julga as execuções que eu escolhi, quando eu mando rodar. Ninguém está sendo avisado de nada.',
      'Se a qualidade cair numa terça de madrugada, eu descubro quando lembrar de rodar de novo.',
      { text: 'O primeiro pilar está de pé. O segundo pergunta outra coisa: *o que está acontecendo com meu produto?*', bold: true },
    ],
    notas:
      '“E pra fechar, eu quero ser honesto sobre o tamanho do que a gente construiu. Porque é bastante — e é menos do que parece.” ' +
      '“Este conjunto julga as execuções que eu escolhi, quando eu mando rodar.” ' +
      '“Ninguém está sendo avisado de nada. Não tem alarme, não tem vigilância.” ' +
      '“Se a qualidade cair numa terça-feira de madrugada, eu descubro quando eu lembrar de rodar de novo.” ' +
      '“Se eu esquecer duas semanas, eu tenho duas semanas de produto ruim que ninguém viu.” ' +
      '“Então o primeiro pilar está de pé: eu consigo responder se a IA está fazendo o que deveria.” ' +
      '“Mas lembra que eram três perguntas. A segunda é outra: o que está acontecendo com o meu produto?” ' +
      '“É esse buraco que a próxima aula preenche.”' },

  { type: 'closing', kicker: 'AULA 2 CONCLUÍDA',
    text: 'Eu sei o que\nprocurar. Agora\nfalta enxergar.',
    notas: '“Eu sei o que procurar. Agora falta enxergar.” “Até lá.”' },
];
