# 01 — System Architecture

**Last-updated:** 2026-07-04
**Prereq reading:** [00-MASTER-PLAN.md](./00-MASTER-PLAN.md)

> **Change note (2026-07-04):** Diagram updated to Vite SPAs on Cloudflare Pages (ADR-001, ADR-003). Next.js references removed.

---

## 1. High-level diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        USER DEVICES                                │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────┐    │
│  │ Store App (PWA)  │   │ Store App (PWA)  │   │ Admin App    │    │
│  │ Owner iPad       │   │ Staff desktop    │   │ You / ops    │    │
│  └────────┬─────────┘   └────────┬─────────┘   └──────┬───────┘    │
│           │ HTTPS + JWT           │ HTTPS + JWT       │ HTTPS + JWT│
└───────────┼──────────────────────┼───────────────────┼─────────────┘
            │                      │                   │
            ▼                      ▼                   ▼
┌────────────────────────────────────────────────────────────────────┐
│              EDGE (Cloudflare Pages / Fly.io Singapore)            │
│  ┌─────────────────────────┐    ┌───────────────────────────────┐  │
│  │ Vite Store (CF Pages)   │    │  Fastify API (Fly.io sin)     │  │
│  │  - SPA + PWA / Workbox  │    │  - REST + WS                  │  │
│  │  - React Router v6      │◄──►│  - Zod validation             │  │
│  │  - CSR app shell        │    │  - RLS-aware Supabase client  │  │
│  └─────────────────────────┘    │  - BullMQ producers           │  │
│  ┌─────────────────────────┐    └───────────────┬───────────────┘  │
│  │ Vite Admin (CF Pages)   │                    │                  │
│  └─────────────────────────┘                    │                  │
└─────────────────────────────────────────────────┼──────────────────┘
                                                  │
      ┌───────────────────────────────────────────┼────────────┐
      ▼                                           ▼            ▼
┌──────────────┐   ┌─────────────────┐   ┌────────────────┐  ┌────────────────┐
│ Supabase     │   │ Upstash Redis   │   │ Providers      │  │ LLM / STT       │
│ (ap-south-1) │   │ (BullMQ queues) │   │ Resend/MSG91/  │  │ Anthropic/       │
│  Postgres    │   │  - bill.sync    │   │ WhatsApp Cloud │  │ OpenAI/Whisper  │
│  Auth        │   │  - notify       │   └────────────────┘  └────────────────┘
│  Storage     │   │  - llm.parse    │
│  Realtime    │   └─────────────────┘
└──────────────┘
```

## 2. Request lifecycle (bill creation, offline)

```
[User taps "New Bill"]
    │
    ▼
[Store PWA] ── generates client_uuid, writes to IndexedDB "bills" store (status=pending)
    │
    ▼
[UI updates instantly from IndexedDB]
    │
    ▼
[Sync engine] ── if online: POST /api/bills with idempotency key = client_uuid
    │                                            │
    │                                            ▼
    │                                    [Fastify API]
    │                                            │
    │                                            ├─ verify JWT, extract tenant_id
    │                                            ├─ validate Zod schema
    │                                            ├─ call domain.createBill()
    │                                            ├─ Supabase INSERT (RLS enforces tenant)
    │                                            ├─ enqueue notification job
    │                                            └─ return { bill_id, server_ts }
    │                                            │
    ▼                                            ▼
[Sync engine] ── receives ack, marks IndexedDB row status=synced
    │
    ▼
