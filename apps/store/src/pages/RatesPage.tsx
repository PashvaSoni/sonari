import type { FormEvent, ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { CurrentRatesResponse, MetalRate, RatesHistoryResponse } from '@sonari/types'
import { Button, Input, Label, PageHeader, toast } from '@sonari/ui'
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

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [current, hist] = await Promise.all([
        apiFetch<CurrentRatesResponse>('/api/v1/rates'),
        apiFetch<RatesHistoryResponse>('/api/v1/rates/history'),
      ])
      setRates(current.rates)
      setHistory(hist.rates.slice(0, 30))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load rates')
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
      toast.success('Rates updated')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save rates')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <PageHeader
        title="Metal rates"
        description="Per gram INR. Updates apply to new bills immediately."
      />

      <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-8 lg:px-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading rates…</p>
        ) : (
          <>
            <section className="rounded-lg border border-border bg-card p-6">
              <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
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
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save rates'}
                </Button>
              </form>
            </section>

            <section className="rounded-lg border border-border bg-card p-6">
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
                      <span className="font-mono font-medium tabular-nums">
                        ₹{row.ratePerGram}
                      </span>
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
          </>
        )}
      </div>
    </div>
  )
}
