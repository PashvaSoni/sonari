# Decisions Log (ADRs)

**Purpose:** Every non-trivial deviation from the plan gets an entry here.
**Format:** ADR-NNN (numbered sequentially, never reuse numbers even for withdrawn ADRs).

**Reading this file:** ADRs are timestamped and rarely revised. If you see conflicting information between an ADR and a plan MD file, the LATER date wins. Superseded ADRs are marked with `Status: Superseded by ADR-NNN`.

**Writing ADRs:** Follow the template. One decision per ADR. Keep them short — 5–15 lines each. If a decision needs pages, split it.

---

## ADR Template (copy for new entries)

```markdown
## ADR-NNN: <short imperative title, e.g. "Switch to X">
Date: YYYY-MM-DD
Author: <agent-name> / <human-reviewer>
Status: Proposed | Accepted | Rejected | Superseded by ADR-XXX
Context: <why this came up — 1-3 sentences>
Decision: <what we're doing — 1-3 sentences>
Consequences:
  - <plan file / code file / process affected>
  - <migration or breaking-ish note>
  - <trade-offs accepted>
Alternatives considered:
  - <option>: <reason rejected>
  - <option>: <reason rejected>
```

---

## ADR-001: Vite + React over Next.js
Date: 2026-07-03
Author: initial-plan / user
Status: Accepted
Context: Both apps (`store`, `admin`) are auth-gated PWAs with no SEO requirement. Next.js's SSR/RSC value doesn't apply.
Decision: Use Vite + React + React Router v6 (data routers) for both apps. Marketing site deferred to Phase 2+ (Astro).
Consequences:
  - `00-MASTER-PLAN.md` §3, §4, §5 updated
  - `04-frontend-store-app.md` fully rewritten
  - `05-frontend-super-admin.md` stack + deployment updated
  - Smaller bundle (~30-40KB), faster HMR (~50ms), simpler mental model
Alternatives considered:
  - Next.js everywhere: rejected — over-engineered for auth-gated PWA
  - Remix / TanStack Start: rejected — less battle-tested for our size
  - Vite + static-gen marketing: deferred — landing page not urgent

---

## ADR-002: shadcn/ui + IndiaCN UI over Ant Design / MUI
Date: 2026-07-03
Author: initial-plan / user
Status: Accepted
Context: Need a component library that fits minimalist jewellery aesthetic, small bundle, and has Indian-market primitives (rupee, GSTIN, HUID).
Decision: shadcn/ui as base, IndiaCN UI for India-specific components (or hand-built following shadcn pattern in `packages/ui/india/`).
Consequences:
  - `17-ui-components.md` full spec added
  - `packages/ui` becomes single source of truth
  - Bundle stays < 100KB gzipped for full UI package
  - No vendor lock-in — we own the component code
Alternatives considered:
  - Ant Design: rejected — 300KB bundle, opinionated "Ant" look, hard to customize
  - MUI: rejected — 350KB bundle, Material aesthetic doesn't fit premium jewellery
  - Chakra UI: rejected — Emotion runtime, larger bundle than shadcn
  - Headless UI (only): rejected — IndiaCN and shadcn already provide the styled layer

---

## ADR-003: Cloudflare Pages preferred over Vercel for frontend hosting
Date: 2026-07-03
Author: initial-plan
Status: Accepted
Context: Both host static Vite builds well. Cost and India edge performance matter.
Decision: Cloudflare Pages primary, Vercel as fallback. Frontend static builds only.
Consequences:
  - `00-MASTER-PLAN.md` §5 deployment table updated
  - `10-phase-0-foundation.md` deploy steps updated
  - Free unlimited bandwidth; better edge coverage in India
Alternatives considered:
  - Vercel: acceptable — but paid tier kicks in earlier on bandwidth
  - Netlify: fine — no strong reason to choose over CF Pages
  - S3+CloudFront: rejected — more moving parts, no dev DX benefit

---

## ADR-004: Monorepo at repo root (not nested sonari/)
Date: 2026-07-04
Author: agent / user
Status: Accepted
Context: Phase 0 scaffold. Plans showed a nested `sonari/` folder; the workspace is already `Billing/` with `Plans/` and `.cursor/` at root. Nesting would add an extra path segment for no benefit.
Decision: Scaffold Turborepo + pnpm workspaces at the **repository root**. Package names use `@sonari/*`. Keep `Plans/` and `.cursor/rules/` at root.
Consequences:
  - `00-MASTER-PLAN.md` §3 folder tree updated
  - `10-phase-0-foundation.md` reflects root layout
  - Deploy build roots are `apps/store`, `apps/admin`, `apps/api` from monorepo root
Alternatives considered:
  - Nested `sonari/` via create-turbo: rejected — inefficient, splits plans from code
  - Separate repos per app: rejected — shared packages require monorepo

