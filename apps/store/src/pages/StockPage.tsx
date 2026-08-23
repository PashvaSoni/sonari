import type { FormEvent, ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  Branch,
  CategoriesListResponse,
  Category,
  ItemListItem,
  ItemsListResponse,
} from '@sonari/types'
import { Button, Input, Label } from '@sonari/ui'
import { apiFetch } from '../lib/api-client.js'

export function StockPage(): ReactElement {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<ItemListItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (query.trim()) params.set('q', query.trim())

      const [cats, itemsRes, branchesRes] = await Promise.all([
        apiFetch<CategoriesListResponse>('/api/v1/categories'),
        apiFetch<ItemsListResponse>(`/api/v1/items?${params.toString()}`),
        apiFetch<{ branches: Branch[] }>('/api/v1/store/branches'),
      ])
      setCategories(cats.categories)
      setItems(itemsRes.items)
      setBranches(branchesRes.branches)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock')
    } finally {
      setLoading(false)
    }
  }, [query, selectedCategory])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setMessage(null)
    setError(null)
    const form = new FormData(event.currentTarget)
    const name = String(form.get('categoryName') ?? '').trim()
    if (!name) return

    try {
      await apiFetch('/api/v1/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
      event.currentTarget.reset()
      setMessage('Category created')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    }
  }

  async function handleCreateItem(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setMessage(null)
    setError(null)
    const form = new FormData(event.currentTarget)
    const defaultBranch = branches.find((b) => b.isDefault) ?? branches[0]
    if (!defaultBranch) {
      setError('Create a branch before adding stock')
      return
    }

    try {
      await apiFetch('/api/v1/items', {
        method: 'POST',
        body: JSON.stringify({
          branchId: defaultBranch.id,
          categoryId: selectedCategory,
          name: String(form.get('itemName') ?? ''),
          metal: String(form.get('metal') ?? 'gold'),
          purity: Number(form.get('purity') || 91.6),
          netWeight: String(form.get('netWeight') ?? '') || undefined,
          grossWeight: String(form.get('grossWeight') ?? '') || undefined,
        }),
      })
      event.currentTarget.reset()
      setMessage('Item added')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Stock
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Categories & items</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Week 2 list view. Full item form lands in Week 3.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Dashboard
          </Link>
        </div>

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-4">
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h2 className="text-sm font-medium">Categories</h2>
              <button
                type="button"
                className={`mt-3 block w-full rounded-md px-2 py-1.5 text-left text-sm ${
                  selectedCategory === null ? 'bg-accent font-medium' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All items
              </button>
              <ul className="mt-1 space-y-0.5">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${
                        selectedCategory === cat.id
                          ? 'bg-accent font-medium'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
              <form className="mt-4 space-y-2" onSubmit={handleCreateCategory}>
                <Label htmlFor="categoryName">New category</Label>
                <Input id="categoryName" name="categoryName" placeholder="Necklaces" required />
                <Button type="submit" className="w-full" variant="secondary">
                  Add
                </Button>
              </form>
            </section>
          </aside>

          <div className="space-y-4">
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <form
                className="flex flex-wrap gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  void load()
                }}
              >
                <Input
                  name="q"
                  placeholder="Search name, SKU, barcode"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-w-[200px] flex-1"
                />
                <Button type="submit" variant="secondary">
                  Search
                </Button>
              </form>
            </section>

            <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h2 className="text-sm font-medium">Quick add item</h2>
              <form className="mt-3 grid gap-3 sm:grid-cols-2" onSubmit={handleCreateItem}>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="itemName">Name</Label>
                  <Input id="itemName" name="itemName" required placeholder="22K Gold Chain 8gm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metal">Metal</Label>
                  <select
                    id="metal"
                    name="metal"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    defaultValue="gold"
                  >
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purity">Purity</Label>
                  <Input id="purity" name="purity" inputMode="decimal" defaultValue="91.6" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grossWeight">Gross wt (g)</Label>
                  <Input id="grossWeight" name="grossWeight" inputMode="decimal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="netWeight">Net wt (g)</Label>
                  <Input id="netWeight" name="netWeight" inputMode="decimal" />
                </div>
                <Button type="submit" className="sm:col-span-2">
                  Add item
                </Button>
              </form>
            </section>

            <section className="rounded-lg border border-border bg-card shadow-sm">
              {loading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading…</p>
              ) : items.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No items yet. Add one above.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">SKU</th>
                        <th className="px-4 py-3 font-medium">Metal</th>
                        <th className="px-4 py-3 font-medium">Net wt</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 tabular-nums">{item.sku}</td>
                          <td className="px-4 py-3 capitalize">
                            {item.metal}
                            {item.purity ? ` ${item.purity}` : ''}
                          </td>
                          <td className="px-4 py-3 tabular-nums">{item.netWeight ?? '—'}</td>
                          <td className="px-4 py-3 capitalize">
                            {item.status.replace('_', ' ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
