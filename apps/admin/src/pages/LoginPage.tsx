import type { FormEvent, ReactElement } from 'react'
import { Button } from '@sonari/ui'

export function LoginPage(): ReactElement {
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    // Super-admin auth wiring lands in Phase 1.
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sonari Super Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tenant management, plans, and feature flags.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring focus-visible:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring focus-visible:ring-2"
            />
          </label>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </section>
    </main>
  )
}
