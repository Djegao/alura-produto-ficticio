// Aula 2 — Construindo a primeira rede de seguranca (evals, sem Langfuse
// ainda: ele so chega na Aula 3). Base: Hamel Husain / Pawel Huryn,
// "Mastering AI Evals" (niveis 1 e 2, error analysis bottom-up) + os
// criterios reais de evals/criterios.md (fidelidade_ao_estoque,
// respeito_as_restricoes), traduzidos pra linguagem de produto.
// Persona Renata: observa, junta evidencia, pergunta ao Claude.

module.exports.footer =
  'Aula 2 — Construindo a primeira rede de segurança — Evals, observabilidade e conformidade';

module.exports.slides = [
  { type: 'cover',
    title: 'Construindo a\nprimeira rede\nde segurança',
    subtitle: 'Aula 2 — de "parece bom" para "eu sei que é bom"',
    meta: 'Continuação da Aula 1 — mesmo produto, ainda sem observabilidade' },

  { type: 'divider', number: '2.1', title: 'Parece certo não é o mesmo que estar certo' },
  { type: 'bullets', eyebrow: 'Vídeo 2.1', title: 'Onde a Aula 1 parou',
    bullets: [
      'Na aula passada eu fiz um pedido ao Chef Caseiro. A resposta pareceu boa. Só que "pareceu" foi só a minha opinião, lendo uma vez.',
      { text: 'Hoje eu paro de sentir e começo a construir um jeito de saber — sem precisar reler cada resposta pra sempre.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 2.1', title: 'Se tudo passa, o critério está fácil demais',
    bullets: [
      'É tentador comemorar quando 100% das respostas passam no seu critério.',
      { text: 'Só que 100% de aprovação é sinal de alerta, não de sucesso — o critério provavelmente não está pegando nada de verdade.', bold: true },
      'Decidir o quanto de falha eu aceito é uma decisão de produto. Não existe "zero erro" de graça.',
    ] },

  { type: 'divider', number: '2.2', title: 'Escrevendo os primeiros critérios' },
  { type: 'bullets', eyebrow: 'Vídeo 2.2', title: 'Um critério bom é uma pergunta que qualquer um responde',
    bullets: [
      'Critério ruim: "a resposta é boa" — ninguém consegue julgar isso do mesmo jeito duas vezes.',
      { text: 'Critério bom: "a sugestão usa só o que realmente existe no estoque que ela consultou?" — dá pra apontar o sim ou o não.', bold: true },
      'Sempre que der, prefira sim/não a uma nota de 1 a 10 — nota vira opinião disfarçada de número.',
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 2.2', title: 'Os dois critérios que valem mais pro Chef Caseiro',
    bullets: [
      { text: 'Fidelidade ao estoque: os ingredientes da receita vieram do que ela realmente consultou, ou ela inventou algo "óbvio"?', bold: true },
      { text: 'Respeito às restrições: a sugestão respeitou tudo que eu cadastrei — alergia, dieta, o que a casa não come?', bold: true },
      'Esses dois nascem direto do que o produto promete. Se algum dos dois falha, a promessa central quebrou.',
    ] },

  { type: 'divider', number: '2.3', title: 'Pedindo ajuda pra gerar casos de teste' },
  { type: 'bullets', eyebrow: 'Vídeo 2.3', title: 'Um pedido não é suficiente pra confiar em nada',
    bullets: [
      'Eu testei com um pedido só, na Aula 1. Isso não prova nada — só mostra que funcionou uma vez, com uma pessoa, num dia.',
      { text: 'Vou pedir pro Claude gerar várias situações diferentes de pedido — como se fossem várias pessoas reais perguntando.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 2.3', title: 'Rodando o produto contra cada situação',
    bullets: [
      'Cadastro estoques e restrições diferentes para cada situação gerada, e mando cada pedido pro Chef Caseiro.',
      { text: 'Agora eu tenho várias respostas reais para julgar — não mais uma opinião sobre um caso só.', bold: true },
    ] },

  { type: 'divider', number: '2.4', title: 'Lendo o que aconteceu de verdade' },
  { type: 'bullets', eyebrow: 'Vídeo 2.4', title: 'Ainda não tenho um painel — e tudo bem',
    bullets: [
      'Sem observabilidade ainda (isso é a Aula 3), eu leio direto o que o produto guardou: cada pedido e cada resposta, um por um.',
      { text: 'Pra cada resposta, escrevo uma nota curta e aberta: o que incomodou, se incomodou algo. Nada de categoria fixa ainda.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 2.4', title: 'Das notas soltas para um padrão',
    bullets: [
      'Depois de ler todas, eu junto as notas parecidas e dou um nome a cada grupo — isso é a taxonomia, e ela nasce do dado, não de uma lista pronta.',
      { text: 'Normalmente, dois ou três padrões respondem pela maioria dos problemas. É neles que vale focar primeiro.', bold: true },
    ] },

  { type: 'divider', number: '2.5', title: 'O que aprendemos' },
  { type: 'bullets', eyebrow: 'Fechamento da aula', title: 'O que aprendemos',
    bullets: [
      'Um critério só serve se qualquer pessoa da equipe conseguir julgá-lo, olhando a resposta, sem programar.',
      'Testar com um caso só não prova nada — pedir ajuda ao Claude pra gerar várias situações resolve isso rápido.',
      { text: 'Ler as respostas e agrupar em padrões (não em categorias prontas) revela onde o produto realmente falha.', bold: true },
      'Hoje eu li tudo à mão, um por um. Isso não escala — e é exatamente o problema que a próxima aula resolve.',
    ] },

  { type: 'closing', kicker: 'AULA 2 CONCLUÍDA',
    text: 'Eu sei o que\nprocurar. Agora\nfalta enxergar.' },
];
