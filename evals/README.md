# `evals/` — pipeline de evals do Chef Caseiro

Material da **Aula 2** do curso "Evals, observabilidade e conformidade".

## O que é

Um script que lê **interações reais já logadas no Langfuse**, pede pro Claude
julgá-las contra critérios de produto, e grava o julgamento de volta como
**Score** no mesmo trace.

```
traces (Langfuse)  ->  juiz (Claude, tool_choice forçado)  ->  Scores (Langfuse)
```

Dois arquivos:

- **`criterios.md`** — os critérios em linguagem de produto (o que é lido na
  câmera no vídeo 2.2). Cada critério tem nome, pergunta, escala e por que
  erra caro. Os nomes são exatamente os nomes dos Scores no Langfuse.
- **`run-evals.js`** — o pipeline. Sem framework novo: só
  `@anthropic-ai/sdk` + `dotenv` (já no `package.json`) e o `fetch` nativo do
  Node.

Cobre as três operações instrumentadas do produto: `sugerir-receita`,
`mediar-cardapio` e `ingerir-relato`.

## Como rodar

```bash
node evals/run-evals.js                       # conjunto padrão (4 traces por operação) e GRAVA os Scores
node evals/run-evals.js --dry-run --limit 3   # julga e mostra, sem gravar nada
node evals/run-evals.js --limit 5             # 5 traces por operação
node evals/run-evals.js --operacao ingerir-relato
node evals/run-evals.js --operacao sugerir-receita,mediar-cardapio --limit 4
node evals/run-evals.js --sem-cor             # saída sem ANSI (log/CI)
node evals/run-evals.js --help
```

Sai com código 1 se qualquer trace falhar — nada é engolido em silêncio
(SDD §11.6).

## Env vars necessárias

Lê o mesmo `.env` do produto (nada novo):

| Variável | Para quê |
|---|---|
| `LANGFUSE_PUBLIC_KEY` | Basic Auth da API pública (parte do usuário) |
| `LANGFUSE_SECRET_KEY` | Basic Auth da API pública (parte da senha) |
| `LANGFUSE_BASE_URL` | ex.: `https://us.cloud.langfuse.com` |
| `ANTHROPIC_API_KEY` | o juiz (`claude-sonnet-5`) |

Não precisa de Supabase: o pipeline não toca no banco do produto, só lê
traces e escreve Scores.

## Duas coisas para saber antes de rodar ao vivo

1. **Lag de ~45s do Langfuse Cloud** (achado SDD §11.2). O Score é aceito na
   hora, mas leva quase um minuto pra ficar consultável na UI. Se você abrir
   o Langfuse imediatamente depois de rodar, o Score **ainda não está lá** —
   isso é esperado, não é bug. Avise a turma antes de abrir a tela.
2. **`tool_choice` forçado no juiz** (achado SDD §11.3). O juiz não é
   solicitado a "responder em JSON" — a chamada da tool é forçada pelo
   parâmetro da API. Sem isso, o juiz eventualmente responde em prosa e não
   sobra Score nenhum pra agregar. É a mesma convenção já aplicada em
   `agent.js` e `nota-fiscal.js`.

## Divisão de trabalho: código vs. LLM

Regra de ouro do projeto, aplicada aqui também — **a LLM não faz aritmética**.
Antes de chamar o juiz, o script apura em JS os fatos objetivos do trace e os
entrega prontos, no bloco `sinais_apurados_em_codigo`:

- quais ferramentas foram chamadas (`registrou_consumo`, `verificou_disponibilidade`, ...)
- tokens de saída de cada chamada ao modelo
- se algum deles bateu **exatamente** no teto de `max_tokens` — a assinatura
  de truncamento do achado §11.4
- se alguma observação do trace ficou em nível `ERROR`
- se a saída final veio vazia

O juiz recebe isso como verdade e julga só o que não é apurável: fidelidade
ao estoque, respeito às restrições, qualidade do trade-off, ancoragem no
texto.

## Onde ver o resultado

Langfuse Cloud → projeto do Chef Caseiro → **Tracing → Traces** → abrir um
trace → aba **Scores**. Os Scores também aparecem como colunas filtráveis na
lista de traces, que é o que a Aula 3 usa pra "qualidade ao longo do tempo".
