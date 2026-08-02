-- Schema do produto ficticio "Chef Caseiro" — Alura, curso Evals/Observabilidade/Conformidade
-- Rode isso no Supabase: Dashboard do projeto -> SQL Editor -> New query -> colar -> Run

create extension if not exists pgcrypto;

-- O domicilio (1 registro neste prototipo, mas correto ter a entidade separada
-- das preferencias e do estoque, ja que sao coisas que crescem independentemente)
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Minha casa',
  created_at timestamptz not null default now(),
  -- v3 "Musa Balance": telegram_chat_id do grupo (aprendido sozinho, ver
  -- telegram.js) e dias de validade pos-branqueamento (regra D-6 hoje,
  -- editavel em vez de constante fixa em codigo).
  telegram_chat_id bigint,
  dias_validade_pos_branqueamento numeric not null default 6
);

-- Preferencias persistentes do domicilio — atomicas: uma preferencia por linha
create table preferences (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  description text not null,
  created_at timestamptz not null default now()
);

-- O estoque de fato. "state" segue a definicao combinada:
--   base        = materia-prima crua (arroz cru, carne crua)
--   ingrediente = ja transformado, mas nao e prato pronto (molho pronto, queijo ralado)
--   preparado   = prato finalizado (sobra de lasanha de ontem)
create table pantry_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  quantity numeric not null default 0,
  unit text not null default 'unidade',
  state text not null check (state in ('base', 'ingrediente', 'preparado')),
  -- "storage" e' o eixo de ONDE o item mora fisicamente — ortogonal ao "state"
  -- (que e' sobre o quao transformado o alimento esta). Arroz e base+seco;
  -- maca e base+perecivel. Um item pode mudar de estado sem mudar de storage.
  storage text not null default 'seco' check (storage in ('seco', 'perecivel')),
  source text, -- 'nota_fiscal', 'manual', etc.
  -- v3 "Musa Balance": quando um vegetal e' branqueado, a depreciacao passa a
  -- seguir a regra D-6 (6 dias a partir deste timestamp) em vez da curva
  -- tabelada de "fresco". Calculado em codigo (consultar_validade_estoque),
  -- nunca inferido pelo Claude — null significa que o item nunca foi branqueado.
  blanched_at timestamptz,
  -- v3 "Musa Balance": porcionamento (estagio v do pipeline). So faz sentido
  -- pra state='preparado' — quantas porcoes o prato rendeu e quantas restam.
  -- null enquanto o item nao foi porcionado ainda.
  portions_total numeric,
  portions_remaining numeric,
  -- v3 "Musa Balance" fase 3: quando o item virou 'preparado' — base pro
  -- relogio de validade de prato pronto. Diferente de blanched_at porque
  -- cada prato decai num ritmo proprio (nao da pra globalizar como o D-6
  -- de vegetal) — em vez de constante configuravel, a validade e' APRENDIDA
  -- por relato de desperdicio (ver pensamentos.dias_desde_preparo), nao
  -- calculada de uma regra fixa.
  prepared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cada nota fiscal ingerida (a imagem em si nao fica no banco — guardamos so
-- o caminho local do arquivo, ja que isso roda na maquina, nao em producao real)
create table receipts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  image_path text,
  status text not null default 'pendente' check (status in ('pendente', 'revisado', 'confirmado')),
  model_used text,
  trace_id text,
  created_at timestamptz not null default now()
);

-- Itens extraidos da nota, em estagio de revisao ANTES de virarem pantry_items.
-- Isso existe de proposito: nao confiamos cegamente na extracao por visao.
create table receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references receipts(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  state_guess text check (state_guess in ('base', 'ingrediente', 'preparado')),
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

-- O pedido em texto livre do usuario ("vou receber um casal de amigos...")
create table meal_requests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  prompt_text text not null,
  extracted_context jsonb,
  created_at timestamptz not null default now()
);

-- A sugestao gerada pelo Claude (com tool use real consultando estoque/preferencias)
create table meal_suggestions (
  id uuid primary key default gen_random_uuid(),
  meal_request_id uuid not null references meal_requests(id) on delete cascade,
  suggestion_text text not null,
  items_used jsonb not null default '[]', -- [{item_id, quantidade}, ...] — reportado pelo Claude via a tool registrar_itens_usados
  model_used text,
  prompt_version text,
  trace_id text,
  created_at timestamptz not null default now()
);

-- O evento de confirmacao ("fiz essa receita") que de fato abate o estoque.
-- So existe DEPOIS dessa confirmacao — nao decrementamos so por ter sugerido.
create table stock_consumptions (
  id uuid primary key default gen_random_uuid(),
  meal_suggestion_id uuid not null references meal_suggestions(id) on delete cascade,
  confirmed_at timestamptz not null default now(),
  items_consumed jsonb not null default '[]' -- [{name, quantity, unit}, ...] — retrato tirado na hora da confirmacao, nao depende do item ainda existir no estoque depois
);

-- ---------------------------------------------------------------------
-- v3 "Musa Balance": atores em competicao pelo mesmo recurso (a decisao do
-- que cozinhar), no lugar da casa como bloco unico e indiferenciado.
-- ---------------------------------------------------------------------

