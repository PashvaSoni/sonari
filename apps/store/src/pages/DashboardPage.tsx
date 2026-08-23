import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TenantProfile } from '@sonari/types'
import { Button, PageHeader, toast } from '@sonari/ui'
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
    <div className="flex h-full flex-col overflow-auto">
      <PageHeader
        title={profile?.name ?? 'Your store'}
        description={`Signed in as ${user?.email ?? 'store owner'}`}
        actions={
          <Button variant="outline" onClick={() => void handleSignOut()}>
            Sign out
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-3xl px-6 py-8 lg:px-8">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-medium">Store overview</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Setup complete. Use the sidebar for Bills, Stock, and Rates.
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
          <Button
            className="mt-6"
            onClick={() => {
              toast.message('Opening bills')
              navigate('/bills')
            }}
          >
            Go to Bills
          </Button>
        </section>
      </div>
    </div>
  )
}
