-- Mirror of supabase/migrations/20260706123103_metal_rates.sql

CREATE TYPE public.metal_type AS ENUM ('gold', 'silver', 'platinum');

CREATE TYPE public.rate_source AS ENUM ('manual', 'feed');

CREATE TABLE public.metal_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  metal public.metal_type NOT NULL,
  purity numeric(6, 3) NOT NULL,
  rate_per_gram numeric(14, 2) NOT NULL CHECK (rate_per_gram >= 0),
  effective_from timestamptz NOT NULL DEFAULT now(),
  source public.rate_source NOT NULL DEFAULT 'manual',
  set_by uuid REFERENCES public.users (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX metal_rates_tenant_lookup_idx
  ON public.metal_rates (tenant_id, metal, purity, effective_from DESC);

ALTER TABLE public.metal_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY metal_rates_read ON public.metal_rates
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.user_has_active_membership(tenant_id)
    )
  );

CREATE POLICY metal_rates_insert ON public.metal_rates
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager')
    )
  );
