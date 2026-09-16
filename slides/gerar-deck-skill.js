// Deck de 3 slides que explica a skill `narrativa-diego`, montado no proprio
// sistema visual que a skill documenta.
//
// Design de acordo com .claude/skills/narrativa-diego/references/sistema-visual.md:
//   - canvas 26,67 x 15 in, margem 2,65
//   - Encode Sans nos titulos, Roboto no corpo
//   - as cinco familias de fundo (uma por slide, escolhida pela funcao)
//   - as tres cores semanticas usadas SO onde significam os pilares
//
// Rodar:  node slides/gerar-deck-skill.js
const path = require('path');
const pptxgen = require('pptxgenjs');

const ART = path.join(__dirname, 'gerador-alura', 'art');
const OUT = path.join(__dirname, 'skill-narrativa-diego.pptx');

const W = 26.67;
const H = 15.0;
const M = 2.65;
const COLW = W - M * 2;

// paleta oficial + derivados medidos do template
const C = {
  newBlack: '0C0C0E',
  blueUniverse: '010C53',
  techBlue: '0429BC',
  devBlue: '1F53E5',
  whiteSnow: 'F4F5F6',
  white: 'FFFFFF',
  titleGray: 'BDBFC7',
  bodyGray: 'A7A9B4',
  subInk: '7B7F8E',
  // as cinco familias de fundo
  bgPreto: '000000',
  bgCarvao: '131316',
  bgClaro: 'EEEFF1',
  bgAzulClaro: '5F8BEC',
  // cores semanticas dos tres pilares — so para os pilares
  pilarEvals: '2563EB',
  pilarObserv: '059669',
  pilarConform: '7C3AED',
};

const FONT = 'Encode Sans';
const FONT_CORPO = 'Roboto';
const FOOTER = 'Skill narrativa-diego — curso Evals, observabilidade e conformidade';

const pres = new pptxgen();
pres.defineLayout({ name: 'ALURA', width: W, height: H });
pres.layout = 'ALURA';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT_CORPO };
pres.author = 'Diego Rosales';
pres.title = 'Skill narrativa-diego';

const img = (n) => path.join(ART, n);

function logoClaro(s) {
  s.addImage({ path: img('logo.png'), x: 25.63, y: 0.44, w: 0.52, h: 0.65 });
}
// em fundo claro o logo branco sumiria: entra sobre uma pastilha escura
function logoEscuro(s) {
  s.addShape(pres.ShapeType.roundRect, {
    x: 25.42, y: 0.26, w: 0.94, h: 1.0,
    fill: { color: C.newBlack }, line: { color: C.newBlack }, rectRadius: 0.12,
  });
  s.addImage({ path: img('logo.png'), x: 25.63, y: 0.44, w: 0.52, h: 0.65 });
}

