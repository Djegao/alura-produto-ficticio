# -*- coding: utf-8 -*-
"""Mede quantas linhas cada bullet ocupa, usando as metricas reais da Arial.

Estimar por contagem de caracteres erra: texto em negrito e mais largo, e
acentuacao/pontuacao mudam a media. Um erro para menos faz o item seguinte
encostar no anterior. Aqui a quebra e simulada de verdade.
"""
import json, sys
from PIL import ImageFont

entrada, saida = sys.argv[1], sys.argv[2]
# Coluna util 19.6, medida contra 18.6: 5%% de margem de seguranca.
# Errar para MAIS linhas so aumenta o respiro; errar para menos faz o item
# seguinte encostar no anterior. A Roboto variavel mede um pouco mais estreita
# aqui do que o PowerPoint renderiza, entao a folga e obrigatoria.
LARGURA_IN = 18.6
TAMANHO_PT = 28
DPI = 96

px = LARGURA_IN * DPI
size = int(round(TAMANHO_PT * DPI / 72.0))

# Corpo do template e Roboto. Instalada como fonte VARIAVEL: nao existe um
# arquivo -Bold separado, entao o peso vem de set_variation_by_name.
# Foi instalada POR USUARIO (AppData), nao em C:\Windows\Fonts.
import os
CANDIDATOS = [
    os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Windows\Fonts\Roboto-VariableFont_wdth,wght.ttf"),
    r"C:\Windows\Fonts\Roboto-VariableFont_wdth,wght.ttf",
]
ROBOTO = next((p for p in CANDIDATOS if os.path.exists(p)), None)
if not ROBOTO:
    raise SystemExit("Roboto nao encontrada em: " + " | ".join(CANDIDATOS))
print("fonte de medicao:", ROBOTO)

def carregar(bold):
    f = ImageFont.truetype(ROBOTO, size)
    try:
        f.set_variation_by_name('Bold' if bold else 'Regular')
    except Exception as e:
        print("  aviso: variacao %s indisponivel (%s)" % ('Bold' if bold else 'Regular', e))
    return f

fonts = {False: carregar(False), True: carregar(True)}

def linhas(texto, bold):
    f = fonts[bold]
    palavras = texto.split()
    n, atual = 1, ""
    for p in palavras:
        teste = (atual + " " + p).strip()
        if f.getlength(teste) <= px:
            atual = teste
        else:
            n += 1
            atual = p
    return n

itens = json.load(open(entrada, encoding='utf-8'))
out = {}
for it in itens:
    out[it['text']] = linhas(it['text'], bool(it.get('bold')))

json.dump(out, open(saida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print("medidos %d bullets -> %s" % (len(out), saida))
print("  em 2+ linhas:", sum(1 for v in out.values() if v > 1))
