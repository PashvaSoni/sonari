# Sonari

India-first jewellery billing + ERP SaaS (multi-tenant, offline-first).

Plans live in [`Plans/`](./Plans/README.md). Start with [`Plans/00-MASTER-PLAN.md`](./Plans/00-MASTER-PLAN.md).

## Monorepo layout

```
apps/
  store/     # Store owner + staff PWA (Vite + React)
  admin/     # Super Admin (Vite + React)
  api/       # Fastify API
packages/
  config/    # Shared TS / ESLint / Prettier / Tailwind
  types/     # Shared Zod schemas
  domain/    # Pure billing math (Decimal.js)
  db/        # Supabase client + migrations
  ui/        # Shared UI (@sonari/ui)
  notifications/ llm/ offline/ pdf/ barcode/
Plans/       # Product + engineering plans
```

## Prerequisites

- Node.js ≥ 20
- pnpm 11 (`corepack enable` if needed)

## Setup

```bash
pnpm install
pnpm build
```

Copy env templates (fill when you have Supabase / Sentry):

```bash
cp .env.example .env
cp apps/store/.env.example apps/store/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/api/.env.example apps/api/.env
```

## Develop

```bash
pnpm dev:store   # http://localhost:5173
pnpm dev:admin   # http://localhost:5174
pnpm dev:api     # http://localhost:3001  → GET /health
```

Or all at once: `pnpm dev`

## Scripts

| Command | What |
|---------|------|
| `pnpm build` | Build all packages + apps |
| `pnpm test` | Vitest across the monorepo |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript project checks |
| `pnpm format` | Prettier write |

## Deploy (Phase 0 wiring)

| Surface | Host | Notes |
|---------|------|--------|
| `apps/store` | Cloudflare Pages (or Vercel) | Build: `pnpm --filter @sonari/store build`, output `apps/store/dist` |
| `apps/admin` | Cloudflare Pages (or Vercel) | Build: `pnpm --filter @sonari/admin build`, output `apps/admin/dist` |
| `apps/api` | Fly.io `bom` | `apps/api/Dockerfile` + `fly.toml` |

SPA fallback: `public/_redirects` → `/* /index.html 200`.

## Phase status

**Phase 0 — Foundation** (in progress): monorepo skeleton, login shells, `/health`, CI files. Details and acceptance checkboxes live in `Plans/10-phase-0-foundation.md`.

Still needs your accounts: Supabase (Mumbai), GitHub remote, Cloudflare/Vercel, Fly.io, Sentry DSNs.

When code diverges from plans, agents update `Plans/` in the same change (see `.cursor/rules/sonari-plans-sync.mdc`).