function rodape(s, cor, num) {
  s.addText(FOOTER, {
    x: M, y: H - 1.05, w: COLW - 1.5, h: 0.5,
    fontSize: 15, color: cor, fontFace: FONT_CORPO, transparency: 35,
    isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addText(num, {
    x: W - M - 1.3, y: H - 1.05, w: 1.3, h: 0.5,
    fontSize: 15, color: cor, fontFace: FONT_CORPO, transparency: 35,
    isTextBox: true, margin: 0, valign: 'middle', align: 'right',
  });
}

function eyebrow(s, texto, cor) {
  s.addText(texto, {
    x: M, y: 1.55, w: 16, h: 0.6,
    fontSize: 21, color: cor, bold: true, charSpacing: 3,
    fontFace: FONT, isTextBox: true, margin: 0, valign: 'middle',
  });
}

// ===========================================================================
// SLIDE 1 — familia "fala conceitual": fundo preto, malha, citacao em destaque
// ===========================================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: C.bgPreto };
  s.addImage({ path: img('malha.png'), x: 0, y: 0, w: W, h: H });
  logoClaro(s);

  // numero fantasma, atras do conteudo
  s.addText('01', {
    x: 20.9, y: 2.6, w: 5.4, h: 5.2,
    fontSize: 260, color: C.bgCarvao, bold: true, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'top', align: 'right',
  });

  eyebrow(s, 'COMO A SKILL FUNCIONA · 01 DE 03', C.devBlue);

  s.addText('Ela não escreve por mim.\nEla me impede de virar\nlocutor do meu curso.', {
    x: M, y: 2.35, w: 17.4, h: 3.6,
    fontSize: 60, color: C.whiteSnow, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'top', lineSpacingMultiple: 1.05,
  });

  const itens = [
    ['Tudo sai em primeira pessoa: eu conto o que eu fiz no produto, não explico um tema de fora.', false],
    ['São sete regras de voz, e cada uma está amarrada a uma frase minha que já foi gravada.', false],
    ['Se o parágrafo pudesse ter sido escrito por qualquer instrutor sobre qualquer produto, a voz já se perdeu.', true],
  ];
  itens.forEach(([txt, forte], i) => {
    const y = 6.45 + i * 1.62;
    s.addShape(pres.ShapeType.rect, {
      x: M, y: y + 0.32, w: 0.13, h: 0.13, fill: { color: C.devBlue }, line: { color: C.devBlue },
    });
    s.addText(txt, {
      x: M + 0.5, y, w: 15.9, h: 1.5,
      fontSize: 26, color: forte ? C.whiteSnow : C.bodyGray, bold: !!forte,
      fontFace: FONT_CORPO, isTextBox: true, margin: 0, valign: 'top',
      lineSpacingMultiple: 1.2,
    });
  });

  // cartao de citacao — a frase de fecho, padrao que a skill exige em todo bloco
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 11.4, w: 16.4, h: 2.05,
    fill: { color: C.bgCarvao }, line: { color: C.bgCarvao }, rectRadius: 0.08,
  });
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 11.4, w: 0.1, h: 2.05, fill: { color: C.devBlue }, line: { color: C.devBlue },
  });
  s.addText('"Se precisa de você pra julgar, não é critério, é gosto."', {
    x: M + 0.6, y: 11.62, w: 15.3, h: 0.95,
    fontSize: 27, color: C.whiteSnow, italic: true, fontFace: FONT_CORPO,
    isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addText('Toda seção fecha assim: uma frase curta e defensável. É ela que vira o negrito do slide e o corte da edição.', {
    x: M + 0.6, y: 12.55, w: 15.3, h: 0.7,
    fontSize: 17, color: C.subInk, fontFace: FONT_CORPO,
    isTextBox: true, margin: 0, valign: 'middle',
  });

  rodape(s, C.bodyGray, '01');
  s.addNotes(
    '"A skill não escreve no meu lugar. Ela guarda o jeito que eu escrevo, pra ' +
    'que qualquer sessão do Claude continue o curso sem trocar a minha voz pela ' +
    'de um locutor."\n' +
    '"Ela tem sete regras, e nenhuma foi inventada: cada uma saiu de uma frase ' +
    'que eu já falei em aula."\n' +
    '"E tem um teste simples: se o parágrafo serviria pra qualquer instrutor ' +
    'falando de qualquer produto, já era."'
  );
}

// ===========================================================================
// SLIDE 2 — familia "quadro comparativo": fundo claro, tres cartoes + legenda
// ===========================================================================
function slide2() {
  const s = pres.addSlide();
  s.background = { color: C.bgClaro };
  logoEscuro(s);

  eyebrow(s, 'COMO A SKILL FUNCIONA · 02 DE 03', C.techBlue);

  s.addText('Ela sabe montar o slide do jeito que eu monto', {
    x: M, y: 2.3, w: 19.5, h: 1.5,
    fontSize: 54, color: C.newBlack, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'top',
  });
  s.addText('Três regras de construção, medidas nos slides 1–68 do deck mestre — não deduzidas.', {
    x: M, y: 4.0, w: 19.5, h: 0.8,
    fontSize: 24, color: C.subInk, fontFace: FONT_CORPO,
    isTextBox: true, margin: 0, valign: 'top',
  });

  const cartoes = [
    { cor: C.techBlue, titulo: 'Animação\nforçada',
      corpo: 'Duplico o slide e acrescento um componente por vez, com o anterior idêntico e na mesma posição. Sem recurso de animação: sobrevive ao PDF e dá um frame por batida da fala.' },
    { cor: C.devBlue, titulo: 'Densidade\ncognitiva',
      corpo: 'O slide carrega a estrutura; a profundidade é minha, na fala. Se o aluno precisa ler tudo antes de me ouvir, o slide está fazendo trabalho demais.' },
    { cor: C.blueUniverse, titulo: 'Cinco famílias\nde fundo',
      corpo: 'O fundo é escolhido pela função, não pelo gosto: divisor, fala conceitual, quadro comparativo, opinião × critério e diagrama. Este slide é da terceira.' },
  ];
  const cw = (COLW - 1.2) / 3;
  cartoes.forEach((c, i) => {
    const x = M + i * (cw + 0.6);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 5.3, w: cw, h: 5.75,
      fill: { color: C.white }, line: { color: 'E2E4E8' }, rectRadius: 0.1,
    });
    s.addShape(pres.ShapeType.rect, {
      x, y: 5.3, w: cw, h: 0.16, fill: { color: c.cor }, line: { color: c.cor },
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: x + 0.55, y: 5.9, w: 0.78, h: 0.78,
      fill: { color: c.cor }, line: { color: c.cor }, rectRadius: 0.1,
    });
    s.addText(String(i + 1), {
      x: x + 0.55, y: 5.9, w: 0.78, h: 0.78,
      fontSize: 24, color: C.white, bold: true, fontFace: FONT,
      isTextBox: true, margin: 0, valign: 'middle', align: 'center',
    });
    s.addText(c.titulo, {
      x: x + 0.55, y: 7.0, w: cw - 1.1, h: 1.5,
      fontSize: 28, color: C.newBlack, fontFace: FONT,
      isTextBox: true, margin: 0, valign: 'top', lineSpacingMultiple: 1.05,
    });
    s.addText(c.corpo, {
      x: x + 0.55, y: 8.7, w: cw - 1.1, h: 2.1,
      fontSize: 18, color: C.subInk, fontFace: FONT_CORPO,
      isTextBox: true, margin: 0, valign: 'top', lineSpacingMultiple: 1.22,
    });
  });

  // legenda: as tres cores que carregam significado (uso correto do codigo)
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 11.5, w: COLW, h: 1.45,
    fill: { color: C.white }, line: { color: 'E2E4E8' }, rectRadius: 0.1,
  });
  s.addText('AS TRÊS CORES QUE CARREGAM SIGNIFICADO', {
    x: M + 0.55, y: 11.5, w: 6.6, h: 1.45,
    fontSize: 15, color: C.subInk, bold: true, charSpacing: 1.5, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'middle',
  });
  const pilares = [
    ['Evals', C.pilarEvals], ['Observabilidade', C.pilarObserv], ['Conformidade', C.pilarConform],
  ];
  pilares.forEach(([nome, cor], i) => {
    const x = M + 8.0 + i * 4.6;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 11.99, w: 0.42, h: 0.42, fill: { color: cor }, line: { color: cor }, rectRadius: 0.06,
    });
    s.addText(nome, {
      x: x + 0.62, y: 11.5, w: 3.9, h: 1.45,
      fontSize: 20, color: C.newBlack, fontFace: FONT_CORPO,
      isTextBox: true, margin: 0, valign: 'middle',
    });
  });

  rodape(s, C.subInk, '02');
  s.addNotes(
    '"Repara no fundo deste slide: ele é claro, e não é escolha estética. Quadro ' +
    'comparativo de três colunas mora no fundo claro; fala conceitual mora no preto."\n' +
    '"As três regras aqui eu não deduzi — elas foram medidas nos slides que já ' +
    'existem."\n' +
    '"E aquela faixa embaixo é uma regra que a skill protege: azul, verde e roxo ' +
    'são Evals, Observabilidade e Conformidade. Essas três cores significam alguma ' +
    'coisa, então não entram em cartão decorativo."'
  );
}

