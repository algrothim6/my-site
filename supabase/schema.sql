-- ============================================================
-- الدولة الجروبية — Supabase schema
-- Run this once in Supabase SQL Editor (Dashboard → SQL → New query)
-- ============================================================

create table if not exists public.users (
  id text primary key,
  name text,
  email text unique,
  password_hash text,
  national_id text,
  balance integer default 5000,
  role text default 'citizen',
  created_at timestamptz default now(),
  salary_claimed_at timestamptz,
  voted_for text,
  law_votes jsonb default '{}'::jsonb,
  token text unique
);

create table if not exists public.bank (
  id text primary key,
  reserve bigint default 1000000,
  issued bigint default 0,
  collected bigint default 0,
  spent bigint default 0,
  exchange_rate numeric default 3.75
);

create table if not exists public.settings (
  id text primary key,
  speaker text,
  judge text default 'ادم وائل إسماعيل'
);

create table if not exists public.transactions (
  id text primary key,
  user_id text,
  title text,
  amount integer,
  type text,
  date text,
  created_at timestamptz default now()
);

create table if not exists public.candidates (
  id text primary key,
  name text,
  slogan text,
  votes integer default 0
);

create table if not exists public.laws (
  id text primary key,
  title text,
  description text,
  yes integer default 0,
  no integer default 0,
  status text default 'open'
);

create table if not exists public.violations (
  id text primary key,
  user_id text,
  title text,
  amount integer,
  paid boolean default false,
  date text
);

create table if not exists public.cases (
  id text primary key,
  title text,
  defendant text,
  status text,
  date text
);

create table if not exists public.businesses (
  id text primary key,
  owner_id text,
  owner_name text,
  name text,
  type text,
  category text,
  created_at timestamptz default now()
);

create table if not exists public.sales (
  id text primary key,
  title text,
  amount integer,
  tax integer,
  date text
);

create table if not exists public.rooms (
  id text primary key,
  name text,
  game text,
  code text,
  host text,
  players jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.articles (
  id text primary key,
  title text,
  source text,
  body text,
  date text
);

create table if not exists public.projects (
  id text primary key,
  name text,
  value bigint,
  status text
);

-- Extra columns for the expanded features (safe to re-run this whole file)
alter table public.settings add column if not exists flag text;
alter table public.settings add column if not exists anthem text;
alter table public.rooms add column if not exists phase text default 'waiting';
alter table public.rooms add column if not exists word text;
alter table public.rooms add column if not exists roles jsonb default '{}'::jsonb;

-- Public demo access: this is a fictional hobby app with no real money.
-- Everyone (anon key) may read and write, exactly like the original's public demo.
do $$
declare t text;
begin
  foreach t in array array[
    'users','bank','settings','transactions','candidates','laws',
    'violations','cases','businesses','sales','rooms','articles','projects'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists public_access on public.%I', t);
    execute format('create policy public_access on public.%I for all to anon, authenticated using (true) with check (true)', t);
    execute format('grant all on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- Done. Now paste Project URL + anon key into supabase/config.js