-- Cada pessoa que participa da decisao. Multi-canal: web e Telegram
-- resolvem pra mesma identidade via telegram_user_id (null ate o ator
-- mandar a primeira mensagem no bot).
create table actors (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  role text not null check (role in ('chef', 'musa')),
  telegram_user_id bigint unique,
  created_at timestamptz not null default now()
);

-- Teto semanal calorico/financeiro. E' contra isso que
-- consultar_orcamento_semanal soma o gasto real de meal_reports — sempre em
-- codigo, nunca calculado pelo Claude (regra de ouro do v3-musa-balance.md).
create table weekly_budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  week_start date not null,
  calorie_cap numeric,
  financial_cap numeric,
  created_at timestamptz not null default now(),
  unique (household_id, week_start)
);

-- Relato de refeicao de um ator — materia-prima do orcamento semanal e do
-- lembrete de dado ausente. "source" registra o canal de origem; nunca e'
-- inferido quando ausente, so cobrado via lembrete proativo (camada 5).
create table meal_reports (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references actors(id) on delete cascade,
  date date not null,
  description text not null,
  source text not null check (source in ('manual', 'telegram', 'reminder')),
  calories numeric,
  cost numeric,
  -- de qual "carteira" saiu o gasto — nao entra na conta do orcamento real
  -- da casa quando e' TR (vale-refeicao), so quando e' credito_familia.
  budget_categoria text check (budget_categoria in ('tr_diego', 'tr_esposa', 'credito_familia')),
  -- fase 3: distingue refeicao caseira de delivery/restaurante — materia-prima
  -- pro Agente Mediador notar (ou nao — de proposito nao forcado) a tensao
  -- entre pedir fora e porcoes caseiras envelhecendo sem uso.
  fonte_refeicao text check (fonte_refeicao in ('caseira', 'delivery', 'restaurante')),
  created_at timestamptz not null default now()
);

-- Metas diarias por ator — repositorio de configuracao editavel, nao log.
-- calorie_cap_daily substitui a nocao de teto semanal generico por algo por
-- pessoa/dia. Macros ficam nulos ate a nutricionista entrar em cena de
-- verdade (caso de uso futuro, registrado explicitamente — nao inventar
-- recomendacao de macro sem orientacao profissional real).
create table actor_daily_targets (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references actors(id) on delete cascade,
  calorie_cap_daily numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (actor_id)
);

-- Decisao do Agente Mediador: ele nao decide sozinho, expoe a proposta e o
-- trade-off e registra quem escolheu o que. "proposta" e "escolha" sao
-- retratos (jsonb) tomados na hora — no mesmo espirito de
-- stock_consumptions.items_consumed, nao sao referencia viva a outra tabela.
create table trade_off_decisions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  week_start date not null,
  proposta jsonb not null,
  escolhida_por uuid references actors(id),
  escolha jsonb,
  created_at timestamptz not null default now()
);

-- Log cru de tudo que o Agente de Ingestao classificou — relato de refeicao,
-- desejo OU aquisicao (compra), sem distincao de importancia. E' a
-- materia-prima do icone "balao de pensamento" da UI e do estagio "Adquirir"
-- do Kanban. Uma aquisicao pode nascer sem budget_categoria (status
-- 'aguardando_categoria') ate o bot perguntar e a pessoa responder pelo
-- botao no Telegram — so entao vira 'completo'.
create table pensamentos (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references actors(id) on delete cascade,
  tipo text not null check (tipo in ('relato_refeicao', 'desejo', 'aquisicao', 'desperdicio')),
  descricao text not null,
  data date,
  calorias numeric,
  custo numeric,
  budget_categoria text check (budget_categoria in ('tr_diego', 'tr_esposa', 'credito_familia')),
  status text not null default 'completo' check (status in ('completo', 'aguardando_categoria')),
  fonte_refeicao text check (fonte_refeicao in ('caseira', 'delivery', 'restaurante')),
  -- fase 3: dado APRENDIDO, nao configurado. So preenchido quando tipo=
  -- desperdicio E o sistema conseguiu casar o relato com um pantry_item
  -- 'preparado' ainda vivo — dias entre prepared_at e este relato. E' o
  -- ponto de dado bruto pra uma futura camada de "quanto tempo esse prato
  -- costuma durar" — nao consumido por nada ainda nesta versao.
  dias_desde_preparo numeric,
  trace_id text,
  created_at timestamptz not null default now()
);

-- Um domicilio padrao para o prototipo funcionar sem tela de "criar conta"
insert into households (name) values ('Casa de teste — curso Alura');

-- ---------------------------------------------------------------------
-- Migracoes (rodadas manualmente no SQL Editor, apos o schema inicial)
-- ---------------------------------------------------------------------

-- 2026-07-31: log de consumo real dentro da geladeira — guarda o retrato
-- (nome/quantidade/unidade) de cada item consumido na confirmacao.
-- alter table stock_consumptions
--   add column items_consumed jsonb not null default '[]';

