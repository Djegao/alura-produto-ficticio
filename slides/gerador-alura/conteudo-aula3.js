// Aula 3 — Observabilidade. Conteudo na voz do AI Product Builder (persona
// Renata): quem observa, junta evidencia e pergunta — nao quem le codigo.
// Numeros reais do Langfuse, com o dia da gravacao filtrado fora.

module.exports.footer =
  'Aula 3 — Observabilidade: monitorando em produção — Evals, observabilidade e conformidade';

module.exports.slides = [
  { type: 'cover',
    title: 'Observabilidade:\nmonitorando\nem produção',
    subtitle: 'Aula 3 — lendo os dados reais do meu produto no Langfuse',
    meta: 'Dados reais: 61 interações, 31/07 a 28/08, US$ 1,88 acumulado' },

  { type: 'divider', number: '3.1', title: 'O que é observabilidade?' },
  { type: 'bullets', eyebrow: 'Vídeo 3.1', title: 'Eu não vejo o que meu produto faz',
    bullets: [
      'Depois que o produto está no ar, ele conversa com gente que eu não vejo, na hora em que eu não estou.',
      'Log responde “o que aconteceu aqui” — um evento solto, e só se alguém lembrou de registrar.',
      { text: 'Observabilidade é conseguir reconstruir por que aconteceu, sem ter estado olhando na hora.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 3.1', title: 'A regra que eu adotei',
    bullets: [
      { text: 'Nenhuma chamada da inteligência pode acontecer sem deixar rastro.', bold: true },
      'Não é enfeite: é a condição para eu conseguir responder qualquer pergunta depois.',
      'Se o rastro começa tarde, o que aconteceu antes some — e some em silêncio.',
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 3.1', title: 'Desligar o rastro não quebra o produto',
    bullets: [
      'Com a observabilidade desligada, o produto continua funcionando normalmente.',
      'O usuário não percebe nada. Quem fica cego é você.',
      { text: 'É por isso que ninguém cobra isso de você: não quebra o produto, quebra a sua capacidade de saber o que ele faz.', bold: true },
    ] },

  { type: 'divider', number: '3.2', title: 'Conhecendo o Langfuse' },
  { type: 'bullets', eyebrow: 'Vídeo 3.2', title: 'Três palavras para navegar',
    bullets: [
      'Interação: uma conversa inteira, do pedido até a resposta. É a unidade que você abre.',
      'Passo: cada coisa que aconteceu dentro dela — consultar o estoque, pensar, responder.',
      'Nota: a avaliação que a gente escreveu de volta na aula passada. Hoje são 39 notas em 9 interações.',
      { text: 'Com essas três você navega sozinha: abre a conversa, vê por dentro, e sabe se ela foi boa.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 3.2', title: 'Ligando no seu produto',
    bullets: [
      'As chaves saem do próprio Langfuse, na área de configurações do projeto.',
      'São três valores que você copia e cola no arquivo de configuração do seu produto.',
      { text: 'É a parte mais fácil da aula inteira — e a que mais gente deixa para depois.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 3.2', title: 'Antes e depois, ao vivo',
    bullets: [
      'Desligo a observabilidade e uso o produto: funciona igual, e não aparece nada no painel.',
      'Ligo de novo e faço exatamente a mesma coisa: agora a interação aparece inteira.',
      { text: 'Espere uns 45 segundos até o registro ficar visível. Não é erro — é a fila de chegada.', bold: true },
    ] },

  { type: 'divider', number: '3.3', title: 'Lendo os dados de produção' },
  { type: 'table', eyebrow: 'Vídeo 3.3 — dados reais (14/09)', title: '38 interações, US$ 1,53 acumulado',
    header: ['O que o produto faz', 'quantas vezes', 'custo por vez', 'demora', '% do custo'],
    rows: [
      ['Mediar o cardápio', '10', 'US$ 0,1381', '55,9 s', '90 %'],
      ['Receita premium da semana', '6', 'US$ 0,0115', '7,3 s', '5 %'],
      ['Entender um relato', '17', 'US$ 0,0032', '1,6 s', '4 %'],
      ['Ler nota por foto', '2', 'US$ 0,0071', '3,3 s', '1 %'],
      ['Ler uma nota fiscal', '2', 'US$ 0,0054', '2,7 s', '1 %'],
    ],
    legenda: 'Nove de cada dez dólares da conta, em pouco mais de um quarto das chamadas.' },
  { type: 'bullets', eyebrow: 'Vídeo 3.3', title: '26% das chamadas, 90% da conta',
    bullets: [
      { text: 'O Mediador de cardápio não é o mais usado — é o mais caro por uso.', bold: true },
      'Pouco mais de um quarto das chamadas do produto, nove de cada dez dólares que eu pago.',
      'Esse tipo de conclusão só aparece olhando o conjunto. Uma conversa por vez nunca mostraria isso.',
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 3.3 — ao vivo', title: 'Trocando o eixo, ao vivo',
    bullets: [
      'Mesma tarefa: entender uma frase curta e classificar o tipo de relato.',
      'Troco o modelo no painel, mando uma mensagem, e comparamos o trace novo com um trace recente.',
      { text: 'Essa decisão só é óbvia porque eu tenho a medição.', bold: true },
    ] },

  { type: 'divider', number: '3.4', title: 'Padrões de falha' },
  { type: 'bullets', eyebrow: 'Vídeo 3.4', title: 'Cinco falhas que eu achei olhando',
    bullets: [
      'Uma resposta cortada no meio de uma palavra, porque bateu num limite que eu mesmo configurei.',
      'Um erro engolido: o produto teve problema, devolveu uma lista vazia e seguiu como se nada fosse.',
      'Duas falhas no canal do Telegram: uma apagou a própria evidência, a outra não deixou evidência nenhuma.',
      'Uma em que a inteligência acertou tudo, e mesmo assim o estoque ficou errado.',
      { text: 'E uma quinta, achada ontem à noite, cozinhando de verdade — diferente de todas as outras.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 3.4', title: 'A resposta cortada no meio',
    bullets: [
      'A assinatura é fácil de reconhecer: a resposta simplesmente termina no meio de uma palavra.',
      'Acontece quando o pedido cresce e a resposta não cabe mais no limite configurado.',
      { text: 'Deixei sem corrigir de propósito — reproduzir isso ao vivo é o conteúdo da próxima aula.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 3.4 — 14/09, ao vivo', title: 'O hambúrguer que sumiu',
    bullets: [
      'Preparei um prato, contei pro bot, respondi a pergunta dele — três vezes, de jeitos diferentes.',
      { text: 'Fui checar os quatro traces: os quatro estão perfeitos. Zero erro.', bold: true },
      'E mesmo assim, o prato nunca entrou no estoque. Resultado líquido zero, sem uma falha visível.',
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 3.4', title: 'O que as cinco têm em comum',
    bullets: [
      { text: 'Nenhuma delas gritou.', bold: true },
      'Nenhum usuário reclamou de nenhuma — a última, nem eu tinha certeza se o erro era meu.',
      'Cada uma precisou de alguém olhando o dado certo, com a pergunta certa — e esse alguém é você.',
    ] },

  { type: 'divider', number: '3.5', title: 'O que aprendemos?' },
  { type: 'bullets', eyebrow: 'Fechamento da aula', title: 'O que aprendemos',
    bullets: [
      'Observabilidade é reconstruir a causa, não só registrar o evento.',
      'Interação, passo e nota são o vocabulário que você precisa para navegar o painel sozinha.',
      { text: 'Com dado real dá para ver para onde o dinheiro está indo — e onde trocar de modelo compensa.', bold: true },
      'Quatro falhas documentadas, nenhuma descoberta por reclamação de usuário.',
    ] },

  { type: 'closing', kicker: 'AULA 3 CONCLUÍDA',
    text: 'Ver o dado não é\nabstrato — vira uma\nconta que fecha.' },
];
