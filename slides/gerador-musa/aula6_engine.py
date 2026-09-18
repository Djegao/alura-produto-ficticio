# -*- coding: utf-8 -*-
"""
Motor do deck da Aula 6 (Conformidade) do curso Alura 6498.

Regras que este motor impoe, por pedido do Diego:

  1. O visual nao e inventado: o "chrome" de cada base (fundo, logo, imagens
     decorativas) e COPIADO do .pptx que o proprio Diego montou
     (`Aula 5.pptx`, 14 slides, bases divisor / capa / statement / claro /
     escuro). So o conteudo e desenhado por codigo.
  2. Titulo centralizado em H e V dentro da faixa util, com QA que mede a
     tinta renderizada (qa-aula6.ps1 + qa-tinta.py).
  3. Variedade de layout: 11 tipos diferentes, nenhum e "circulo trocando
     titulo".
  4. Animacao forcada: cada forma nasce com um numero de quadro. O slide de
     N quadros vira N slides; o quadro k tem exatamente as formas de
     quadro <= k, na MESMA posicao. Nenhum recurso de animacao do PowerPoint.
  5. Nada de texto abaixo de 10 pt (o deck e 720x405 pt; 10 pt aqui equivale
     aos 24 pt do deck 1920x1080 da Aula 4).
"""
import copy
import json
import os
from pptx import Presentation
from pptx.util import Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from pptx.oxml import parse_xml
from pptx.opc.constants import RELATIONSHIP_TYPE as RT

EMU = 12700  # 1 pt

# ---------------------------------------------------------------- paleta ---
AZUL      = '052FD3'
AZUL_MED  = '4A86E8'
AZUL_CLA  = '6D9EEB'
VERDE     = '2FB36B'
AMBAR     = 'D98C1F'
VERMELHO  = 'C0392B'
ROXO      = '7C5CD6'

BG_CLARO  = 'EEEFF1'
CARD_CLA  = 'FFFFFF'
BORDA_CLA = 'D9DBE3'
TXT_FORTE = '14161B'
TXT_MEDIO = '5B6070'
TXT_FRACO = '8A8FA0'

CARD_ESC  = '171A21'
BORDA_ESC = '2A2E38'
TXT_ESC   = 'FFFFFF'
TXT_ESC2  = 'A8ADBD'

STMT      = 'BDBFC7'

# ----------------------------------------------------------------- fontes ---
F_TIT  = 'Encode Sans SemiBold'
F_UI   = 'Encode Sans'
F_TXT  = 'Roboto'

# Metricas calibradas contra PNG exportado pelo PowerPoint em 17/09:
# largura media de caractere e altura de linha, em fracao do corpo da fonte.
LARG = {F_TIT: 0.575, F_UI: 0.560, F_TXT: 0.530}
# altura natural da linha (spacing 100%), medida no PNG: o PowerPoint
# multiplica ESTE valor pelo percentual de entrelinha do paragrafo.
NATURAL = 1.19
FOLGA = 1.04    # margem contra a imprecisao da estimativa de quebra

SLIDE_W, SLIDE_H = 720.0, 405.0
MARGEM = 45.0
UTIL_W = SLIDE_W - 2 * MARGEM          # 630
MIN_FONTE = 10.0


def quebra(texto, larg_pt, tam, fonte=F_TXT):
    """Quebra gulosa por estimativa de largura. Devolve lista de linhas."""
    cpl = max(1, int(larg_pt / (LARG.get(fonte, 0.52) * tam)))
    linhas, atual = [], ''
    for palavra in texto.split():
        teste = (atual + ' ' + palavra).strip()
        if len(teste) <= cpl or not atual:
            atual = teste
        else:
            linhas.append(atual)
            atual = palavra
    if atual:
        linhas.append(atual)
    return linhas


def n_linhas(texto, larg_pt, tam, fonte=F_TXT):
    return len(quebra(texto, larg_pt, tam, fonte))


def altura(texto, larg_pt, tam, fonte=F_TXT, entrelinha=1.0):
    """Altura renderizada estimada. `entrelinha` e o mesmo valor passado ao
    paragrafo — a altura natural da fonte ja entra aqui."""
    return (n_linhas(texto, larg_pt, tam, fonte) * tam * NATURAL
            * entrelinha * FOLGA)


