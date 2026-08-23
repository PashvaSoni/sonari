# 10 — Phase 0: Foundation

**Last-updated:** 2026-08-23
**Duration:** ~1 week
**Goal:** every subsequent phase drops code into a working skeleton.

> **Change note (2026-08-23):** API Dockerfile / Fly deploy path-filter include `packages/db` (`@sonari/db` is a runtime dep of `@sonari/api`).

> **Change note (2026-08-23):** Workers Builds Root = `/`. Deploy **and** Versions must pass `-c apps/<app>/wrangler.toml`. Bare `npx wrangler versions upload` fails.

> **Change note (2026-07-04):** Monorepo scaffolded at **repo root** (not a nested `sonari/` folder). Package scope `@sonari/*`. Sentry uses `@sentry/react` + `@sentry/node` (Vite), not `@sentry/nextjs`. pnpm 11 requires `allowBuilds` in `pnpm-workspace.yaml` (esbuild approved).

---

## Deliverables

1. Turborepo monorepo initialised, pnpm workspaces configured
2. Three app packages scaffolded: `apps/store` (Vite + React), `apps/admin` (Vite + React), `apps/api` (Fastify)
3. Shared packages scaffolded: `types`, `domain`, `db`, `notifications`, `llm`, `offline`, `pdf`, `barcode`, `ui`, `config`
4. Supabase project created (Mumbai region), env vars wired
5. GitHub repo + Actions CI (lint, typecheck, test, build)
6. Cloudflare Pages (or Vercel) projects for `store` and `admin` — deploying static Vite build output
7. Fly.io app for `api` (auto-deploy on `main`)
8. Sentry projects for FE + BE
9. Skeleton screens deployed: login page on store, login page on admin, `/health` on API
10. `.env.example` files with all required keys documented (`VITE_*` prefix for frontend)

## Acceptance criteria

### Done locally (2026-07-04)

- [x] `pnpm i && pnpm build` at root completes cleanly
- [x] `pnpm test` runs (domain + API `/health` tests) and reports results
- [x] README at repo root explains: setup, dev, deploy
- [x] Login shells exist for store (`:5173`) and admin (`:5174`)
- [x] API `GET /health` works locally (`:3001`)
- [x] CI workflow file present (`.github/workflows/ci.yml`) — runs once GitHub remote exists
- [x] PR template + CODEOWNERS present
- [x] Dummy migration files present (`supabase/migrations/`, `packages/db/migrations/`)
- [x] `.env.example` at root and per app

### Done — GitHub (2026-07-04)

- [x] Remote: `https://github.com/PashvaSoni/sonari.git`
- [x] Default branch `main`, CODEOWNERS `@PashvaSoni`

### Done — Supabase (2026-07-04)

- [x] Project: `vewfxwzyialmlsaljafz` (Mumbai), URL `https://vewfxwzyialmlsaljafz.supabase.co`
- [x] Local `.env` files filled (root, store, admin, api) — secrets not committed
- [x] `@sonari/db` wired with `createAnonClient` / `createServiceClient`
- [x] `supabase/config.toml` `project_id` set
- [x] Dummy migration applied remotely (`_sonari_schema_migrations_probe`)

### Cloudflare Workers Static Assets (ADR-007)

Create **two** Workers (Git-connected), both on `PashvaSoni/sonari`, branch `main`. Config files: `apps/store/wrangler.toml`, `apps/admin/wrangler.toml`.

> **Change note (2026-08-23):** Root = `/` (pnpm workspace). Deploy **and** non-prod Versions both need `-c apps/<app>/wrangler.toml`. Bare `versions upload` fails.

| Setting | Store (`sonari-store`) | Admin (`sonari-admin`) |
|---|---|---|
| **Root directory** | `/` | `/` |
| Build command | `pnpm install --frozen-lockfile && pnpm turbo run build --filter=@sonari/store` | `pnpm install --frozen-lockfile && pnpm turbo run build --filter=@sonari/admin` |
| Deploy command (production branch) | `npx wrangler deploy -c apps/store/wrangler.toml` | `npx wrangler deploy -c apps/admin/wrangler.toml` |
| Non-production branch deploy command | `npx wrangler versions upload -c apps/store/wrangler.toml` | `npx wrangler versions upload -c apps/admin/wrangler.toml` |
| Custom domain (in `wrangler.toml`) | `app.sonari.shop` | `admin.sonari.shop` |

`workers_dev = false` — deploy uses custom domains only (no `workers.dev` registration required). Zone `sonari.shop` must be **Active** on the same Cloudflare account.

#### Build watch paths (path filters — set in Cloudflare dashboard)

So a change under `apps/admin` does **not** redeploy store (and vice versa). Configure per Worker:

**Workers & Pages → worker → Settings → Build → Build watch paths**

