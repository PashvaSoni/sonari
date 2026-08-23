import type { FormEvent, ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TenantProfile } from '@sonari/types'
import { Button, Input, Label } from '@sonari/ui'
import { apiFetch } from '../../lib/api-client.js'

const STEPS = ['Store details', 'Branch', 'Rates'] as const

export function OnboardingWizard(): ReactElement {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<TenantProfile | null>(null)

  useEffect(() => {
    apiFetch<TenantProfile>('/api/v1/store')
      .then((data) => {
        setProfile(data)
        if (data.onboarding.hasRates) {
          navigate('/dashboard')
          return
        }
        if (data.onboarding.hasBranch) {
          setStep(2)
        } else if (data.gstin) {
          setStep(1)
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [navigate])

  async function handleStoreSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = new FormData(event.currentTarget)
    const gstin = String(form.get('gstin') ?? '').trim()

    try {
      const updated = await apiFetch<TenantProfile>('/api/v1/store', {
        method: 'PATCH',
        body: JSON.stringify({
          name: profile?.name,
          gstin: gstin || null,
        }),
      })
      setProfile(updated)
      setStep(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save store')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBranchSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = new FormData(event.currentTarget)

    try {
      await apiFetch('/api/v1/store/branches', {
        method: 'POST',
        body: JSON.stringify({
          name: String(form.get('branchName') ?? 'Main Branch'),
          phone: String(form.get('phone') ?? '') || undefined,
          invoicePrefix: String(form.get('invoicePrefix') ?? '') || undefined,
          address: {
            line1: String(form.get('line1') ?? '') || undefined,
            city: String(form.get('city') ?? '') || undefined,
            state: String(form.get('state') ?? '') || undefined,
            pincode: String(form.get('pincode') ?? '') || undefined,
          },
          isDefault: true,
        }),
      })
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create branch')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRatesSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = new FormData(event.currentTarget)
    const gold24k = String(form.get('gold24k') ?? '')
    const gold22k = String(form.get('gold22k') ?? '')
    const silver999 = String(form.get('silver999') ?? '')

    try {
      await Promise.all([
        apiFetch('/api/v1/rates', {
          method: 'POST',
          body: JSON.stringify({ metal: 'gold', purity: 99.9, ratePerGram: gold24k }),
        }),
        apiFetch('/api/v1/rates', {
          method: 'POST',
          body: JSON.stringify({ metal: 'gold', purity: 91.6, ratePerGram: gold22k }),
        }),
        apiFetch('/api/v1/rates', {
          method: 'POST',
          body: JSON.stringify({ metal: 'silver', purity: 99.9, ratePerGram: silver999 }),
        }),
      ])
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rates')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading setup…
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Store setup
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{profile?.name ?? 'Your store'}</h1>
        <div className="mt-4 flex gap-2">
          {STEPS.map((label, index) => (
            <div
              key={label}
              className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-primary' : 'bg-border'}`}
              aria-hidden
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>

        <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          {step === 0 ? (
            <form className="space-y-4" onSubmit={handleStoreSubmit}>
              <div className="space-y-2">
                <Label htmlFor="storeName">Store name</Label>
                <Input id="storeName" value={profile?.name ?? ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN (optional)</Label>
                <Input
                  id="gstin"
                  name="gstin"
                  defaultValue={profile?.gstin ?? ''}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                Continue
              </Button>
            </form>
          ) : null}

          {step === 1 ? (
            <form className="space-y-4" onSubmit={handleBranchSubmit}>
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch name</Label>
                <Input id="branchName" name="branchName" defaultValue="Main Branch" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Invoice prefix</Label>
                <Input id="invoicePrefix" name="invoicePrefix" placeholder="MEENA/25-26/" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="line1">Address</Label>
                <Input id="line1" name="line1" placeholder="Shop no., street" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input name="city" placeholder="City" />
                <Input name="state" placeholder="State" />
              </div>
              <Input name="pincode" placeholder="Pincode" />
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  Continue
                </Button>
              </div>
            </form>
          ) : null}

          {step === 2 ? (
            <form className="space-y-4" onSubmit={handleRatesSubmit}>
              <p className="text-sm text-muted-foreground">
                Enter today&apos;s rates per gram (INR). You can update these anytime.
              </p>
              <div className="space-y-2">
                <Label htmlFor="gold24k">Gold 24K (999)</Label>
                <Input id="gold24k" name="gold24k" inputMode="decimal" required placeholder="7850.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gold22k">Gold 22K (916)</Label>
                <Input id="gold22k" name="gold22k" inputMode="decimal" required placeholder="7200.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="silver999">Silver 999</Label>
                <Input id="silver999" name="silver999" inputMode="decimal" required placeholder="95.00" />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  Finish setup
                </Button>
              </div>
            </form>
          ) : null}

          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        </section>
      </div>
    </main>
  )
}
