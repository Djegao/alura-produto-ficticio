// Gera aula4-alura.pptx — conteudo da Aula 4 no design do template oficial
// da Alura ("templte e passado.pptx"). Valores tipograficos e cromaticos
// extraidos do proprio template, nao inventados.
const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');

const ART = process.argv[2];
const OUT = process.argv[3];

// linhas.json: quantas linhas cada bullet ocupa de fato (ver medir.py)
const LINHAS_PATH = path.join(__dirname, 'linhas.json');
const LINHAS = fs.existsSync(LINHAS_PATH) ? JSON.parse(fs.readFileSync(LINHAS_PATH, 'utf8')) : {};

// ---- canvas do template ----
const W = 26.67;
const H = 15.0;
const M = 2.65;          // margem esquerda do template
const COLW = W - M * 2;

// ---- paleta oficial (slide "Paleta de cores" do template) ----
const C = {
  newBlack: '0C0C0E',
  blueUniverse: '010C53',
  techBlue: '0429BC',
  dividerBlue: '052FD3',   // fill real do slide divisor
  devBlue: '1F53E5',
  whiteSnow: 'F4F5F6',
  white: 'FFFFFF',
  titleGray: 'BDBFC7',     // titulo sobre fundo escuro
  bodyGray: 'A7A9B4',      // corpo sobre fundo escuro
  lightBg: 'EEEFF1',
  darkInk: '0C0C0E',
  subInk: '7B7F8E',
};

// Tipografia da marca, igual ao template: Encode Sans nos titulos, Roboto no
// corpo. As duas foram instaladas nesta maquina em 29/08 (fontes variaveis).
const FONT = 'Encode Sans';        // titulos, numeros, eyebrow
const FONT_CORPO = 'Roboto';       // bullets, tabela, rodape

// Conteudo: por padrao o array `aula4` embutido; com um modulo em argv[6],
// o mesmo design gera qualquer aula (o modulo exporta .slides e .footer).
const MOD = process.argv[6] ? require(path.resolve(process.argv[6])) : null;
let FOOTER = 'Aula 4 — Detectar, diagnosticar e corrigir — Evals, observabilidade e conformidade';
if (MOD && MOD.footer) FOOTER = MOD.footer;

const pres = new pptxgen();
pres.defineLayout({ name: 'ALURA', width: W, height: H });
pres.layout = 'ALURA';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT_CORPO };

const img = (n) => path.join(ART, n);

function logo(s) {
  s.addImage({ path: img('logo.png'), x: 25.63, y: 0.44, w: 0.52, h: 0.65 });
}

function malha(s) {
  s.addImage({ path: img('malha.png'), x: 0, y: 0, w: W, h: H });
}

function footer(s) {
  s.addText(FOOTER, {
    x: M, y: H - 1.05, w: COLW, h: 0.5,
    fontSize: 15, color: C.bodyGray, fontFace: FONT_CORPO, transparency: 35,
    isTextBox: true, margin: 0, valign: 'middle',
  });
}