// ===========================================================================
// SLIDE 3 — familia "diagrama de fluxo": fundo azul claro, funil + checklist
// ===========================================================================
function slide3() {
  const s = pres.addSlide();
  s.background = { color: C.bgAzulClaro };
  logoEscuro(s);

  eyebrow(s, 'COMO A SKILL FUNCIONA · 03 DE 03', C.blueUniverse);

  s.addText('E ela cobra a pergunta que fecha tudo', {
    x: M, y: 2.15, w: 19.5, h: 1.4,
    fontSize: 54, color: C.white, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'top',
  });

  // o funil canonico, em quatro passos
  const passos = ['1. Cenário', '2. Critério', '3. Resposta', '4. Evidência'];
  const chipW = 4.3, gap = 1.0;
  const total = passos.length * chipW + (passos.length - 1) * gap;
  const x0 = M + (COLW - total) / 2;
  passos.forEach((p, i) => {
    const x = x0 + i * (chipW + gap);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 4.35, w: chipW, h: 1.4,
      fill: { color: C.white }, line: { color: C.white }, rectRadius: 0.1,
    });
    s.addText(p, {
      x, y: 4.35, w: chipW, h: 1.4,
      fontSize: 22, color: C.blueUniverse, bold: true, fontFace: FONT,
      isTextBox: true, margin: 0, valign: 'middle', align: 'center',
    });
    if (i < passos.length - 1) {
      s.addText('→', {
        x: x + chipW, y: 4.35, w: gap, h: 1.4,
        fontSize: 30, color: C.white, fontFace: FONT_CORPO,
        isTextBox: true, margin: 0, valign: 'middle', align: 'center',
      });
    }
  });
  s.addText('o funil canônico do curso — quatro passos, desenhado nos slides 52–57, e não muda', {
    x: M, y: 5.95, w: COLW, h: 0.6,
    fontSize: 19, color: C.blueUniverse, fontFace: FONT_CORPO,
    isTextBox: true, margin: 0, valign: 'middle', align: 'center',
  });

  // cartao da pergunta-ancora
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 7.05, w: 11.8, h: 3.35,
    fill: { color: C.white }, line: { color: C.white }, rectRadius: 0.12,
  });
  s.addText('A PERGUNTA-ÂNCORA', {
    x: M + 0.7, y: 7.4, w: 10.4, h: 0.5,
    fontSize: 15, color: C.subInk, bold: true, charSpacing: 2, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addText('Como eu saberia?', {
    x: M + 0.7, y: 8.0, w: 10.4, h: 1.3,
    fontSize: 50, color: C.blueUniverse, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'middle',
  });
  s.addText('Está literal nas minhas notas dos slides 43–50. Se o bloco termina numa afirmação que ficou subjetiva, ele não está pronto.', {
    x: M + 0.7, y: 9.35, w: 10.4, h: 0.85,
    fontSize: 17, color: C.subInk, fontFace: FONT_CORPO,
    isTextBox: true, margin: 0, valign: 'top', lineSpacingMultiple: 1.2,
  });

  // checklist
  s.addText('ANTES DE DAR UM BLOCO POR PRONTO', {
    x: 15.35, y: 7.05, w: 8.7, h: 0.5,
    fontSize: 15, color: C.blueUniverse, bold: true, charSpacing: 2, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'middle',
  });
  const checks = [
    'Que decisão o aluno toma melhor depois disto?',
    'Onde isso aparece no produto real, com dado na tela?',
    'Dá pra tirar metade do texto sem perder a ideia?',
  ];
  checks.forEach((t, i) => {
    const y = 7.85 + i * 0.85;
    s.addShape(pres.ShapeType.rect, {
      x: 15.35, y: y + 0.11, w: 0.3, h: 0.3,
      fill: { color: C.bgAzulClaro }, line: { color: C.white, width: 1.5 },
    });
    s.addText(t, {
      x: 15.95, y, w: 8.1, h: 0.72,
      fontSize: 19, color: C.white, fontFace: FONT_CORPO,
      isTextBox: true, margin: 0, valign: 'middle',
    });
  });

  // ancora recorrente do deck
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 11.0, w: COLW, h: 1.25,
    fill: { color: C.blueUniverse }, line: { color: C.blueUniverse },
  });
  s.addText('LEMBRE-SE: não estamos avaliando o modelo, e sim o comportamento esperado do produto.', {
    x: M + 0.7, y: 11.0, w: COLW - 1.4, h: 1.25,
    fontSize: 22, color: C.whiteSnow, fontFace: FONT_CORPO,
    isTextBox: true, margin: 0, valign: 'middle',
  });

  s.addText('Bloco que não muda uma decisão é ornamento — corte.', {
    x: M, y: 12.55, w: COLW, h: 0.9,
    fontSize: 26, color: C.blueUniverse, bold: true, fontFace: FONT,
    isTextBox: true, margin: 0, valign: 'middle',
  });

  rodape(s, C.blueUniverse, '03');
  s.addNotes(
    '"O funil é o que o aluno vê na tela: cenário, critério, resposta, evidência. ' +
    'Quatro passos, e eu não mexo neles."\n' +
    '"O que a skill acrescenta é a cobrança: sempre que uma afirmação puder ficar ' +
    'subjetiva, ela me devolve a pergunta — como eu saberia?"\n' +
    '"E o alvo não é você sair daqui sabendo mais. É você sair decidindo melhor. ' +
    'Se um bloco não muda uma decisão, ele é enfeite, e enfeite eu corto."'
  );
}

slide1();
slide2();
slide3();

pres.writeFile({ fileName: OUT }).then(() => {
  console.log('gerado:', OUT, '- 3 slides');
});
