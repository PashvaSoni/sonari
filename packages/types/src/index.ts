import { z } from 'zod'

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  timestamp: z.string().datetime(),
})

export type HealthResponse = z.infer<typeof HealthResponseSchema>

export * from './common.js'
export * from './auth.js'
export * from './store.js'
export * from './inventory.js'
