# Aula 4 — inventário de conteúdo disponível

Levantado em 2026-08-22 a partir dos dados reais de produção (68 traces no
Langfuse, período 27/07 → 22/08, custo acumulado **US$ 1,65**).

## 1. Duas falhas reais de produção, com evidência completa

Ambas capturadas nas últimas 24h, **preservadas em produção de propósito**.
Roteiro detalhado em `aula4-roteiro-falha-telegram.md`.

| | Episódio A (21/08) | Episódio B (22/08) |
|---|---|---|
| Sintoma | nada acontece | nada acontece |
| Log | 2 linhas de `fetch failed` | **nenhuma** |
| Trace | nenhum | **nenhum** |
| Causa | tratamento de erro destruiu a evidência | `return` mudo para não-texto |
| Pista | 8 µs entre as duas linhas | webhook OK + zero rastro |

O par é bom porque são **os dois modos de cegueira**: no A a informação
existiu e foi destruída; no B nunca foi gerada. E os dois têm a mesma
família de correção — nenhum caminho pode terminar em silêncio.

## 2. Eixo de custo, com números reais

Custo e latência médios por tipo de operação (dados de produção):

| Operação | n | Custo médio | Latência média | % do custo total |
|---|---|---|---|---|
| `mediar-cardapio` | 10 | **US$ 0,1121** | 45,4 s | **68 %** |
| `sugerir-receita` (v1/v2) | 13 | US$ 0,0227 | 23,3 s | 18 % |
| `ingerir-relato` | 30 | US$ 0,0051 | 2,6 s | 9 % |
| `ingerir-nota-fiscal` | 4 | US$ 0,0080 | 3,9 s | 2 % |
| `receita-premium-semanal` | 1 | US$ 0,0157 | 7,5 s | 1 % |

O Mediador é **15 % das chamadas e 68 % da conta**. É o argumento mais
concreto possível para separar o eixo de geração do eixo de ingestão.

### O mesmo agente em dois modelos

`ingerir-relato` rodou nos dois modelos ao longo do tempo — mesma tarefa,
mesmo prompt, mesma tool forçada:

| Modelo | n | Custo médio | Latência média |
|---|---|---|---|
| `claude-haiku-4-5` | 6 | US$ 0,00293 | **1,17 s** |
| `claude-sonnet-5` | 24 | US$ 0,00563 | 2,99 s |

**Haiku: 1,9× mais barato e 2,5× mais rápido, na mesma tarefa.** Trocar o
eixo `modelIngestao` ao vivo no painel e comparar os dois traces é a
demonstração direta.

## 3. Dado real multi-canal

As 30 ingestões vieram de 3 canais: **Telegram 21, manual 5, web 4**.
Serve para mostrar que o `trace` carrega o canal de origem e que o mesmo
caminho de escrita (`intencao-efeitos.js`) atende os três.

## 4. Achados já documentados (SDD §11)

1. **Bug previsto que não reproduziu** — v1 (solto) e v2 chamaram as
   ferramentas igualmente. Nem toda hipótese de causa-raiz se confirma.
2. **Lag de ingestão do Langfuse Cloud** — ~45 s entre "export succeeded" e
   o trace ficar consultável pela API. Importante avisar em aula antes de
   alguém achar que o trace sumiu.
3. **Prompt não é garantia estrutural** — v2 *pedia* a chamada de
   `registrar_itens_usados` e o modelo nem sempre obedecia; `tool_choice`
   forçado virou padrão do projeto.
4. **Truncamento por `max_tokens`** — degradou de cosmético para crash real:
   o corte no meio de um `tool_use` deixa bloco órfão e derruba a chamada
   seguinte com 400. Reprodução ao vivo disponível.

## 5. Conteúdo de produto (não de código)

- **A morte do Kanban** (SDD §14) — construímos a estrutura rigorosa, a
  realidade não a alimentou, e matar foi a decisão certa. Inclui o
  diagnóstico de que o "bug do drag" era sintoma da metáfora errada.
- **Divergência de caminhos de escrita** — a nota por texto não fechava a
  lista de compras enquanto SEFAZ e chat fechavam; encontrado só em teste
  de ponta a ponta, não em revisão de código.
- **Porções não equivalentes** — a lasanha virou "5 porções" sendo 4×250 g
  + 1×330 g, e o modelo trata porção como unidade intercambiável. Discussão
  de modelagem, e de onde a LLM fez `4+1=5` (aritmética na LLM, no limite
  da regra de ouro).

## 6. Exercício planejado (ainda não construído, de propósito)

**Atualização em tempo real do painel.** Hoje a escrita do Telegram só
aparece ao recarregar. O aluno vê a escrita chegar pelo bot, olha o trace no
Langfuse, e implementa polling ou SSE entendendo o custo de cada opção.

## 7. Lacunas conhecidas

- **Pipeline de evals (Aula 2)** — Claude-as-judge escrevendo Score de volta
  no Langfuse ainda não existe. É dependência dura para "qualidade ao longo
  do tempo" na Aula 3.
- **Ingestão de nota por imagem** — a próxima camada, e agora com um caso
  real de usuário pedindo por ela (episódio B).
