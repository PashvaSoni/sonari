import { z } from 'zod'
import { MembershipRoleSchema } from './common.js'

export const BootstrapRequestSchema = z.object({
  storeName: z.string().trim().min(2).max(100),
  fullName: z.string().trim().min(1).max(100).optional(),
})

export type BootstrapRequest = z.infer<typeof BootstrapRequestSchema>

export const BootstrapResponseSchema = z.object({
  tenantId: z.string().uuid(),
  role: MembershipRoleSchema,
})

export type BootstrapResponse = z.infer<typeof BootstrapResponseSchema>

export const AuthSessionSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().nullable(),
  tenantId: z.string().uuid().nullable(),
  role: MembershipRoleSchema.nullable(),
  bootstrapped: z.boolean(),
})

export type AuthSession = z.infer<typeof AuthSessionSchema>
