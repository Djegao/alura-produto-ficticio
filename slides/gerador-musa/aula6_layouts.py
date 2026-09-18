# -*- coding: utf-8 -*-
"""Os 11 tipos de slide da Aula 6. Cada funcao registra formas por quadro.

Todo layout mede a composicao antes de desenhar e encolhe o corpo (nunca
abaixo de 10 pt) ate caber na faixa util. Se nao couber nem no menor corpo,
o QA acusa — e o texto e que precisa encurtar, nao o slide crescer.
"""
from pptx.util import Pt, Emu
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from aula6_engine import (
    Deck, quebra, altura, n_linhas,
    AZUL, AZUL_MED, AZUL_CLA, VERDE, AMBAR, VERMELHO, ROXO,
    BG_CLARO, CARD_CLA, BORDA_CLA, TXT_FORTE, TXT_MEDIO, TXT_FRACO,
    CARD_ESC, BORDA_ESC, TXT_ESC, TXT_ESC2, STMT,
    F_TIT, F_UI, F_TXT, MARGEM, UTIL_W, SLIDE_W, SLIDE_H,
)

RR = MSO_SHAPE.ROUNDED_RECTANGLE
RET = MSO_SHAPE.RECTANGLE
OVAL = MSO_SHAPE.OVAL

BANDA_TOPO, BANDA_BASE = 113.0, 363.0
BANDA_TOPO_SUB = 132.0


def _tema(base):
    if base == 'escuro':
        return dict(card=CARD_ESC, borda=BORDA_ESC, titulo=TXT_ESC,
                    corpo=TXT_ESC2, forte=TXT_ESC)
    return dict(card=CARD_CLA, borda=BORDA_CLA, titulo=TXT_FORTE,
                corpo=TXT_MEDIO, forte=TXT_FORTE)


def _cabecalho(d, base, titulo, sub):
    t = _tema(base)
    tam = 25 if n_linhas(titulo, UTIL_W, 25, F_TIT) == 1 else 21

    def desenha(sl):
        d._texto(sl, MARGEM, 44, UTIL_W, 43, titulo, tam, t['titulo'], F_TIT,
                 entrelinha=1.05)
        if sub:
            d._texto(sl, MARGEM, 94, UTIL_W, 22, sub, 13, TXT_FRACO, F_TXT)
    d.em(1, desenha)
    return BANDA_TOPO_SUB if sub else BANDA_TOPO


def _ajusta(candidatos, mede, limite):
    """Primeiro candidato cuja medida cabe no limite; senao o ultimo."""
    for c in candidatos:
        if mede(c) <= limite:
            return c, True
    return candidatos[-1], False


# ------------------------------------------------------------------ 1. capa --
def capa(d, secao, notas):
    def desenha(sl):
        d._texto(sl, 72, 55, 391, 19, 'EVALS, OBSERVABILIDADE E CONFORMIDADE',
                 8, '1F53E5', F_UI, algn=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
                 bold=True)
        d._texto(sl, 72, 130, 400, 120, ['Aula 6', secao], 36, 'FFFFFF', F_UI,
                 algn=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, entrelinha=1.15)
        d._texto(sl, 72, 258, 402, 51,
                 'Guardrails em código, transparência como design e LGPD na prática',
                 15, 'FFFFFF', F_TXT, algn=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
                 entrelinha=1.2)
        d._texto(sl, 72, 317, 410, 22,
                 'Lançar é o começo. O run é a grande responsabilidade.',
                 12, '4A9BE8', F_TXT, algn=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP)
    d.em(1, desenha)
    d.slide('capa', secao, 'capa', notas)


# --------------------------------------------------------------- 2. divisor --
def divisor(d, titulo, notas):
    tam, _ = _ajusta([38, 34, 30],
                     lambda t: altura(titulo, 368, t, F_UI, 1.12), 137)

    def desenha(sl):
        d._texto(sl, 176, 140, 368, 137, quebra(titulo, 368, tam, F_UI), tam,
                 'FFFFFF', F_UI, entrelinha=1.12)
    d.em(1, desenha)
    d.slide('divisor', titulo, 'divisor', notas)


