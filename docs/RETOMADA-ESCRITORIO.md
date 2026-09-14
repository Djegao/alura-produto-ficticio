# Retomada — continuar da máquina do escritório

> Substitui `RETOMADA-MAQUINA-ESCOLA.md`, que descrevia o método antigo
> (gravação não-linear, com deploys ao vivo). **O formato mudou em 09/09.**

---

## Prompt para colar no Claude Code do escritório

Cole **depois** do `git clone`, `npm install` e `railway link`.

```text
Vou dar continuidade à preparação do curso Alura "Evals, observabilidade e
conformidade" — 5 aulas, formato de gravação LINEAR (decidido em 09/09: o
produto fica no estado final do primeiro ao último vídeo, sem checkout, sem
deploy e sem troca de branch durante a gravação).

Antes de qualquer coisa:

1. Leia `docs/RETOMADA-ESCRITORIO.md` e depois `docs/SCRIPT-LINEAR-CURSO.md`.
2. Verifique o estado atual e me diga o que mudou desde 12/09: se o PR #6 foi
   mergeado, se produção está atualizada (o último deploy era de 29/08), se a
   ANTHROPIC_API_KEY ainda responde, e se o trace do episódio C
   (41a4e5c75e33...) ainda está no Langfuse.
3. Me diga em uma linha qual é o próximo passo.

Contexto que você precisa saber e não deve violar:

- O produto tem falhas PRESERVADAS DE PROPÓSITO como conteúdo de aula
  (truncamento por max_tokens, match lasanha×lasagna). NÃO corrija nenhuma
  delas: elas aparecem em cinco vídeos do script. Se encontrar um bug novo,
  pergunte antes de consertar — é a convenção do projeto.
- A evidência dos traces já está versionada em docs/apoio/. O trace do
  truncamento expirou do Langfuse em 11/09; a cópia local é a fonte agora.
- Não faça deploy, merge, nem `git push` sem eu pedir.
```

---

## Estado verificado em 12/09/2026

| Item | Estado |
|---|---|
| Produção no ar | ✅ HTTP 401 (Basic Auth) |
| `ANTHROPIC_API_KEY` + workspace id | ✅ responde 200 |
| PR #4 (resposta honesta) | ✅ **mergeado** em 09/09 |
| PR #6 (nota por foto) | ⚠️ **aberto**, `MERGEABLE` |
| Último deploy | ⚠️ **29/08** — anterior ao merge do #4 |
| Trace do truncamento (12/08) | ❌ **expirou** do painel em 11/09 |
| Trace do episódio C (22/08) | ✅ no painel, sai ~21/09 |
| Evidência versionada | ✅ em `docs/apoio/` |
| Lasanha 5/5 porções | ✅ intacta |
| Scripts de aula | ✅ completos, 1.1 → 5.6 |
| Decks `.pptx` | ✅ 5 arquivos em `slides/` |

---

## O que falta — duas coisas, nesta ordem

### 1. Mergear o PR #6 *(só o Diego pode)*

[PR #6 — nota fiscal por foto](https://github.com/Djegao/alura-produto-ficticio/pull/6)

Está `MERGEABLE`: o conflito com `master` foi resolvido em 09/09 (era só
documentação — `CLAUDE.md` e o runbook). Botão verde, **Create a merge
commit**.

O merge pelo Claude Code foi bloqueado pelas permissões da sessão anterior,
então esse clique é manual.

### 2. Deployar produção

Produção ainda roda o código de **29/08** — ou seja, sem o PR #4 e sem o #6.
Para o formato linear funcionar, ela precisa estar no estado final:

```bash
railway up --service chef-caseiro --detach
```

Depois, verificar de ponta a ponta:

```bash
curl.exe -s -o NUL -w "producao: HTTP %{http_code}\n" https://chef.workshopee.com.br
```

E mandar uma foto de cupom no grupo do Telegram — o bot deve responder e os
itens devem entrar no estoque. Essa é a demo ao vivo do vídeo 4.3.

> Peça ao Claude para fazer o deploy e a verificação; ele consegue os dois.

---

## Como o curso está montado

**Documento principal:** [`SCRIPT-LINEAR-CURSO.md`](./SCRIPT-LINEAR-CURSO.md)
— do vídeo 1.1 ao 5.6, em ordem contínua. Cada vídeo tem **TELA** (o que
abrir), **FALA** (texto desenvolvido para dizer), **COMANDOS** e **CORTE**.

**Evidência para os slides:**

- [`apoio/evidencia-preservada.md`](./apoio/evidencia-preservada.md) — os
  dois casos com os números, já organizados por slide
- [`apoio/antes-depois-codigo.md`](./apoio/antes-depois-codigo.md) — o
  código antes e depois das correções
- [`apoio/aula2-saida-evals.md`](./apoio/aula2-saida-evals.md) — a rodada
  real de evals e a leitura dos resultados

**Demos ao vivo que sobraram** (nenhuma exige deploy ou troca de branch):

| Vídeo | Demo |
|---|---|
| 1.2 | painel web em produção |
| 2.4 | `node evals/run-evals.js --limit 3` |
| 3.2 | liga/desliga do Langfuse (`scripts/observabilidade.ps1`) |
| 3.3 e 3.4 | painel do Langfuse |
| 4.2 | evals no terminal |
| 4.3 | foto do cupom no Telegram |
| 4.4 | painel mostrando as 5 porções intactas |

---

## Decisões vigentes — não reverter sem combinar

1. **Formato linear** (09/09). O método não-linear travou quatro tentativas
   de gravação. Não voltar atrás.
2. **Os achados continuam preservados** (reafirmado em 09/09). O truncamento
   aparece nos vídeos 3.4, 4.2 e 4.4; o match de nome em 3.4 e 4.4.
3. **Produto no estado final** durante toda a gravação.
4. **Perguntar antes de corrigir** qualquer bug que possa virar conteúdo.

---

## Duas coisas com prazo

**O episódio C sai do Langfuse por volta de 21/09.** A evidência já está
salva, então isso não bloqueia a gravação — mas se você quiser mostrar o
trace **ao vivo** no vídeo 3.4, precisa gravar antes dessa data. Depois
disso, o slide com a evidência assume.

**A retenção virou conteúdo.** O trace do truncamento expirou em 11/09, dois
dias depois de eu capturá-lo. Isso está no vídeo 3.3 como o argumento de que
dado bruto tem prazo de validade e só sobrevive o que você agregou — e agora
é uma história que aconteceu de verdade durante a preparação do curso, não
um conselho abstrato.
