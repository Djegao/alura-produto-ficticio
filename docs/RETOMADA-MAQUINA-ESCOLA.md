# Retomada — continuar de onde parou, na máquina da escola

> **Cole isto como primeira mensagem para o Claude na máquina da escola:**
>
> > Hoje é dia da gravação do curso completo (Aulas 1–5). Leia
> > `docs/RETOMADA-MAQUINA-ESCOLA.md` e depois
> > `docs/PLANO-GRAVACAO-CURSO.md`. Confirme os cinco sinais de estado
> > antes de qualquer outra coisa e me diga se algo mudou.

---

## Estado verificado em 29/08 às 10h39 (manhã da gravação)

| # | Sinal | Esperado | Verificado hoje |
|---|---|---|---|
| 1 | Produção | HTTP **401** (Basic Auth) | ✅ 401 |
| 2 | Lasanha (episódio C) | **5/5** porções | ✅ 5/5, 7 dias de preparo |
| 3 | Webhook do Telegram | 0 pendentes, sem erro | ✅ limpo |
| 4 | `return` mudo em `master` | presente (falha preservada) | ✅ presente |
| 5 | PRs #4 e #6 | abertos, nessa ordem | ✅ abertos |

Comando para reconferir tudo de uma vez, já na máquina nova (depois do
`railway link`):

```bash
curl.exe -s -o NUL -w "producao: HTTP %{http_code}\n" https://chef.workshopee.com.br
gh pr list --state open
```

**401 é bom. 404 significa que não há deploy ativo** — nesse caso, pare e
veja `SETUP-MAQUINA-ESCOLA.md` §0.1.

---

## O que já está pronto (não precisa construir nada)

Tudo em `master` (`2f13800`). **Zero código para escrever hoje.**

- **Roteiros com fala sugerida, demo e outline de slides**, por vídeo do
  CSV: `aula1-roteiro.md`, `aula2-roteiro.md`, `aula3-roteiro.md`,
  `aula4-roteiro-falha-telegram.md` + `RUNBOOK-gravacao-29-08.md`,
  `aula5-roteiro.md` e `aula5-checklist-conformidade.md`.
- **Mapa mestre**: `PLANO-GRAVACAO-CURSO.md` — aula → versão do produto →
  comandos → slides. É o documento que fica aberto o dia todo.
- **Setup da máquina**: `SETUP-MAQUINA-ESCOLA.md` (~25 min, cronometrado).
- **5 decks**: `slides/aula{1..5}.pptx`.
- **Evals reais**: `evals/run-evals.js` — já rodou contra produção em
  28/08, **39 Scores gravados no Langfuse**. Leitura pronta dos resultados
  em `docs/apoio/aula2-saida-evals.md`.
- **`scripts/observabilidade.ps1`**: liga/desliga o Langfuse para a demo
  do antes/depois da Aula 3.

---

## Decisões vigentes (não reverter sem combinar)

1. **Os quatro achados continuam preservados** — incluindo o truncamento
   por `max_tokens` e o match `lasanha`×`lasagna`. Confirmado pelo Diego
   em 29/08: *"continua preservado"*.
2. **Não haverá ensaio** — decisão do Diego em 29/08, por falta de espaço
   na agenda. Os comandos da Aula 4 estão no runbook §4 e as duas branches
   foram verificadas íntegras.
3. **Ordem de gravação sugerida**: Aula 4 primeiro (única com deploy real
   e ordem de branch que importa), Aula 1 por último.
4. **Convenção de sempre**: ao achar um bug que possa virar conteúdo,
   **perguntar antes de corrigir**.

---

## ⚠️ O erro mais provável do dia

Durante a **Aula 4** você faz checkout das branches do PR #4 e do #6.
**Essas branches não têm nenhum destes documentos** — o material some do
disco no meio da gravação.

**Antes de começar**, deixe `docs/PLANO-GRAVACAO-CURSO.md` aberto numa aba
do GitHub. Depois da Aula 4, para trazer tudo de volta:

```bash
git checkout master
```

---

## Credenciais — só validar, nada a trocar

A `ANTHROPIC_API_KEY` foi trocada em 28/08 e funciona. Ela é
*identity-linked*, então o produto exige também
`ANTHROPIC_WORKSPACE_ID=wrkspc_01DEmvYfoN3SESEnSYfinMmH` — presente no
`.env` e no Railway, sem nenhuma mudança de código.

```bash
railway variable list --kv | grep ANTHROPIC
```

Esperado: chave com **108 caracteres** e o `wrkspc_...`. Se precisar mexer,
**não use `--stdin`** no PowerShell (anexa quebra de linha e corrompe o
segredo em silêncio) — detalhes em `SETUP-MAQUINA-ESCOLA.md` §0.

---

## Histórico curto de 28/08 (para contexto de uma sessão nova)

Dia de dois sustos, ambos resolvidos: produção caiu de manhã (fim do
período gratuito do Railway, voltou às 10h34) e a chave da Anthropic estava
revogada desde ~24/08, o que tinha desligado toda chamada de modelo em
produção — substituída às 12h54. Depois disso, o pipeline de evals rodou
pela primeira vez de verdade e produção foi verificada de ponta a ponta.
