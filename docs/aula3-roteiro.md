# Aula 3 — Observabilidade: monitorando em produção

Versão do produto: **`master`, produção** (dados reais do Langfuse Cloud) +
demo local do "antes/depois" com/sem as variáveis `LANGFUSE_*`. Ver mapa
geral em [`PLANO-GRAVACAO-CURSO.md`](./PLANO-GRAVACAO-CURSO.md). Números
usados nesta aula vêm de `docs/RUNBOOK-gravacao-29-08.md` §3 e do `SDD.md`
§11 — não são inventados, são o estado real de produção em 22/08 (68
traces, 27/07 → 22/08, US$ 1,65 acumulado).

---

## 3.1 — O que é observabilidade? (tempo não informado no CSV)

**Objetivo:** entender o que significa observar um produto com IA em
produção — quais dados capturar, o que revelam, por que isso muda a forma
de operar o produto.

**Fala sugerida (bullets):**
- Observabilidade ≠ log. Log é "o que aconteceu aqui". Observabilidade é
  "consigo reconstruir por que aconteceu, sem ter estado olhando na hora".
- No Chef Caseiro, a invariante é literal no `SDD.md` §8: **nenhuma chamada
  ao Claude pode acontecer fora de uma observação do Langfuse** — não é
  feature, é requisito não-funcional.
- Mecânica real: `instrumentation.js` sobe o OpenTelemetry com o
  `LangfuseSpanProcessor` **antes de qualquer outro módulo** (primeiro
  `require` de `server.js`) — se isso não acontecer primeiro, chamadas
  feitas antes não são capturadas.
- O que muda sem as variáveis `LANGFUSE_*`: o SDK **ainda funciona**, ainda
  gera `trace_id`, só não consegue exportar pro dashboard. Ou seja: tirar a
  observabilidade não quebra o produto — quebra a sua capacidade de saber o
  que ele está fazendo. É a demo do 3.2.

**Demo:**
1. Mostrar `instrumentation.js` (17 linhas, curto de propósito) e apontar
   o comentário de topo explicando o comportamento sem as env vars.
2. Sem executar nada ainda — a execução fica pro 3.2.

**Slides — outline:**
1. **"Log vs. observabilidade"** — bullets: log é evento isolado;
   observabilidade é reconstrução de causa; a pergunta que cada um responde.
2. **A invariante do Chef Caseiro** — citar `SDD.md §8` literalmente:
   nenhuma chamada ao Claude fora de uma observação.
3. **O que quebra sem instrumentação** — não o produto, a sua visão dele.

**Se der errado:** sem dependência de rede — é leitura de código.

---

## 3.2 — Conhecendo o Langfuse (tempo não informado no CSV)

**Objetivo:** navegar pela interface do Langfuse, entender sua estrutura de
dados e configurá-lo como ferramenta de observabilidade do Chef Caseiro.

**Fala sugerida (bullets):**
- Estrutura de dados: **trace** (uma interação inteira) → **observation**
  (cada chamada dentro dela — `generation` pro Claude, `span` pra lógica,
  `tool` pra tool call). No Chef Caseiro cada chamada e cada tool call
  viram observação própria, aninhada num span `agent`.
- Onde configurar: `LANGFUSE_SECRET_KEY` / `LANGFUSE_PUBLIC_KEY` /
  `LANGFUSE_BASE_URL`, tirados do Langfuse Cloud
  (`us.cloud.langfuse.com` → Settings → API Keys do projeto).
- Fazer o antes/depois **ao vivo, local** — é a demonstração mais direta da
  aula inteira.

**Demo (antes/depois local):**

Use o script de apoio — ele guarda e devolve **só** as três variáveis
`LANGFUSE_*`, sem tocar nas do Supabase/Anthropic (testado em 28/08; o
`.env` volta idêntico ao original):

```bash
powershell -File scripts/observabilidade.ps1 off
```

```bash
npm start
```

Mostrar: o produto responde normalmente (sugerir receita, mandar mensagem
na conversa), mas nada aparece no Langfuse Cloud. Ponto didático: **o
produto não sabe que está cego** — nada falha, nada avisa.

Encerre com `Ctrl+C`, religue e suba de novo:

