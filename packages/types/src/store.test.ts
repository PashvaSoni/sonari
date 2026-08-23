import { describe, expect, it } from 'vitest'
import { TenantProfileSchema } from './store.js'

describe('TenantProfileSchema', () => {
  it('accepts Supabase timestamptz with numeric offset', () => {
    const result = TenantProfileSchema.safeParse({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Mangaldeep',
      slug: 'mangaldeep-abc123',
      status: 'trial',
      gstin: null,
      country: 'IN',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      trialEndsAt: '2026-09-06T18:30:00+00:00',
      onboarding: { hasBranch: false, hasRates: false },
    })

    expect(result.success).toBe(true)
  })
})
