# Slides do curso — Evals, observabilidade e conformidade

5 decks `.pptx` das 5 aulas, gerados a partir dos outlines slide-a-slide dos
roteiros em `docs/`. Paleta e layout são os oficiais da Alura, reaproveitados
de `../generate-slides.js` (não alterado).

## Arquivos

- `tema-alura.js` — paleta (`C`), fonte, layout 16x9 e os helpers de slide
  (`addCover`, `addDivider`, `addBulletSlide`, `addTableSlide`,
  `addStatusGrid`, `addClosing`), extraídos de `../generate-slides.js` e
  reorganizados em funções fábrica (`criarApresentacao`, `criarTema`) pra dar
  pra gerar vários decks independentes. É só layout — não tem conteúdo de
  aula nenhum.
- `generate-slides-curso.js` — o conteúdo de cada aula, como arrays de dados
  (`const aula1 = [...]` até `aula5`), mais a função `renderDeck` que
  percorre o array e desenha cada slide conforme o `type`.
- `aula1.pptx` ... `aula5.pptx` — os decks gerados (não editar o `.pptx`
  direto — sempre editar o array de dados e regerar).

## Como regerar

```bash
node slides/generate-slides-curso.js
```

Sobrescreve os 5 `.pptx` em `slides/`.

## Onde editar o texto de cada slide

Tudo em `generate-slides-curso.js`, dentro do array da aula correspondente
(`aula1`, `aula2`, `aula3`, `aula4`, `aula5`). Cada item do array é um objeto
com um `type`:

- `{ type: 'cover', title, subtitle, meta }` — capa do deck (só o primeiro
  item de cada array).
- `{ type: 'divider', number, title }` — divisória de vídeo (ex.: `'2.3'`,
  `'Claude como avaliador'`).
- `{ type: 'bullets', eyebrow, title, bullets, opts? }` — slide de apoio à
  fala. `bullets` é um array de strings (ou `{ text, bold }` pra destacar um
  item); `opts.quote` adiciona uma citação em destaque no rodapé do slide.
- `{ type: 'table', eyebrow, title, header, rows, colW }` — slide de tabela
  (números reais: custo por operação, checklist de conformidade etc.).
  `colW` é a largura de cada coluna em polegadas — a soma deve ficar perto de
  `8.9` (largura útil do slide).
- `{ type: 'closing', kicker, text }` — slide de encerramento do deck.

Pra mudar só o texto de um slide, edite os campos do objeto correspondente e
rode o comando de regeração — não precisa mexer em `tema-alura.js`.

Pra mudar o **visual** (cor, fonte, espaçamento), edite `tema-alura.js` — a
mudança se aplica automaticamente aos 5 decks na próxima geração.

## Origem do conteúdo

- Aulas 1, 2, 3, 5: outlines "Slides — outline" de
  `docs/aula1-roteiro.md`, `docs/aula2-roteiro.md`, `docs/aula3-roteiro.md`,
  `docs/aula5-roteiro.md`.
- Aula 4 (sem roteiro numerado com outline de slides): derivada de
  `docs/RUNBOOK-gravacao-29-08.md` (§2 falhas reais, §3 números de custo, §4
  sequência dos atos), `docs/aula4-roteiro-falha-telegram.md` e
  `docs/aula4-inventario-conteudo.md`, seguindo o mapeamento vídeo → ato
  sugerido em `docs/PLANO-GRAVACAO-CURSO.md`.

Nenhum número foi inventado — todos os dados de custo/latência/contagem
vêm literalmente dos documentos acima.