| Worker | Include paths (one per line) | Exclude paths (optional) |
|---|---|---|
| `sonari-store` | `apps/store/**` `packages/ui/**` `packages/config/**` `package.json` `pnpm-lock.yaml` `pnpm-workspace.yaml` `turbo.json` | `Plans/**` `**/*.md` `.cursor/**` `apps/admin/**` `apps/api/**` |
| `sonari-admin` | `apps/admin/**` `packages/ui/**` `packages/config/**` `package.json` `pnpm-lock.yaml` `pnpm-workspace.yaml` `turbo.json` | `Plans/**` `**/*.md` `.cursor/**` `apps/store/**` `apps/api/**` |

- Change only `apps/admin/**` → **admin** deploys only  
- Change only `apps/store/**` → **store** deploys only  
- Change `packages/ui/**` (shared) → **both** deploy (correct)  
- Change only `Plans/**` → **neither** deploys
| Node version (env) | `NODE_VERSION=22` | `NODE_VERSION=22` |

**Environment variables** (build-time `VITE_*` — set in Worker build settings for Production + Preview):

| Name | Value |
|---|---|
| `NODE_VERSION` | `22` |
| `VITE_SUPABASE_URL` | `https://vewfxwzyialmlsaljafz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(anon key from Supabase — not service_role)* |
| `VITE_API_URL` | **Must** be `https://sonari-api.fly.dev` on Production (and Preview if testing against Fly). `http://localhost:3001` only for local `pnpm dev`. Wrong value → browser "Failed to fetch" / empty onboarding store name. |
| `VITE_SENTRY_DSN` | *(empty until Sentry)* |

SPA routing: `not_found_handling = "single-page-application"` in each `wrangler.toml`.
Do **not** ship `public/_redirects` — Workers rejects `/* /index.html 200` as an infinite loop when SPA handling is enabled.

#### Supabase Auth URL configuration (required for email confirm)

Dashboard: **Authentication → URL Configuration**

| Setting | Value |
|---|---|
| **Site URL** | `https://app.sonari.shop` |
| **Redirect URLs** (one per line) | `https://app.sonari.shop/**` |
| | `http://localhost:5173/**` |
| | `http://localhost:5174/**` |

Signup passes `emailRedirectTo = {origin}/login`. If Site URL stays `http://localhost:3000`, confirm links open localhost and look “broken” in production.

### Domain `sonari.shop` (ADR-008)

| Host | Target |
|---|---|
| `app.sonari.shop` | Worker `sonari-store` |
| `admin.sonari.shop` | Worker `sonari-admin` |
| `api.sonari.shop` | Fly.io API (when deployed) |
| `sonari.shop` (apex) | Marketing later, or redirect to `app.sonari.shop` |

Zone must live on Cloudflare DNS (add site + update nameservers at registrar if not already).

### Fly.io API (auto-deploy on `main`)

App: `sonari-api` · region `sin` (ADR-009; bom when capacity returns) · hostname `https://sonari-api.fly.dev` · custom domain `api.sonari.shop`.

**One-time (local):**

```bash
fly auth login
fly apps create sonari-api   # skip if exists
fly secrets set `
  SUPABASE_URL=... `
  SUPABASE_ANON_KEY=... `
  SUPABASE_SERVICE_ROLE_KEY=... `
  CORS_ORIGINS=https://app.sonari.shop,https://admin.sonari.shop `
  -a sonari-api
```

| Fly secret | Required | Source |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Yes | Same page → `anon` `public` key (RLS request clients) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Same page → `service_role` (server only; never ship to browser) |
| `CORS_ORIGINS` | Yes (prod) | `https://app.sonari.shop,https://admin.sonari.shop` |
| `REDIS_URL` / `SENTRY_DSN` | Optional | Phase 0+ queues / error reporting |

**GitHub Actions** — `.github/workflows/deploy-api.yml`

| Trigger | Paths that redeploy API |
|---|---|
| Push to `main` | `apps/api/**`, `packages/types/**`, `packages/config/**`, root lockfiles, `.dockerignore`, workflow file |
| Manual | Actions → **Deploy API** → **Run workflow** |

Deploy command (CI runner, repo root):

```bash
flyctl deploy --config apps/api/fly.toml --dockerfile apps/api/Dockerfile -a sonari-api --ha=false
```

**GitHub secret (required):**

| Secret | How to create |
|---|---|
| `FLY_API_TOKEN` | `fly tokens create deploy -a sonari-api` → paste in **Settings → Secrets and variables → Actions** |

Post-deploy smoke test in workflow: `GET https://sonari-api.fly.dev/health`.

Changes only under `apps/store`, `apps/admin`, or `Plans/` do **not** redeploy the API.

### Pending credentials / accounts

- [ ] Cloudflare: register `workers.dev` subdomain (one-time) **or** rely on custom domains only
- [ ] `app.sonari.shop` → store Worker live (login shell)
- [ ] `admin.sonari.shop` → admin Worker live (login shell)
- [x] API `/health` returns 200 on Fly.io (`sin`) — `https://sonari-api.fly.dev/health`
- [ ] Custom domain `api.sonari.shop` wired to Fly
- [ ] A PR triggers CI, deploys a preview URL, comments the URL back
- [ ] Sentry captures a synthetic error from each surface




