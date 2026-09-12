# Chef Caseiro — produto fictício de referência

> ## 📹 Estado do curso — atualizado 12/09/2026
>
> **Formato decidido: gravação LINEAR.** O produto vai para a gravação no
> **estado final** e permanece assim do primeiro ao último vídeo — nenhum
> checkout, nenhum deploy, nenhuma troca de branch durante a gravação. As
> quatro tentativas anteriores travaram justamente no método não-linear.
>
> **Comece por [`docs/RETOMADA-ESCRITORIO.md`](docs/RETOMADA-ESCRITORIO.md)** —
> tem o estado verificado, o que falta e o prompt pronto para colar.
>
> O roteiro de gravação é [`docs/SCRIPT-LINEAR-CURSO.md`](docs/SCRIPT-LINEAR-CURSO.md):
> documento único, do vídeo 1.1 ao 5.6, com TELA / FALA / COMANDOS / CORTE
> por vídeo. Os roteiros por aula (`docs/aula{1,2,3,5}-roteiro.md`) e o
> `RUNBOOK-gravacao-29-08.md` continuam válidos como referência de detalhe,
> **mas o runbook descreve o método antigo** (deploys ao vivo) e foi
> superado pelo script linear.
>
> ### ⚠️ Pendências antes de gravar
>
> 1. **[PR #6](https://github.com/Djegao/alura-produto-ficticio/pull/6)
>    precisa ser mergeado** (só o Diego pode). Está `MERGEABLE` — o conflito
>    com master foi resolvido em 09/09. O [PR #4](https://github.com/Djegao/alura-produto-ficticio/pull/4)
>    já entrou.
> 2. **Produção está desatualizada**: o último deploy é de **29/08**, anterior
>    ao merge do #4. Depois do #6, rodar
>    `railway up --service chef-caseiro --detach` para produção refletir o
>    estado final.
>
> ### Evidência preservada (não depende mais do Langfuse)
>
> O Langfuse Cloud retém ~30 dias. Os traces que sustentam as Aulas 3 e 4
> foram extraídos em 09/09 e versionados — **e o do truncamento expirou do
> painel em 11/09**, dois dias depois da captura:
>
> - [`docs/apoio/evidencia-preservada.md`](docs/apoio/evidencia-preservada.md) —
>   leitura pronta para slide dos dois casos
> - [`docs/apoio/traces-preservados/`](docs/apoio/traces-preservados/) — JSONs completos
> - [`docs/apoio/antes-depois-codigo.md`](docs/apoio/antes-depois-codigo.md) —
>   o `return` mudo antes do PR #4 (removido de `master` pelo merge)
>
> O trace do **episódio C** (lasagna, 22/08) ainda está no painel, mas sai
> por volta de **21/09**.
>
> ### Credenciais
>
> A `ANTHROPIC_API_KEY` é *identity-linked*, então o produto exige também
> `ANTHROPIC_WORKSPACE_ID` (presente no `.env` e no Railway; nenhuma linha
> de código mudou por causa disso). Verificada funcionando em 12/09. Se
> precisar trocar, **não use `--stdin`** no PowerShell — anexa quebra de
> linha e corrompe o segredo em silêncio. Detalhes em
> `docs/SETUP-MAQUINA-ESCOLA.md` §0.
>
> ### Achados preservados — continuam intactos
>
> Os quatro achados seguem sem correção, por decisão explícita e reafirmada
> em 09/09. No formato linear eles são **contados por slide**, não
> reproduzidos ao vivo. O truncamento aparece em três vídeos (3.4, 4.2 e o
> fechamento do 4.4) e o match de nome em dois (3.4 e 4.4) — corrigir
> qualquer um exige refazer esses trechos.


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
   instrutor: manter como está. **Desde 09/09 o formato é contar por
   slide, não reproduzir ao vivo** — a evidência completa (1024 tokens no
   teto, o corte logo após "Vou registrar o uso desses itens agora", o
   `tool_use` órfão e o 400 literal) está em
   `docs/apoio/evidencia-preservada.md`. O trace original expirou do
   Langfuse em 11/09; a cópia versionada é a fonte agora.

## O que falta (próximas camadas)

- Ingestão de nota fiscal por **imagem** — construída no
  [PR #6](https://github.com/Djegao/alura-produto-ficticio/pull/6), que
  **ainda não foi mergeado**. Lê o QR code e busca o dado oficial na SEFAZ,
  com visão como degrau de recuo: o desenho original (visão lendo os 44
  dígitos) foi derrubado por teste, porque a SEFAZ exige um código que só
  existe dentro do QR.
- Tela de revisão de nota fiscal — `receipt_items.confirmed` já existe no
  schema, mas hoje é gravado direto como `true`, sem revisão humana.
- ~~Pipeline de evals da Aula 2~~ — **construído em 28/08** (`evals/`),
  rodou contra produção e gravou Scores reais no Langfuse. Os resultados
  viraram conteúdo: `execucao_integra` em 0,33 nas operações de geração
  confirma que o truncamento alcançou também o `mediar-cardapio`.
- ~~Roteiros de aula~~ — **escritos**. Consolidados no
  `docs/SCRIPT-LINEAR-CURSO.md` (do 1.1 ao 5.6), com os roteiros por aula
  como referência de detalhe.
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
