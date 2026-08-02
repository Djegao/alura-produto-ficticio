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
- **`public/`** — front vanilla JS, sem build step. UI é "objetos da
  cozinha": geladeira e livro de receitas, cada um com ilustração real
  (gerada pelo próprio instrutor, licença própria — não é mais CSS
  desenhado à mão) trocando entre estado fechado/aberto via crossfade de
  opacidade. Preferências **não** é mais um terceiro objeto — virou um botão
  de configuração ("⚙ Preferências da casa") ao lado dos eixos ao vivo,
  porque não havia caso de uso real pra separar fisicamente (decisão
  revertida, ver SDD §9.5). O estoque dentro da geladeira é sempre
  segmentado em duas grades (Geladeira/Despensa por `storage`), nunca lista
  única — evita o scroll horizontal que a primeira versão tinha. Painel
  revelado usa o truque `grid-template-rows: 0fr → 1fr` pra animar altura
  desconhecida. Paleta/tipografia inspiradas na *linguagem de interação* do
  site de campanha da Kerrygold ("The Magical Pantry") — objetos como
  portais de navegação — mas implementação e ilustrações originais.
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
pergunta, nunca infere). `agent.js` ganhou `mediarCardapio` (mesmo padrão de
loop + `tool_choice` forçado do `sugerirReceita`, mas com tools
deterministas novas e `max_tokens` maior — o teto de 1024 do loop original
**não foi tocado de propósito**, é o achado §11.4 preservado). `tools.js`
ganhou `mediatorToolDefinitions`, um array **separado** de `toolDefinitions`
pra não vazar as tools novas pro agente v1/v2 antigo.

Tabelas novas (migração **já rodada** no Supabase em 2026-08-02, registrada
como histórico no fim do `schema.sql`): `actors` (Diego=chef, Esposa=musa já
semeados), `weekly_budgets`, `meal_reports`, `trade_off_decisions`,
`pensamentos` (log cru exibido no painel "💭 Pensamentos da semana", só
leitura por enquanto), e `pantry_items.blanched_at` /
`households.telegram_chat_id`. RLS deixado desligado de propósito — só o
`SUPABASE_SERVICE_ROLE_KEY` (só usado em `tools.js`, nunca no browser) toca
essas tabelas, então o aviso do linter do Supabase não se aplica aqui.

Rotas novas em `server.js`: `/api/atores`, `/api/relatos`,
`/api/orcamento-semanal`, `/api/mediacao`, `/api/mediacoes`,
`/api/pensamentos`, `/api/telegram/webhook` (autenticado por
`TELEGRAM_WEBHOOK_SECRET`, não pelo Basic Auth geral — o Telegram não manda
credenciais).

**Pendências externas (não é código, é ação manual)** — atualizado
2026-08-02: migração rodada, atores semeados, bot criado e webhook
registrado (200 via POST JSON no Postman). Falta:
1. Confirmar Group Privacy = off no BotFather (bot precisa ler texto livre
   no grupo, não só comandos).
2. Rodar `/eusou_chef` e `/eusou_musa` no grupo (cada ator no seu celular)
   pra ligar `telegram_user_id`.
3. Semear o cenário real já vivido (compras da semana, lasanha, itens
   branqueados com `blanched_at` real) — dado de verdade, não simulação.
4. Configurar `TELEGRAM_BOT_TOKEN`/`TELEGRAM_WEBHOOK_SECRET` também no
   Railway (produção), não só local — sem isso o webhook de produção não
   valida o secret_token.

Adiado de propósito, não esquecido: cards (swipe + geração de imagem por
IA), LTM/aprendizado de "match de sucesso", RLS/multi-tenancy — ver
`unified-meandering-newell.md` pro raciocínio completo de cada adiamento.

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
   configurado (1024). Achado preservado, correção ainda **não aplicada**.

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

## Convenção de processo (instrução do instrutor, válida em qualquer sessão)

Ao debugar e encontrar algo que possa virar conteúdo de aula, **perguntar
antes de "corrigir"** — pode valer mais preservar o comportamento como
exemplo real do que consertar. Os dois achados acima são precedentes disso.
