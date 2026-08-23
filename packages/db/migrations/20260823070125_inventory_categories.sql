-- Mirror of supabase/migrations/20260823070125_inventory_categories.sql

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE INDEX categories_tenant_id_idx ON public.categories (tenant_id);
CREATE INDEX categories_parent_id_idx ON public.categories (parent_id);

CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_read ON public.categories
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.user_has_active_membership(tenant_id)
    )
  );

CREATE POLICY categories_insert ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager')
    )
  );

CREATE POLICY categories_update ON public.categories
  FOR UPDATE TO authenticated
  USING (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager')
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager')
    )
  );

CREATE POLICY categories_delete ON public.categories
  FOR DELETE TO authenticated
  USING (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager')
    )
  );
