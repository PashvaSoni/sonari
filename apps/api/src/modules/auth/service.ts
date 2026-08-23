import { randomBytes } from 'node:crypto'
import type { BootstrapRequest, BootstrapResponse, MembershipRole } from '@sonari/types'
import { ConflictError, ForbiddenError } from '../../lib/errors.js'
import { serviceDb } from '../../plugins/service-db.js'

const TRIAL_PLAN_ID = '00000000-0000-0000-0000-000000000001'

function toSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  const suffix = randomBytes(3).toString('hex')
  return `${base || 'store'}-${suffix}`
}

async function ensurePublicUser(userId: string, fullName?: string): Promise<void> {
  const { data: existing } = await serviceDb.from('users').select('id').eq('id', userId).maybeSingle()
  if (existing) {
    if (fullName) {
      await serviceDb.from('users').update({ full_name: fullName }).eq('id', userId)
    }
    return
  }

  const { data: authUser, error: authError } = await serviceDb.auth.admin.getUserById(userId)
  if (authError || !authUser.user) {
    throw new ForbiddenError('Auth user not found')
  }

  await serviceDb.from('users').insert({
    id: userId,
    email: authUser.user.email,
    phone: authUser.user.phone,
    full_name: fullName ?? authUser.user.user_metadata?.full_name ?? null,
  })
}

async function setUserClaims(
  userId: string,
  tenantId: string,
  role: MembershipRole,
  branchIds: string[],
): Promise<void> {
  const { error } = await serviceDb.auth.admin.updateUserById(userId, {
    app_metadata: {
      tenant_id: tenantId,
      role,
      branch_ids: branchIds,
    },
  })
  if (error) {
    throw new Error(`Failed to update auth claims: ${error.message}`)
  }
}

export async function bootstrapTenant(
  userId: string,
  input: BootstrapRequest,
): Promise<BootstrapResponse> {
  const { data: existingMembership } = await serviceDb
    .from('memberships')
    .select('id, tenant_id, role')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (existingMembership) {
    return {
      tenantId: existingMembership.tenant_id,
      role: existingMembership.role as MembershipRole,
    }
  }

  await ensurePublicUser(userId, input.fullName)

  const slug = toSlug(input.storeName)
  const { data: tenant, error: tenantError } = await serviceDb
    .from('tenants')
    .insert({
      name: input.storeName,
      slug,
      plan_id: TRIAL_PLAN_ID,
      status: 'trial',
    })
    .select('id')
    .single()

  if (tenantError || !tenant) {
    throw new Error(tenantError?.message ?? 'Failed to create tenant')
  }

  const { error: membershipError } = await serviceDb.from('memberships').insert({
    user_id: userId,
    tenant_id: tenant.id,
    role: 'store_owner',
    status: 'active',
  })

  if (membershipError) {
    await serviceDb.from('tenants').delete().eq('id', tenant.id)
    throw new Error(membershipError.message)
  }

  await serviceDb
    .from('users')
    .update({ default_tenant_id: tenant.id, full_name: input.fullName ?? undefined })
    .eq('id', userId)

  await setUserClaims(userId, tenant.id, 'store_owner', [])

  return { tenantId: tenant.id, role: 'store_owner' }
}

export async function getAuthSession(userId: string, email: string | null) {
  const { data: membership } = await serviceDb
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  return {
    userId,
    email,
    tenantId: membership?.tenant_id ?? null,
    role: (membership?.role as MembershipRole | undefined) ?? null,
    bootstrapped: Boolean(membership),
  }
}

export function assertOwnerOrManager(role: MembershipRole | null): void {
  if (!role || !['store_owner', 'manager', 'super_admin'].includes(role)) {
    throw new ForbiddenError()
  }
}

export function assertTenant(tenantId: string | null): asserts tenantId is string {
  if (!tenantId) {
    throw new ConflictError('Complete store bootstrap before continuing')
  }
}
