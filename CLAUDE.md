# Chef Caseiro — produto fictício de referência

> **📹 GRAVAÇÃO DE 29/08 — o curso inteiro (Aulas 1–5) está pré-preparado.**
> Comece por **`docs/PLANO-GRAVACAO-CURSO.md`** (mapa mestre: aula → vídeo →
> versão do produto → comandos → slides) e por
> **`docs/SETUP-MAQUINA-ESCOLA.md`** (checklist da máquina da escola).
> Material criado em 28/08: roteiros por aula (`docs/aula{1,2,3,5}-roteiro.md`),
> checklist de conformidade, pipeline de evals real em `evals/`, decks em
> `slides/*.pptx` e o script `scripts/observabilidade.ps1` (liga/desliga o
> Langfuse para a demo da Aula 3). Nada disso altera o produto — é tudo
> aditivo, e os quatro achados preservados continuam intactos.
>
> ✅ **Credenciais trocadas em 28/08.** A `ANTHROPIC_API_KEY` antiga estava
> revogada (nenhuma chamada de modelo funcionou entre ~24/08 e 28/08). A
> chave nova é *identity-linked*, então o produto agora exige também
> `ANTHROPIC_WORKSPACE_ID` — presente no `.env` e no Railway. O SDK envia o
> header sozinho a partir da variável; **nenhuma linha de código mudou**.
> Produção redeployada e verificada, e o pipeline de evals gravou 39 Scores
> reais no Langfuse.
>
> **Achado novo de 28/08, ainda não corrigido (convenção: perguntar antes):**
> o truncamento do §11.4 **não é só do v1/v2** — o `mediar-cardapio` também
> está batendo nos tetos (2048 e 1024) com ~18,5 mil tokens de entrada.
> Evidência em `docs/apoio/aula2-saida-evals.md`.
>
> Dois avisos operacionais de 28/08: (a) o pre-flight do runbook que espera
> o hash `b876e2c` **está desatualizado** — use o comando corrigido em
> `docs/SETUP-MAQUINA-ESCOLA.md` §5, que compara só os arquivos de código;
> (b) produção caiu de manhã (fim do período gratuito do Railway) e voltou
> às 10h34 — confira sempre com `curl.exe`, esperando **401**, não 404.

> **A Aula 4 continua regida por `docs/RUNBOOK-gravacao-29-08.md`.**
> Produção está com **falhas preservadas de propósito** para demonstração ao
> vivo. Há dois PRs abertos que **não devem ser mergeados nem deployados
> antes da gravação**, e a ordem entre eles importa: **#4 antes do #6**.
> Se você é uma sessão nova dando suporte à aula, o runbook tem o estado
> atual, a sequência dos atos e os comandos de cada momento.

Produto fictício construído para o curso Alura **"Evals, observabilidade e
conformidade"** (parte da formação AI Product Builder). Não é um produto real
— existe para dar suporte de exemplo prático às aulas sobre Langfuse,
observabilidade e diagnóstico de falhas em produção.

## O que é

Um assistente que sugere o que cozinhar com base no que a pessoa tem em casa
(estoque) e nas restrições/preferências da casa. O núcleo é um loop agêntico
real com Claude (tool use de verdade, sem mock) contra dados reais no
Supabase, com cada chamada instrumentada no Langfuse.

**Por que existe**: a aula precisava de um caso prático pra ensinar Langfuse
e diagnóstico de causa-raiz (prompt vs dados vs modelo). Por isso o produto
tem **eixos trocáveis ao vivo**, direto na barra de configuração do painel:
- versão do prompt (v1 solto / v2 obriga tool use)
- modelo de geração (`claude-sonnet-5` / `claude-haiku-4-5` / `claude-opus-5`)
- (planejado, não implementado ainda) modelo de visão pra ingestão de nota fiscal por imagem

Trocar os eixos ao vivo, comparar o resultado e olhar o trace no Langfuse é
o exercício central da Aula 4.

**Especificação completa**: ver `SDD.md` na raiz do repo — documento de spec
retroativo que registra requisitos, arquitetura e (principalmente) os
achados empíricos incorporados como restrições de design. Leia antes de
alterar qualquer coisa relacionada aos eixos, ao loop agêntico ou à
categorização de estoque.

