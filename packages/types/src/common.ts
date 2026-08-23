import { z } from 'zod'

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string().optional(),
  }),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

export const AddressSchema = z.object({
  line1: z.string().max(200).optional(),
  line2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
})

export type Address = z.infer<typeof AddressSchema>

export const MembershipRoleSchema = z.enum([
  'super_admin',
  'store_owner',
  'manager',
  'staff',
  'karigar',
])

export type MembershipRole = z.infer<typeof MembershipRoleSchema>

export const TenantStatusSchema = z.enum([
  'trial',
  'active',
  'past_due',
  'suspended',
  'cancelled',
])

export type TenantStatus = z.infer<typeof TenantStatusSchema>

export const MetalTypeSchema = z.enum(['gold', 'silver', 'platinum'])

export type MetalType = z.infer<typeof MetalTypeSchema>