# ------------------------------------------------------------- 3. statement --
def statement(d, texto, notas, item=None):
    """Frase unica dentro do circulo preto. A fonte encolhe ate caber."""
    tam, _ = _ajusta([49, 44, 40, 36, 32, 28, 24],
                     lambda t: altura(texto, 330, t, F_UI, 1.12), 296)

    def desenha(sl):
        d._texto(sl, 195, 54, 330, 296, quebra(texto, 330, tam, F_UI), tam,
                 STMT, F_UI, entrelinha=1.12)
    d.em(1, desenha)
    d.slide('statement', item or texto[:40], 'statement', notas)


# ------------------------------------------------------------------ 4. hero --
def hero(d, frase, sub, notas):
    def f1(sl):
        d._texto(sl, 90, 108, 540, 120, quebra(frase, 540, 44, F_TIT), 44,
                 'FFFFFF', F_TIT, entrelinha=1.1)

    def f2(sl):
        d._forma(sl, RET, 330, 246, 60, 3, fill='FFFFFF')

    def f3(sl):
        d._texto(sl, 130, 268, 460, 60, quebra(sub, 460, 20, F_TXT), 20,
                 'C7D6FF', F_TXT, entrelinha=1.25)
    d.em(1, f1)
    d.em(2, f2)
    d.em(3, f3)
    d.slide('divisor', frase, 'hero', notas)


# ----------------------------------------------------------------- 5. cards --
def cards(d, base, titulo, sub, lista, notas):
    """2 a 4 cartoes com barra de destaque. Um quadro por cartao."""
    t = _tema(base)
    topo = _cabecalho(d, base, titulo, sub)
    disp = BANDA_BASE - topo
    n = len(lista)
    gap = 20.0
    w = (UTIL_W - gap * (n - 1)) / n
    pad = 16.0
    interno = w - 2 * pad

    def mede(par):
        tt, tc = par
        alt = []
        for c in lista:
            th = altura(c['titulo'], interno, tt, F_TIT, 1.1)
            bh = sum(altura(b, interno - 14, tc, F_TXT, 1.15) + 5
                     for b in c['itens'])
            alt.append(40 + th + 12 + bh + 16)
        return max(alt)

    (t_tit, t_corpo), _ = _ajusta(
        [(18, 11), (17, 10.5), (16, 10), (15, 10)], mede, disp)
    ch = mede((t_tit, t_corpo))
    topo_card = topo + max(0.0, (disp - ch) / 2)

    for i, c in enumerate(lista):
        l = MARGEM + i * (w + gap)
        cor = c['cor']

        def desenha(sl, l=l, c=c, cor=cor):
            d._forma(sl, RR, l, topo_card, w, ch, fill=t['card'],
                     linha=t['borda'], arredondamento=0.06)
            d._forma(sl, RET, l, topo_card, w, 4, fill=cor)
            d._texto(sl, l + pad, topo_card + 18, interno, 14, c['rotulo'], 11,
                     cor, F_UI, bold=True, caixa=True)
            th = altura(c['titulo'], interno, t_tit, F_TIT, 1.1)
            d._texto(sl, l + pad, topo_card + 40, interno, th,
                     quebra(c['titulo'], interno, t_tit, F_TIT), t_tit,
                     t['titulo'], F_TIT, entrelinha=1.1)
            bh = sum(altura(b, interno - 14, t_corpo, F_TXT, 1.15) + 5
                     for b in c['itens'])
            d._texto(sl, l + pad, topo_card + 40 + th + 12, interno, bh,
                     c['itens'], t_corpo, t['corpo'], F_TXT,
                     algn=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
                     entrelinha=1.15, espaco=5, bullet=cor)
        d.em(i + 1, desenha)
    d.slide(base, titulo, 'cards%d' % n, notas)


