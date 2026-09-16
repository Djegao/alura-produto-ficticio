// Aula 1 — Por que builders de produto de IA precisam de evals.
// Base: Hamel Husain / Pawel Huryn, "Mastering AI Evals: A Complete Guide
// for PMs" (Product Compass, abr/2025) — a cena que se repete, o flywheel.
//
// PIVOT 03/09: a aula deixa de ser gravada no produto zerado (aula1-virgem,
// descontinuado) e passa a ser apresentada em cima da PRODUCAO
// (chef.workshopee.com.br) — produto agentico real, no ar, com dado real de
// uso. A premissa inverte: nao e "olha ele nascendo do zero", e "olha ele
// vivo, e eu nao consigo provar se ele esta bom". Os numeros de despensa
// citados nos slides sao reais, lidos da producao em 03/09 as 16h30.
//
// O eixo demonstrado no 1.5 e o MODELO (barra de configuracao do painel,
// troca ao vivo, sem deploy) — nao o v1/v2 via Postman, que fica reservado
// pra Aula 4 conforme CLAUDE.md.

module.exports.footer =
  'Aula 1 — O produto agêntico do zero — Evals, observabilidade e conformidade';

module.exports.slides = [
  { type: 'cover',
    title: 'Construindo com\nIA: o primeiro\nproduto agêntico',
    subtitle: 'Aula 1 — por que builders de produto de IA precisam de evals',
    meta: 'Um produto agêntico real, no ar, usado de verdade todo dia' },

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
  { type: 'bullets', eyebrow: 'Vídeo 1.3', title: 'O produto que vamos investigar juntos',
    bullets: [
      'O Chef Caseiro sugere o que cozinhar com o que a casa já tem — sem inventar ingrediente, sem ignorar restrição.',
      'Não é protótipo de slide: está no ar, com dado real, e a minha casa usa ele de verdade.',
      { text: 'É por isso que ele serve pra este curso. Produto que ninguém usa nunca falha de um jeito interessante.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 1.3', title: 'O que essa inteligência pode fazer',
    bullets: [
      'Ela pode consultar o que está no estoque, antes de sugerir qualquer prato.',
      'Ela pode consultar as restrições da casa — alergia, dieta, o que a família não come.',
      { text: 'E ela decide, sozinha, quando usar cada uma dessas capacidades. Ninguém escreveu um roteiro fixo para ela seguir.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 1.3', title: 'O estoque real não é uma lista limpa',
    bullets: [
      'Na despensa, agora: 41 itens. "Arroz" aparece em quatro registros diferentes — e um deles está zerado.',
      '"Feijão carioca" e "feijao". "Macarrão espaguete" e "macarrao". Três molhos de tomate, um deles vazio.',
      { text: 'Guarda essa imagem. Ela é o motivo de "ela usou só o que eu tenho?" ser uma pergunta difícil de responder.', bold: true },
    ] },

  { type: 'divider', number: '1.4', title: 'Um pedido de verdade, ao vivo' },
  { type: 'bullets', eyebrow: 'Vídeo 1.4', title: 'Vou pedir do jeito que eu pediria pra uma pessoa',
    bullets: [
      'Sem prompt especial, sem truque de engenharia: um pedido de jantar em português, como qualquer um da casa faria.',
      'As restrições da casa já estão cadastradas há semanas — evitar carne de porco, preferência por vinho tinto seco.',
      { text: 'Presta atenção no que ela faz antes de responder: ela para pra consultar, ou já sai sugerindo?', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 1.4', title: 'A pergunta que fica no ar',
    bullets: [
      { text: 'A sugestão parece boa. Mas "parece boa" é uma opinião minha, no momento em que eu li — nada mais que isso.', bold: true },
      'Ela respeitou mesmo as restrições? Usou só o que eu realmente tenho — inclusive o arroz que está zerado?',
      'E essa é exatamente a cena do começo desta aula, acontecendo comigo, no meu próprio produto, agora.',
    ] },

  { type: 'divider', number: '1.5', title: 'O mesmo pedido, outro motor' },
  { type: 'bullets', eyebrow: 'Vídeo 1.5', title: 'Todo produto de IA tem eixos que dá pra girar',
    bullets: [
      'O modelo que gera a resposta é um eixo. A instrução que orienta o modelo é outro. Os dados que ele consulta são o terceiro.',
      'Neste produto eu giro o eixo do modelo ao vivo, na própria barra de configuração — sem deploy, sem tocar em código.',
      { text: 'Vou girar um eixo só: mesmo pedido, mesmo estoque, mesmas restrições — outro modelo.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 1.5', title: 'Duas respostas — e nenhuma régua pra escolher',
    bullets: [
      'Mudou o prato, mudou o jeito de escrever, mudaram os ingredientes escolhidos, mudou o tamanho da resposta.',
      'Agora responde rápido: qual das duas é melhor? E na próxima pergunta, vai continuar sendo a mesma?',
      { text: 'Eu girei um eixo e não sei dizer se melhorei ou piorei o produto. É esse buraco que o curso inteiro fecha.', bold: true },
    ] },

  { type: 'divider', number: '1.6', title: 'O ciclo que faz a diferença' },
  { type: 'bullets', eyebrow: 'Vídeo 1.6', title: 'Avaliar, entender, mudar — e de novo',
    bullets: [
      'Todo produto de IA que evolui rápido gira o mesmo ciclo: avaliar a qualidade, entender o que saiu errado, mudar o comportamento.',
      { text: 'Quanto mais rápido e barato for avaliar, mais vezes esse ciclo gira — e mais rápido o produto melhora.', bold: true },
      'Hoje eu girei o ciclo pela metade: mudei o comportamento, mas não avaliei nada. Só senti.',
    ] },
  { type: 'bullets', eyebrow: 'Fechamento da aula', title: 'O que aprendemos',
    bullets: [
      'O problema não é ter dúvida se uma mudança ajudou — é não ter como responder essa dúvida.',
      'Conheci um produto agêntico real, no ar, e o estoque bagunçado que ele consulta de verdade.',
      'Girei um eixo, vi a resposta mudar na minha frente, e não soube dizer se ficou melhor.',
      { text: 'Na próxima aula, eu paro de sentir se a sugestão foi boa e começo a construir uma forma de saber.', bold: true },
    ] },

  { type: 'closing', kicker: 'AULA 1 CONCLUÍDA',
    text: 'Eu senti que foi\nbom. Na próxima\naula, eu vou saber.' },
];