# ============================================================== construtor ==
class Deck:
    """Escreve o .pptx. Cada `add_*` desenha uma forma no quadro pedido."""

    # (indice do slide de origem, indices das formas que sao "chrome")
    BASES = {
        'divisor':   (1, [0, 1, 2, 4]),
        'capa':      (2, [0, 1, 2]),
        'statement': (3, [0, 1, 2, 3, 5, 6, 7]),
        'claro':     (4, [0, 1, 2, 3, 4]),
        'escuro':    (8, [0, 1]),
    }

    def __init__(self, origem):
        self.prs = Presentation(origem)
        self.n_origem = len(self.prs.slides._sldIdLst)
        self.layout = self.prs.slides[1].slide_layout
        self.chrome = {}
        for nome, (idx, formas) in self.BASES.items():
            slide = self.prs.slides[idx]
            self.chrome[nome] = (slide, [slide.shapes[i]._element for i in formas])
        self.manifesto = []
        self._pendentes = []   # (quadro, funcao(slide))
        self._id = 900

    # ---------------------------------------------------------- utilidades --
    def _proximo_id(self):
        self._id += 1
        return self._id

    def _cola_chrome(self, slide, base):
        origem, elementos = self.chrome[base]
        for el in elementos:
            novo = copy.deepcopy(el)
            for blip in novo.iter(qn('a:blip')):
                rid = blip.get(qn('r:embed'))
                if rid:
                    parte = origem.part.related_part(rid)
                    blip.set(qn('r:embed'), slide.part.relate_to(parte, RT.IMAGE))
            for cnv in novo.iter(qn('p:cNvPr')):
                cnv.set('id', str(self._proximo_id()))
            slide.shapes._spTree.append(novo)

    def _slide_vazio(self):
        slide = self.prs.slides.add_slide(self.layout)
        for forma in list(slide.shapes):
            forma._element.getparent().remove(forma._element)
        return slide

    # ------------------------------------------------------------ desenhos --
    def _texto(self, slide, l, t, w, h, linhas, tam, cor, fonte=F_TIT,
               algn=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, bold=None,
               entrelinha=1.0, espaco=0.0, bullet=None, caixa=False):
        cx = slide.shapes.add_textbox(Emu(int(l * EMU)), Emu(int(t * EMU)),
                                      Emu(int(w * EMU)), Emu(int(h * EMU)))
        tf = cx.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = anchor
        tf.margin_left = tf.margin_right = Emu(0)
        tf.margin_top = tf.margin_bottom = Emu(0)
        if isinstance(linhas, str):
            linhas = [linhas]
        for i, linha in enumerate(linhas):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p.alignment = algn
            p.line_spacing = entrelinha
            if espaco:
                p.space_after = Pt(espaco)
            run = p.add_run()
            run.text = linha
            f = run.font
            f.name = fonte
            f.size = Pt(tam)
            f.color.rgb = RGBColor.from_string(cor)
            if bold is not None:
                f.bold = bold
            if caixa:
                self._caixa_alta(run)
            if bullet:
                self._bullet(p, bullet, tam)
        return cx

    @staticmethod
    def _caixa_alta(run):
        run.font._rPr.set('cap', 'all')

    @staticmethod
    def _bullet(p, cor, tam):
        pPr = p._p.get_or_add_pPr()
        pPr.set('marL', '182880')
        pPr.set('indent', '-182880')
        xml = (
            '<a:buClr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
            '<a:srgbClr val="%s"/></a:buClr>' % cor)
        pPr.append(parse_xml(xml))
        pPr.append(parse_xml(
            '<a:buSzPts xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" val="%d"/>'
            % int(tam * 70)))
        pPr.append(parse_xml(
            '<a:buFont xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" typeface="Arial"/>'))
        pPr.append(parse_xml(
            '<a:buChar xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" char="●"/>'))

    def _forma(self, slide, tipo, l, t, w, h, fill=None, linha=None,
               larg_linha=2.1, arredondamento=None):
        sh = slide.shapes.add_shape(tipo, Emu(int(l * EMU)), Emu(int(t * EMU)),
                                    Emu(int(w * EMU)), Emu(int(h * EMU)))
        if arredondamento is not None and len(sh.adjustments):
            sh.adjustments[0] = arredondamento
        if fill:
            sh.fill.solid()
            sh.fill.fore_color.rgb = RGBColor.from_string(fill)
        else:
            sh.fill.background()
        if linha:
            sh.line.color.rgb = RGBColor.from_string(linha)
            sh.line.width = Pt(larg_linha)
        else:
            sh.line.fill.background()
        sh.shadow.inherit = False
        sh.text_frame.word_wrap = True
        return sh

    # -------------------------------------------------- API de composicao --
    def slide(self, base, item, layout, notas):
        """Fecha a composicao pendente e escreve os N quadros."""
        quadros = max([q for q, _ in self._pendentes], default=1)
        if isinstance(notas, str):
            notas = [notas]
        for k in range(1, quadros + 1):
            sl = self._slide_vazio()
            self._cola_chrome(sl, base)
            for quadro, desenha in self._pendentes:
                if quadro <= k:
                    desenha(sl)
            nota = notas[min(k - 1, len(notas) - 1)] if notas else ''
            if quadros > 1:
                nota = '[quadro %d/%d] %s' % (k, quadros, nota)
            sl.notes_slide.notes_text_frame.text = nota
            self.manifesto.append({
                'slide': len(self.prs.slides._sldIdLst),
                'item': item, 'layout': layout, 'base': base,
                'quadro': '%d/%d' % (k, quadros),
            })
        self._pendentes = []

    def em(self, quadro, funcao):
        self._pendentes.append((quadro, funcao))

    # ------------------------------------------------------------- salvar --
    def salvar(self, destino, manifesto):
        lista = self.prs.slides._sldIdLst
        for sldId in list(lista)[:self.n_origem]:
            self.prs.part.drop_rel(sldId.get(qn('r:id')))
            lista.remove(sldId)
        for i, linha in enumerate(self.manifesto, 1):
            linha['slide'] = i
        self.prs.save(destino)
        with open(manifesto, 'w', encoding='utf-8') as fh:
            json.dump(self.manifesto, fh, ensure_ascii=False, indent=1)
        return len(self.manifesto)


BASES_ORDEM = ['divisor', 'capa', 'statement', 'claro', 'escuro']


def gera_referencia(origem, destino, manifesto):
    """Deck com um slide por base, SEM conteudo. O QA usa como referencia:
    a tinta do chrome (logo, imagem decorativa, fundo) e subtraida antes de
    medir a centralizacao do titulo."""
    d = Deck(origem)
    for base in BASES_ORDEM:
        sl = d._slide_vazio()
        d._cola_chrome(sl, base)
        sl.notes_slide.notes_text_frame.text = 'referencia de chrome: ' + base
        d.manifesto.append({'slide': 0, 'item': base, 'layout': 'ref',
                            'base': base, 'quadro': '1/1'})
    return d.salvar(destino, manifesto)