[If offline] ── retries with exponential backoff when connection returns
```

## 3. Tenant isolation model

**Multi-tenant SaaS** — one Postgres, isolation via **Row-Level Security (RLS)**.

- Every business table has `tenant_id UUID NOT NULL` column.
- Supabase Auth JWT carries `tenant_id` as a custom claim (set on signup via trigger).
- RLS policy on every table:
  ```sql
  CREATE POLICY tenant_isolation ON <table>
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
  ```
- **Super Admin bypass:** JWT with `role = 'super_admin'` → policy `USING (true)`.
- Cross-tenant analytics for Super Admin go through a `security definer` function that explicitly aggregates without exposing row-level data to the caller.

## 4. Roles

| Role | Scope | Set by |
|------|-------|--------|
| `super_admin` | All tenants | Manual seed |
| `store_owner` | One tenant | On tenant creation |
| `manager` | One tenant, one or more branches | Owner invite |
| `staff` | One tenant, one branch | Owner/manager invite |
| `karigar` | One tenant, limited (view own jobs) | Owner invite |
| `customer` (future) | One tenant, self only | Self signup (Phase 3+) |

Roles stored in `memberships` table: `(user_id, tenant_id, branch_id NULL, role)`.

## 5. Data flow — key patterns

### 5.1 Rate updates (Realtime broadcast)
- Super Admin (or automated feed) writes to `metal_rates` table.
- Postgres trigger publishes to Supabase Realtime channel `rates:<tenant_id>` (or `rates:global`).
- All open Store App tabs subscribe → live rate updates in bill preview without refresh.

### 5.2 Barcode scan
- Camera path: `@zxing/browser` decodes → emits `barcode.scanned` event.
- USB HID path: keyboard-wedge scanner types digits + Enter → global input listener catches → emits same event.
- Handler: lookup `items` by `barcode` (indexed unique), add to current bill draft.

### 5.3 Notifications
- Any module dispatches `notifications.send({ channel, template, to, data })`.
- Enqueued to BullMQ `notify` queue.
- Worker resolves provider from `packages/notifications` → sends → writes to `notification_log` for audit.

## 6. Offline-first architecture (summary)

Deep dive in [07-offline-sync.md](./07-offline-sync.md). Summary:

- **Dexie (IndexedDB wrapper)** for local storage.
- **Local schema mirrors server schema** for user-facing tables (items, customers, bills, drafts).
- **Sync engine** runs on:
  - App start
  - Network reconnect
  - Manual "Sync now"
  - Every 30s if online (cheap delta pull)
- **Write path:** local-first, always. Sync queued.
- **Read path:** local-first with background refresh (stale-while-revalidate).
- **Conflicts:** last-writer-wins on non-money fields; money fields use event-sourced append (a bill line is immutable once server-acked).

## 7. Security architecture

- **All traffic HTTPS.** HSTS enforced.
- **JWT rotation** every 60 min. Refresh token 30 days, revocable per session.
- **Rate limiting** at Fastify: 100 req/min/IP for auth endpoints, 300 req/min/user for others.
- **Input validation:** Zod on every endpoint. Reject malformed early.
- **SQL injection:** impossible — parameterised queries via Supabase JS client and postgres.js.
- **XSS:** React auto-escapes. No `dangerouslySetInnerHTML` allowed without ADR.
- **Secrets:** Vercel + Fly.io env vars. Never in git. `.env.example` only.
- **Audit log:** `audit_events` table for every mutation on financial data (bills, payments, stock adjustments).
- **PII encryption at rest:** Supabase default (AES-256). Customer phone/email stored as-is; masked in UI for staff-role.

## 8. Observability

- **Errors:** Sentry (FE + BE, source-map upload in CI).
- **Logs:** Fastify pino JSON → Fly.io log drain → Better Stack (free tier).
- **Metrics:** PostHog for product analytics; Fly.io built-in for infra.
- **Uptime:** UptimeRobot pinging `/health` every 5 min → SMS alert to owner.

## 9. Failure modes and mitigations

| Failure | Mitigation |
|---------|-----------|
| Supabase down | Store app runs offline; sync queue drains when back |
| API server down | Store app runs offline; static Vite SPAs still serve from Cloudflare Pages |
| Rate feed stale | UI shows "last updated Xm ago"; bills use last known rate + warning |
| WhatsApp API rate-limited | BullMQ retries with backoff; falls back to SMS after 3 fails |
| LLM provider outage | Voice/chat mode shows "Voice unavailable, use live-edit"; deterministic modes always work |
| Barcode scanner broken | Manual SKU search always available |

## 10. Non-functional targets (Phase 1)

- **API p95 latency:** < 200ms (excluding LLM calls)
- **PWA cold load:** < 3s on 3G (Lighthouse mobile)
- **Bill creation (live-edit):** first paint < 500ms, print PDF ready < 2s
- **Offline write ack (local):** < 50ms
- **Sync catch-up after 24h offline:** < 30s for typical shop volume (200 bills, 500 stock items)

## Changelog

- **2026-07-04:** High-level diagram and failure modes updated for Vite + Cloudflare Pages (removed Next.js / Vercel-as-primary).

