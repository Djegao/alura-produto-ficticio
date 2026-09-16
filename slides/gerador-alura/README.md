# Gerador dos decks no design oficial da Alura

Gera os `.pptx` das aulas no canvas 26,67 x 15 in do template oficial
("templte e passado.pptx"), com a paleta e a tipografia extraidas dele:
Encode Sans nos titulos, Roboto no corpo, Blue Universe / Tech Blue /
Dev Blue / New Black / White Snow.

## Rodar

Dois passos, sempre nesta ordem — a medicao das quebras de linha alimenta o
posicionamento dos bullets:

    node gerar-deck-alura.js ./art ../aula3-alura.pptx dump ./b.json ./conteudo-aula3.js
    python medir.py ./b.json ./linhas.json
    node gerar-deck-alura.js ./art ../aula3-alura.pptx gerar - ./conteudo-aula3.js

Sem o modulo de conteudo no fim, ele usa o array `aula4` embutido.

## Por que medir.py existe

Estimar quebra de linha por contagem de caracteres erra: negrito e mais
largo, acentuacao muda a media. Um erro para menos faz um bullet encostar no
anterior. O medir.py simula a quebra com as metricas TrueType reais da
Roboto, contra uma coluna 5% mais estreita (margem de seguranca).

## Armadilhas conhecidas

- **PowerShell descarta argumentos vazios** ao chamar `node`. Passe `-` no
  lugar do argumento vazio, nunca `""` — senao o modulo de conteudo cai na
  posicao errada e o deck sai com o conteudo da aula errada.
- **Feche o PowerPoint antes de gerar.** Arquivo aberto trava a escrita
  (`EBUSY`).
- Os divisores azuis sao a **claquete da edicao** — nao encher de elemento
  nem mexer no fundo.
