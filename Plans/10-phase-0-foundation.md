# 10 — Phase 0: Foundation

**Last-updated:** 2026-07-04
**Duration:** ~1 week
**Goal:** every subsequent phase drops code into a working skeleton.

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

### Pending credentials / accounts

- [ ] Both apps load their login pages on Cloudflare Pages (or Vercel) preview URL
- [ ] API `/health` returns 200 on Fly.io (`bom`)
- [ ] A PR triggers CI, deploys a preview URL, comments the URL back
- [ ] Sentry captures a synthetic error from each surface
- [ ] Supabase project linked (Mumbai) and dummy migration applied remotely

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
7. **Deploy** — configs sketched (`apps/api/Dockerfile`, `fly.toml`, SPA `_redirects`). **Needs** CF Pages / Fly accounts.
8. **Sentry** — wire `@sentry/react` (store/admin) and `@sentry/node` (api) when DSNs exist.
9. **PR template** — `.github/pull_request_template.md` with DoD checklist.
10. **CODEOWNERS** — present; replace `@your-github-handle` when team is set.

## Changelog

- **2026-07-04:** Scaffolded monorepo at repo root; local build/test/lint/typecheck green. Acceptance split into local-done vs credentials-pending.
- **2026-07-04:** GitHub remote `PashvaSoni/sonari`, branch `main`, CODEOWNERS set.
