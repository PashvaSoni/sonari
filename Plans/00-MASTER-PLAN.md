# Jewelry ERP — Master Plan

> **Product name (working):** *Sonari* (Hindi: "goldsmith"). Change anytime.
> **This is the master document.** Any AI agent or developer should read this file first, then jump to the sub-plan for the phase/module they are working on.

---

## 1. Vision (one paragraph)

A multi-tenant SaaS jewellery ERP built India-first (HUID, GST, TCS) with an obsessive focus on **doing more with less user input**. Store owners create bills in three ways — chat-style Q&A, live-editable bill preview, or voice/LLM dictation. The system handles metal rate math, wastage, making charges, GST, and HUID capture in the background. Offline-first PWA so shops never lose a sale when internet dies. Karigar tracking, savings schemes, loyalty, and multi-branch built in.

## 2. Target user & non-goals

**Primary user:** Small-to-mid Indian jewellery store owners + their counter staff.
**Secondary user (Super Admin):** *You* — managing tenants (stores), subscriptions, feature flags, global rates.

**Non-goals for v1:**
- No hardware integrations (scale/thermal printer/RFID) — Phase 3+
- No native mobile app — responsive PWA covers Phase 1
- No end-customer-facing payment gateway — Phase 2
- No fine-tuned LLM — use Claude/GPT-4 with domain prompt when we add voice

## 3. Three deliverables (apps)

| # | App | Users | Stack |
|---|-----|-------|-------|
| 1 | **Store App** (main) | Store Owner, Manager, Staff | Vite + React 18 + TS + Tailwind + shadcn/ui, PWA (vite-plugin-pwa) |
| 2 | **Super Admin App** | You + your ops team | Vite + React 18 + TS + Tailwind + shadcn/ui |
| 3 | **Backend API** | Both apps consume | Node.js + TypeScript + Fastify + Supabase (Postgres, Auth, Storage, Realtime) |
| 4 | **Marketing site** (Phase 2+) | Public visitors | Deferred — will use Astro static site when SEO becomes a priority. For now, a single `index.html` login-redirect page hosted on Vercel is enough. |

**Why Vite + React over Next.js:** Our apps are auth-gated PWAs with no SEO requirement. Next.js's SSR / RSC / App Router adds complexity we don't use. Vite gives ~50ms HMR, smaller bundles, simpler mental model, and offline-first fits an SPA more naturally. Marketing site is a separate concern deferred to when SEO matters.

**Repo strategy:** Monorepo using **Turborepo + pnpm workspaces**. Scaffold lives at the **repo root** (not a nested `sonari/` folder). Package scope is `@sonari/*`.

