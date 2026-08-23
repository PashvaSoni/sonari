import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, Button, Input, Label } from '@sonari/ui'
import { signIn } from '../hooks/useAuth.js'
import { apiFetch } from '../lib/api-client.js'
import type { AuthSession } from '@sonari/types'

export function LoginPage(): ReactElement {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

      if (!session.bootstrapped) {
        navigate('/signup')
        return
      }

      const store = await apiFetch<{ onboarding: { hasBranch: boolean; hasRates: boolean } }>(
        '/api/v1/store',
      )

      if (!store.onboarding.hasBranch || !store.onboarding.hasRates) {
        navigate('/onboarding')
        return
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
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
