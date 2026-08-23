import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { BootstrapResponse } from '@sonari/types'
import { AuthLayout, Button, Input, Label } from '@sonari/ui'
import { refreshSession, signUp } from '../hooks/useAuth.js'
import { apiFetch } from '../lib/api-client.js'

export function SignupPage(): ReactElement {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const fullName = String(form.get('fullName') ?? '')
    const storeName = String(form.get('storeName') ?? '')
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    try {
      const { session } = await signUp(email, password, fullName)
      if (!session) {
        setError('Check your email to confirm your account, then sign in.')
        return
      }

      await apiFetch<BootstrapResponse>('/api/v1/auth/bootstrap', {
        method: 'POST',
        body: JSON.stringify({ storeName, fullName }),
      })

      await refreshSession()
      navigate('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Sonari Store"
      title="Create your store"
      description="Set up your jewellery business in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link className="font-medium text-foreground underline-offset-4 hover:underline" to="/login">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="fullName">Your name</Label>
          <Input id="fullName" name="fullName" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" name="storeName" required placeholder="Meena Jewellers" />
        </div>
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
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Continue'}
        </Button>
      </form>
    </AuthLayout>
  )
}
