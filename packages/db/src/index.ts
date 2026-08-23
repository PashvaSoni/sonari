import { createClient, type SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js'

export type SonariSupabaseClient = SupabaseClient

/** Browser / staff client — uses anon key; RLS enforced. */
export function createAnonClient(
  url: string,
  anonKey: string,
  options?: SupabaseClientOptions<'public'>,
): SonariSupabaseClient {
  return createClient(url, anonKey, {
    ...options,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      ...options?.auth,
    },
  })
}

/** Server client — service role; bypasses RLS. API only, never ship to browser. */
export function createServiceClient(url: string, serviceRoleKey: string): SonariSupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/** Phase 0 probe table — proves migrations reach the remote project. */
export const PHASE0_PROBE_TABLE = '_sonari_schema_migrations_probe' as const