```bash
powershell -File scripts/observabilidade.ps1 on
```

```bash
npm start
```

Repetir a mesma ação e mostrar o trace aparecendo no Langfuse (depois do
lag do 2.4/§11.2 — não espere em silêncio, já avise a turma do ~45s aqui
também).

**Slides — outline:**
1. **"Trace, observation, generation"** — diagrama da hierarquia com um
   exemplo real do Chef Caseiro (span `agent` → generation → tool spans).
2. **Onde pegar as chaves** — screenshot do Langfuse Cloud, Settings → API
   Keys.
3. **Antes/depois** — captura de tela do painel do Langfuse vazio vs. com
   o trace, lado a lado.

**Se der errado:**

- **Não existe `.env` na máquina** (é o caso da máquina da escola, que usa
  `railway run`): gere um antes com
  `powershell -File scripts/observabilidade.ps1 preparar` — ele monta o
  `.env` a partir das variáveis do Railway. Confira com `... status`.
- **Ficou em dúvida sobre o estado**: `powershell -File
  scripts/observabilidade.ps1 status` diz se está ligada ou desligada.
- **O trace não aparece depois de religar**: espere os ~45 s do lag de
  ingestão antes de concluir que falhou (achado §11.2). Se passar disso,
  siga a aula com o painel que já tem os traces históricos — o "depois"
  também pode ser contado com dado antigo.

---

## 3.3 — Lendo os dados de produção (tempo não informado no CSV)

**Objetivo:** interpretar os dados gerados pelo Langfuse em produção:
volume de uso, latência, erros e variações de qualidade ao longo do tempo.

**Fala sugerida (bullets), com os números reais do RUNBOOK §3:**
- Janela: 68 traces, 27/07 → 22/08, **US$ 1,65** de custo acumulado — mostra
  que "observar" não é abstrato, vira uma conta que fecha.
- A tabela por operação:
  - `mediar-cardapio`: 10 chamadas, US$ 0,1121 em média, 45,4s de latência
    média, **68% do custo total**.
  - `sugerir-receita`: 13 chamadas, US$ 0,0227 em média, 23,3s.
  - `ingerir-relato`: 30 chamadas, US$ 0,0051 em média, 2,6s.
- A leitura que importa: o Mediador é **15% das chamadas e 68% da conta** —
  não é o mais frequente, é o mais caro por chamada. Esse é o tipo de
  insight que só aparece olhando dado agregado, não uma interação por vez.
- Comparação de modelo na mesma tarefa (`ingerir-relato` rodou nos dois):
  haiku **1,9× mais barato e 2,5× mais rápido** que sonnet (US$ 0,00293 /
  1,17s contra US$ 0,00563 / 2,99s) — é o argumento real por trás do eixo
  `modelIngestao` existir separado do eixo `model`.

**Demo:**
1. Abrir o Langfuse Cloud, ir na visão de traces/observations do projeto.
2. Filtrar por nome de operação (`mediar-cardapio`, `ingerir-relato`) e
   mostrar custo/latência agregados batendo com a tabela.
3. Abrir dois traces de `ingerir-relato` — um em haiku, um em sonnet — lado
   a lado, mostrando a diferença de custo/latência na mesma tarefa.

**Slides — outline:**
1. **"68 traces, US$ 1,65"** — a tabela de operação × custo × latência ×
   % do custo, direto do RUNBOOK §3.
2. **"15% das chamadas, 68% da conta"** — destaque visual só pro Mediador.
3. **Mesmo agente, dois modelos** — tabela haiku vs. sonnet no
   `ingerir-relato`, com o fator 1,9× e 2,5× em destaque.

**Se der errado:** se os números do Langfuse ao vivo não baterem exatamente
com a tabela (produção continua acumulando uso entre 22/08 e 29/08), avise
a turma que os números vão ter crescido — a tabela do RUNBOOK é a foto de
22/08, o Langfuse ao vivo é sempre mais atual, e isso também é conteúdo
("observabilidade é um retrato que fica velho rápido").

---

## 3.4 — Padrões de falha (tempo não informado no CSV)