## Arquitetura

- **`server.js`** — Express. Rotas REST puras (`/api/estoque`,
  `/api/preferencias`, `/api/sugestao`, `/api/sugestoes`, `/api/consumos`,
  `/api/notas-fiscais`, `/api/config`). Protegido por Basic Auth
  (`APP_USER`/`APP_PASSWORD`) quando essas env vars existem — sem elas, roda
  aberto (ok só em localhost).
- **`agent.js`** — o loop agêntico. Cada chamada ao Claude e cada tool call
  vira uma observação própria no Langfuse, aninhada num span `agent`
  (`startObservation`/`asType`). Depois do loop, se o estoque foi consultado
  mas nenhum consumo foi registrado, força uma chamada extra com
  `tool_choice` — não confia mais em pedido de prompt sozinho (ver SDD §11.3).
- **`nota-fiscal.js`** — ingestão de nota fiscal em texto/markdown: extrai
  itens de comida (ignora limpeza/higiene), normaliza quantidade e categoriza
  `state`+`storage` via Claude com `tool_choice` forçado. Sem tela de revisão
  ainda — vai direto pro estoque.
- **`tools.js`** — três ferramentas que o Claude pode chamar durante o loop
  (`consultar_estoque`, `consultar_preferencias`, `registrar_itens_usados`),
  lendo/confirmando contra o Supabase de verdade — nunca dado pré-buscado
  pelo backend.
- **`prompts.js`** — v1 (solto, não obriga tool use) e v2 (obriga consultar
  estoque/preferências e registrar consumo). Ver "Achados" abaixo.
- **`schema.sql`** — schema Postgres completo (rodar manualmente no SQL
  Editor do Supabase se for recriar o backend do zero). 8 tabelas:
  `households`, `preferences`, `pantry_items` (com `state` em
  `base/ingrediente/preparado` E `storage` em `seco/perecivel` — dois eixos
  ortogonais), `receipts`, `receipt_items`, `meal_requests`,
  `meal_suggestions` (com `items_used`), `stock_consumptions` (com
  `items_consumed`, retrato tirado na confirmação). Migrações rodadas
  manualmente após o schema inicial documentadas no fim do arquivo.
- **`public/`** — front vanilla JS, sem build step. **Reescrito em 2026-08-21
  pra v4 "Feed vivo"**: o hero é uma **faixa de estado derivado** (3 cartas
  só-leitura, tudo calculado em código: porções vivas, vencendo D-N, saldo
  da semana — `GET /api/estado-cozinha`) + um **feed** (a tabela
  `pensamentos` renderizada em ordem cronológica reversa, com filtro por
  ator) + um **composer de conversa** (`POST /api/conversa`, mesmo caminho
  de escrita do Telegram). Desejo no feed tem botão "🍳 Mediar" →
  `/api/mediacao`. **O Kanban (fase 4, 2026-08-02) foi morto em 2026-08-21**
  por decisão explícita do instrutor — a estrutura de 5 estágios exigia
  eventos num formato que a vida da casa não produz (colunas cronicamente
  vazias foram o sintoma; diagnóstico completo na conversa do pivot). As
  ações de coluna viraram frases na conversa; ver `intencao-efeitos.js`.
  Despensa continua **função separada** (objeto geladeira/ilustração real
  do instrutor) — só itens não `preparado`, grade densa por `storage`, +
  lista de compras + importação de nota. "Livro de receitas" (UI do v1/v2)
  segue **fora da interface** — `agent.js:sugerirReceita`, `prompts.js`
  v1/v2 e `/api/sugestao`/`/api/sugestoes` intactas, demonstrar via
  Postman/curl na Aula 4. Painel revelado usa `grid-template-rows: 0fr →
  1fr` pra animar altura desconhecida. Paleta/tipografia inspiradas na
  *linguagem de interação* da campanha "The Magical Pantry" (Kerrygold) —
  implementação e ilustrações originais.
- **`instrumentation.js`** — setup do OpenTelemetry + `LangfuseSpanProcessor`.
  Precisa ser o primeiro `require` (já é, em `server.js`).