# ---------------------------------------------------------------- 6. linhas --
def linhas(d, base, titulo, sub, lista, notas):
    """Linhas empilhadas: selo + titulo + descricao. Um quadro por linha."""
    t = _tema(base)
    topo = _cabecalho(d, base, titulo, sub)
    disp = BANDA_BASE - topo
    n = len(lista)
    gap = 6.0 if n >= 5 else 9.0
    rh_min = 44.0 if n >= 5 else 46.0
    x_tit, w_tit = 112.0, 208.0
    x_desc, w_desc = 336.0, 320.0

    def mede(par):
        tt, tc = par
        alt = []
        for r in lista:
            alt.append(max(rh_min,
                           max(altura(r['titulo'], w_tit, tt, F_TIT, 1.15),
                               altura(r['desc'], w_desc, tc, F_TXT, 1.25)) + 20))
        rh = max(alt)
        return n * rh + (n - 1) * gap

    (t_tit, t_corpo), _ = _ajusta(
        [(15, 11), (14, 10.5), (13, 10)], mede, disp)
    rh = (mede((t_tit, t_corpo)) - (n - 1) * gap) / n
    y0 = topo + max(0.0, (disp - (n * rh + (n - 1) * gap)) / 2)

    for i, r in enumerate(lista):
        y = y0 + i * (rh + gap)
        cor = r['cor']

        def desenha(sl, y=y, r=r, cor=cor):
            d._forma(sl, RR, MARGEM, y, UTIL_W, rh, fill=t['card'],
                     linha=t['borda'], arredondamento=0.12)
            d._forma(sl, RET, MARGEM, y, 4, rh, fill=cor)
            d._forma(sl, RR, MARGEM + 16, y + (rh - 24) / 2, 38, 24, fill=cor,
                     arredondamento=0.22)
            d._texto(sl, MARGEM + 16, y + (rh - 24) / 2, 38, 24, r['selo'], 11,
                     'FFFFFF', F_UI, bold=True)
            d._texto(sl, x_tit, y, w_tit, rh,
                     quebra(r['titulo'], w_tit, t_tit, F_TIT), t_tit,
                     t['titulo'], F_TIT, algn=PP_ALIGN.LEFT, entrelinha=1.15)
            d._texto(sl, x_desc, y, w_desc, rh,
                     quebra(r['desc'], w_desc, t_corpo, F_TXT), t_corpo,
                     t['corpo'], F_TXT, algn=PP_ALIGN.LEFT, entrelinha=1.25)
        d.em(i + 1, desenha)
    d.slide(base, titulo, 'linhas%d' % n, notas)


