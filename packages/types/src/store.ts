import { z } from 'zod'
import { AddressSchema, MetalTypeSchema, TenantStatusSchema } from './common.js'

export const OnboardingStatusSchema = z.object({
  hasBranch: z.boolean(),
  hasRates: z.boolean(),
})

export type OnboardingStatus = z.infer<typeof OnboardingStatusSchema>

export const TenantProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: TenantStatusSchema,
  gstin: z.string().nullable(),
  country: z.string(),
  timezone: z.string(),
  currency: z.string(),
  trialEndsAt: z.string().datetime({ offset: true }),
  onboarding: OnboardingStatusSchema,
})

export type TenantProfile = z.infer<typeof TenantProfileSchema>

export const UpdateStoreProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  gstin: z.string().trim().max(15).nullable().optional(),
})

export type UpdateStoreProfile = z.infer<typeof UpdateStoreProfileSchema>

export const BranchSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  isDefault: z.boolean(),
  address: AddressSchema,
  gstin: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  invoicePrefix: z.string().nullable(),
})

export type Branch = z.infer<typeof BranchSchema>

export const CreateBranchSchema = z.object({
  name: z.string().trim().min(2).max(100),
  address: AddressSchema.optional(),
  gstin: z.string().trim().max(15).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().email().optional(),
  invoicePrefix: z.string().trim().max(30).optional(),
  isDefault: z.boolean().optional(),
})

export type CreateBranch = z.infer<typeof CreateBranchSchema>

export const UpdateBranchSchema = CreateBranchSchema.partial()

export type UpdateBranch = z.infer<typeof UpdateBranchSchema>

export const MetalRateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  metal: MetalTypeSchema,
  purity: z.string(),
  ratePerGram: z.string(),
  effectiveFrom: z.string().datetime(),
})

export type MetalRate = z.infer<typeof MetalRateSchema>

export const CreateMetalRateSchema = z.object({
  metal: MetalTypeSchema,
  purity: z.number().min(0).max(100),
  ratePerGram: z.string().regex(/^\d+(\.\d{1,2})?$/),
  effectiveFrom: z.string().datetime().optional(),
})

export type CreateMetalRate = z.infer<typeof CreateMetalRateSchema>

export const CurrentRatesResponseSchema = z.object({
  rates: z.array(MetalRateSchema),
})

export type CurrentRatesResponse = z.infer<typeof CurrentRatesResponseSchema>

export const RatesHistoryQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export type RatesHistoryQuery = z.infer<typeof RatesHistoryQuerySchema>

export const RatesHistoryResponseSchema = z.object({
  rates: z.array(MetalRateSchema),
})

export type RatesHistoryResponse = z.infer<typeof RatesHistoryResponseSchema>