- **`generate-slides.js`** / **`docs/rascunho-coordenacao.html`** — material
  de apresentação pra coordenação da Alura, não faz parte do produto.

## v3 "Musa Balance" — pivot multi-ator (em construção)

A partir de 2026-08-02 o produto pivotou de "gestor de estoque com chat" pra
um mediador entre dois atores reais da casa (Diego/chef, esposa/musa) com
objetivos parcialmente conflitantes — ver `v3-musa-balance.md` pra spec e o
plano salvo em `unified-meandering-newell.md` (`.claude/plans/`) pra
arquitetura completa. **v1/v2 do Chef Ops original continuam existindo sem
alteração** — são um agente separado, não substituído, pra manter a
comparação de aula intacta.

Arquivos novos: `relato-ingestao.js` (agente de ingestão, classifica texto em
relato de refeição vs. desejo), `telegram.js` (canal Telegram, roda em
paralelo ao web), `lembrete.js` (job horário que cobra relato ausente —
pergunta, nunca infere), e (fase 5, 2026-08-21) `sefaz.js` + `receita-premium.js`
(ver "Fase 5" abaixo). `agent.js` ganhou `mediarCardapio` (mesmo padrão de
loop + `tool_choice` forçado do `sugerirReceita`, mas com tools
deterministas novas e `max_tokens` maior — o teto de 1024 do loop original
**não foi tocado de propósito**, é o achado §11.4 preservado). `tools.js`
ganhou `mediatorToolDefinitions`, um array **separado** de `toolDefinitions`
pra não vazar as tools novas pro agente v1/v2 antigo.

Tabelas novas, construídas em 4 fases ao longo de 2026-08-02 (histórico
completo no fim do `schema.sql`, cada bloco com a data): `actors`
(Diego=chef, Esposa=musa, semeados), `weekly_budgets`, `meal_reports`,
`trade_off_decisions` (+ `porcionado_em`, fase 4), `pensamentos` (log cru,
`tipo` em `relato_refeicao/desejo/aquisicao/desperdicio`, + `budget_categoria`/
`status`/`fonte_refeicao`/`dias_desde_preparo`), `actor_daily_targets`
(calorias+macros por ator, uso futuro com nutricionista), e em
`pantry_items`: `blanched_at`, `portions_total`/`portions_remaining`
(porcionamento), `prepared_at` (base pra validade de prato pronto —
**aprendida por relato de desperdício, não configurada globalmente**, cada
prato decai no próprio ritmo). Em `households`:
`dias_validade_pos_branqueamento` (D-N editável, substituiu constante fixa
em código) e `telegram_chat_id`. RLS deixado desligado de propósito — só o
`SUPABASE_SERVICE_ROLE_KEY` (só usado em `tools.js`, nunca no browser) toca
essas tabelas, então o aviso do linter do Supabase não se aplica aqui.

Rotas em `server.js` (estado pós-v4): `/api/atores`,
`/api/orcamento-semanal`, `/api/mediacao`, `/api/mediacoes`,
`/api/pensamentos`, `/api/telegram/webhook` (autenticado por
`TELEGRAM_WEBHOOK_SECRET`, não pelo Basic Auth geral — o Telegram não manda
credenciais), e `/api/config-quantitativo` (+ `/validade`, `/metas` — o
repositório editável por trás da gaveta de Configurações). **Mortas na v4
(2026-08-21)**: `/api/kanban`, `/api/kanban/acao` e `/api/relatos` —
substituídas por `/api/estado-cozinha` (faixa de estado derivado),
`/api/conversa` (canal web do caminho único de escrita) e
`/api/estoque/:id/branquear` (o botão da despensa, única ação do Kanban que
já morava na tela certa). A regra "porcionar é sempre manual, só quem
cozinhou sabe o rendimento" sobrevive na conversa: porcionamento sem número
dito vira pergunta, nunca chute (`intencao-efeitos.js`).

### Fase 5 (2026-08-21): SEFAZ, lista de compras e receita premium

