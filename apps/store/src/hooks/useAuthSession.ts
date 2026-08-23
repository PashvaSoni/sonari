import { useEffect, useState } from 'react'
import type { AuthSession } from '@sonari/types'
import { apiFetch } from '../lib/api-client.js'
import { useAuth } from './useAuth.js'

export type AuthSessionState = {
  user: ReturnType<typeof useAuth>['user']
  authSession: AuthSession | null
  bootstrapped: boolean
  loading: boolean
  error: string | null
}

export function useAuthSession(): AuthSessionState {
  const { user, loading: authLoading } = useAuth()
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      setAuthSession(null)
      setError(null)
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)
    setError(null)

    apiFetch<AuthSession>('/api/v1/auth/session')
      .then((data) => {
        if (!mounted) return
        setAuthSession(data)
      })
      .catch((err: Error) => {
        if (!mounted) return
        setAuthSession(null)
        setError(err.message)
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [user, authLoading])

  return {
    user,
    authSession,
    bootstrapped: authSession?.bootstrapped ?? false,
    loading: authLoading || loading,
    error,
  }
}
