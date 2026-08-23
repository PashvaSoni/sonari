import type { NavigateFunction } from 'react-router-dom'
import type { AuthSession } from '@sonari/types'
import { apiFetch } from './api-client.js'

type StoreOnboarding = {
  onboarding: { hasBranch: boolean; hasRates: boolean }
}

/** Route after login / bootstrap based on API session + onboarding flags. */
export async function navigateAfterAuth(
  navigate: NavigateFunction,
  session: AuthSession,
): Promise<void> {
  if (!session.bootstrapped) {
    navigate('/signup', { replace: true })
    return
  }

  const store = await apiFetch<StoreOnboarding>('/api/v1/store')
  if (!store.onboarding.hasBranch || !store.onboarding.hasRates) {
    navigate('/onboarding', { replace: true })
    return
  }

  navigate('/dashboard', { replace: true })
}
