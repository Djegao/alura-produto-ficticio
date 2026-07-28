// Gera a apresentacao de progresso em .pptx real, usando a paleta oficial da
// Alura encontrada no template ("[FACA UMA COPIA] ALURA MODELO NOVO SLIDE").
// O arquivo gerado e depois enviado ao Drive com conversao automatica para
// Google Slides nativo.

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

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };

const W = 10,
  H = 5.63;
const MARGIN = 0.55;

function baseSlide(bg = C.whiteSnow) {
  const s = pres.addSlide();
  s.background = { color: bg };
  return s;
}

function footer(s, label) {
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
  footer(s, 'Evals, observabilidade e conformidade — rascunho de progresso');
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
  footer(s, 'Evals, observabilidade e conformidade — rascunho de progresso');
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
  footer(s, 'Evals, observabilidade e conformidade — rascunho de progresso');
  return s;
}

function addColorSwatches(eyebrow, title, swatches, layoutList) {
  const s = baseSlide();
  s.addText(eyebrow.toUpperCase(), {
    x: MARGIN, y: 0.4, w: W - MARGIN * 2, h: 0.35,
    fontSize: 11, color: C.techBlue, bold: true, charSpacing: 1.5, fontFace: FONT,
  });
  s.addText(title, {
    x: MARGIN, y: 0.78, w: W - MARGIN * 2, h: 0.7,
    fontSize: 26, color: C.blueUniverse, bold: true, fontFace: FONT,
  });

  const swW = 1.35;
  swatches.forEach((sw, i) => {
    const x = MARGIN + i * (swW + 0.12);
    s.addShape(pres.ShapeType.rect, { x, y: 1.65, w: swW, h: 0.75, fill: { color: sw.hex }, line: { color: 'D8DCEA', width: 0.5 } });
    s.addText(sw.name, { x, y: 2.44, w: swW, h: 0.25, fontSize: 8.5, bold: true, color: C.blueUniverse, fontFace: 'Consolas' });
    s.addText('#' + sw.hex, { x, y: 2.66, w: swW, h: 0.25, fontSize: 8, color: C.deepBlue, fontFace: 'Consolas', transparency: 20 });
  });

  s.addText('LAYOUTS DISPONÍVEIS NO TEMPLATE', {
    x: MARGIN, y: 3.15, w: W - MARGIN * 2, h: 0.3,
    fontSize: 10, bold: true, color: C.techBlue, charSpacing: 1, fontFace: FONT,
  });
  s.addText(layoutList.map((l) => ({ text: l, options: { bullet: { code: '2022' }, breakLine: true, paraSpaceAfter: 3 } })), {
    x: MARGIN, y: 3.5, w: W - MARGIN * 2, h: 1.7, fontSize: 12, color: C.deepBlue, fontFace: FONT,
  });
  footer(s, 'Evals, observabilidade e conformidade — rascunho de progresso');
  return s;
}

function addClosing() {
  const s = baseSlide(C.newBlack);
  s.addText('Rascunho de progresso', {
    x: MARGIN, y: 2.2, w: W - MARGIN * 2, h: 0.5,
    fontSize: 14, color: C.devBlue, bold: true, charSpacing: 1.5, fontFace: FONT,
  });
  s.addText('Produto e conteúdo construídos e\nverificados em tempo real — não\napenas planejados em teoria.', {
    x: MARGIN, y: 2.6, w: W - MARGIN * 2, h: 1.8,
    fontSize: 24, color: C.whiteSnow, bold: true, fontFace: FONT, lineSpacingMultiple: 1.2,
  });
  return s;
}

// ---------- CONTEÚDO ----------

addCover(
  'Evals, observabilidade\ne conformidade',
  'Formação AI Product Builder — rascunho de progresso para a coordenação',
  'Foco desta etapa: Aula 3 — Observabilidade'
);

addDivider('01', 'Fundamento pedagógico');

addBulletSlide('Tese central', 'O que é um AI Product Builder', [
  { text: 'Profissional capaz de transformar uma hipótese em produto funcional em produção,', bold: false },
  'usando IA para reduzir dependências técnicas nas etapas iniciais de construção, validação e aprendizado.',
  'Não substitui Engenharia — reduz o custo do aprendizado antes de disputar capacidade estrutural.',
], { quote: '"O AI Product Builder não substitui Engenharia. Ele reduz o custo do aprendizado."' });

addBulletSlide('Persona de referência', 'Renata Souza, 31 anos', [
  'Profissional digital em São Paulo, não técnica por formação.',
  'Tensão central: sabe pensar o problema, mas depende de designers e devs para tirá-lo do papel.',
  'Estuda no fim do expediente — precisa aplicar o conteúdo a algo concreto imediatamente.',
  { text: 'Curso sem projeto próprio não funciona para essa persona.', bold: true },
]);

