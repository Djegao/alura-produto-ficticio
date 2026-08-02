-- Schema do produto ficticio "Chef Caseiro" — Alura, curso Evals/Observabilidade/Conformidade
-- Rode isso no Supabase: Dashboard do projeto -> SQL Editor -> New query -> colar -> Run

create extension if not exists pgcrypto;

-- O domicilio (1 registro neste prototipo, mas correto ter a entidade separada
-- das preferencias e do estoque, ja que sao coisas que crescem independentemente)
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Minha casa',
  created_at timestamptz not null default now()
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
  created_at timestamptz not null default now()
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
