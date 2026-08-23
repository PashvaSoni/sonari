-- Platform + tenant core: plans, tenants, users, memberships, branches, feature_flags

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.tenant_status AS ENUM (
  'trial',
  'active',
  'past_due',
  'suspended',
  'cancelled'
);

CREATE TYPE public.membership_role AS ENUM (
  'super_admin',
  'store_owner',
  'manager',
  'staff',
  'karigar'
);

CREATE TYPE public.membership_status AS ENUM (
  'invited',
  'active',
  'disabled'
);

-- ---------------------------------------------------------------------------
-- Utilities
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.jwt_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(auth.jwt() -> 'app_metadata' ->> 'tenant_id', '')::uuid;
$$;

CREATE OR REPLACE FUNCTION public.jwt_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role';
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.jwt_role() = 'super_admin';
$$;

-- ---------------------------------------------------------------------------
-- plans
-- ---------------------------------------------------------------------------

CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_monthly_inr numeric(10, 2) NOT NULL DEFAULT 0,
  max_branches int NOT NULL DEFAULT 1,
  max_staff int NOT NULL DEFAULT 5,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER plans_set_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.plans (id, name, price_monthly_inr, max_branches, max_staff, features)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Trial',
  0,
  1,
  5,
  '{"voice": false, "karigar": false}'::jsonb
);

-- ---------------------------------------------------------------------------
-- tenants
-- ---------------------------------------------------------------------------

CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  plan_id uuid NOT NULL REFERENCES public.plans (id),
  status public.tenant_status NOT NULL DEFAULT 'trial',
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  gstin text,
  country text NOT NULL DEFAULT 'IN',
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  currency text NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tenants_status_idx ON public.tenants (status);

CREATE TRIGGER tenants_set_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- feature_flags
-- ---------------------------------------------------------------------------

CREATE TABLE public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants (id) ON DELETE CASCADE,
  flag_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  rollout_pct int NOT NULL DEFAULT 100 CHECK (rollout_pct >= 0 AND rollout_pct <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, flag_key)
);

CREATE INDEX feature_flags_tenant_id_idx ON public.feature_flags (tenant_id);

CREATE TRIGGER feature_flags_set_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- users (mirrors auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  email text,
  phone text,
  full_name text,
  avatar_url text,
  default_tenant_id uuid REFERENCES public.tenants (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- branches
-- ---------------------------------------------------------------------------

CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  gstin text,
  phone text,
  email text,
  logo_url text,
  invoice_prefix text,
  invoice_counter bigint NOT NULL DEFAULT 0,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX branches_one_default_per_tenant_idx
  ON public.branches (tenant_id)
  WHERE is_default = true AND deleted_at IS NULL;

CREATE INDEX branches_tenant_id_idx ON public.branches (tenant_id);

CREATE TRIGGER branches_set_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- memberships
-- ---------------------------------------------------------------------------

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches (id) ON DELETE SET NULL,
  role public.membership_role NOT NULL,
  status public.membership_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_id, branch_id)
);

CREATE INDEX memberships_user_id_idx ON public.memberships (user_id);
CREATE INDEX memberships_tenant_id_idx ON public.memberships (tenant_id);

-- Must be after memberships exists — LANGUAGE sql validates body at CREATE time
CREATE OR REPLACE FUNCTION public.user_has_active_membership(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.tenant_id = p_tenant_id
      AND m.status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
-- auth.users → public.users sync
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY plans_read ON public.plans
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY tenants_read ON public.tenants
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR public.user_has_active_membership(id)
  );

CREATE POLICY tenants_update ON public.tenants
  FOR UPDATE TO authenticated
  USING (
    public.is_super_admin()
    OR (
      id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager')
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager')
    )
  );

CREATE POLICY feature_flags_read ON public.feature_flags
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR tenant_id IS NULL
    OR tenant_id = public.jwt_tenant_id()
  );

CREATE POLICY users_read ON public.users
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.memberships m_self
      JOIN public.memberships m_other ON m_self.tenant_id = m_other.tenant_id
      WHERE m_self.user_id = auth.uid()
        AND m_other.user_id = public.users.id
        AND m_self.status = 'active'
        AND m_other.status = 'active'
    )
  );

CREATE POLICY users_update_self ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY branches_read ON public.branches
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.user_has_active_membership(tenant_id)
    )
  );

CREATE POLICY branches_insert ON public.branches
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager')
    )
  );

CREATE POLICY branches_update ON public.branches
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

CREATE POLICY memberships_read ON public.memberships
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR user_id = auth.uid()
    OR (
      tenant_id = public.jwt_tenant_id()
      AND public.jwt_role() IN ('store_owner', 'manager')
    )
  );
