# Gerador do deck inicial da Aula 2 (design da Aula 1, duplicado)

Produz `slides/Aula 2 6498 - inicial.pptx` duplicando as bases do deck da
Aula 1 (`Downloads/Aula 1 6498.pptx`) e duas telas do deck atual da Aula 2
(`Downloads/Aula 2 6498.pptx`), via PowerPoint COM. O conteúdo vem de
`docs/aula2-script.md` (Slide · Script); a base de cada slide, de
`docs/aula2-bases.md`. O script de cada slide entra na nota de apresentador.

O Diego finaliza no Google Slides. Este gerador é a **primeira** versão, não
a última: depois de finalizar à mão, não regerar por cima.

## Regerar (só se o script mudar antes da finalização)

Feche o PowerPoint antes.

```
python parse-script.py ..\..\docs\aula2-script.md ..\..\docs\aula2-bases.md aula2-spec.json
powershell -NoProfile -ExecutionPolicy Bypass -File .\gerar-aula2.ps1 -Spec .\aula2-spec.json
```

O parser avisa quando um texto de tela passa do orçamento de caracteres da
base. `-SemNotas` gera sem notas de apresentador (padrão da Aula 1).

## Armadilhas encontradas em 03/09

- O `.ps1` precisa de **BOM UTF-8** (Windows PowerShell 5.1 lê sem BOM como
  ANSI e quebra em `·` e `Ã`).
- Não reatribuir um parâmetro tipado (`[string]$Spec`) com um array: o
  PowerShell converte pra string em silêncio.
- A página de notas dos slides exportados do Google não responde a
  `Placeholders.Item(2)`; o placeholder de corpo é achado por tipo.
- Título de hero (A1·5) com mais de 20 caracteres quebra em duas linhas e
  cobre o subtítulo; o gerador desce o subtítulo nesses casos.

---

# Meio novo da Aula 4 (Episódio D, ciclo completo) — 17/09

Gerador próprio, diferente dos acima: usa o deck da Aula 2 **só como fundo**
(azul, círculo, escuro, claro, coluna com imagem, capa) e desenha cada layout
em formas nativas — conversa, tabela, cards, ramos, citação, decisões, régua,
código, padrão, contraste, caminhos, timeline, critério, números, ciclo,
lista. Sai `slides/Aula 4 6498 - meio episodio D.pptx` (4.2.1–4.2.6 + 4.5).

```
node aula4-meio-spec-build.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\gerar-aula4-meio.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\qa-deck.ps1
```

- **Conteúdo e notas de apresentador:** `aula4-meio-spec-build.js`.
- **Animação forçada (último passo do gerador):** cada forma tem tag `FRAME`;
  o slide completo é duplicado e cada cópia perde as formas de frame maior.
  O que já estava fica idêntico e na mesma posição. Notas no primeiro frame.
- **Centralização:** a composição de cada slide é escalada até a área segura
  e centralizada H e V. Títulos são calibrados pela **tinta renderizada**:
  o `qa-deck.ps1` exporta PNG, o `qa-tinta.py` mede o desvio real de cada
  título e grava `aula4-meio-calibracao.json`. Mudou texto de título? Rode
  gerador + QA **duas vezes** (a segunda já sai calibrada).
- **O QA falha** se: título fora do eixo na tinta (> 6 pt), texto vazando a
  caixa ou a área segura, texto abaixo de 24 pt, composição fora do centro,
  frame de animação que não está contido no seguinte, ou slide sem tag.
- **Imagens:** placeholders cinza com legenda "IMAGEM — …" nos slides de
  coluna; a imagem final entra à mão no ensaio.

Armadilhas encontradas em 17/09:
- PowerShell não diferencia maiúscula de minúscula em variável: `$c` num
  `foreach` sobrescreve `$C` global dentro das funções chamadas. Globais com
  nomes que não colidem (`$PAL`, `$FONTES`, `$SLIDE_W`, `$SLIDE_H`).
- COM do PowerPoint recusa `double` em `Left/Top/Width/Height/Font.Size`:
  sempre `[single]`.
- `TextRange.BoundLeft` desloca ~8 pt e a caixa de linha não é onde a letra
  está — por isso a medição de centralização é no PNG, não no PowerPoint.
- Roboto precisa estar instalada: sem ela o PowerPoint substitui por outra
  fonte e a quebra de linha do corpo muda (e a calibração de título junto).
  Instalada nesta máquina em 17/09, por usuário, a partir de Downloads/Roboto.zip
  (%LOCALAPPDATA%\Microsoft\Windows\Fonts + HKCU\...\Fonts).
- `-replace` do PowerShell é case-insensitive: `[a-z]` casa com maiúscula
  também. Para separar CamelCase, use `-creplace`.
