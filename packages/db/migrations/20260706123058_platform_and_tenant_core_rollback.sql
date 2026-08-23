DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();

DROP TABLE IF EXISTS public.memberships CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.feature_flags CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;

DROP FUNCTION IF EXISTS public.user_has_active_membership(uuid);
DROP FUNCTION IF EXISTS public.is_super_admin();
DROP FUNCTION IF EXISTS public.jwt_role();
DROP FUNCTION IF EXISTS public.jwt_tenant_id();
DROP FUNCTION IF EXISTS public.set_updated_at();

DROP TYPE IF EXISTS public.membership_status;
DROP TYPE IF EXISTS public.membership_role;
DROP TYPE IF EXISTS public.tenant_status;
