// Aula 1 — Por que builders de produto de IA precisam de evals.
// Base: Hamel Husain / Pawel Huryn, "Mastering AI Evals: A Complete Guide
// for PMs" (Product Compass, abr/2025) — a cena que se repete, o flywheel.
// Persona Renata (AI product builder, nao-tecnica): observa, junta
// evidencia, pergunta. Produto zerado (aula1-virgem) — sem dado anterior.

module.exports.footer =
  'Aula 1 — O produto agêntico do zero — Evals, observabilidade e conformidade';

module.exports.slides = [
  { type: 'cover',
    title: 'Construindo com\nIA: o primeiro\nproduto agêntico',
    subtitle: 'Aula 1 — por que builders de produto de IA precisam de evals',
    meta: 'Produto zerado, ao vivo — nenhuma sugestão, nenhum dado ainda' },

  { type: 'divider', number: '1.1', title: 'A cena que se repete' },
  { type: 'bullets', eyebrow: 'Vídeo 1.1', title: 'Funcionou lindo na demo. E depois?',
    bullets: [
      'Você monta uma funcionalidade com IA. Testa três vezes, três vezes funciona. Você entrega.',
      'Uma semana depois, alguém pergunta: "aquela mudança que você fez ajudou ou atrapalhou?"',
      { text: 'E você não sabe responder. Não porque não trabalhou — porque não tinha como medir.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 1.1', title: 'O que separa quem evolui rápido',
    bullets: [
      'A tentação é focar no que dá pra controlar: qual modelo usar, qual framework, qual banco de dados.',
      { text: 'Só que builders que dão certo raramente falam de ferramenta. Eles falam de medição.', bold: true },
      'Eles sabem, a cada mudança, se o produto ficou melhor ou pior. O resto do trabalho fica mais fácil por causa disso.',
    ] },

  { type: 'divider', number: '1.2', title: 'Os três pilares desta jornada' },
  { type: 'bullets', eyebrow: 'Vídeo 1.2', title: 'Três perguntas que sustentam um produto de IA',
    bullets: [
      { text: 'Evals: como eu sei que a resposta é boa, sem reler cada uma à mão?', bold: true },
      { text: 'Observabilidade: como eu enxergo o que está acontecendo, sem estar olhando o tempo todo?', bold: true },
      { text: 'Conformidade: como eu garanto que o produto não passa de limites que protegem quem usa?', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 1.2', title: 'Os três se alimentam um do outro',
    bullets: [
      'Não são etapas separadas — um eval mal feito deixa passar a falha que só a observabilidade encontra depois.',
      'E uma falha sem guardrail vira o tipo de incidente que a conformidade deveria ter barrado antes.',
      { text: 'Esta aula começa pela primeira pergunta. É onde tudo o mais se apoia.', bold: true },
    ] },

  { type: 'divider', number: '1.3', title: 'Conhecendo o Chef Caseiro' },
  { type: 'bullets', eyebrow: 'Vídeo 1.3', title: 'O produto que vamos construir junto',
    bullets: [
      'O Chef Caseiro sugere o que cozinhar com o que a casa já tem — sem inventar ingrediente, sem ignorar restrição.',
      'Por trás da sugestão tem uma inteligência que decide sozinha: será que preciso checar o estoque antes de responder?',
      { text: 'Hoje ele está zerado. Nenhuma sugestão ainda, nenhum dado — para eu te mostrar cada passo, ao vivo, do início.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 1.3', title: 'O que essa inteligência pode fazer',
    bullets: [
      'Ela pode consultar o que está no estoque, antes de sugerir qualquer prato.',
      'Ela pode consultar as restrições da casa — alergia, dieta, o que a família não gosta.',
      { text: 'E ela decide, sozinha, quando usar cada uma dessas capacidades. Ninguém escreveu um roteiro fixo para ela seguir.', bold: true },
    ] },

  { type: 'divider', number: '1.4', title: 'O primeiro pedido, ao vivo' },
  { type: 'bullets', eyebrow: 'Vídeo 1.4', title: 'Vamos fazer o primeiro pedido juntos',
    bullets: [
      'Eu vou cadastrar o que tenho em casa e uma restrição — por exemplo, "sem lactose".',
      'E vou pedir uma sugestão de janta, do jeito que eu pediria pra uma pessoa.',
      { text: 'Preste atenção no que ela faz antes de responder: ela para pra consultar, ou já sai sugerindo?', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 1.4', title: 'A pergunta que fica no ar',
    bullets: [
      { text: 'A sugestão parece boa. Mas "parece boa" é uma opinião minha, no momento em que eu li — nada mais que isso.', bold: true },
      'Ela respeitou mesmo a restrição? Usou só o que eu realmente tenho? Eu não sei dizer com certeza — só senti que sim.',
      'E essa é exatamente a cena do começo desta aula, acontecendo com o meu próprio produto.',
    ] },

  { type: 'divider', number: '1.5', title: 'Duas formas de pedir a mesma coisa' },
  { type: 'bullets', eyebrow: 'Vídeo 1.5', title: 'O mesmo produto, dois jeitos de instruir',
    bullets: [
      'Existem duas formas de orientar essa inteligência. Uma é mais solta: pede para ajudar, sem exigir nada específico antes.',
      'A outra é mais rígida: exige que ela confira o estoque e as restrições antes de sugerir qualquer coisa.',
      { text: 'Vou fazer o mesmo pedido nas duas formas e comparar o que muda na resposta.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 1.5', title: 'O que eu observei na comparação',
    bullets: [
      'Na forma solta, a resposta veio completa: a receita inteira, passo a passo, e até por que o leite ficou de fora.',
      'Na forma rígida, ela fez tudo certo por dentro — mas a resposta final foi seca: só confirmou que registrou o uso.',
      { text: 'As duas respeitaram a restrição. Só uma me contou o que eu ia comer — e isso eu não esperava antes de comparar.', bold: true },
    ] },

  { type: 'divider', number: '1.6', title: 'O ciclo que faz a diferença' },
  { type: 'bullets', eyebrow: 'Vídeo 1.6', title: 'Avaliar, entender, mudar — e de novo',
    bullets: [
      'Todo produto de IA que evolui rápido gira o mesmo ciclo: avaliar a qualidade, entender o que saiu errado, mudar o comportamento.',
      { text: 'Quanto mais rápido e barato for avaliar, mais vezes esse ciclo gira — e mais rápido o produto melhora.', bold: true },
      'Hoje eu só consegui fazer a primeira volta pela metade: eu senti que a sugestão foi boa, mas não tenho como provar.',
    ] },
  { type: 'bullets', eyebrow: 'Fechamento da aula', title: 'O que aprendemos',
    bullets: [
      'O problema não é ter dúvida se uma mudança ajudou — é não ter como responder essa dúvida.',
      'Conheci o Chef Caseiro zerado e vi as duas formas de instruir a mesma inteligência.',
      { text: 'Na próxima aula, eu paro de sentir se a sugestão foi boa e começo a construir uma forma de saber.', bold: true },
    ] },

  { type: 'closing', kicker: 'AULA 1 CONCLUÍDA',
    text: 'Eu senti que foi\nbom. Na próxima\naula, eu vou saber.' },
];
