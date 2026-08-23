import { randomBytes } from 'node:crypto'
import type {
  CreateItem,
  ItemListItem,
  ItemsListQuery,
  MembershipRole,
} from '@sonari/types'
import { ForbiddenError } from '../../lib/errors.js'
import { serviceDb } from '../../plugins/service-db.js'

type ItemRow = {
  id: string
  tenant_id: string
  branch_id: string
  category_id: string | null
  sku: string
  barcode: string | null
  huid: string | null
  name: string
  metal: string
  purity: number | null
  gross_weight: number | null
  net_weight: number | null
  status: string
  making_charge_type: string
  making_charge_value: number
  wastage_percent: number
  hsn_code: string
  tax_rate: number
  cost_price: number | null
}

function canSeeCost(role: MembershipRole | null): boolean {
  return role === 'store_owner' || role === 'manager' || role === 'super_admin'
}

function mapItem(row: ItemRow, includeCost: boolean): ItemListItem {
  const item: ItemListItem = {
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    categoryId: row.category_id,
    sku: row.sku,
    barcode: row.barcode,
    huid: row.huid,
    name: row.name,
    metal: row.metal as ItemListItem['metal'],
    purity: row.purity === null ? null : String(row.purity),
    grossWeight: row.gross_weight === null ? null : Number(row.gross_weight).toFixed(3),
    netWeight: row.net_weight === null ? null : Number(row.net_weight).toFixed(3),
    status: row.status as ItemListItem['status'],
    makingChargeType: row.making_charge_type as ItemListItem['makingChargeType'],
    makingChargeValue: Number(row.making_charge_value).toFixed(2),
    wastagePercent: Number(row.wastage_percent).toFixed(3),
    hsnCode: row.hsn_code,
    taxRate: Number(row.tax_rate).toFixed(3),
  }

  if (includeCost) {
    item.costPrice =
      row.cost_price === null ? null : Number(row.cost_price).toFixed(2)
  }

  return item
}

function generateSku(): string {
  return `SKU-${randomBytes(4).toString('hex').toUpperCase()}`
}

export async function listItems(
  tenantId: string,
  role: MembershipRole | null,
  query: ItemsListQuery,
): Promise<{ items: ItemListItem[]; nextCursor: string | null }> {
  const limit = query.limit ?? 50
  const includeCost = canSeeCost(role)

  let dbQuery = serviceDb
    .from('items')
    .select(
      'id, tenant_id, branch_id, category_id, sku, barcode, huid, name, metal, purity, gross_weight, net_weight, status, making_charge_type, making_charge_value, wastage_percent, hsn_code, tax_rate, cost_price',
    )
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (query.status) {
    dbQuery = dbQuery.eq('status', query.status)
  }
  if (query.category) {
    dbQuery = dbQuery.eq('category_id', query.category)
  }
  if (query.q) {
    dbQuery = dbQuery.or(
      `name.ilike.%${query.q}%,sku.ilike.%${query.q}%,barcode.ilike.%${query.q}%`,
    )
  }
  if (query.cursor) {
    dbQuery = dbQuery.lt('id', query.cursor)
  }

  const { data, error } = await dbQuery
  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as ItemRow[]
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null

  return {
    items: page.map((row) => mapItem(row, includeCost)),
    nextCursor,
  }
}

export async function createItem(
  tenantId: string,
  role: MembershipRole | null,
  input: CreateItem,
): Promise<ItemListItem> {
  if (!role || !['store_owner', 'manager', 'staff', 'super_admin'].includes(role)) {
    throw new ForbiddenError()
  }

  if (input.costPrice !== undefined && !canSeeCost(role)) {
    throw new ForbiddenError('Staff cannot set cost price')
  }

  const sku = input.sku?.trim() || generateSku()

  const { data, error } = await serviceDb
    .from('items')
    .insert({
      tenant_id: tenantId,
      branch_id: input.branchId,
      category_id: input.categoryId ?? null,
      sku,
      barcode: input.barcode ?? null,
      huid: input.huid ?? null,
      name: input.name,
      metal: input.metal,
      purity: input.purity ?? null,
      gross_weight: input.grossWeight ?? null,
      net_weight: input.netWeight ?? null,
      making_charge_type: input.makingChargeType ?? 'flat',
      making_charge_value: input.makingChargeValue ?? '0',
      wastage_percent: input.wastagePercent ?? 0,
      hsn_code: input.hsnCode ?? '7113',
      tax_rate: input.taxRate ?? 3,
      cost_price: input.costPrice ?? null,
      status: 'in_stock',
    })
    .select(
      'id, tenant_id, branch_id, category_id, sku, barcode, huid, name, metal, purity, gross_weight, net_weight, status, making_charge_type, making_charge_value, wastage_percent, hsn_code, tax_rate, cost_price',
    )
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create item')
  }

  return mapItem(data as ItemRow, canSeeCost(role))
}
