-- Phase 0 dummy migration — proves the migration runner path exists.
-- Real schema lands in Phase 1 per Plans/02-data-model.md.

create table if not exists public._sonari_schema_migrations_probe (
  id int primary key generated always as identity,
  created_at timestamptz not null default now()
);

comment on table public._sonari_schema_migrations_probe is
  'Phase 0 probe table; safe to drop after Supabase is linked.';
