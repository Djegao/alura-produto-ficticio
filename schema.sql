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
  source text, -- 'nota_fiscal', 'manual', etc.
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

-- Um domicilio padrao para o prototipo funcionar sem tela de "criar conta"
insert into households (name) values ('Casa de teste — curso Alura');

-- ---------------------------------------------------------------------
-- Migracoes (rodadas manualmente no SQL Editor, apos o schema inicial)
-- ---------------------------------------------------------------------

-- 2026-07-31: log de consumo real dentro da geladeira — guarda o retrato
-- (nome/quantidade/unidade) de cada item consumido na confirmacao.
-- alter table stock_consumptions
--   add column items_consumed jsonb not null default '[]';