addTableSlide(
  'Framework',
  'Pirâmide do Aprendizado em Produção',
  ['Camada', 'Pergunta', 'Onde este curso entra'],
  [
    ['1', 'O problema continua sendo resolvido?', 'Job to be done — pré-requisito'],
    ['2', 'A IA entrega respostas confiáveis?', 'Aula 2 — Evals'],
    ['3', 'O usuário incorporou ao workflow?', 'Aula 3 — Observabilidade'],
    ['4', 'Existe impacto para o negócio?', 'Aula 3/4 — consequência, não métrica isolada'],
  ],
  [0.8, 4.2, 3.9]
);

addBulletSlide('Referência prática', 'Caso CS Labs (Thomson Reuters)', [
  'Customer Success constrói soluções locais para problemas que não entrariam no roadmap oficial.',
  'Mede-se impacto e adoção real com clientes.',
  'Produto cura o que já provou valor.',
], { quote: '"Nem todo problema precisa entrar imediatamente no roadmap. Alguns precisam, primeiro, provar seu valor nas mãos de quem está mais próximo do cliente."' });

addDivider('02', 'Estrutura das 5 aulas');

addTableSlide(
  'Ata oficial da coordenação',
  'As 5 aulas',
  ['Aula', 'Foco'],
  [
    ['1', 'O produto lançou. E agora? — os três pilares da operação'],
    ['2', 'Evals — avaliando a qualidade das respostas com Claude'],
    ['3', 'Observabilidade — monitorando em produção com Langfuse'],
    ['4', 'Detectar, diagnosticar e corrigir — prompt, dados ou modelo'],
    ['5', 'Guardrails, transparência e LGPD'],
  ],
  [0.9, 8.1]
);

addDivider('03', 'O produto fictício: Chef Caseiro');

addBulletSlide('Evolução deliberada', 'De mock simples a produto agêntico', [
  'Começou como ingredientes → receita, sem estado.',
  'Evoluído porque um mock estático não sustentaria as 5 aulas — não geraria dado real suficiente para as Aulas 3 e 4.',
]);

addBulletSlide('O que o produto faz', 'Cinco capacidades centrais', [
  'Ingere nota fiscal por foto — extração automática via visão.',
  'Mantém memória ativa em Supabase, com registros atômicos.',
  { text: 'Categoriza por estado: base (cru), ingrediente (transformado), preparado (prato pronto).' },
  'Aplica preferências persistentes do domicílio combinadas ao contexto do pedido.',
  'Gerencia estoque — decrementado só após confirmação explícita de consumo.',
]);

addTableSlide(
  'Arquitetura de dados',
  'Supabase / Postgres — 8 tabelas',
  ['Tabela', 'Papel'],
  [
    ['households', 'O domicílio'],
    ['preferences', 'Preferências persistentes, atômicas'],
    ['pantry_items', 'Estoque real: nome, quantidade, unidade, estado'],
    ['receipts', 'Notas fiscais ingeridas, com status de revisão'],
    ['receipt_items', 'Itens extraídos por visão — staging antes de virar estoque'],
    ['meal_requests', 'Pedido em texto livre do usuário'],
    ['meal_suggestions', 'Sugestão gerada, com modelo/versão/trace_id'],
    ['stock_consumptions', 'Confirmação de consumo — só aqui o estoque é abatido'],
  ],
  [3.0, 6.0]
);

addBulletSlide('Núcleo agêntico', 'Tool use real, não dado pré-buscado', [
  'O Claude decide sozinho quando consultar estoque e preferências.',
  'consultar_estoque — filtra itens do estoque por estado.',
  'consultar_preferencias — retorna as restrições persistentes do domicílio.',
  'Cada chamada vira observação própria no Langfuse, aninhada na árvore do trace.',
]);

addTableSlide(
  'Para a Aula 4',
  'Três eixos de troca ao vivo',
  ['Eixo', 'Opções'],
  [
    ['Versão do prompt', 'v1 (bug proposital) / v2 (corrigida)'],
    ['Modelo da visão (nota fiscal)', 'claude-fable-5 (overkill) / claude-haiku-4-5'],
    ['Modelo da geração agêntica', 'modelo mais fraco / claude-sonnet-5'],
  ],
  [4.0, 5.0]
);

addDivider('04', 'Status técnico verificado');