- **`sefaz.js`** — ingestão de NFC-e pela URL do QR code, sem custo nem
  intermediário: fetch da página pública de consulta da SEFAZ do estado
  emissor (validada: domínio `.gov.br` + chave de 44 dígitos na URL),
  HTML→texto, e o texto cai no **mesmo** extrator LLM de `nota-fiscal.js`
  (estado-agnóstico de propósito — nada de parser por UF). Funciona no
  painel web (campo "cole o link do QR" dentro de Importar nota fiscal) e
  mandando o link no Telegram (detectado no meio de texto livre). Limite
  conhecido: portal estadual que só renderiza via JS falha barulhento com
  instrução de usar o caminho de texto manual. `nota-fiscal.js` ganhou
  `estocarItensDaNota` (persistência compartilhada pelos caminhos novos; a
  rota antiga `/api/notas-fiscais` mantém o inline dela de propósito).
- **Lista de compras** (`shopping_list_items`) — alimentada por 3 fontes:
  o Mediador (novas tools `verificar_disponibilidade`, que faz match de
  ingredientes contra o estoque **em código**, e `registrar_lista_compras`;
  o prompt `mediador` agora manda resolver falta de item nesta ordem:
  substituição com o que há no estoque → lista de compras com motivo — a
  falta nunca cancela a proposta, vira trade-off), a receita premium
  (faltantes prováveis, source `premium`) e manual. Itens pendentes viram
  `comprado` **automaticamente** quando a compra chega (aquisição via chat
  ou item de nota fiscal/SEFAZ com nome casando — `marcarCompradoNaLista`
  em `tools.js`). Rotas: `/api/lista-compras` (+ `/:id/status`), comando
  `/lista` no Telegram, e seção na despensa do painel web.
- **Estoque atualizado pelo chat** — relato de refeição `caseira` que nomeia
  um prato (ex.: "comi a lasanha") agora baixa `portions_remaining` do
  `pantry_item` `preparado` correspondente (mesmo padrão de match do
  desperdício; sem match, não infere nada). `relato-ingestao.js` extrai
  `item_nome`/`item_quantidade` também pra relato caseiro.
- **`receita-premium.js`** — toda sexta ≥10h, job (padrão `lembrete.js`)
  escolhe UMA receita premium do canal do chef Mohamad Hindi
  (youtube.com/@mohindi) via **feed RSS público** do YouTube (sem API key;
  channelId resolvido da página do canal — regex aceita
  `externalId|browseId|channelId`, testado ao vivo). A única decisão da LLM
  é qual vídeo casa com estoque+preferências (tool_choice forçado +
  guarda-corpo: URL registrada tem que existir no feed, senão erro).
  Dedupe real é o `unique(household_id, week_start)` de
  `premium_suggestions`. Posta no grupo do Telegram e alimenta a lista de
  compras. Rotas `/api/receita-premium` (POST, `force` regenera) e
  `/api/receitas-premium`; comando `/premium` no Telegram (require tardio
  de `receita-premium` dentro do handler — evita ciclo com
  `enviarMensagem`).

### v4 "Feed vivo" (2026-08-21): o Kanban morreu