# ------------------------------------------------------------- 7. contraste --
def contraste(d, base, titulo, sub, esq, dir_, notas, simbolo='×'):
    """Dois paineis com cabecalho colorido e um simbolo no meio."""
    t = _tema(base)
    topo = _cabecalho(d, base, titulo, sub)
    disp = BANDA_BASE - topo
    w = 298.0
    xs = (MARGEM, MARGEM + w + 34)
    pad = 16.0
    interno = w - 2 * pad
    cab = 30.0

    def mede(par):
        tt, tc = par
        alt = []
        for p in (esq, dir_):
            th = altura(p['titulo'], interno, tt, F_TIT, 1.1)
            bh = sum(altura(b, interno - 14, tc, F_TXT, 1.15) + 6
                     for b in p['itens'])
            alt.append(cab + 16 + th + 12 + bh + 14)
        return max(alt)

    (t_tit, t_corpo), _ = _ajusta(
        [(18, 11), (17, 10.5), (16, 10), (15, 10)], mede, disp)
    ph = mede((t_tit, t_corpo))
    y0 = topo + max(0.0, (disp - ph) / 2)

    for i, p in enumerate((esq, dir_)):
        l = xs[i]

        def desenha(sl, l=l, p=p):
            d._forma(sl, RR, l, y0, w, ph, fill=t['card'], linha=t['borda'],
                     arredondamento=0.05)
            d._forma(sl, RET, l, y0, w, cab, fill=p['cor'])
            d._texto(sl, l, y0, w, cab, p['rotulo'], 11, 'FFFFFF', F_UI,
                     bold=True, caixa=True)
            th = altura(p['titulo'], interno, t_tit, F_TIT, 1.1)
            d._texto(sl, l + pad, y0 + cab + 16, interno, th,
                     quebra(p['titulo'], interno, t_tit, F_TIT), t_tit,
                     t['titulo'], F_TIT, entrelinha=1.1)
            bh = sum(altura(b, interno - 14, t_corpo, F_TXT, 1.15) + 6
                     for b in p['itens'])
            d._texto(sl, l + pad, y0 + cab + 16 + th + 12, interno, bh,
                     p['itens'], t_corpo, t['corpo'], F_TXT,
                     algn=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
                     entrelinha=1.15, espaco=6, bullet=p['cor'])
        d.em(i + 1, desenha)

    def meio(sl):
        d._forma(sl, OVAL, 360 - 15, y0 + ph / 2 - 15, 30, 30,
                 fill=BG_CLARO if base != 'escuro' else CARD_ESC,
                 linha=t['borda'])
        d._texto(sl, 360 - 15, y0 + ph / 2 - 15, 30, 30, simbolo, 12,
                 TXT_FRACO, F_UI, bold=True)
    d.em(2, meio)
    d.slide(base, titulo, 'contraste', notas)


# ------------------------------------------------------------------ 8. chat --
def chat(d, titulo, sub, msgs, notas):
    """Conversa do Telegram. Um quadro por mensagem."""
    topo = _cabecalho(d, 'claro', titulo, sub)
    disp = BANDA_BASE - topo
    w_col = 470.0
    x0 = (SLIDE_W - w_col) / 2
    w_bolha = 320.0
    pad = 13.0
    gap = 11.0

    def mede(tc):
        return sum(15 + altura(m['texto'], w_bolha - 2 * pad, tc, F_TXT, 1.3)
                   + 2 * pad for m in msgs) + gap * (len(msgs) - 1)

    t_corpo, _ = _ajusta([12, 11.5, 11, 10.5, 10], mede, disp)
    alturas = [15 + altura(m['texto'], w_bolha - 2 * pad, t_corpo, F_TXT, 1.3)
               + 2 * pad for m in msgs]
    total = sum(alturas) + gap * (len(msgs) - 1)
    y = topo + max(0.0, (disp - total) / 2)

    for i, m in enumerate(msgs):
        h = alturas[i]
        direita = m['lado'] == 'dir'
        l = x0 + (w_col - w_bolha) if direita else x0
        yy = y

        def desenha(sl, l=l, yy=yy, h=h, m=m, direita=direita):
            d._texto(sl, l, yy, w_bolha, 13, m['rotulo'], 10, m['cor'], F_UI,
                     bold=True, caixa=True, anchor=MSO_ANCHOR.TOP,
                     algn=PP_ALIGN.RIGHT if direita else PP_ALIGN.LEFT)
            corpo_h = h - 15
            if m.get('vazia'):
                sh = d._forma(sl, RR, l, yy + 15, w_bolha, corpo_h,
                              fill=BG_CLARO, linha=m['cor'], larg_linha=1.4,
                              arredondamento=0.16)
                sh.line.dash_style = 4  # tracejado
            else:
                d._forma(sl, RR, l, yy + 15, w_bolha, corpo_h,
                         fill=m['fundo'], linha=m.get('borda') or m['fundo'],
                         arredondamento=0.16)
            d._texto(sl, l + pad, yy + 15, w_bolha - 2 * pad, corpo_h,
                     quebra(m['texto'], w_bolha - 2 * pad, t_corpo, F_TXT),
                     t_corpo, m['texto_cor'], F_TXT, algn=PP_ALIGN.LEFT,
                     entrelinha=1.3)
        d.em(i + 1, desenha)
        y += h + gap
    d.slide('claro', titulo, 'chat', notas)


