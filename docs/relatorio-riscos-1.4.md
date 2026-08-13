# Relatório de Riscos — Musa Balance (Chef Caseiro v3)

**Aula 1.4 — Mapeando riscos do produto**
Mapeamento inicial de riscos operacionais no produto fictício de referência, organizado pelos três pilares da operação (evals, observabilidade, conformidade). Cada risco listado aqui é real — aconteceu de verdade durante a construção do produto, não é hipotético — com evidência rastreável no `SDD.md` (seção 11) e no histórico do Langfuse.

---

## 🎯 Evals — "a IA está fazendo o que deveria?"

| Risco | Evidência | Ação |
|---|---|---|
| Nenhum pipeline de evals existe ainda | `meal_suggestions`/`trade_off_decisions` são logados, mas nada avalia qualidade sistematicamente | Construir Claude-as-judge escrevendo Score no Langfuse (conteúdo da Aula 2) |
| Instrução do Mediador é *pedida*, não garantida | O prompt pede pra notar a tensão "delivery vs. porção envelhecendo" sem `tool_choice` forçado — decisão deliberada, mas sem eval, ninguém mede se ele realmente nota | Eval específico: "nessa situação, o agente comentou o trade-off?" — não é qualidade geral, é aderência a um comportamento esperado |
| Classificação de `fonte_refeicao` já errou ao vivo | Um relato claramente caseiro ("reaquecida hoje") ficou sem classificação | Eval de precisão sobre uma amostra rotulada manualmente |

## 📈 Observabilidade — "o que está acontecendo com o produto?"

| Risco | Evidência | Ação |
|---|---|---|
| Erro engolido em silêncio já aconteceu de verdade | `/api/kanban` mascarava coluna ausente com `\|\| []` — só apareceu testando ponta a ponta (SDD §11.6) | Auditar o resto do código atrás do mesmo padrão (`\|\| []`, `\|\| null`, catch vazio) |
| Truncamento por `max_tokens` virou crash real | Teto de 1024 agora corta no meio de uma chamada de ferramenta — 400 da Anthropic, reproduzido ao vivo (trace `57debf7a71533fdc6a9e7a982595ba7c`, SDD §11.4) | Sem monitoramento hoje, ninguém saberia até um usuário reclamar — alertar quando `output_tokens == max_tokens` configurado |
| Latência cresceu sem ninguém medir | Sugestão que era rápida agora leva ~60s, conforme a base real de dados cresceu | Acompanhar p50/p95 de latência no Langfuse ao longo do tempo — não é bug, é degradação silenciosa |

## 🔒 Conformidade — "estamos fazendo do jeito certo?"

| Risco | Evidência | Ação |
|---|---|---|
| RLS desligado no Supabase | Mitigado porque só a service role key toca as tabelas — mas é uma dependência frágil de "ninguém erra isso no futuro" | Documentar o invariante explicitamente; RLS de verdade antes de qualquer multi-tenancy real |
| Dado sensível de família real, sem política de retenção | Compras, hábitos, orçamento trafegam por Telegram + Supabase + Langfuse — nenhuma regra de "por quanto tempo" ou "como excluir" | Checklist de conformidade (Aula 5) |
| Nenhuma transparência formal sobre uso de IA | Sugestões e decisões são geradas por IA sem aviso explícito ao "usuário final" | Ligação direta com 5.2 — o que comunicar, quando e como |
| Achado de crash mantido de propósito | Decisão documentada (SDD §11.4) de não corrigir — correto como conteúdo de aula, mas seria inaceitável num produto real sem essa decisão estar registrada e assumida | Usar como exemplo do que separa "risco aceito e documentado" de "risco escondido" |

---

*Gerado durante ensaio da gravação, branch `ensaio-aula4`. Gancho direto pro fechamento do módulo 1 (1.5) e semente pras Aulas 2–5, já que cada linha aponta pra uma delas.*
