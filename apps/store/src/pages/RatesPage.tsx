import type { FormEvent, ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CurrentRatesResponse, MetalRate, RatesHistoryResponse } from '@sonari/types'
import { Button, Input, Label } from '@sonari/ui'
import { apiFetch } from '../lib/api-client.js'

function findRate(rates: MetalRate[], metal: string, purity: string): string {
  const match = rates.find((r) => r.metal === metal && Number(r.purity) === Number(purity))
  return match?.ratePerGram ?? ''
}

export function RatesPage(): ReactElement {
  const [rates, setRates] = useState<MetalRate[]>([])
  const [history, setHistory] = useState<MetalRate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [current, hist] = await Promise.all([
        apiFetch<CurrentRatesResponse>('/api/v1/rates'),
        apiFetch<RatesHistoryResponse>('/api/v1/rates/history'),
      ])
      setRates(current.rates)
      setHistory(hist.rates.slice(0, 30))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

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
      setMessage('Rates updated')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rates')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading rates…
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Rates
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Today&apos;s metal rates</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Per gram INR. Updates apply to new bills immediately.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Dashboard
          </Link>
        </div>

        <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="gold24k">Gold 24K (999)</Label>
              <Input
                id="gold24k"
                name="gold24k"
                inputMode="decimal"
                required
                defaultValue={findRate(rates, 'gold', '99.9')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gold22k">Gold 22K (916)</Label>
              <Input
                id="gold22k"
                name="gold22k"
                inputMode="decimal"
                required
                defaultValue={findRate(rates, 'gold', '91.6')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="silver999">Silver 999</Label>
              <Input
                id="silver999"
                name="silver999"
                inputMode="decimal"
                required
                defaultValue={findRate(rates, 'silver', '99.9')}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-green-700">{message}</p> : null}
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save rates'}
            </Button>
          </form>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Recent history</h2>
          <p className="mt-1 text-sm text-muted-foreground">Last 30 rate changes</p>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No history yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border text-sm">
              {history.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="capitalize">
                    {row.metal} {row.purity}
                  </span>
                  <span className="font-medium tabular-nums">₹{row.ratePerGram}</span>
                  <span className="text-muted-foreground">
                    {new Date(row.effectiveFrom).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