# -------------------------------------------------------------- 9. semaforo --
def semaforo(d, base, titulo, sub, colunas, secoes, notas):
    """Grade secao x (sim / parcial / nao). Um quadro por secao."""
    t = _tema(base)
    topo = _cabecalho(d, base, titulo, sub)
    disp = BANDA_BASE - topo
    w_esq = 104.0
    gap = 11.0
    w_col = (UTIL_W - w_esq - gap * 3) / 3
    xs = [MARGEM + w_esq + gap + i * (w_col + gap) for i in range(3)]
    cab = 26.0
    vgap = 8.0

    def mede(tc):
        rh = max([max(altura(c, w_col - 18, tc, F_TXT, 1.2) for c in s['celulas'])
                  for s in secoes] + [46.0 - 18]) + 18
        return cab + 10 + len(secoes) * rh + (len(secoes) - 1) * vgap

    t_corpo, _ = _ajusta([11, 10.5, 10], mede, disp)
    rh = (mede(t_corpo) - cab - 10 - (len(secoes) - 1) * vgap) / len(secoes)
    total = mede(t_corpo)
    y0 = topo + max(0.0, (disp - total) / 2)

    def cabecalho(sl):
        for i, col in enumerate(colunas):
            d._forma(sl, RR, xs[i], y0, w_col, cab, fill=col['cor'],
                     arredondamento=0.2)
            d._texto(sl, xs[i], y0, w_col, cab, col['rotulo'], 10.5, 'FFFFFF',
                     F_UI, bold=True, caixa=True)
    d.em(1, cabecalho)

    for j, s in enumerate(secoes):
        y = y0 + cab + 10 + j * (rh + vgap)

        def desenha(sl, y=y, s=s):
            d._texto(sl, MARGEM, y, w_esq, rh,
                     quebra(s['nome'], w_esq, 13, F_TIT), 13, t['titulo'],
                     F_TIT, algn=PP_ALIGN.RIGHT, entrelinha=1.1)
            for i, celula in enumerate(s['celulas']):
                d._forma(sl, RR, xs[i], y, w_col, rh, fill=t['card'],
                         linha=colunas[i]['cor'], larg_linha=1.1,
                         arredondamento=0.1)
                d._texto(sl, xs[i] + 9, y, w_col - 18, rh,
                         quebra(celula, w_col - 18, t_corpo, F_TXT), t_corpo,
                         t['corpo'], F_TXT, entrelinha=1.2)
        d.em(j + 2, desenha)
    d.slide(base, titulo, 'semaforo', notas)


