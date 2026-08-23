import type {
  Branch,
  CreateBranch,
  CreateMetalRate,
  MetalRate,
  MembershipRole,
  TenantProfile,
  UpdateBranch,
  UpdateStoreProfile,
} from '@sonari/types'
import { throwIfDbError } from '../../lib/db-error.js'
import { NotFoundError } from '../../lib/errors.js'
import { serviceDb } from '../../plugins/service-db.js'
import { assertOwnerOrManager, assertTenant } from '../auth/service.js'

type TenantRow = {
  id: string
  name: string
  slug: string
  status: string
  gstin: string | null
  country: string
  timezone: string
  currency: string
  trial_ends_at: string
}

type BranchRow = {
  id: string
  tenant_id: string
  name: string
  is_default: boolean
  address: Record<string, string | undefined>
  gstin: string | null
  phone: string | null
  email: string | null
  invoice_prefix: string | null
}

type RateRow = {
  id: string
  tenant_id: string
  metal: string
  purity: number
  rate_per_gram: number
  effective_from: string
}

function mapBranch(row: BranchRow): Branch {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    isDefault: row.is_default,
    address: row.address ?? {},
    gstin: row.gstin,
    phone: row.phone,
    email: row.email,
    invoicePrefix: row.invoice_prefix,
  }
}

function mapRate(row: RateRow): MetalRate {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    metal: row.metal as MetalRate['metal'],
    purity: String(row.purity),
    ratePerGram: Number(row.rate_per_gram).toFixed(2),
    effectiveFrom: new Date(row.effective_from).toISOString(),
  }
}

async function getOnboardingStatus(tenantId: string) {
  const [branchResult, rateResult] = await Promise.all([
    serviceDb
      .from('branches')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null),
    serviceDb
      .from('metal_rates')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),
  ])

  throwIfDbError(branchResult.error, 'Failed to load branch onboarding status')
  throwIfDbError(rateResult.error, 'Failed to load rates onboarding status')

  return {
    hasBranch: (branchResult.count ?? 0) > 0,
    hasRates: (rateResult.count ?? 0) > 0,
  }
}

export async function getStoreProfile(tenantId: string): Promise<TenantProfile> {
  const { data: tenant, error } = await serviceDb
    .from('tenants')
    .select('id, name, slug, status, gstin, country, timezone, currency, trial_ends_at')
    .eq('id', tenantId)
    .maybeSingle()

  if (error || !tenant) {
    throw new NotFoundError('Store')
  }

  const row = tenant as TenantRow
  const onboarding = await getOnboardingStatus(tenantId)

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as TenantProfile['status'],
    gstin: row.gstin,
    country: row.country,
    timezone: row.timezone,
    currency: row.currency,
    // Supabase returns offset timestamps; normalize to ISO-Z for Zod wire schema.
    trialEndsAt: new Date(row.trial_ends_at).toISOString(),
    onboarding,
  }
}

export async function updateStoreProfile(
  tenantId: string,
  role: MembershipRole | null,
  input: UpdateStoreProfile,
): Promise<TenantProfile> {
  assertOwnerOrManager(role as Parameters<typeof assertOwnerOrManager>[0])

  const patch: Record<string, string | null> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.gstin !== undefined) patch.gstin = input.gstin

  if (Object.keys(patch).length > 0) {
    const { error } = await serviceDb.from('tenants').update(patch).eq('id', tenantId)
    throwIfDbError(error, 'Failed to update store profile')
  }

  return getStoreProfile(tenantId)
}

export async function listBranches(tenantId: string): Promise<Branch[]> {
  const { data, error } = await serviceDb
    .from('branches')
    .select('id, tenant_id, name, is_default, address, gstin, phone, email, invoice_prefix')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  throwIfDbError(error, 'Failed to list branches')

  return (data as BranchRow[]).map(mapBranch)
}