## Current repo layout (as implemented)

```
.
├── apps/store|admin|api
├── packages/config|types|domain|db|ui|notifications|llm|offline|pdf|barcode
├── supabase/migrations/
├── Plans/
├── .cursor/rules/
├── .github/
├── package.json
├── pnpm-workspace.yaml   # includes allowBuilds.esbuild: true (pnpm 11)
└── turbo.json
```

Local scripts: `pnpm dev:store`, `pnpm dev:admin`, `pnpm dev:api`, `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`.

## Step-by-step (historical + remaining)

1. **Repo setup** — done at repo root (manual Turborepo layout; not `create-turbo` nested folder).
2. **Apps and packages** — done per `00-MASTER-PLAN.md` §3.
3. **Base configs** — `packages/config` (tsconfig, eslint, prettier, tailwind).
4. **Supabase** — migration files ready; **needs** Mumbai project + `supabase link --project-ref <ref>`.
5. **Env** — `.env.example` files present; copy to `.env` and fill secrets locally (never commit).
6. **CI** — `.github/workflows/ci.yml` (lint, typecheck, test, build). Turbo remote cache / Sentry sourcemaps when deploy accounts exist.
7. **Deploy** — store/admin via Cloudflare Workers (dashboard). API via Fly.io: `apps/api/Dockerfile`, `fly.toml`, root `.dockerignore`; GitHub Actions `.github/workflows/deploy-api.yml` on push to `main` (path-filtered) + secret `FLY_API_TOKEN`. Manual bootstrap: `fly deploy --config apps/api/fly.toml --dockerfile apps/api/Dockerfile -a sonari-api` from repo root.
8. **Sentry** — wire `@sentry/react` (store/admin) and `@sentry/node` (api) when DSNs exist.
9. **PR template** — `.github/pull_request_template.md` with DoD checklist.
10. **CODEOWNERS** — present; replace `@your-github-handle` when team is set.

## Changelog

- **2026-08-23:** Prod store bundle was baked with `VITE_API_URL=localhost:3001` → onboarding Failed to fetch; document CF env must be Fly URL + redeploy.
- **2026-08-23:** Supabase Auth Site URL / Redirect URLs for `app.sonari.shop` + local Vite; signup `emailRedirectTo` → `/login`.
- **2026-08-23:** Fly crash loop — `SUPABASE_ANON_KEY` required by RLS plugin; document on Fly secrets + Zod env. Not a port bug.
- **2026-08-23:** API Dockerfile copies/builds `packages/db`; `deploy-api.yml` watches `packages/db/**`. Document prod `VITE_API_URL` + Fly `CORS_ORIGINS` for store/admin.
- **2026-08-23:** Workers Builds — Root `/` + `wrangler -c apps/<app>/wrangler.toml` on Deploy **and** Versions. Bare `versions upload` fails. Supersedes per-app Root directory and removed unused `cf:*` package scripts.
- **2026-07-04:** Scaffolded monorepo at repo root; local build/test/lint/typecheck green. Acceptance split into local-done vs credentials-pending.
- **2026-07-04:** GitHub remote `PashvaSoni/sonari`, branch `main`, CODEOWNERS set.
- **2026-07-04:** Supabase project `vewfxwzyialmlsaljafz` env wired; `@sonari/db` clients added; probe migration applied remotely.
- **2026-07-04:** Removed temporary `scripts/verify-supabase.mjs` (one-off smoke test no longer needed).
- **2026-07-04:** Frontend host = Cloudflare Workers Static Assets (ADR-007); `wrangler.toml` per app.
- **2026-07-04:** Removed `public/_redirects` — conflicts with Workers SPA `not_found_handling`.
- **2026-07-04:** Domain `sonari.shop` — `app.` / `admin.` / `api.` subdomains (ADR-008).
- **2026-07-04:** `wrangler.toml` routes use `custom_domain` so deploy works without `workers.dev` subdomain.
- **2026-07-04:** Documented Cloudflare Build watch paths so store/admin deploy independently.
- **2026-07-05:** Added root `.dockerignore` — fixes Fly/Depot `archive/tar: unknown file mode` when deploying from Windows (pnpm junctions in `node_modules`).
- **2026-07-05:** API `Dockerfile` runner uses `pnpm deploy --legacy` — fixes Fly “not listening on 0.0.0.0:3001” (broken pnpm symlinks in copied `node_modules`).
- **2026-07-05:** Added `.github/workflows/deploy-api.yml` — Fly auto-deploy on `main` (path-filtered) + `FLY_API_TOKEN` secret.
- **2026-07-05:** Fly API region `bom` → `sin` (ADR-009) — Mumbai VM capacity exhausted; deploy uses `--ha=false`.