```
.                          # repo root (e.g. Billing/)
├── apps/
│   ├── store/             # Store owner + staff app (main) — Vite SPA
│   ├── admin/             # Super admin app — Vite SPA
│   └── api/               # Fastify backend
├── packages/
│   ├── config/            # Shared TS / ESLint / Prettier / Tailwind
│   ├── types/             # Shared Zod schemas + TS types
│   ├── domain/            # Pure business logic (billing math, GST, HUID)
│   ├── db/                # Supabase client, schema helpers
│   ├── ui/                # Shared shadcn + IndiaCN components
│   ├── notifications/     # Email/SMS/WhatsApp provider abstraction
│   ├── llm/               # LLM provider abstraction (Claude/GPT/Whisper)
│   ├── offline/           # IndexedDB adapter + sync engine
│   ├── pdf/               # Invoice PDF generation
│   └── barcode/           # Camera + USB HID barcode helpers
├── supabase/              # CLI config + migrations (applied via supabase CLI)
│   └── migrations/
├── Plans/                 # Product + engineering plans (source of truth)
├── .cursor/rules/         # Agent rules (must stay in sync with Plans/)
├── .github/               # CI, PR template, CODEOWNERS
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 4. Tech stack (locked)

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend build | **Vite 5 + React 18 + TypeScript** | Fastest HMR, smallest bundle, simple mental model, no SSR complexity we don't need |
| Routing | **React Router v6 (data routers)** | Battle-tested, `createBrowserRouter` gives loaders/actions similar DX to Next.js without the runtime |
| PWA | **vite-plugin-pwa (Workbox)** | Service worker, install prompts (wired in Phase 1) |
| Styling | **Tailwind CSS + shadcn/ui + IndiaCN UI + Radix primitives** | Minimalist, ownership, accessible, India-specific components pre-built. See [17-ui-components.md](./17-ui-components.md) |
| State (client) | **Zustand + TanStack Query** | Simple, no Redux boilerplate; TanStack Query has `persistQueryClient` for offline reads |
| Forms | **React Hook Form + Zod** | Type-safe validation shared with backend |
| Backend framework | **Fastify + TypeScript** | 2-3x faster than Express, first-class TS |
| Database | **Supabase Postgres** | Managed, RLS for tenant isolation, realtime |
| Auth | **Supabase Auth** (email/password + OTP) | Free, JWT-based, works with RLS |
| File storage | **Supabase Storage** | Item images, HUID scans, karigar docs |
| Realtime | **Supabase Realtime** | Live rate pushes, bill updates on multi-counter |
| Background jobs | **BullMQ + Upstash Redis** | Free tier fits Phase 1 |
| Offline | **IndexedDB (via Dexie) + custom sync engine** | Full offline billing |
| Error tracking | **Sentry** (`@sentry/react` for store/admin, `@sentry/node` for api) | Vite SDKs — not `@sentry/nextjs` |
| LLM (later) | **Anthropic Claude / OpenAI GPT via provider abstraction** | Swappable |
| Voice STT (later) | **OpenAI Whisper / Deepgram** | Swappable |
| Notifications | **Resend (email) + MSG91 (SMS) + Meta WhatsApp Cloud API** | India-friendly, swappable |
| Barcode | **@zxing/browser** (camera) + USB HID reader event listener | Web-native |
| PDF | **@react-pdf/renderer** | Invoice generation |
| Image optimization | **Cloudflare Images** (or `<img loading="lazy">` + client-side WebP compression) | We avoid `next/image` since no Next.js |
| Analytics | **PostHog (self-host optional)** | Product analytics |
| Testing | **Vitest + Playwright + Testing Library** | Fast, modern |
| CI/CD | **GitHub Actions** | Free for public/private |

## 5. Deployment topology

| Component | Where | Cost @ start | Cost @ 100 stores | Cost @ 1000 stores |
|-----------|-------|-------------|-------------------|---------------------|
| Store App (Vite SPA) | **Cloudflare Pages** or **Vercel** (static build) | Free | Free-$10/mo | ~$20/mo |
| Admin App (Vite SPA) | **Cloudflare Pages** or **Vercel** | Free | Free | Free |
| API (Fastify) | **Fly.io** (shared-cpu-1x, 256MB, autoscale) | Free | ~$15/mo | ~$50/mo |
| Postgres + Auth + Storage | **Supabase** (Free → Pro) | Free | $25/mo | ~$100/mo |
| Redis (BullMQ) | **Upstash** (pay-per-request) | Free | ~$5/mo | ~$20/mo |
| PDF/image storage | Supabase Storage | Free | included | ~$10/mo |
| Domain + email | Cloudflare + Resend | ~$12/yr + free | ~$12/yr + $20/mo | ~$50/mo |
| **TOTAL** | | **~$0-5/mo** | **~$85/mo** | **~$300/mo** |

**Region:** Supabase region **Mumbai (ap-south-1)**. Fly.io region **bom (Mumbai)**. Latency for India < 50ms.

## 6. Phased delivery

Each phase has its own MD file with acceptance criteria. Ship phase-by-phase — nothing merges to `main` until its phase acceptance passes.

| Phase | Duration | File | Outcome |
|-------|----------|------|---------|
| **Phase 0 — Foundation** | 1 week | [10-phase-0-foundation.md](./10-phase-0-foundation.md) | Monorepo, CI, Supabase, deploy skeleton |
| **Phase 1 — MVP (usable product)** | 8-10 weeks | [11-phase-1-mvp.md](./11-phase-1-mvp.md) | Store setup, stock, barcode, billing (chat + live-edit), GST, HUID, print, offline sync, customers |
| **Phase 2 — Depth** | 6-8 weeks | [12-phase-2-depth.md](./12-phase-2-depth.md) | Karigar module, old gold exchange, repairs, savings schemes, loyalty, SaaS billing (Razorpay) |
| **Phase 3 — Voice & AI** | 4-6 weeks | [13-phase-3-voice-ai.md](./13-phase-3-voice-ai.md) | Voice-to-bill, LLM parsing + rule validation, AI insights |
| **Phase 4 — Scale** | 4 weeks | [14-phase-4-scale.md](./14-phase-4-scale.md) | Multi-branch UX polish, RFID, thermal printer, weighing scale, franchise/wholesale |

## 7. Sub-plans (module specs)

Cross-cutting shared modules — every phase touches these:

| File | What it covers |
|------|----------------|
| [01-architecture.md](./01-architecture.md) | System diagram, data flow, tenant isolation model |
| [02-data-model.md](./02-data-model.md) | Full Postgres schema, RLS policies, indexes |
| [03-backend-api.md](./03-backend-api.md) | API structure, auth, all endpoint contracts |
| [04-frontend-store-app.md](./04-frontend-store-app.md) | Store app IA, routes, components, all three billing modes |
| [05-frontend-super-admin.md](./05-frontend-super-admin.md) | Super Admin IA, tenant mgmt, plans, feature flags |
| [06-shared-modules.md](./06-shared-modules.md) | Notifications, LLM, offline, rate engine, billing engine — all shared packages |
| [07-offline-sync.md](./07-offline-sync.md) | IndexedDB schema, sync protocol, conflict resolution |
| [08-billing-engine.md](./08-billing-engine.md) | Pricing math, GST/TCS/HUID rules, bill types |
| [09-stitch-figma-prompts.md](./09-stitch-figma-prompts.md) | Copy-paste prompts for Google Stitch to generate mockups |
| [15-coding-standards.md](./15-coding-standards.md) | Naming, folder layout, testing, PR rules, definition-of-done |
| [16-differentiators.md](./16-differentiators.md) | Features competitors don't have — the "wow" list |
| [17-ui-components.md](./17-ui-components.md) | **UI library choice (shadcn + IndiaCN), reuse workflow, `packages/ui` catalog rules** |
| [18-ai-agent-manual.md](./18-ai-agent-manual.md) | **⭐ AI agent constitution — mandatory read for any AI touching this repo** |
| [DECISIONS.md](./DECISIONS.md) | **ADR log — every non-trivial deviation from plans lives here** |

## 8. Design principles (non-negotiable)

1. **Minimalist UI, maximalist backend.** Every screen should ask for the *minimum* the user must type. Everything else is inferred, defaulted, or auto-completed from stock/customer history.
2. **Three-input rule.** No form asks for more than 3 inputs above the fold. Progressive disclosure for the rest.
3. **Offline is not a feature, it's the baseline.** Every write path must work offline and queue for sync.
4. **Tenant-scoped by default.** Every table has `tenant_id`. Every RLS policy filters by JWT `tenant_id`. No cross-tenant reads possible even by accident.
5. **Domain logic is pure.** `packages/domain` has zero I/O. Billing math is unit-tested to 100%.
6. **Providers are swappable.** LLM, SMS, WhatsApp, PG — all behind interfaces in `packages/*` so we can change vendor without touching apps.
7. **Money is `decimal`, never `float`.** All amounts in `NUMERIC(14,2)`. Weights in `NUMERIC(10,3)`. Never JS `number`.
8. **Rates are audited.** Every bill snapshots the metal rate used. Rate changes are event-sourced.
9. **HUID is scanned or typed once, verified always.** BIS format validated client + server.
10. **Every action is idempotent by client-generated UUID.** Offline retry + double-click safety.
11. **UI components are reused, never re-created.** Before making any UI element, check `packages/ui/COMPONENTS.md`. New shared components go into `packages/ui`. See [17-ui-components.md](./17-ui-components.md) for the mandatory workflow.

## 9. Definition of Done (per feature)

A feature is only "done" when ALL of these are true:

- [ ] Domain logic has unit tests (Vitest) with ≥90% coverage
- [ ] API endpoint has integration test (Fastify test harness)
- [ ] UI has one Playwright happy-path test
- [ ] Works offline (if it's a write path) — verified in DevTools offline mode
- [ ] RLS policy tested with a second tenant (data leak test)
- [ ] Zod schema shared between FE + BE
- [ ] Loading, empty, error states designed
- [ ] Mobile responsive at 375px width
- [ ] Accessibility: keyboard navigable, ARIA labels present
- [ ] Sentry error boundary catches unexpected errors
- [ ] Docs updated (relevant sub-plan MD file)

## 10. How AI agents should use this repo

**Any AI agent (Claude, Cursor, Copilot, Windsurf, Cody, Aider, or any future model) working on this project MUST read `18-ai-agent-manual.md` before touching code.** That file is the constitution — it covers:

- Mandatory read order per task type
- When to ASK vs when to PROCEED
- Reuse-before-rebuild workflow
- Modules impact analysis (required in every PR)
- Query efficiency rules (anti-N+1, when to use VIEWS / RPC / Edge / jobs)
- Doc update contract (update plans in the SAME PR)
- The PR contract
- Escalation triggers
- Hard "no"s

Non-negotiable summary (details in `18-ai-agent-manual.md`):

1. **Start by reading `00-MASTER-PLAN.md` (this file) + `18-ai-agent-manual.md` + `15-coding-standards.md`.**
2. Read the relevant phase file (`10-` through `14-`).
3. Read the relevant module file (`01-` through `09-`, `17-`).
4. Check the phase's acceptance criteria — do not exceed scope.
5. Fill the modules impact table before writing code.
6. Run the query-efficiency self-check for any new data access.
7. Never introduce a new library without an ADR in `DECISIONS.md`.
8. Never break tenant isolation.
9. Reuse from `packages/ui`, `packages/domain`, `packages/types` before creating new code.
10. Update plan MDs in the same PR when reality changes.
11. Ask (with options + recommendation) when ambiguous.

## 11. Living document

This file is versioned. When something material changes (stack, phase order, module boundary), update this file first, then propagate to sub-plans. Every sub-plan has a `Last-updated:` header. Stale files > 30 days must be reviewed.

**Agents:** any code or process change that diverges from these plans must update the relevant plan MD (and ADR if non-trivial) in the **same change** — do not wait to be asked.

**Last-updated:** 2026-07-04
**Owner:** Store owner (you)
**Version:** 1.0.1

## Changelog

- **2026-07-04:** Repo root monorepo layout (not nested `sonari/`); full package list; Sentry Vite SDKs; PWA row no longer references next-pwa.
