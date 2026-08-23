import { z } from 'zod'

export const ItemMetalSchema = z.enum(['gold', 'silver', 'platinum', 'other'])
export type ItemMetal = z.infer<typeof ItemMetalSchema>

export const MakingChargeTypeSchema = z.enum(['flat', 'per_gram', 'percent'])
export type MakingChargeType = z.infer<typeof MakingChargeTypeSchema>

export const ItemStatusSchema = z.enum([
  'in_stock',
  'sold',
  'reserved',
  'in_repair',
  'with_karigar',
  'melted',
])
export type ItemStatus = z.infer<typeof ItemStatusSchema>

export const CategorySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  name: z.string(),
  slug: z.string(),
})

export type Category = z.infer<typeof CategorySchema>

export const CreateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  parentId: z.string().uuid().nullable().optional(),
  slug: z.string().trim().min(1).max(100).optional(),
})

export type CreateCategory = z.infer<typeof CreateCategorySchema>

export const UpdateCategorySchema = CreateCategorySchema.partial()
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>

export const CategoriesListResponseSchema = z.object({
  categories: z.array(CategorySchema),
})

export type CategoriesListResponse = z.infer<typeof CategoriesListResponseSchema>

export const ItemListItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  branchId: z.string().uuid(),
  categoryId: z.string().uuid().nullable(),
  sku: z.string(),
  barcode: z.string().nullable(),
  huid: z.string().nullable(),
  name: z.string(),
  metal: ItemMetalSchema,
  purity: z.string().nullable(),
  grossWeight: z.string().nullable(),
  netWeight: z.string().nullable(),
  status: ItemStatusSchema,
  makingChargeType: MakingChargeTypeSchema,
  makingChargeValue: z.string(),
  wastagePercent: z.string(),
  hsnCode: z.string(),
  taxRate: z.string(),
  /** Hidden from staff in UI — only returned for owner/manager */
  costPrice: z.string().nullable().optional(),
})

export type ItemListItem = z.infer<typeof ItemListItemSchema>

export const ItemsListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().uuid().optional(),
  status: ItemStatusSchema.optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

export type ItemsListQuery = z.infer<typeof ItemsListQuerySchema>

export const ItemsListResponseSchema = z.object({
  items: z.array(ItemListItemSchema),
  nextCursor: z.string().uuid().nullable(),
})

export type ItemsListResponse = z.infer<typeof ItemsListResponseSchema>

export const CreateItemSchema = z.object({
  branchId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(200),
  metal: ItemMetalSchema,
  purity: z.number().min(0).max(100).optional(),
  grossWeight: z.string().regex(/^\d+(\.\d{1,3})?$/).optional(),
  netWeight: z.string().regex(/^\d+(\.\d{1,3})?$/).optional(),
  barcode: z.string().trim().max(64).optional(),
  huid: z.string().trim().max(6).optional(),
  makingChargeType: MakingChargeTypeSchema.optional(),
  makingChargeValue: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  wastagePercent: z.number().min(0).max(30).optional(),
  hsnCode: z.string().trim().max(16).optional(),
  taxRate: z.number().min(0).max(30).optional(),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  sku: z.string().trim().max(64).optional(),
})

export type CreateItem = z.infer<typeof CreateItemSchema>
