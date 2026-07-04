# Sonari — Jewellery ERP Plans

A complete, phase-by-phase plan for building an enterprise-grade, India-first jewellery billing + ERP SaaS.

## Read in this order

1. **[00-MASTER-PLAN.md](./00-MASTER-PLAN.md)** ← start here
2. Then the module docs you need:
   - [01-architecture.md](./01-architecture.md) — System diagram, tenant isolation
   - [02-data-model.md](./02-data-model.md) — Full Postgres schema + RLS
   - [03-backend-api.md](./03-backend-api.md) — Fastify structure + endpoint contracts
   - [04-frontend-store-app.md](./04-frontend-store-app.md) — Store owner + staff app (main)
   - [05-frontend-super-admin.md](./05-frontend-super-admin.md) — SaaS admin app
   - [06-shared-modules.md](./06-shared-modules.md) — Shared packages (domain, notifications, LLM, offline, PDF, UI)
   - [07-offline-sync.md](./07-offline-sync.md) — Offline-first, Dexie, sync engine, conflict rules
   - [08-billing-engine.md](./08-billing-engine.md) — Pricing math, GST, TCS, HUID, rounding
   - [09-stitch-figma-prompts.md](./09-stitch-figma-prompts.md) — Copy-paste prompts for Stitch/v0
3. Then the phase you're building:
   - [10-phase-0-foundation.md](./10-phase-0-foundation.md) — 1 week
   - [11-phase-1-mvp.md](./11-phase-1-mvp.md) — 8-10 weeks (usable product)
   - [12-phase-2-depth.md](./12-phase-2-depth.md) — 6-8 weeks (karigar, schemes, loyalty, SaaS billing)
   - [13-phase-3-voice-ai.md](./13-phase-3-voice-ai.md) — 4-6 weeks (voice billing, AI insights)
   - [14-phase-4-scale.md](./14-phase-4-scale.md) — 4 weeks (hardware, native apps, wholesale)
4. Reference before writing code:
   - [15-coding-standards.md](./15-coding-standards.md) — Coding standards + Definition of Done
   - [16-differentiators.md](./16-differentiators.md) — Features competitors don't have
   - [17-ui-components.md](./17-ui-components.md) — **UI library (shadcn + IndiaCN) + component reuse workflow (READ before any UI work)**
   - [18-ai-agent-manual.md](./18-ai-agent-manual.md) — **⭐ AI agent constitution (READ before any AI-assisted work)**
   - [DECISIONS.md](./DECISIONS.md) — **ADR log — every non-trivial deviation from plans is here**

## Tech stack (locked)

Node.js + TypeScript + Fastify · **Vite + React 18** · React Router v6 · Tailwind · **shadcn/ui + IndiaCN UI** · Radix primitives · Supabase (Postgres, Auth, Storage, Realtime) · BullMQ + Upstash Redis · Dexie for IndexedDB · Deployed on Cloudflare Pages (or Vercel) + Fly.io Mumbai.

> **Note:** We picked **Vite + React** over Next.js because our apps are auth-gated PWAs with no SEO need. See `00-MASTER-PLAN.md` §4 and `04-frontend-store-app.md` §20 for the full rationale.
>
> **UI note:** We picked **shadcn/ui + IndiaCN UI** over Ant Design / MUI for ownership, smaller bundles, and India-specific pre-built components. See `17-ui-components.md` for the reuse workflow.

## Cost trajectory

- Start: **~$0-5/mo**
- 100 tenants: **~$85/mo**
- 1000 tenants: **~$300/mo**

## Product principles

- Multi-tenant SaaS from day one
- Offline-first (not offline-tolerant)
- Minimalist UI, maximalist backend
- Three-input rule per screen
- Money never uses JS floats
- Every provider is swappable
- Every mutation is idempotent
- Every table is tenant-scoped

## Repo layout (as implemented)

Monorepo at **repository root** (not a nested `sonari/` folder). Packages are `@sonari/*`. See `00-MASTER-PLAN.md` §3 and `10-phase-0-foundation.md`.

## For AI agents working here

**Read `18-ai-agent-manual.md` before touching code.** That file is the constitution.
Then `00-MASTER-PLAN.md` §10, then `15-coding-standards.md` §13, then the task-specific plans.
Never exceed current phase scope. Never N+1. Never bypass RLS.

**Always update plans in the same change as code** when reality diverges — do not wait for the human to ask. Cursor rules in `.cursor/rules/` enforce this.

---
_Last updated: 2026-07-04_