addStatusGrid('Testado de ponta a ponta', 'O que já está confirmado', [
  { status: 'done', title: 'Langfuse Cloud', body: 'Instrumentação via @langfuse/tracing + otel. Traces reais confirmados via API pública.' },
  { status: 'done', title: 'Supabase', body: '8 tabelas no ar. Domicílio semente + 8 itens de estoque + 2 preferências inseridos.' },
  { status: 'done', title: 'Agente com tool use real', body: 'Testado 2x (v1/v2). Cada execução gerou árvore de 5 observações no Langfuse.' },
  { status: 'pending', title: 'Restante do produto', body: 'Nota fiscal, CRUD de preferências, confirmação de consumo, interface consolidada.' },
]);

addBulletSlide('Exemplo real', 'O agente em ação', [
  { text: 'Pedido: "Vou receber um casal de amigos para uma noite de jantar de massa com carne, queijo e vinho."', bold: true },
  'Consultou o estoque real (arroz, feijão, macarrão, carne moída, vinho, queijo ralado, molho de tomate, lasanha de sobra).',
  'Consultou as preferências reais (evitar carne de porco, preferência por tintos secos).',
  'Respondeu corretamente sem violar restrições — sem alucinar o que havia na despensa.',
]);

addDivider('05', 'Achados reais de desenvolvimento');

addBulletSlide('Achado 01', 'O bug previsto não se confirmou', [
  'O prompt v1 foi desenhado para pular a consulta às ferramentas de propósito.',
  'Na prática, o Sonnet 5 chamou as ferramentas nas duas versões — o bug não se reproduziu.',
  { text: 'Vira conteúdo por si só: previmos uma falha por intuição, medimos, e a intuição estava errada.', bold: true },
]);

addBulletSlide('Achado 02', 'Latência de ingestão do Langfuse', [
  'Um trace exportado com sucesso ainda leva ~45 segundos para ficar disponível via API.',
  { text: '"Tempo real" em observabilidade quase nunca é instantâneo.', bold: true },
]);

addDivider('06', 'Roteiro já escrito');

addBulletSlide('Conhecendo o Langfuse', 'Onde seus dados de observabilidade vão morar?', [
  'Langfuse Cloud — hospedado, 5 min pra configurar, plano Hobby grátis (50k eventos/mês, 30 dias). Dado fica na infra deles.',
  'Docker Compose — self-hosted, controle total, mas "carece de alta disponibilidade, escala e backup" segundo a própria documentação.',
  'Produção real — Kubernetes/Terraform, para quem já provou valor.',
  { text: 'Essa escolha é, na prática, uma decisão de conformidade — o fio que volta na Aula 5 (LGPD).', bold: true },
]);

addDivider('07', 'Preparo conceitual — leitura de dados');

addBulletSlide('Lendo os dados de produção', 'O que cada dado realmente significa', [
  'Volume: pico não é sempre bom sinal; queda não é sempre problema.',
  'Latência: olhar p95/p99, não a média — ela esconde os casos que mais irritam o usuário.',
  { text: 'Erro técnico ≠ resposta ruim: o sistema pode responder errado com toda confiança.', bold: true },
  'Qualidade ao longo do tempo depende dos evals da Aula 2 escrevendo Score no trace_id — dependência de arquitetura, não detalhe.',
]);

addDivider('08', 'Identidade visual');

addColorSwatches(
  'Template oficial da Alura',
  'Paleta e layouts',
  [
    { name: 'Blue Universe', hex: '010C53' },
    { name: 'Deep Blue', hex: '011676' },
    { name: 'Tech Blue', hex: '0429BC' },
    { name: 'Dev Blue', hex: '1F53E5' },
    { name: 'New Black', hex: '0C0C0E' },
    { name: 'White Snow', hex: 'F4F5F6' },
  ],
  [
    'Capa · Divisor de seção · Título + parágrafo',
    'Seção com 3 tópicos em bullet · Citação/depoimento',
    'Passo a passo (01-04) · Infográfico 3 colunas · Encerramento',
  ]
);

addDivider('09', 'Próximos passos');

addTableSlide(
  'Pendências',
  'O que falta construir',
  ['Item', 'Status'],
  [
    ['Ingestão de nota fiscal (upload + visão)', 'Pendente'],
    ['CRUD de preferências', 'Pendente'],
    ['Confirmação de consumo (abate de estoque)', 'Pendente'],
    ['Interface consolidada', 'Pendente'],
    ['Decisão: reforçar bug do v1 ou manter achado', 'Em aberto'],
    ['Roteiro: "Lendo os dados" e "Padrões de falha"', 'Conceito pronto, texto pendente'],
    ['Aula 2 (Evals) — pipeline Score no Langfuse', 'Não iniciada — bloqueia dado real'],
    ['Aulas 1, 4 e 5', 'Não iniciadas'],
  ],
  [5.4, 3.6]
);

addClosing();

pres.writeFile({ fileName: 'chef-caseiro-progresso.pptx' }).then(() => {
  console.log('pptx gerado com sucesso');
});