Decisão do instrutor na conversa de 2026-08-21 ("matar; o curso não
precisa; a faixa de estado entra"): a interface pipeline foi substituída
por **feed + conversa + faixa de estado derivado**. Racional registrado: a
estrutura de 5 estágios exigia eventos num formato que a vida da casa não
produz (as colunas Porcionamento/Consumo ficaram cronicamente vazias); o
grão real dos dados é evento no tempo — a tabela `pensamentos` É o feed. A
morte do Kanban também matou a divergência intencional entre os dois
caminhos de escrita (web × bot): agora existe **um caminho só**,
`intencao-efeitos.js` (`aplicarIntencao`) — todo canal classifica com o
agente de ingestão e cai ali pra aplicar efeitos. Dois tipos novos de
pensamento (`branqueamento`, `porcionamento`) substituem as ações de
coluna; porcionamento sem número dito vira pergunta (campo `pergunta` no
retorno), nunca estimativa. Novo eixo de custo demonstrável em aula:
`modelIngestao` (default `claude-haiku-4-5`) roda a classificação
conversacional barata; `model` continua sendo o eixo de geração
(Mediador, nota fiscal, receita premium). O achado de teste do
`/api/kanban` (fallback `|| []` mascarando erro de schema — corrigido pra
propagar com `semSilencio`) sobrevive como convenção em
`/api/estado-cozinha`: nenhuma consulta cai em silêncio.

**Pendências externas (não é código, é ação manual)** — atualizado
2026-08-21: bot criado, webhook registrado e validando, os dois atores já
identificados no grupo (`/eusou_chef`/`/eusou_musa`), Group Privacy
confirmado off, env vars do Telegram já no Railway. **Todas as migrações
(fases 2–6) rodadas e verificadas em 2026-08-21** — nada pendente no banco.
O cenário real da lasanha foi semeado em 2026-08-21 **pelo próprio produto**,
via Telegram ("porcionei a lasanha em 4 porções de 250g e 1 porção extra de
~330g com mais queijo tostado" → `pantry_item` `preparado`, 5 porções) —
primeiro uso real do caminho único de escrita em produção. Nada pendente.

**Observação em aberto desse primeiro uso real** (não mexer sem decidir,
convenção de processo abaixo): (a) o agente de ingestão fez `4 + 1 = 5` —
soma de números ditos explicitamente, mas ainda assim aritmética feita pela
LLM, no limite da regra de ouro "matemática sempre em código"; (b) as 5
porções não são equivalentes (4×250g + 1×330g) e o modelo atual trata
porção como unidade intercambiável — "comi uma porção" decrementa 1
independente de qual. Importa quando entrar cálculo calórico por porção.

Adiado de propósito, não esquecido: cards (swipe + geração de imagem por
IA), LTM/aprendizado de "match de sucesso" (a validade de prato pronto é o
primeiro passo concreto disso, ainda sem consumidor), RLS/multi-tenancy —
ver `unified-meandering-newell.md` pro raciocínio completo de cada adiamento.

## Rodando localmente

```
npm install
cp .env.example .env   # preencher com valores reais (ver "Segredos" abaixo)
npm start               # ou: node server.js
```

Abre em `http://localhost:3300`.

## Segredos — como recriar o `.env`

O `.env` nunca é versionado (está no `.gitignore`). Pra rodar em outra
máquina, recrie `.env` a partir de `.env.example` puxando os valores reais
direto dos dashboards (não copie o `.env` por chat/e-mail):

- `ANTHROPIC_API_KEY` — console.anthropic.com → API Keys
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — dashboard do projeto
  Supabase → Settings → API (mesmo projeto, tabelas já existem — não rodar
  `schema.sql` de novo)
- `LANGFUSE_SECRET_KEY` / `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_BASE_URL` —
  Langfuse Cloud (`us.cloud.langfuse.com`) → Settings → API Keys do projeto
- `APP_USER` / `APP_PASSWORD` — Basic Auth do deploy público (ver abaixo);
  pode reusar a mesma senha ou trocar, é só o gate de acesso da app, não uma
  credencial de terceiros

## Deploy — já está no ar

- **URL pública**: https://chef.workshopee.com.br (também responde em
  https://chef-caseiro-production.up.railway.app)
- **Host**: Railway, projeto `chef-caseiro` (ID `b43e0343-417c-4e0c-9fa3-3e52a8c8226b`),
  service `chef-caseiro` (ID `9d6bc7b8-1630-4eb5-b466-867ec11fef5d`)
- **Domínio custom**: `chef.workshopee.com.br` via CNAME → `qsctlh9n.up.railway.app`
  (registro já propagado e certificado válido)
- Protegida por Basic Auth — necessário porque usa chaves reais e pagas
  (Anthropic/Supabase/Langfuse); nunca remover o gate sem colocar outra
  proteção no lugar.

Pra fazer deploy de uma atualização a partir de outra máquina:

```
railway login          # abre o navegador, autentica a mesma conta Railway
railway link            # selecionar o projeto "chef-caseiro"
railway up --service chef-caseiro --detach
```

As env vars já estão configuradas no Railway (não precisa reenviar) — só
`railway variable set` se algum valor mudar.

## Achados reais preservados como conteúdo de aula

Achados de debugging que o instrutor decidiu manter como conteúdo real
das Aulas 3/4 (evitar "corrigir" sem perguntar antes — combinado
explicitamente). Detalhados com evidência completa em `SDD.md` §11:

1. **Bug previsto que não reproduziu**: v1 (solto) e v2 chamaram as
   ferramentas igualmente em teste real — nem toda hipótese de causa-raiz se
   confirma.
2. **Lag de ingestão do Langfuse Cloud**: ~45s entre "export succeeded" e o
   trace ficar consultável via API pública.
3. **Prompt não é garantia estrutural**: v2 *pedia* pra chamar
   `registrar_itens_usados`, mas o Claude nem sempre obedecia. Corrigido com
   `tool_choice` forçado — virou o padrão do projeto pra qualquer saída
   estruturada crítica (reaplicado em `nota-fiscal.js`).
4. **Truncamento por `max_tokens`**: resposta cortada no meio de uma
   palavra; confirmado no Langfuse que `output tokens == max_tokens`
   configurado (1024). Achado preservado, correção ainda **não aplicada** —
   e em 2026-08-12 degradou de cosmético pra crash real: com a despensa
   maior, o corte pode acontecer no meio de uma chamada de ferramenta
   (`registrar_itens_usados`, v2), deixando um `tool_use` órfão que
   derruba a chamada seguinte com 400 da Anthropic. Decisão explícita do
   instrutor: manter como está, usar a reprodução ao vivo como conteúdo
   de aula (ver SDD.md §11.4 pra causa raiz completa e trace de exemplo).

## O que falta (próximas camadas)

- Ingestão de nota fiscal por **imagem** (Claude Vision) — hoje só ingere
  texto/markdown. É o terceiro eixo trocável (fable-5/haiku-4-5 pra visão)
  que ainda não foi construído.
- Tela de revisão de nota fiscal — `receipt_items.confirmed` já existe no
  schema, mas hoje é gravado direto como `true`, sem revisão humana.
- Pipeline de evals da Aula 2: Claude-as-judge avaliando interações logadas e
  escrevendo Score de volta no Langfuse via `trace_id`/`meal_suggestions.trace_id`
  — dependência dura pra ter dado real de "qualidade ao longo do tempo" na
  Aula 3 e conteúdo de diagnóstico na Aula 4.
- Roteiros de aula ainda não escritos: Aulas 1, 4, 5 completas; Aula 3 falta
  "Lendo os dados de produção" e "Padrões de falha".
- **Atualização em tempo real do painel web** — hoje o feed e a faixa de
  estado só refletem escritas do Telegram quando a página é recarregada.
  Decisão explícita do instrutor (2026-08-21): **não construir agora** —
  vira exercício de aula sobre observabilidade (o aluno vê a escrita chegar
  pelo bot, olha o trace no Langfuse, e implementa polling ou SSE
  entendendo o custo de cada opção). Não "consertar" sem combinar antes.

5. **Match de nome derruba o estoque em silêncio** (22/08, ao vivo na aula):
   relato "comemos 3 porções de **lasagna**" foi classificado perfeitamente
   pelo agente (`fonte_refeicao: caseira`, `item_nome: lasagna`,
   `item_quantidade: 3`), mas o prato está gravado como **lasanha** — o
   `ilike`/`nomesCasam` não casa (`gn` × `nh`, não é acento), e as porções
   **não foram baixadas**. Nada falhou visivelmente: relato gravado,
   `meal_report` gravado, reação 👍 enviada, estado errado. Decisão do
   instrutor: **preservar para a gravação de 29/08** — é o caso em que o
   modelo acertou e o código determinístico errou. Não corrigir sem
   combinar. Detalhes em `docs/aula4-inventario-conteudo.md` §1b.

## Convenção de processo (instrução do instrutor, válida em qualquer sessão)

Ao debugar e encontrar algo que possa virar conteúdo de aula, **perguntar
antes de "corrigir"** — pode valer mais preservar o comportamento como
exemplo real do que consertar. Os dois achados acima são precedentes disso.