# -------------------------------------------------------------- 10. pilares --
def pilares(d, base, titulo, sub, colunas, base_txt, notas):
    """Tres colunas + a barra que amarra as tres. Quadro por coluna, base no fim."""
    t = _tema(base)
    topo = _cabecalho(d, base, titulo, sub)
    disp = BANDA_BASE - topo
    gap = 18.0
    w = (UTIL_W - gap * 2) / 3
    pad = 14.0
    interno = w - 2 * pad
    barra = 36.0

    def mede(par):
        tt, tc = par
        alt = []
        for c in colunas:
            th = altura(c['titulo'], interno, tt, F_TIT, 1.1)
            bh = sum(altura(b, interno - 14, tc, F_TXT, 1.15) + 6
                     for b in c['itens'])
            alt.append(46 + th + 10 + bh + 14)
        return max(alt) + 12 + barra

    (t_tit, t_corpo), _ = _ajusta(
        [(17, 11), (16, 10.5), (15, 10)], mede, disp)
    ch = mede((t_tit, t_corpo)) - 12 - barra
    total = ch + 12 + barra
    y0 = topo + max(0.0, (disp - total) / 2)

    for i, c in enumerate(colunas):
        l = MARGEM + i * (w + gap)

        def desenha(sl, l=l, c=c):
            d._forma(sl, RR, l, y0, w, ch, fill=t['card'], linha=t['borda'],
                     arredondamento=0.05)
            d._forma(sl, RET, l, y0, w, 4, fill=c['cor'])
            d._texto(sl, l + pad, y0 + 14, interno, 24, c['numero'], 20,
                     c['cor'], F_TIT, algn=PP_ALIGN.LEFT)
            th = altura(c['titulo'], interno, t_tit, F_TIT, 1.1)
            d._texto(sl, l + pad, y0 + 46, interno, th,
                     quebra(c['titulo'], interno, t_tit, F_TIT), t_tit,
                     t['titulo'], F_TIT, algn=PP_ALIGN.LEFT, entrelinha=1.1)
            bh = sum(altura(b, interno - 14, t_corpo, F_TXT, 1.15) + 6
                     for b in c['itens'])
            d._texto(sl, l + pad, y0 + 46 + th + 10, interno, bh, c['itens'],
                     t_corpo, t['corpo'], F_TXT, algn=PP_ALIGN.LEFT,
                     anchor=MSO_ANCHOR.TOP, entrelinha=1.15, espaco=6,
                     bullet=c['cor'])
        d.em(i + 1, desenha)

    def rodape(sl):
        d._forma(sl, RR, MARGEM, y0 + ch + 12, UTIL_W, barra, fill=AZUL,
                 arredondamento=0.25)
        d._texto(sl, MARGEM + 16, y0 + ch + 12, UTIL_W - 32, barra, base_txt,
                 13, 'FFFFFF', F_TIT)
    d.em(len(colunas) + 1, rodape)
    d.slide(base, titulo, 'pilares', notas)


# -------------------------------------------------------------- 11. citacao --
def citacao(d, base, titulo, sub, texto, fonte, chips, notas):
    """Citacao com barra de destaque + pilulas. Quadro por pilula."""
    t = _tema(base)
    topo = _cabecalho(d, base, titulo, sub)
    disp = BANDA_BASE - topo
    w_txt = UTIL_W - 46
    pill_h = 32.0

    def mede(tt):
        return altura(texto, w_txt, tt, F_TIT, 1.3) + 14 + 16 + 24 + pill_h

    t_cit, _ = _ajusta([22, 20, 18, 16], mede, disp)
    th = altura(texto, w_txt, t_cit, F_TIT, 1.3)
    bloco = th + 14 + 16
    total = bloco + 24 + pill_h
    y0 = topo + max(0.0, (disp - total) / 2)

    def aspas(sl):
        d._forma(sl, RET, MARGEM, y0, 5, bloco, fill=AZUL)
        d._texto(sl, MARGEM + 30, y0, w_txt, th,
                 quebra(texto, w_txt, t_cit, F_TIT), t_cit, t['titulo'], F_TIT,
                 algn=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, entrelinha=1.3)
        d._texto(sl, MARGEM + 30, y0 + th + 10, w_txt, 16, fonte, 11, TXT_FRACO,
                 F_TXT, algn=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, caixa=True)
    d.em(1, aspas)

    gap = 14.0
    w_pill = (UTIL_W - gap * (len(chips) - 1)) / len(chips)
    for i, chip in enumerate(chips):
        l = MARGEM + i * (w_pill + gap)

        def desenha(sl, l=l, chip=chip):
            d._forma(sl, RR, l, y0 + bloco + 24, w_pill, pill_h, fill=t['card'],
                     linha=chip['cor'], larg_linha=1.4, arredondamento=0.3)
            d._texto(sl, l + 10, y0 + bloco + 24, w_pill - 20, pill_h,
                     chip['texto'], 11.5, t['titulo'], F_TIT)
        d.em(i + 2, desenha)
    d.slide(base, titulo, 'citacao', notas)
