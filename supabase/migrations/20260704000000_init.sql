-- Mirror of packages/db/migrations/20260704000000_init.sql
-- Supabase CLI applies files from supabase/migrations/ by default.

create table if not exists public._sonari_schema_migrations_probe (
  id int primary key generated always as identity,
  created_at timestamptz not null default now()
);

comment on table public._sonari_schema_migrations_probe is
  'Phase 0 probe table; safe to drop after Supabase is linked.';
