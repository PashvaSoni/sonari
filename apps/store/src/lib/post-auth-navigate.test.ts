import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthSession } from '@sonari/types'
import { navigateAfterAuth } from './post-auth-navigate.js'

vi.mock('./api-client.js', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from './api-client.js'

const navigate = vi.fn()

describe('navigateAfterAuth', () => {
  beforeEach(() => {
    navigate.mockReset()
    vi.mocked(apiFetch).mockReset()
  })

  it('sends unbootstrapped users to signup', async () => {
    const session: AuthSession = {
      userId: '00000000-0000-0000-0000-000000000001',
      email: 'a@example.com',
      tenantId: null,
      role: null,
      bootstrapped: false,
    }

    await navigateAfterAuth(navigate, session)

    expect(navigate).toHaveBeenCalledWith('/signup', { replace: true })
  })

  it('sends bootstrapped users with incomplete onboarding to onboarding', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      onboarding: { hasBranch: false, hasRates: false },
    })

    const session: AuthSession = {
      userId: '00000000-0000-0000-0000-000000000001',
      email: 'a@example.com',
      tenantId: '00000000-0000-0000-0000-000000000002',
      role: 'store_owner',
      bootstrapped: true,
    }

    await navigateAfterAuth(navigate, session)

    expect(navigate).toHaveBeenCalledWith('/onboarding', { replace: true })
  })
})
