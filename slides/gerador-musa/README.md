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