export async function createBranch(
  tenantId: string,
  userId: string,
  role: MembershipRole | null,
  input: CreateBranch,
): Promise<Branch> {
  assertOwnerOrManager(role)

  const existing = await listBranches(tenantId)
  const isDefault = input.isDefault ?? existing.length === 0

  if (isDefault && existing.some((b) => b.isDefault)) {
    await serviceDb
      .from('branches')
      .update({ is_default: false })
      .eq('tenant_id', tenantId)
      .eq('is_default', true)
  }

  const { data, error } = await serviceDb
    .from('branches')
    .insert({
      tenant_id: tenantId,
      name: input.name,
      is_default: isDefault,
      address: input.address ?? {},
      gstin: input.gstin ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      invoice_prefix: input.invoicePrefix ?? null,
    })
    .select('id, tenant_id, name, is_default, address, gstin, phone, email, invoice_prefix')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create branch')
  }

  const branch = mapBranch(data as BranchRow)

  const { data: memberships } = await serviceDb
    .from('memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .eq('role', 'store_owner')
    .maybeSingle()

  if (memberships) {
    const branches = await listBranches(tenantId)
    const branchIds = branches.map((b) => b.id)
    await serviceDb.auth.admin.updateUserById(userId, {
      app_metadata: {
        tenant_id: tenantId,
        role: 'store_owner',
        branch_ids: branchIds,
      },
    })
  }

  return branch
}

export async function updateBranch(
  tenantId: string,
  branchId: string,
  role: MembershipRole | null,
  input: UpdateBranch,
): Promise<Branch> {
  assertOwnerOrManager(role)

  const { data: existing, error: findError } = await serviceDb
    .from('branches')
    .select('id, tenant_id, name, is_default, address, gstin, phone, email, invoice_prefix')
    .eq('id', branchId)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .maybeSingle()

  if (findError || !existing) {
    throw new NotFoundError('Branch')
  }

  if (input.isDefault === true) {
    await serviceDb
      .from('branches')
      .update({ is_default: false })
      .eq('tenant_id', tenantId)
      .eq('is_default', true)
      .neq('id', branchId)
  }

  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.address !== undefined) patch.address = input.address
  if (input.gstin !== undefined) patch.gstin = input.gstin
  if (input.phone !== undefined) patch.phone = input.phone
  if (input.email !== undefined) patch.email = input.email
  if (input.invoicePrefix !== undefined) patch.invoice_prefix = input.invoicePrefix
  if (input.isDefault !== undefined) patch.is_default = input.isDefault

  if (Object.keys(patch).length === 0) {
    return mapBranch(existing as BranchRow)
  }

  const { data, error } = await serviceDb
    .from('branches')
    .update(patch)
    .eq('id', branchId)
    .eq('tenant_id', tenantId)
    .select('id, tenant_id, name, is_default, address, gstin, phone, email, invoice_prefix')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update branch')
  }

  return mapBranch(data as BranchRow)
}

export async function getCurrentRates(tenantId: string): Promise<MetalRate[]> {
  const { data, error } = await serviceDb
    .from('metal_rates')
    .select('id, tenant_id, metal, purity, rate_per_gram, effective_from')
    .eq('tenant_id', tenantId)
    .order('effective_from', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const latestByKey = new Map<string, RateRow>()
  for (const row of (data ?? []) as RateRow[]) {
    const key = `${row.metal}:${row.purity}`
    if (!latestByKey.has(key)) {
      latestByKey.set(key, row)
    }
  }

  return [...latestByKey.values()].map(mapRate)
}

export async function createMetalRate(
  tenantId: string,
  userId: string,
  role: MembershipRole | null,
  input: CreateMetalRate,
): Promise<MetalRate> {
  assertOwnerOrManager(role)

  const { data, error } = await serviceDb
    .from('metal_rates')
    .insert({
      tenant_id: tenantId,
      metal: input.metal,
      purity: input.purity,
      rate_per_gram: input.ratePerGram,
      effective_from: input.effectiveFrom ?? new Date().toISOString(),
      source: 'manual',
      set_by: userId,
    })
    .select('id, tenant_id, metal, purity, rate_per_gram, effective_from')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create rate')
  }

  return mapRate(data as RateRow)
}

export async function getRateHistory(
  tenantId: string,
  from?: string,
  to?: string,
): Promise<MetalRate[]> {
  let query = serviceDb
    .from('metal_rates')
    .select('id, tenant_id, metal, purity, rate_per_gram, effective_from')
    .eq('tenant_id', tenantId)
    .order('effective_from', { ascending: false })
    .limit(200)

  if (from) {
    query = query.gte('effective_from', from)
  }
  if (to) {
    query = query.lte('effective_from', to)
  }

  const { data, error } = await query
  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as RateRow[]).map(mapRate)
}

export function requireTenantId(tenantId: string | null): string {
  assertTenant(tenantId)
  return tenantId
}
