import type {
  Category,
  CreateCategory,
  MembershipRole,
  UpdateCategory,
} from '@sonari/types'
import { NotFoundError } from '../../lib/errors.js'
import { serviceDb } from '../../plugins/service-db.js'
import { assertOwnerOrManager } from '../auth/service.js'

type CategoryRow = {
  id: string
  tenant_id: string
  parent_id: string | null
  name: string
  slug: string
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    parentId: row.parent_id,
    name: row.name,
    slug: row.slug,
  }
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'category'
}

export async function listCategories(tenantId: string): Promise<Category[]> {
  const { data, error } = await serviceDb
    .from('categories')
    .select('id, tenant_id, parent_id, name, slug')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as CategoryRow[]).map(mapCategory)
}

export async function createCategory(
  tenantId: string,
  role: MembershipRole | null,
  input: CreateCategory,
): Promise<Category> {
  assertOwnerOrManager(role)

  const slug = input.slug?.trim() || toSlug(input.name)
  const { data, error } = await serviceDb
    .from('categories')
    .insert({
      tenant_id: tenantId,
      parent_id: input.parentId ?? null,
      name: input.name,
      slug,
    })
    .select('id, tenant_id, parent_id, name, slug')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create category')
  }

  return mapCategory(data as CategoryRow)
}

export async function updateCategory(
  tenantId: string,
  categoryId: string,
  role: MembershipRole | null,
  input: UpdateCategory,
): Promise<Category> {
  assertOwnerOrManager(role)

  const { data: existing, error: findError } = await serviceDb
    .from('categories')
    .select('id, tenant_id, parent_id, name, slug')
    .eq('id', categoryId)
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (findError || !existing) {
    throw new NotFoundError('Category')
  }

  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.parentId !== undefined) patch.parent_id = input.parentId
  if (input.slug !== undefined) patch.slug = input.slug
  else if (input.name !== undefined) patch.slug = toSlug(input.name)

  if (Object.keys(patch).length === 0) {
    return mapCategory(existing as CategoryRow)
  }

  const { data, error } = await serviceDb
    .from('categories')
    .update(patch)
    .eq('id', categoryId)
    .eq('tenant_id', tenantId)
    .select('id, tenant_id, parent_id, name, slug')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update category')
  }

  return mapCategory(data as CategoryRow)
}

export async function deleteCategory(
  tenantId: string,
  categoryId: string,
  role: MembershipRole | null,
): Promise<void> {
  assertOwnerOrManager(role)

  const { error, count } = await serviceDb
    .from('categories')
    .delete({ count: 'exact' })
    .eq('id', categoryId)
    .eq('tenant_id', tenantId)

  if (error) {
    throw new Error(error.message)
  }
  if (!count) {
    throw new NotFoundError('Category')
  }
}