**Objetivo:** identificar padrões recorrentes de falha e degradação nas
respostas do produto, usando os dados do Langfuse para encontrar onde e
quando o produto piora.

**Fala sugerida (bullets) — os padrões documentados no SDD §11, não
inventados na hora:**
1. **Truncamento por `max_tokens`** (§11.4) — assinatura reconhecível:
   `output tokens == max_tokens` configurado (1024). Resposta cortada no
   meio de uma palavra na primeira observação; desde 2026-08-12, com
   despensa maior, o corte pode acontecer **no meio de uma chamada de
   ferramenta**, deixando um `tool_use` órfão que derruba a chamada
   seguinte com erro 400 da Anthropic (trace de exemplo:
   `57debf7a71533fdc6a9e7a982595ba7c`). **Não corrigido de propósito** —
   fica pra reprodução ao vivo na Aula 4.
2. **Erro engolido por fallback defensivo** (§11.6) — `|| []` escondendo
   falha de query; a coluna do Kanban aparecia vazia em vez de mostrar
   erro. Só apareceu com teste ponta a ponta.
3. **Episódios A e B do Telegram** (RUNBOOK §2) — dois modos de cegueira:
   informação destruída pelo próprio tratamento de erro (A) vs. informação
   nunca gerada (B). Detalhar só o suficiente pra preparar a Aula 4 — não
   fazer o diagnóstico completo aqui, isso é o núcleo do vídeo 4.2.
4. **Episódio C — o modelo acertou, o código errou** (RUNBOOK §2, episódio
   C / `aula4-inventario-conteudo.md` §1b) — falha de **estado**, não de
   canal: relato classificado perfeitamente, e o estoque não mudou porque
   o match de nome (`ilike`) não reconheceu "lasagna" contra "lasanha"
   gravado. Só detectável cruzando trace com estado resultante.
- Fechamento: o padrão comum aos quatro é o mesmo — **nenhum deles gritou
  sozinho**. Cada um precisou de alguém olhando o dado certo, na hora
  certa, com a pergunta certa.

**Demo:**
1. Se possível, abrir o trace `57debf7a71533fdc6a9e7a982595ba7c` no
   Langfuse e mostrar `output tokens == 1024`.
2. Mostrar o trace do episódio C (haiku, 1,3s, US$ 0,0033, `trace
   41a4e5c75e`) com a extração perfeita (`item_nome: lasagna`) ao lado do
   estado real do estoque, que não mudou.

**Slides — outline:**
1. **"4 padrões de falha reais"** — lista curta, um bullet por padrão, sem
   solução ainda (a solução é a Aula 4).
2. **Truncamento por `max_tokens`** — diagrama: teto configurado → output
   tokens bate no teto → `stop_reason` vira `max_tokens` em vez de
   `tool_use` → loop não processa → `tool_use` órfão → erro 400.
3. **O padrão comum** — "nenhuma dessas quatro falhas gritou sozinha";
   gancho direto pro título da Aula 4 ("detectar, diagnosticar, corrigir").

**Se der errado:** se o trace específico não carregar (lag do Langfuse, ou
já fora da retenção), use os prints/trechos já documentados em
`SDD.md §11.4` e `docs/aula4-inventario-conteudo.md` como evidência — o
texto já cita os IDs e números exatos, não precisa da tela ao vivo pra
sustentar a explicação.

---

## 3.5 — O que aprendemos? (texto)

- Observabilidade é reconstruir a causa, não só registrar o evento — e no
  Chef Caseiro é uma invariante de código, não um extra.
- Trace → observation → generation é a estrutura de dados do Langfuse;
  sem as chaves configuradas, o produto continua funcionando, mas você
  perde a visão.
- Dado de produção real (68 traces, US$ 1,65) mostra onde o custo se
  concentra — 15% das chamadas, 68% da conta — e onde trocar de modelo
  compensa (haiku 1,9× mais barato, 2,5× mais rápido na mesma tarefa).
- Quatro padrões de falha reais e documentados (truncamento por
  `max_tokens`, fallback silencioso, dois modos de cegueira no Telegram, e
  o caso do modelo acertando enquanto o código erra) — nenhum gritou
  sozinho, todos precisaram de alguém observando. É o gancho direto pra
  Aula 4.