// ---------------------------------------------------------------- capa
function addCover(d) {
  const s = pres.addSlide();
  s.background = { color: C.newBlack };
  malha(s);
  s.addImage({ path: img('capa.png'), x: 8.85, y: 0, w: 17.82, h: 15.0 });
  logo(s);

  s.addText('EVALS, OBSERVABILIDADE E CONFORMIDADE', {
    x: M, y: 2.05, w: 14.5, h: 0.7,
    fontSize: 22, color: C.devBlue, bold: true, charSpacing: 3,
    fontFace: FONT, isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addText(d.title, {
    x: M, y: 2.95, w: 14.4, h: 6.3,
    fontSize: 104, color: C.titleGray, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'top', lineSpacingMultiple: 1.02,
  });
  s.addText(d.subtitle, {
    x: M, y: 9.55, w: 14.9, h: 1.9,
    fontSize: 38, color: C.bodyGray, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'top', lineSpacingMultiple: 1.15,
  });
  s.addText(d.meta, {
    x: M, y: 11.75, w: 15.2, h: 0.8,
    fontSize: 28, color: C.devBlue, fontFace: FONT_CORPO,
    isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addNotes(d.notas || 'Capa. Ciclo completo ao vivo: detectar, diagnosticar, corrigir.');
  return s;
}

// ------------------------------------------------------------- divisor
function addDivider(d) {
  const s = pres.addSlide();
  s.background = { color: C.dividerBlue };
  logo(s);
  s.addText(d.number + ' ' + d.title, {
    x: 4.83, y: 4.4, w: 17.0, h: 6.2,
    fontSize: 96, color: C.white, fontFace: FONT, align: 'center',
    isTextBox: true, margin: 0, valign: 'middle', lineSpacingMultiple: 1.05,
  });
  // O divisor nao e so transicao: e a CLAQUETE do video. O editor corta por
  // ele. Azul chapado full-bleed justamente pra ser achavel na varredura da
  // timeline — nao mexer no fundo nem encher de elemento.
  s.addNotes(
    'CLAQUETE — inicio do video ' + d.number + '. Segure 2 segundos em silencio ' +
    'antes de comecar a falar: e por esta tela que a edicao corta.'
  );
  return s;
}

// ------------------------------------------------- conteudo (fundo escuro)
function addBullets(d) {
  const s = pres.addSlide();
  s.background = { color: C.newBlack };
  malha(s);
  logo(s);

  s.addText(d.eyebrow.toUpperCase(), {
    x: M, y: 2.35, w: COLW, h: 0.65,
    fontSize: 21, color: C.devBlue, bold: true, charSpacing: 2.5,
    fontFace: FONT, isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addText(d.title, {
    x: M, y: 3.15, w: 20.5, h: 2.6,
    fontSize: 66, color: C.titleGray, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'top', lineSpacingMultiple: 1.05,
  });

  // Linhas com seta em Dev Blue (padrao do template). Seta e texto ambos
  // ancorados no TOPO: a seta tem que acompanhar a primeira linha, nao o
  // centro do bloco — senao ela flutua nos itens que quebram em duas linhas.
  // A contagem de linhas vem medida da Arial real (medir.py), nao estimada.
  const LINE = 0.60;         // altura de uma linha
  const GAP = 0.55;          // respiro entre itens
  let y = 5.85;
  d.bullets.forEach((b) => {
    const texto = typeof b === 'string' ? b : b.text;
    const forte = typeof b !== 'string' && b.bold;
    const linhas = LINHAS[texto] || 1;
    const h = linhas * LINE;

    s.addText('→', {
      x: M, y: y + 0.02, w: 0.85, h: LINE,
      fontSize: 30, color: C.devBlue, bold: true, fontFace: FONT_CORPO,
      isTextBox: true, margin: 0, valign: 'top',
    });
    s.addText(texto, {
      x: M + 1.0, y: y, w: 19.6, h: h,
      fontSize: 28, color: forte ? C.titleGray : C.bodyGray, bold: !!forte,
      fontFace: FONT_CORPO, isTextBox: true, margin: 0, valign: 'top',
      lineSpacingMultiple: 1.18,
    });
    y += h + GAP;
  });

  footer(s);
  return s;
}

// ------------------------------------------------- tabela (fundo claro)
function addTable(d) {
  const s = pres.addSlide();
  s.background = { color: C.lightBg };
  logo(s);

  s.addText(d.eyebrow.toUpperCase(), {
    x: M, y: 2.35, w: COLW, h: 0.65,
    fontSize: 21, color: C.techBlue, bold: true, charSpacing: 2.5,
    fontFace: FONT, isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addText(d.title, {
    x: M, y: 3.15, w: 20.5, h: 1.6,
    fontSize: 64, color: C.darkInk, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'top',
  });

  const head = d.header.map((h) => ({
    text: h,
    options: { fill: { color: C.blueUniverse }, color: C.whiteSnow, bold: true, fontSize: 22, fontFace: FONT_CORPO, valign: 'middle', align: 'left' },
  }));
  const corpo = d.rows.map((r, i) =>
    r.map((cell) => ({
      text: cell,
      options: { fill: { color: i % 2 === 0 ? 'FFFFFF' : 'F7F8FA' }, color: '2B2F3A', fontSize: 22, fontFace: FONT_CORPO, valign: 'middle', align: 'left' },
    }))
  );

  s.addTable([head, ...corpo], {
    x: M, y: 5.5, w: 21.37,
    colW: d.colW || [6.5, 1.45, 4.1, 4.6, 4.72],
    rowH: 0.85,
    border: { type: 'solid', color: 'D8DCEA', pt: 0.75 },
    autoPage: false,
  });

  s.addText(d.legenda || '75 % do custo em 19 % das chamadas — o Mediador é o eixo caro.', {
    x: M, y: 11.6, w: 21.37, h: 0.8,
    fontSize: 26, italic: true, color: C.subInk, fontFace: FONT_CORPO,
    isTextBox: true, margin: 0, valign: 'middle',
  });

  s.addText(FOOTER, {
    x: M, y: H - 1.05, w: COLW, h: 0.5,
    fontSize: 15, color: C.subInk, fontFace: FONT_CORPO,
    isTextBox: true, margin: 0, valign: 'middle',
  });
  return s;
}

// ---------------------------------------------------------- fechamento
function addClosing(d) {
  const s = pres.addSlide();
  s.background = { color: C.blueUniverse };
  logo(s);
  s.addText(d.kicker, {
    x: M, y: 5.5, w: COLW, h: 0.9,
    fontSize: 26, color: C.devBlue, bold: true, charSpacing: 3,
    fontFace: FONT, isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addText(d.text, {
    x: M, y: 6.55, w: 19.5, h: 5.2,
    fontSize: 78, color: C.whiteSnow, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'top', lineSpacingMultiple: 1.12,
  });
  return s;
}

// ====================================================== conteudo da Aula 4
// (identico ao array `aula4` de slides/generate-slides-curso.js)
const aula4 = [
  { type: 'cover',
    title: 'Detectar,\ndiagnosticar\ne corrigir',
    subtitle: 'Aula 4 — prompt, dados ou modelo? diagnóstico em produção real',
    meta: 'Diagnóstico e correção ao vivo, em produção — chef.workshopee.com.br' },

  { type: 'divider', number: '4.1', title: 'Detectando degradação' },
  { type: 'bullets', eyebrow: 'Vídeo 4.1', title: 'O estado em produção hoje',
    bullets: [
      'O Chef Caseiro está no ar, com dados reais e chamadas de modelo pagas.',
      'Nenhum alarme disparou. Nenhum usuário reclamou. E há três falhas ativas neste momento.',
      { text: 'Falha que não grita é a regra, não a exceção — detectar é trabalho ativo, não espera.', bold: true },
    ] },
  { type: 'table', eyebrow: 'Vídeo 4.1 — dado real', title: 'Eixo de custo, por operação',
    header: ['Operação', 'n', 'Custo médio', 'Latência média', '% do custo'],
    rows: [
      ['mediar-cardapio', '12', 'US$ 0,1184', '51,2 s', '75 %'],
      ['sugerir-receita', '7', 'US$ 0,0324', '34,1 s', '12 %'],
      ['ingerir-relato', '37', 'US$ 0,0047', '2,5 s', '9 %'],
      ['receita-premium-semanal', '4', 'US$ 0,0085', '5,8 s', '2 %'],
      ['ingerir-nota-fiscal', '4', 'US$ 0,0080', '3,9 s', '2 %'],
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 4.1', title: '19% das chamadas, 75% da conta',
    bullets: [
      { text: 'O Mediador de cardápio concentra o custo — não a frequência.', bold: true },
      'É o argumento mais concreto pra separar o eixo de geração do eixo de ingestão.',
      'Com a leitura de nota por foto, entram três eixos trocáveis ao vivo: geração, ingestão e visão.',
    ] },

  { type: 'divider', number: '4.2', title: 'Diagnosticando a causa' },
  { type: 'bullets', eyebrow: 'Vídeo 4.2 — episódio A', title: 'Dois erros. Ou um só?',
    bullets: [
      'O sintoma: mandei uma nota pelo Telegram e não aconteceu nada.',
      'O que eu junto: o registro tem duas linhas de erro, mesma mensagem, com 8 milionésimos de segundo entre elas.',
      'Não sei o que a mensagem de erro significa — e não preciso saber para investigar.',
      { text: 'O que eu levo ao Claude: “aconteceram dois erros aqui, ou um só? Repara no horário das duas linhas.”', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 4.2 — episódio B', title: 'A falha perfeitamente silenciosa',
    bullets: [
      'O sintoma: mandei a foto do cupom. Sem resposta, sem item no estoque, sem nada.',
      'O que eu junto: o Telegram confirma que entregou. Nenhuma linha nova no feed. Nenhum trace no Langfuse.',
      'O “recebido” que o app manda de volta não conta — ele responde isso antes de processar qualquer coisa.',
      { text: 'O que eu levo ao Claude: “a mensagem chegou e sumiu sem deixar rastro nenhum. Onde ela se perdeu?”', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 4.2 — episódio C', title: 'A conta bateu. O estoque não.',
    bullets: [
      'O sintoma: avisei que comemos 3 porções de lasagna. O bot reagiu com joinha. O estoque continuou com 5.',
      'O que eu junto: o registro mostra que ele entendeu tudo — o prato, as 3 porções, até a conta de 1 e meia para cada.',
      'Ou seja: a inteligência acertou. Alguma outra coisa errou — e eu não sei qual.',
      { text: 'O que eu levo ao Claude: “ele entendeu certo e mesmo assim o estoque não baixou. Por quê?”', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 4.2', title: 'O que os três casos têm em comum',
    bullets: [
      'Em nenhum deles eu li código para descobrir o problema. Eu observei, juntei evidência e perguntei.',
      'Nos dois primeiros, o produto falhou em avisar. No terceiro, ele avisou que tinha dado certo — e não tinha.',
      { text: 'O reflexo “o problema é o prompt” está errado aqui: a inteligência acertou nos três. Quem errou foi o produto em volta dela.', bold: true },
    ] },

  { type: 'divider', number: '4.3', title: 'Corrigindo antes do usuário' },
  { type: 'bullets', eyebrow: 'Vídeo 4.3 — a correção', title: 'Ensinar o produto a dizer “não sei”',
    bullets: [
      'O Claude achou o ponto: existe um caminho em que o produto recebe a mensagem e simplesmente sai calado.',
      'A correção não ensina ele a ler foto. Ensina ele a avisar que não sabe ler.',
      'E resolve o outro caso junto: o aviso de erro nunca mais apaga a informação do erro.',
      { text: 'Admitir a limitação já é uma correção — o problema não era não saber ler, era não dizer.', bold: true },
    ] },
  { type: 'bullets', eyebrow: 'Vídeo 4.3 — a capacidade nova', title: 'Agora sim: ensinar a ler a nota',
    bullets: [
      'Só depois de o produto saber dizer “não sei” é que faz sentido ensinar ele a saber.',
      'A foto entra e os itens caem no estoque com o dado oficial da nota — não com chute de modelo.',
      { text: 'O desenho que eu imaginei primeiro não funcionou: os números impressos não bastavam, o dado oficial só vem pelo link do QR code.', bold: true },
      'Quem teve a ideia fui eu. Quem descobriu que ela não parava em pé fui eu, testando.',
    ] },

  { type: 'divider', number: '4.4', title: 'Simulando o ciclo completo' },
  { type: 'bullets', eyebrow: 'Vídeo 4.4', title: 'O que essa correção criou',
    bullets: [
      'Toda capacidade nova traz erro novo: com foto entrando, cresce a chance de item errado no estoque.',
      'A tela de conferir antes de salvar deixou de ser luxo — virou a próxima coisa a construir.',
      'E tem o que eu escolhi NÃO corrigir: o caso da lasanha continua quebrado neste momento, de propósito.',
      { text: 'Risco que eu conheço e registro é diferente de risco escondido — e é onde a próxima aula começa.', bold: true },
    ] },

  { type: 'divider', number: '4.5', title: 'O que aprendemos?' },
  { type: 'bullets', eyebrow: 'Fechamento da aula', title: 'O que aprendemos',
    bullets: [
      'Nenhuma das três falhas gritou. Todas apareceram porque eu fui olhar.',
      'Eu não li código para diagnosticar: observei, juntei evidência e perguntei.',
      { text: 'A inteligência acertou nos três casos. Quem falhou foi o produto em volta dela — e cuidar disso é trabalho de quem constrói o produto.', bold: true },
      'Corrigir antes do usuário perceber é possível quando o dado de produção está visível para você.',
    ] },

  { type: 'closing', kicker: 'AULA 4 CONCLUÍDA',
    text: 'Nenhuma falha gritou\nsozinha. Todas foram\nencontradas olhando.' },
];

// Passo 1 (`dump`): exporta os bullets pra medicao. Passo 2: gera o deck
// usando linhas.json. Dois passos porque a medicao usa as metricas TrueType
// da Arial via Pillow, do lado do Python.
const SLIDES = MOD ? MOD.slides : aula4;
const MODO = process.argv[4] || 'gerar';

if (MODO === 'dump') {
  const itens = [];
  SLIDES.filter((d) => d.type === 'bullets').forEach((d) =>
    d.bullets.forEach((b) =>
      itens.push(typeof b === 'string' ? { text: b, bold: false } : { text: b.text, bold: !!b.bold })
    )
  );
  fs.writeFileSync(process.argv[5], JSON.stringify(itens, null, 1), 'utf8');
  console.log('dump:', itens.length, 'bullets ->', process.argv[5]);
} else {
  const construtor = { cover: addCover, divider: addDivider, bullets: addBullets, table: addTable, closing: addClosing };
  SLIDES.forEach((d) => construtor[d.type](d));
  pres.writeFile({ fileName: OUT }).then(() => {
    console.log('gerado:', OUT, '-', SLIDES.length, 'slides');
  });
}
