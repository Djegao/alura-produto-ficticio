# -*- coding: utf-8 -*-
"""Mede o centro da TINTA do titulo no PNG exportado e compara com o eixo.

    python qa-aula6-tinta.py <pasta_png> <titulos.json> <tolerancia_pt>

O BoundLeft do PowerPoint desloca alguns pontos e a caixa de linha nao e
onde a letra esta — por isso a centralizacao e conferida no pixel, nao na
geometria. Imprime "FALHA: ..." pro qa-aula6.ps1 coletar.
"""
import json
import sys
import numpy as np
from PIL import Image

PASTA, JSON, TOL = sys.argv[1], sys.argv[2], float(sys.argv[3])
SLIDE_W, SLIDE_H = 720.0, 405.0

titulos = json.load(open(JSON, encoding='utf-8'))
if isinstance(titulos, dict):
    titulos = [titulos]

piores = []
for t in titulos:
    px = np.asarray(Image.open('%s\\%s' % (PASTA, t['png'])).convert('L'),
                    dtype=np.int16)
    ref = np.asarray(Image.open('%s\\%s' % (PASTA, t['ref'])).convert('L'),
                     dtype=np.int16)
    alt, larg = px.shape
    esc_x, esc_y = larg / SLIDE_W, alt / SLIDE_H
    y0 = int(max(0, (t['t'] - 4) * esc_y))
    y1 = int(min(alt, (t['t'] + t['h'] + 4) * esc_y))
    faixa = px[y0:y1, :] - ref[y0:y1, :]   # so o que o conteudo acrescentou
    if faixa.size == 0:
        continue
    tinta = np.abs(faixa) > 45
    cols = np.where(tinta.any(axis=0))[0]
    rows = np.where(tinta.any(axis=1))[0]
    if len(cols) < 4 or len(rows) < 2:
        print('FALHA: %s : nao achei tinta de titulo no PNG' % t['rotulo'])
        continue
    cx = (cols[0] + cols[-1]) / 2 / esc_x
    cy = (y0 + (rows[0] + rows[-1]) / 2) / esc_y
    dx = cx - SLIDE_W / 2
    dy = cy - (t['t'] + t['h'] / 2)
    piores.append((abs(dx), t['rotulo'], dx, dy))
    if abs(dx) > TOL:
        print('FALHA: %s : titulo fora do eixo horizontal na tinta (dx=%.1f pt)'
              % (t['rotulo'], dx))
    if abs(dy) > TOL + 2:
        print('FALHA: %s : titulo fora do eixo vertical na tinta (dy=%.1f pt)'
              % (t['rotulo'], dy))

if piores:
    piores.sort(reverse=True)
    pior = piores[0]
    print('tinta dos titulos: %d medidos, pior desvio dx=%.1f pt (%s)'
          % (len(piores), pior[2], pior[1]))
