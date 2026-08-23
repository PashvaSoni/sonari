-- Mirror of supabase/migrations/20260823070134_inventory_items.sql

CREATE TYPE public.item_metal AS ENUM ('gold', 'silver', 'platinum', 'other');

CREATE TYPE public.making_charge_type AS ENUM ('flat', 'per_gram', 'percent');

CREATE TYPE public.item_status AS ENUM (
  'in_stock',
  'sold',
  'reserved',
  'in_repair',
  'with_karigar',
  'melted'
);

CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches (id),
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  sku text NOT NULL,
  barcode text,
  huid text,
  name text NOT NULL,
  description text,
  metal public.item_metal NOT NULL,
  purity numeric(6, 3),
  gross_weight numeric(10, 3),
  net_weight numeric(10, 3),
  stone_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  making_charge_type public.making_charge_type NOT NULL DEFAULT 'flat',
  making_charge_value numeric(14, 2) NOT NULL DEFAULT 0,
  wastage_percent numeric(6, 3) NOT NULL DEFAULT 0,
  hsn_code text NOT NULL DEFAULT '7113',
  tax_rate numeric(6, 3) NOT NULL DEFAULT 3.0,
  status public.item_status NOT NULL DEFAULT 'in_stock',
  cost_price numeric(14, 2),
  images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, sku)
);

CREATE UNIQUE INDEX items_tenant_barcode_uidx
  ON public.items (tenant_id, barcode)
  WHERE barcode IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX items_tenant_status_idx ON public.items (tenant_id, status);
CREATE INDEX items_tenant_barcode_idx ON public.items (tenant_id, barcode);
CREATE INDEX items_branch_id_idx ON public.items (branch_id);
CREATE INDEX items_category_id_idx ON public.items (category_id);

CREATE TRIGGER items_set_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY items_read ON public.items
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.user_has_active_membership(tenant_id)
    )
  );

CREATE POLICY items_insert ON public.items
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager', 'staff')
    )
  );

CREATE POLICY items_update ON public.items
  FOR UPDATE TO authenticated
  USING (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager', 'staff')
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager', 'staff')
    )
  );
