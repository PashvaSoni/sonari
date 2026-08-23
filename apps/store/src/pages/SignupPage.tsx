import type { FormEvent, ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { BootstrapResponse } from '@sonari/types'
import { AuthLayout, Button, Input, Label } from '@sonari/ui'
import { refreshSession, signUp } from '../hooks/useAuth.js'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { apiFetch } from '../lib/api-client.js'
import {
  clearPendingSignup,
  resolvePendingFullName,
  resolvePendingStoreName,
  savePendingSignup,
} from '../lib/pending-signup.js'
import { navigateAfterAuth } from '../lib/post-auth-navigate.js'

export function SignupPage(): ReactElement {
  const navigate = useNavigate()
  const { user, loading: sessionLoading, bootstrapped, authSession } = useAuthSession()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const finishSetup = Boolean(user && !bootstrapped)

  useEffect(() => {
    if (sessionLoading || !user || !bootstrapped || !authSession) {
      return
    }
    void navigateAfterAuth(navigate, authSession).catch((err: Error) => setError(err.message))
  }, [sessionLoading, user, bootstrapped, authSession, navigate])

  async function runBootstrap(storeName: string, fullName: string): Promise<void> {
    await apiFetch<BootstrapResponse>('/api/v1/auth/bootstrap', {
      method: 'POST',
      body: JSON.stringify({ storeName, fullName }),
    })
    await refreshSession()
    clearPendingSignup()
    navigate('/onboarding', { replace: true })
  }

  async function handleFinishSetup(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const fullName = String(form.get('fullName') ?? '').trim()
    const storeName =
      resolvePendingStoreName(user?.user_metadata) ||
      String(form.get('storeName') ?? '').trim()

    if (!storeName) {
      setError('Store name is required')
      setLoading(false)
      return
    }

    try {
      await runBootstrap(storeName, fullName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const fullName = String(form.get('fullName') ?? '').trim()
    const storeName = String(form.get('storeName') ?? '').trim()
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    savePendingSignup(fullName, storeName)

    try {
      const { session } = await signUp(email, password, fullName, storeName)
      if (!session) {
        setError('Check your email to confirm your account, then sign in to finish setup.')
        return
      }

      await runBootstrap(storeName, fullName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </main>
    )
  }

  if (finishSetup) {
    const pendingStoreName = resolvePendingStoreName(user?.user_metadata)
    const pendingFullName = resolvePendingFullName(user?.user_metadata)

    return (
      <AuthLayout
        eyebrow="Sonari Store"
        title="Finish setting up your store"
        description={
          pendingStoreName
            ? `Your account is confirmed. We'll create ${pendingStoreName} and continue setup.`
            : 'Your account is confirmed. Enter your store name to continue.'
        }
        footer={
          <>
            Wrong account?{' '}
            <Link className="font-medium text-foreground underline-offset-4 hover:underline" to="/login">
              Sign in
            </Link>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleFinishSetup}>
          <div className="space-y-2">
            <Label htmlFor="fullName">Your name</Label>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              required
              defaultValue={pendingFullName}
            />
          </div>
          {pendingStoreName ? (
            <div className="space-y-2">
              <Label htmlFor="storeName">Store name</Label>
              <Input id="storeName" name="storeName" value={pendingStoreName} readOnly />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="storeName">Store name</Label>
              <Input id="storeName" name="storeName" required placeholder="Meena Jewellers" />
            </div>
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating store…' : 'Continue'}
          </Button>
        </form>
      </AuthLayout>
    )
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
      <form className="space-y-4" onSubmit={handleSignUp}>
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
