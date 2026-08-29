# -*- coding: utf-8 -*-
"""Gera a malha pontilhada de fundo do template (preto + pontos sutis)."""
from PIL import Image, ImageDraw
import os, sys

out = sys.argv[1]
W, H = 2667, 1500

# Preto puro: a arte da capa (esfera de voxels) tem fundo #000000 e qualquer
# diferenca aqui vira uma emenda visivel no meio do slide.
img = Image.new('RGB', (W, H), (0x00, 0x00, 0x00))
d = ImageDraw.Draw(img)

step = 30
r = 1
cor = (0x1B, 0x1C, 0x22)
for y in range(step // 2, H, step):
    for x in range(step // 2, W, step):
        d.ellipse([x - r, y - r, x + r, y + r], fill=cor)

img.save(out, 'PNG', optimize=True)
print("gerado:", out, os.path.getsize(out), "bytes")
