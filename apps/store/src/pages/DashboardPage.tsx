import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { TenantProfile } from '@sonari/types'
import { Button } from '@sonari/ui'
import { signOut, useAuth } from '../hooks/useAuth.js'
import { apiFetch } from '../lib/api-client.js'

export function DashboardPage(): ReactElement {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<TenantProfile | null>(null)

  useEffect(() => {
    apiFetch<TenantProfile>('/api/v1/store')
      .then((data) => {
        if (!data.onboarding.hasBranch || !data.onboarding.hasRates) {
          navigate('/onboarding')
          return
        }
        setProfile(data)
      })
      .catch(() => navigate('/onboarding'))
  }, [navigate])

  async function handleSignOut(): Promise<void> {
    await signOut()
    navigate('/login')
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{profile?.name ?? 'Your store'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in as {user?.email ?? 'store owner'}
            </p>
          </div>
          <Button variant="secondary" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>

        <nav className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            to="/rates"
            className="rounded-md border border-border bg-card px-3 py-2 font-medium hover:bg-accent"
          >
            Rates
          </Link>
          <Link
            to="/stock"
            className="rounded-md border border-border bg-card px-3 py-2 font-medium hover:bg-accent"
          >
            Stock
          </Link>
          <span className="rounded-md border border-dashed border-border px-3 py-2 text-muted-foreground">
            Bills (Week 5+)
          </span>
        </nav>

        <section className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Store overview</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Setup complete. Next: categories and stock items.
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium capitalize">{profile?.status ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">GSTIN</dt>
              <dd className="font-medium">{profile?.gstin ?? 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Trial ends</dt>
              <dd className="font-medium">
                {profile ? new Date(profile.trialEndsAt).toLocaleDateString('en-IN') : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-medium">{profile?.slug ?? '—'}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  )
}