-- 2026-07-31: categorizacao seco/perecivel — separa a lista do estoque em
-- despensa (seco) e geladeira (perecivel), pra UI virar visual de verdade.
-- alter table pantry_items
--   add column storage text not null default 'seco' check (storage in ('seco', 'perecivel'));

-- 2026-08-02: v3 "Musa Balance" — atores, orcamento semanal, relatos de
-- refeicao e decisoes de trade-off. pantry_items ganha blanched_at pra
-- decaimento D-6 em codigo. RODADO no Supabase (RLS deixado desligado de
-- proposito — so o service role key toca essas tabelas, nunca anon/authenticated,
-- ver CLAUDE.md/plano v3 sobre RLS ter sido adiado).
-- alter table pantry_items
--   add column if not exists blanched_at timestamptz;
-- alter table households
--   add column if not exists telegram_chat_id bigint;
-- create table actors (
--   id uuid primary key default gen_random_uuid(),
--   household_id uuid not null references households(id) on delete cascade,
--   name text not null,
--   role text not null check (role in ('chef', 'musa')),
--   telegram_user_id bigint unique,
--   created_at timestamptz not null default now()
-- );
-- create table weekly_budgets (
--   id uuid primary key default gen_random_uuid(),
--   household_id uuid not null references households(id) on delete cascade,
--   week_start date not null,
--   calorie_cap numeric,
--   financial_cap numeric,
--   created_at timestamptz not null default now(),
--   unique (household_id, week_start)
-- );
-- create table meal_reports (
--   id uuid primary key default gen_random_uuid(),
--   actor_id uuid not null references actors(id) on delete cascade,
--   date date not null,
--   description text not null,
--   source text not null check (source in ('manual', 'telegram', 'reminder')),
--   calories numeric,
--   cost numeric,
--   created_at timestamptz not null default now()
-- );
-- create table trade_off_decisions (
--   id uuid primary key default gen_random_uuid(),
--   household_id uuid not null references households(id) on delete cascade,
--   week_start date not null,
--   proposta jsonb not null,
--   escolhida_por uuid references actors(id),
--   escolha jsonb,
--   created_at timestamptz not null default now()
-- );
-- create table pensamentos (
--   id uuid primary key default gen_random_uuid(),
--   actor_id uuid not null references actors(id) on delete cascade,
--   tipo text not null check (tipo in ('relato_refeicao', 'desejo')),
--   descricao text not null,
--   data date,
--   calorias numeric,
--   custo numeric,
--   trace_id text,
--   created_at timestamptz not null default now()
-- );
-- insert into actors (household_id, name, role)
--   select id, 'Diego', 'chef' from households limit 1;
-- insert into actors (household_id, name, role)
--   select id, 'Esposa', 'musa' from households limit 1;

-- ---------------------------------------------------------------------
-- PENDENTE — ainda NAO rodado no Supabase. Rodar manualmente no SQL Editor,
-- depois comentar este bloco como historico igual aos de cima.
-- ---------------------------------------------------------------------

-- 2026-08-02: "Musa Balance" fase 2 — porcionamento, config editavel
-- (validade, metas diarias/macro por ator), e atribuicao de orcamento
-- (TR Diego / TR Esposa / Credito Familia) em compras e relatos.

alter table pantry_items
  add column if not exists portions_total numeric,
  add column if not exists portions_remaining numeric;

alter table households
  add column if not exists dias_validade_pos_branqueamento numeric not null default 6;

alter table meal_reports
  add column if not exists budget_categoria text check (budget_categoria in ('tr_diego', 'tr_esposa', 'credito_familia'));

create table if not exists actor_daily_targets (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references actors(id) on delete cascade,
  calorie_cap_daily numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (actor_id)
);

alter table pensamentos
  add column if not exists budget_categoria text check (budget_categoria in ('tr_diego', 'tr_esposa', 'credito_familia')),
  add column if not exists status text not null default 'completo' check (status in ('completo', 'aguardando_categoria'));

alter table pensamentos drop constraint if exists pensamentos_tipo_check;
alter table pensamentos add constraint pensamentos_tipo_check check (tipo in ('relato_refeicao', 'desejo', 'aquisicao'));

-- ---------------------------------------------------------------------
-- PENDENTE fase 3 — ainda NAO rodado no Supabase.
-- ---------------------------------------------------------------------

-- 2026-08-02: "Musa Balance" fase 3 — validade de prato pronto aprendida
-- (nao configurada), fonte da refeicao (caseira/delivery/restaurante) pro
-- Mediador notar tensao de desperdicio, e tipo 'desperdicio' em pensamentos.

alter table pantry_items
  add column if not exists prepared_at timestamptz;

alter table meal_reports
  add column if not exists fonte_refeicao text check (fonte_refeicao in ('caseira', 'delivery', 'restaurante'));

alter table pensamentos
  add column if not exists fonte_refeicao text check (fonte_refeicao in ('caseira', 'delivery', 'restaurante')),
  add column if not exists dias_desde_preparo numeric;

alter table pensamentos drop constraint if exists pensamentos_tipo_check;
alter table pensamentos add constraint pensamentos_tipo_check check (tipo in ('relato_refeicao', 'desejo', 'aquisicao', 'desperdicio'));
