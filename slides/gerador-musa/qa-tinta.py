"""Mede a centralizacao REAL dos titulos no PNG exportado pelo qa-deck.ps1.

Para cada titulo: recorta a caixa (com folga), marca os pixels proximos da
cor da fonte e calcula o centro da tinta. Compara com o eixo esperado
(CX; CY quando o titulo e' o centro do slide, senao o centro da caixa).
PNG exportado em 1920x1080 = 1 px por ponto do slide.

    python qa-tinta.py <pasta_png> <titulos.json> <tolerancia_pt> [calibracao.json]
"""
import json, sys
import numpy as np
from PIL import Image

pasta, arq, tol = sys.argv[1], sys.argv[2], float(sys.argv[3])
calib_arq = sys.argv[4] if len(sys.argv) > 4 else None
calib = {}
itens = json.load(open(arq, encoding='utf-8-sig'))
if isinstance(itens, dict):
    itens = [itens]
piores = 0.0
for it in itens:
    img = np.asarray(Image.open(f"{pasta}/{it['png']}").convert('RGB')).astype(int)
    H, W, _ = img.shape
    fx, fy = 30, 6   # folga vertical curta: nao pegar texto vizinho da mesma cor
    x0 = max(0, int(it['l']) - fx); x1 = min(W, int(it['l'] + it['w']) + fx)
    y0 = max(0, int(it['t']) - fy); y1 = min(H, int(it['t'] + it['h']) + fy)
    alvo = np.array([int(it['cor'][i:i + 2], 16) for i in (0, 2, 4)])
    reg = img[y0:y1, x0:x1]
    m = np.abs(reg - alvo).sum(axis=2) < 90
    if m.sum() < 50:
        print(f"FALHA slide {it['slide']} ({it['layout']}): titulo sem tinta visivel na caixa")
        continue
    ys, xs = np.where(m)
    cx = (xs.min() + xs.max()) / 2 + x0
    cy = (ys.min() + ys.max()) / 2 + y0
    ey = it['cy'] if it['cy'] is not None else it['t'] + it['h'] / 2
    dx, dy = cx - it['cx'], cy - ey
    # calibracao acumulada por item (frames do mesmo item medem igual)
    calib.setdefault(str(it['item']), round(it['cal'] + dy, 1))
    piores = max(piores, abs(dx), abs(dy))
    if abs(dx) > tol or abs(dy) > tol:
        print(f"FALHA slide {it['slide']} ({it['layout']}): titulo descentralizado na tinta dx={dx:.1f} dy={dy:.1f} pt")
if calib_arq:
    json.dump(calib, open(calib_arq, 'w', encoding='utf-8'), indent=1, sort_keys=True, ensure_ascii=False)
print(f"tinta dos titulos: {len(itens)} medidos, maior desvio {piores:.1f} pt")

