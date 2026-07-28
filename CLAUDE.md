# Chef Caseiro — produto fictício de referência

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
tem **três eixos trocáveis ao vivo**, direto na barra de configuração do
painel:
- versão do prompt (v1 solto / v2 obriga tool use)
- modelo de geração (`claude-sonnet-5` / `claude-haiku-4-5` / `claude-opus-5`)
- (planejado, não implementado ainda) modelo de visão pra ingestão de nota fiscal

Trocar os eixos ao vivo, comparar o resultado e olhar o trace no Langfuse é
o exercício central da Aula 4.

## Arquitetura

- **`server.js`** — Express. Rotas REST puras (`/api/estoque`,
  `/api/preferencias`, `/api/sugestao`, `/api/sugestoes`, `/api/config`).
  Protegido por Basic Auth (`APP_USER`/`APP_PASSWORD`) quando essas env vars
  existem — sem elas, roda aberto (ok só em localhost).
- **`agent.js`** — o loop agêntico. Cada chamada ao Claude e cada tool call
  vira uma observação própria no Langfuse, aninhada num span `agent`
  (`startObservation`/`asType`). Isso é o que permite ver a árvore de decisão
  inteira no dashboard.
- **`tools.js`** — as duas ferramentas que o Claude pode chamar
  (`consultar_estoque`, `consultar_preferencias`), lendo do Supabase de
  verdade — nunca dado pré-buscado pelo backend.
- **`prompts.js`** — v1 (solto, não obriga tool use) e v2 (obriga consultar
  estoque/preferências antes de responder). Ver "Achados" abaixo.
- **`schema.sql`** — schema Postgres completo (rodar manualmente no SQL
  Editor do Supabase se for recriar o backend do zero). 8 tabelas:
  `households`, `preferences`, `pantry_items` (com `state` em
  `base/ingrediente/preparado`), `receipts`, `receipt_items`,
  `meal_requests`, `meal_suggestions`, `stock_consumptions`.
- **`public/`** — painel único (vanilla JS, sem build step): estoque,
  preferências, pedido de sugestão, histórico com confirmação de consumo.
- **`instrumentation.js`** — setup do OpenTelemetry + `LangfuseSpanProcessor`.
  Precisa ser o primeiro `require` (já é, em `server.js`).
- **`generate-slides.js`** / **`docs/rascunho-coordenacao.html`** — material
  de apresentação pra coordenação da Alura, não faz parte do produto.

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

Dois achados de debugging que o instrutor decidiu manter como conteúdo real
da Aula 4 (evitar "corrigir" sem perguntar antes — combinado explicitamente):

1. **Bug previsto que não reproduziu**: a expectativa era que o prompt v1
   (solto, não obriga tool use) levaria o Claude a responder "de cabeça" sem
   consultar estoque/preferências. Em teste real com Claude Sonnet 5, tanto
   v1 quanto v2 chamaram as ferramentas normalmente (2x cada). Fica como
   exemplo de que nem toda hipótese de causa-raiz se confirma — parte do
   ensino de diagnóstico é a etapa de descartar hipóteses.
2. **Lag de ingestão do Langfuse Cloud**: um trace exportado com sucesso
   (log "Export succeeded") ainda assim retorna 404 na API pública por cerca
   de **45 segundos** depois do envio. Confirmado via diagnóstico OTel e
   polling. Não é bug da instrumentação — é o tempo de processamento real do
   Langfuse Cloud antes do trace ficar consultável.

## O que falta (próximas camadas)

- Ingestão de nota fiscal via Claude Vision (upload → extração → tela de
  revisão em `receipt_items` antes de virar `pantry_items`) — é o terceiro
  eixo trocável (fable-5/haiku-4-5 pra visão) que ainda não foi construído.
- Pipeline de evals da Aula 2: Claude-as-judge avaliando interações logadas e
  escrevendo Score de volta no Langfuse via `trace_id`/`meal_suggestions.trace_id`
  — dependência dura pra ter dado real de "qualidade ao longo do tempo" na
  Aula 3 e conteúdo de diagnóstico na Aula 4.
- Roteiros de aula ainda não escritos: Aulas 1, 4, 5 completas; Aula 3 falta
  "Lendo os dados de produção" e "Padrões de falha".

## Convenção de processo (instrução do instrutor, válida em qualquer sessão)

Ao debugar e encontrar algo que possa virar conteúdo de aula, **perguntar
antes de "corrigir"** — pode valer mais preservar o comportamento como
exemplo real do que consertar. Os dois achados acima são precedentes disso.
