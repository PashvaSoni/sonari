import type { FormEvent, ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, Button, Input, Label } from '@sonari/ui'
import { signIn } from '../hooks/useAuth.js'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { apiFetch } from '../lib/api-client.js'
import { navigateAfterAuth } from '../lib/post-auth-navigate.js'
import type { AuthSession } from '@sonari/types'

export function LoginPage(): ReactElement {
  const navigate = useNavigate()
  const { user, loading: sessionLoading, authSession } = useAuthSession()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionLoading || !user || !authSession) {
      return
    }
    void navigateAfterAuth(navigate, authSession).catch((err: Error) => setError(err.message))
  }, [sessionLoading, user, authSession, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    try {
      await signIn(email, password)
      const session = await apiFetch<AuthSession>('/api/v1/auth/session')
      await navigateAfterAuth(navigate, session)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading && user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </main>
    )
  }

  return (
    <AuthLayout
      eyebrow="Sonari Store"
      title="Sign in"
      description="Jewellery billing for your counter."
      footer={
        <>
          New store?{' '}
          <Link className="font-medium text-foreground underline-offset-4 hover:underline" to="/signup">
            Create account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Continue'}
        </Button>
      </form>
    </AuthLayout>
  )
}