---

## ADR-005: Sentry Vite SDKs (not Next.js)
Date: 2026-07-04
Author: agent
Status: Accepted
Context: Phase 0 plan text still mentioned `@sentry/nextjs` from an earlier Next.js draft.
Decision: Use `@sentry/react` for `apps/store` and `apps/admin`, `@sentry/node` for `apps/api`. Wire when DSNs are provided.
Consequences:
  - `00-MASTER-PLAN.md` §4, `10-phase-0-foundation.md` updated
Alternatives considered:
  - `@sentry/nextjs`: rejected — no Next.js runtime

---

## ADR-006: pnpm 11 allowBuilds for esbuild
Date: 2026-07-04
Author: agent
Status: Accepted
Context: pnpm 11 blocks dependency build scripts unless listed in `allowBuilds` in `pnpm-workspace.yaml`.
Decision: Set `allowBuilds.esbuild: true` in `pnpm-workspace.yaml` so Vite/esbuild postinstall runs.
Consequences:
  - Required for `pnpm install` / `pnpm build` on pnpm 11+
  - New packages needing native builds must be added to `allowBuilds` (or `pnpm approve-builds <name>`)
Alternatives considered:
  - Downgrade pnpm: rejected — stay on current toolchain

---

## ADR-007: Cloudflare Workers Static Assets over Pages for frontends
Date: 2026-07-04
Author: agent / user
Status: Accepted
Context: Cloudflare dashboard defaults to "Create a Worker"; Pages is de-emphasized ("Looking to deploy Pages?" link). User prefers Workers path.
Decision: Host `apps/store` and `apps/admin` as **Workers Static Assets** (Vite `dist/` + SPA `not_found_handling`). Config: `apps/store/wrangler.toml`, `apps/admin/wrangler.toml`. ADR-003's preference for Cloudflare edge hosting still holds; delivery mechanism is Workers Assets instead of Pages.
Consequences:
  - `10-phase-0-foundation.md` deploy settings updated
  - `00-MASTER-PLAN.md` §5 notes Workers Assets for frontends
  - Dashboard: Build command + Deploy command (`npx wrangler deploy`)
  - Free `*.workers.dev` URLs (custom domains still supported)
Alternatives considered:
  - Cloudflare Pages: still valid, harder to find in current UI
  - Vercel: fallback per ADR-003 if Workers Assets fails
Notes:
  - Do not include Pages-style `public/_redirects` (`/* /index.html 200`) — Workers reports infinite loop (error 100324) when combined with `not_found_handling = "single-page-application"`.

---

## ADR-008: Production domain sonari.shop
Date: 2026-07-04
Author: user / agent
Status: Accepted
Context: Domain `sonari.shop` purchased. Need stable public URLs for store, admin, and (later) API.
Decision: Host on Cloudflare DNS. Subdomains:
  - `app.sonari.shop` → store Worker (`sonari-store`)
  - `admin.sonari.shop` → admin Worker (`sonari-admin`)
  - `api.sonari.shop` → Fly.io API (Phase 0 remaining / when API is deployed)
Consequences:
  - Custom domains attached in Cloudflare Workers (and Fly later)
  - `VITE_API_URL` for production builds becomes `https://api.sonari.shop` once API is live
  - Apex `sonari.shop` reserved for marketing (Phase 2+) or redirect to `app.sonari.shop`
Alternatives considered:
  - Apex-only for store: rejected — blocks clean admin/api hostnames
  - `store.sonari.shop`: fine, but `app.` is shorter for staff bookmarks

---

## ADR-009: Fly API primary region sin until bom capacity stabilizes
Date: 2026-07-05
Author: agent
Status: Accepted
Context: `fly deploy` to `sonari-api` failed in CI and locally with `no capacity available in bom`. Fly docs list `bom` among high-demand regions; Mumbai Supabase stays in ap-south-1 regardless.
Decision: Set `primary_region = "sin"` (Singapore) in `apps/api/fly.toml` and deploy with `--ha=false` (single machine; Phase 0 has `min_machines_running = 0`). Revisit `bom` when Fly reports capacity or India edge improves.
Consequences:
  - `apps/api/fly.toml`, `.github/workflows/deploy-api.yml`, deployment sections in master/phase/backend plans
  - India API latency ~60–90ms (sin ↔ Mumbai) vs target <50ms in bom — acceptable for Phase 0 bootstrap
  - No code changes; hostname remains `sonari-api.fly.dev`
Alternatives considered:
  - Retry bom only: rejected — failed with 1 machine (`--ha=false`) and 2 machines
  - Wait for Fly capacity: rejected — blocks CI and Phase 0 acceptance indefinitely

---



