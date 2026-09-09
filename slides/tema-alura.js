// Tema visual da Alura para os decks do curso "Evals, observabilidade e
// conformidade". Extraído e adaptado de `../generate-slides.js` (paleta
// oficial "[FACA UMA COPIA] ALURA MODELO NOVO SLIDE") — mesmo estilo visual
// já aprovado, reorganizado em funções fábrica pra poder gerar 5 decks
// independentes a partir de um único módulo. O arquivo original não foi
// alterado.

const pptxgen = require('pptxgenjs');

const C = {
  blueUniverse: '010C53',
  deepBlue: '011676',
  techBlue: '0429BC',
  devBlue: '1F53E5',
  newBlack: '0C0C0E',
  whiteSnow: 'F4F5F6',
  white: 'FFFFFF',
  statusDone: '1C6B3C',
  statusDoneBg: 'E3F3E8',
  statusProgress: '92600A',
  statusProgressBg: 'FDF1DE',
  statusPending: '444B74',
  statusPendingBg: 'EEF0F6',
};

const FONT = 'Arial';

const W = 10;
const H = 5.63;
const MARGIN = 0.55;

// Cria uma nova apresentação 16x9 já configurada com a fonte do tema.
function criarApresentacao() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
  return pres;
}

// Cria o conjunto de helpers de slide, ligados a uma apresentação e a um
// texto de rodapé específicos (normalmente "Aula N — <título>").
function criarTema(pres, footerLabel) {
  function baseSlide(bg = C.whiteSnow) {
    const s = pres.addSlide();
    s.background = { color: bg };
    return s;
  }

  function footer(s, label = footerLabel) {
    s.addText(label, {
      x: MARGIN,
      y: H - 0.38,
      w: W - MARGIN * 2,
      h: 0.3,
      fontSize: 9,
      color: C.blueUniverse,
      fontFace: FONT,
      transparency: 40,
    });
  }

  function addCover(title, subtitle, meta) {
    const s = baseSlide(C.blueUniverse);
    s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.14, h: H, fill: { color: C.techBlue } });
    s.addText('EVALS, OBSERVABILIDADE E CONFORMIDADE', {
      x: MARGIN, y: 1.5, w: W - MARGIN * 2, h: 0.4,
      fontSize: 13, color: C.devBlue, bold: true, charSpacing: 2, fontFace: FONT,
    });
    s.addText(title, {
      x: MARGIN, y: 1.95, w: W - MARGIN * 2, h: 1.6,
      fontSize: 40, color: C.whiteSnow, bold: true, fontFace: FONT,
    });
    s.addText(subtitle, {
      x: MARGIN, y: 3.35, w: W - MARGIN * 2, h: 0.6,
      fontSize: 16, color: C.whiteSnow, fontFace: FONT, transparency: 15,
    });
    s.addText(meta, {
      x: MARGIN, y: H - 0.8, w: W - MARGIN * 2, h: 0.4,
      fontSize: 11, color: C.devBlue, fontFace: FONT,
    });
    return s;
  }

  function addDivider(number, title) {
    const s = baseSlide(C.techBlue);
    s.addText(number, {
      x: MARGIN, y: 1.7, w: 2, h: 1,
      fontSize: 20, color: C.whiteSnow, bold: true, fontFace: 'Consolas', transparency: 20,
    });
    s.addText(title, {
      x: MARGIN, y: 2.15, w: W - MARGIN * 2, h: 1.4,
      fontSize: 34, color: C.whiteSnow, bold: true, fontFace: FONT,
    });
    footer(s);
    return s;
  }

  function addBulletSlide(eyebrow, title, bullets, opts = {}) {
    const s = baseSlide();
    s.addText(eyebrow.toUpperCase(), {
      x: MARGIN, y: 0.4, w: W - MARGIN * 2, h: 0.35,
      fontSize: 11, color: C.techBlue, bold: true, charSpacing: 1.5, fontFace: FONT,
    });
    s.addText(title, {
      x: MARGIN, y: 0.78, w: W - MARGIN * 2, h: 0.7,
      fontSize: 26, color: C.blueUniverse, bold: true, fontFace: FONT,
    });
    s.addShape(pres.ShapeType.line, {
      x: MARGIN, y: 1.5, w: W - MARGIN * 2, h: 0,
      line: { color: C.blueUniverse, width: 1.5 },
    });

    const bulletItems = bullets.map((b) => {
      if (typeof b === 'string') return { text: b, options: { bullet: { code: '2022' }, color: C.deepBlue, fontSize: 15, breakLine: true, paraSpaceAfter: 10 } };
      return {
        text: b.text,
        options: { bullet: { code: '2022' }, color: C.deepBlue, fontSize: 15, bold: !!b.bold, breakLine: true, paraSpaceAfter: 10 },
      };
    });

    s.addText(bulletItems, { x: MARGIN, y: 1.75, w: W - MARGIN * 2, h: H - 2.3, valign: 'top', fontFace: FONT, lineSpacingMultiple: 1.15 });

    if (opts.quote) {
      s.addShape(pres.ShapeType.rect, { x: MARGIN, y: H - 1.15, w: 0.06, h: 0.7, fill: { color: C.techBlue } });
      s.addText(opts.quote, {
        x: MARGIN + 0.2, y: H - 1.15, w: W - MARGIN * 2 - 0.2, h: 0.7,
        fontSize: 13, italic: true, color: C.deepBlue, fontFace: FONT, valign: 'middle',
      });
    }
    footer(s);
    return s;
  }

  function addTableSlide(eyebrow, title, headerRow, rows, colW) {
    const s = baseSlide();
    s.addText(eyebrow.toUpperCase(), {
      x: MARGIN, y: 0.4, w: W - MARGIN * 2, h: 0.35,
      fontSize: 11, color: C.techBlue, bold: true, charSpacing: 1.5, fontFace: FONT,
    });
    s.addText(title, {
      x: MARGIN, y: 0.78, w: W - MARGIN * 2, h: 0.7,
      fontSize: 26, color: C.blueUniverse, bold: true, fontFace: FONT,
    });

    const headStyle = { fill: { color: C.blueUniverse }, color: C.whiteSnow, bold: true, fontSize: 11, fontFace: FONT, valign: 'middle' };
    const cellStyle = { fill: { color: C.white }, color: C.deepBlue, fontSize: 11, fontFace: FONT, valign: 'top' };

    const tableRows = [
      headerRow.map((h) => ({ text: h, options: { ...headStyle } })),
      ...rows.map((r, i) =>
        r.map((cell) => ({
          text: cell,
          options: { ...cellStyle, fill: { color: i % 2 === 0 ? C.white : C.whiteSnow } },
        }))
      ),
    ];

    s.addTable(tableRows, {
      x: MARGIN, y: 1.6, w: W - MARGIN * 2, colW,
      border: { type: 'solid', color: 'D8DCEA', pt: 0.5 },
      autoPage: false,
    });
    footer(s);
    return s;
  }

  function addStatusGrid(eyebrow, title, cards) {
    const s = baseSlide();
    s.addText(eyebrow.toUpperCase(), {
      x: MARGIN, y: 0.4, w: W - MARGIN * 2, h: 0.35,
      fontSize: 11, color: C.techBlue, bold: true, charSpacing: 1.5, fontFace: FONT,
    });
    s.addText(title, {
      x: MARGIN, y: 0.78, w: W - MARGIN * 2, h: 0.7,
      fontSize: 26, color: C.blueUniverse, bold: true, fontFace: FONT,
    });

    const cardW = (W - MARGIN * 2 - 0.3) / 2;
    const cardH = 1.55;
    const positions = [
      { x: MARGIN, y: 1.7 },
      { x: MARGIN + cardW + 0.3, y: 1.7 },
      { x: MARGIN, y: 1.7 + cardH + 0.25 },
      { x: MARGIN + cardW + 0.3, y: 1.7 + cardH + 0.25 },
    ];

    const statusColors = {
      done: { fg: C.statusDone, bg: C.statusDoneBg, label: 'CONFIRMADO' },
      progress: { fg: C.statusProgress, bg: C.statusProgressBg, label: 'EM ANDAMENTO' },
      pending: { fg: C.statusPending, bg: C.statusPendingBg, label: 'PENDENTE' },
    };

    cards.forEach((card, i) => {
      const pos = positions[i];
      const sc = statusColors[card.status];
      s.addShape(pres.ShapeType.rect, {
        x: pos.x, y: pos.y, w: cardW, h: cardH,
        fill: { color: C.white }, line: { color: 'D8DCEA', width: 1 },
      });
      s.addShape(pres.ShapeType.rect, {
        x: pos.x + 0.2, y: pos.y + 0.18, w: 1.5, h: 0.28,
        fill: { color: sc.bg },
      });
      s.addText(sc.label, {
        x: pos.x + 0.2, y: pos.y + 0.18, w: 1.5, h: 0.28,
        fontSize: 8, bold: true, color: sc.fg, align: 'center', valign: 'middle', fontFace: 'Consolas',
      });
      s.addText(card.title, {
        x: pos.x + 0.2, y: pos.y + 0.55, w: cardW - 0.4, h: 0.35,
        fontSize: 14, bold: true, color: C.blueUniverse, fontFace: FONT,
      });
      s.addText(card.body, {
        x: pos.x + 0.2, y: pos.y + 0.88, w: cardW - 0.4, h: cardH - 1.0,
        fontSize: 10.5, color: C.deepBlue, fontFace: FONT, valign: 'top',
      });
    });
    footer(s);
    return s;
  }

  function addClosing(kicker, text) {
    const s = baseSlide(C.newBlack);
    s.addText(kicker, {
      x: MARGIN, y: 2.2, w: W - MARGIN * 2, h: 0.5,
      fontSize: 14, color: C.devBlue, bold: true, charSpacing: 1.5, fontFace: FONT,
    });
    s.addText(text, {
      x: MARGIN, y: 2.6, w: W - MARGIN * 2, h: 2.4,
      fontSize: 24, color: C.whiteSnow, bold: true, fontFace: FONT, lineSpacingMultiple: 1.2,
    });
    return s;
  }

  return { pres, baseSlide, footer, addCover, addDivider, addBulletSlide, addTableSlide, addStatusGrid, addClosing };
}

module.exports = { C, FONT, W, H, MARGIN, criarApresentacao, criarTema };
