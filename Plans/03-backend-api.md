# 03 — Backend API (Fastify)

**Last-updated:** 2026-07-03
**Prereq:** [01-architecture.md](./01-architecture.md), [02-data-model.md](./02-data-model.md)

---

## 1. Folder layout — `apps/api`

```
apps/api/
├── src/
│   ├── server.ts              # Fastify bootstrap
│   ├── config/
│   │   └── env.ts             # Zod-validated env config
│   ├── plugins/
│   │   ├── auth.ts            # JWT verify, tenant injection
│   │   ├── supabase.ts        # Request-scoped RLS-aware client
│   │   ├── zod.ts             # Fastify Zod type provider
│   │   ├── rate-limit.ts
│   │   ├── sentry.ts
│   │   └── cors.ts
│   ├── modules/               # One folder per bounded context
│   │   ├── tenants/
│   │   │   ├── routes.ts
│   │   │   ├── service.ts
│   │   │   ├── schemas.ts     # Zod
│   │   │   └── tenants.test.ts
│   │   ├── branches/
│   │   ├── items/
│   │   ├── customers/
│   │   ├── bills/
│   │   ├── payments/
│   │   ├── rates/
│   │   ├── notifications/
│   │   ├── karigars/          # Phase 2
│   │   ├── schemes/           # Phase 2
│   │   ├── llm/               # Phase 3
│   │   └── admin/             # Super-admin endpoints
│   ├── workers/               # BullMQ workers
│   │   ├── notification.worker.ts
│   │   ├── sync.worker.ts
│   │   └── llm.worker.ts
│   ├── lib/
│   │   ├── errors.ts          # AppError classes
│   │   ├── idempotency.ts     # Client UUID handling
│   │   └── audit.ts
│   └── index.ts
├── test/
│   ├── setup.ts
│   └── helpers.ts             # Test tenant factory
├── Dockerfile
├── fly.toml
└── package.json
```

Rule: **any new endpoint has a module folder.** No shared "utils" bin — put it in the module or a shared package.

---

## 2. Bootstrap (server.ts)

```ts
import Fastify from 'fastify'
import { config } from './config/env'
import authPlugin from './plugins/auth'
import zodPlugin from './plugins/zod'
// ... other plugins
import { registerRoutes } from './modules'

export async function buildServer() {
  const app = Fastify({
    logger: { level: config.LOG_LEVEL, transport: config.isDev ? { target: 'pino-pretty' } : undefined },
    genReqId: () => crypto.randomUUID(),
    trustProxy: true,
  })

  await app.register(zodPlugin)
  await app.register(import('@fastify/helmet'))
  await app.register(import('@fastify/cors'), { origin: config.CORS_ORIGINS })
  await app.register(import('@fastify/rate-limit'), { max: 300, timeWindow: '1 minute' })
  await app.register(authPlugin)
  await app.register(import('./plugins/supabase'))
  await app.register(import('./plugins/sentry'))

  app.get('/health', async () => ({ ok: true, ts: Date.now() }))

  await registerRoutes(app)

  return app
}
```

---

## 3. Auth flow

1. Client authenticates via Supabase Auth (email+password or OTP) → gets Supabase JWT.
2. Client sends `Authorization: Bearer <supabase-jwt>` on every request.
3. `auth` plugin:
   - Verifies JWT with Supabase JWKS (cached).
   - Extracts `user_id`, `tenant_id` (custom claim), `role`.
   - Attaches to `request.auth`.
4. `supabase` plugin creates a **request-scoped Supabase client** using the raw JWT — this makes RLS work automatically on Postgres side.

```ts
// plugins/auth.ts
app.decorateRequest('auth', null)
app.addHook('preHandler', async (req, reply) => {
  const publicRoutes = ['/health', '/webhooks/*']
  if (publicRoutes.some(p => req.url.startsWith(p.replace('*','')))) return

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new UnauthorizedError()

  const payload = await verifySupabaseJwt(token)   // cached JWKS
  req.auth = {
    userId: payload.sub,
    tenantId: payload.app_metadata.tenant_id,
    role: payload.app_metadata.role,
    branchIds: payload.app_metadata.branch_ids ?? [],
    rawToken: token,
  }
})
```

---

## 4. Error handling

```ts
export class AppError extends Error {
  constructor(public code: string, public status: number, message: string, public details?: unknown) {
    super(message)
  }
}
export class ValidationError extends AppError { constructor(d?: unknown){ super('VALIDATION', 400, 'Validation failed', d) } }
export class UnauthorizedError extends AppError { constructor(){ super('UNAUTHORIZED', 401, 'Unauthorized') } }
export class ForbiddenError extends AppError { constructor(){ super('FORBIDDEN', 403, 'Forbidden') } }
export class NotFoundError extends AppError { constructor(what: string){ super('NOT_FOUND', 404, `${what} not found`) } }
export class ConflictError extends AppError { constructor(m: string){ super('CONFLICT', 409, m) } }
```

Fastify setErrorHandler formats to:
```json
{ "error": { "code": "VALIDATION", "message": "...", "details": {...}, "requestId": "..." } }
```

---

## 5. Endpoint contracts (Phase 1 surface)

**Base URL:** `/api/v1`. Prefixed inside each module.

### 5.1 Auth (bootstrap only — most auth is client-direct to Supabase)
- `POST /api/v1/auth/bootstrap` — After Supabase signup, create tenant + membership atomically.
- `POST /api/v1/auth/invite` — Owner invites staff/manager.
- `POST /api/v1/auth/accept-invite`

### 5.2 Tenants (Super Admin)
- `GET  /api/v1/admin/tenants`
- `POST /api/v1/admin/tenants`
- `PATCH /api/v1/admin/tenants/:id` (change plan, suspend, etc.)
- `GET  /api/v1/admin/tenants/:id/metrics`

### 5.3 Store setup
- `GET  /api/v1/store` — Current tenant profile
- `PATCH /api/v1/store` — Update profile (name, logo, GSTIN)
- `GET  /api/v1/store/branches`
- `POST /api/v1/store/branches`
- `PATCH /api/v1/store/branches/:id`
- `GET/POST/PATCH/DELETE /api/v1/store/staff`

### 5.4 Rates
- `GET  /api/v1/rates` — Current rates for all metals/purities
- `POST /api/v1/rates` — Set new rate (with `effective_from`)
- `GET  /api/v1/rates/history?from=&to=`

### 5.5 Categories
- CRUD `/api/v1/categories`

### 5.6 Items (stock)
- `GET  /api/v1/items?q=&category=&status=&cursor=`
- `GET  /api/v1/items/lookup/barcode/:code` — For scanning
- `GET  /api/v1/items/lookup/huid/:huid`
- `POST /api/v1/items` — Body includes optional images (base64 or already-uploaded URLs)
- `PATCH /api/v1/items/:id`
- `POST /api/v1/items/bulk-import` — CSV/Excel
- `POST /api/v1/items/:id/adjust` — Stock adjustment with reason (audit)

### 5.7 Customers
- CRUD `/api/v1/customers`
- `GET /api/v1/customers/lookup/phone/:phone` — For bill start
- `GET /api/v1/customers/:id/ledger` — metal + money statement

### 5.8 Bills
- `POST /api/v1/bills` — Create draft (with `client_uuid` for idempotency)
- `GET  /api/v1/bills?status=&from=&to=&customer=`
- `GET  /api/v1/bills/:id`
- `PATCH /api/v1/bills/:id` — Only while `draft`
- `POST /api/v1/bills/:id/confirm` — Locks bill, decrements stock atomically
- `POST /api/v1/bills/:id/cancel`
- `GET  /api/v1/bills/:id/pdf` — Returns PDF stream
- `POST /api/v1/bills/:id/send` — Body: `{channels: ['email','whatsapp']}`
- `POST /api/v1/bills/:id/payments`
- `GET  /api/v1/bills/preview` — **Live preview computation** (no DB write). Body = draft bill. Returns computed totals.

### 5.9 Chat billing
- `POST /api/v1/bills/chat/start` → returns session_id and first question
- `POST /api/v1/bills/chat/:sessionId/answer` → next question or `{ ready: true, draftBill }`

### 5.10 Sync
- `POST /api/v1/sync/pull` — Body: `{ since: ISOTs, tables: [...] }`, returns delta
- `POST /api/v1/sync/push` — Body: `[{ op, table, client_uuid, payload }]`, returns per-op result

### 5.11 Notifications
- `GET /api/v1/notifications/log?entity_type=&entity_id=`

### 5.12 Reports
- `GET /api/v1/reports/sales?from=&to=&group_by=`
- `GET /api/v1/reports/stock`
- `GET /api/v1/reports/gst?month=&year=`

### 5.13 Webhooks (from providers)
- `POST /webhooks/whatsapp` — Meta delivery status
- `POST /webhooks/sms` — MSG91 DLR
- `POST /webhooks/email` — Resend
- `POST /webhooks/payments` — Razorpay (Phase 2)

---

## 6. Zod schema pattern (shared)

Every request/response has a Zod schema in `packages/types/src/<module>.ts`, imported by both API and frontends.

```ts
// packages/types/src/bill.ts
export const BillLineSchema = z.object({
  clientUuid: z.string().uuid(),
  itemId: z.string().uuid().optional(),
  description: z.string().min(1).max(200),
  netWeight: z.number().nonnegative().max(9999.999),
  ratePerGram: z.number().nonnegative(),
  makingChargeType: z.enum(['flat','per_gram','percent']),
  makingChargeValue: z.number().nonnegative(),
  wastagePercent: z.number().min(0).max(30),
  taxRate: z.number().min(0).max(30),
  // ...
})
export type BillLine = z.infer<typeof BillLineSchema>

export const CreateBillSchema = z.object({
  clientUuid: z.string().uuid(),
  branchId: z.string().uuid(),
  customerId: z.string().uuid().nullable(),
  billDate: z.string().datetime(),
  type: z.enum(['sale','return','estimate','repair']),
  lines: z.array(BillLineSchema).min(1),
  oldGold: z.array(OldGoldSchema).optional(),
  payments: z.array(PaymentSchema).optional(),
})
```

---

## 7. Bill creation service (annotated example)

```ts
export async function createBill(input: CreateBillInput, ctx: RequestContext): Promise<Bill> {
  return ctx.db.transaction(async (trx) => {
    // 1. Idempotency check
    const existing = await trx.from('bills').select('id').eq('client_uuid', input.clientUuid).maybeSingle()
    if (existing.data) return getBill(existing.data.id, ctx)

    // 2. Snapshot rates
    const rates = await getCurrentRates(ctx.tenantId, trx)

    // 3. Compute totals (pure domain function)
    const computed = computeBillTotals({ input, rates, tenantConfig: ctx.tenantConfig })

    // 4. Reserve stock for confirmed bills only; drafts don't reserve
    // (draft = no stock impact; confirm endpoint handles reservation)

    // 5. Bill number reserved on confirm, not create-draft
    const bill = await trx.from('bills').insert({
      client_uuid: input.clientUuid,
      tenant_id: ctx.tenantId,
      branch_id: input.branchId,
      // ... all snapshot fields
      status: 'draft',
      rate_snapshot: rates,
      ...computed.totals,
    }).select().single()

    await trx.from('bill_items').insert(computed.lines.map(l => ({ ...l, bill_id: bill.data!.id, tenant_id: ctx.tenantId })))

    // 6. Audit
    await auditLog(ctx, { entity_type: 'bill', entity_id: bill.data!.id, action: 'create', after: bill.data })

    return bill.data
  })
}
```

Confirm endpoint:
- Transitions status draft→confirmed
- Assigns bill_number (branch counter increment, transactional)
- Marks item.status = 'sold', writes stock_movements
- Applies loyalty points, customer_metal_ledger entries
- Enqueues notification job (bill.created)
- Enqueues PDF pre-generation job

---

## 8. Idempotency

Every mutation endpoint accepts `Idempotency-Key` header **or** `client_uuid` in body (bills, items, etc.).

Implementation:
- Look up client_uuid in target table (unique index).
- If hit: return the existing resource (200 with same body).
- Else: create and return 201.

Applies to: bills, bill_items, payments, items, customers, stock_movements.

---

## 9. Rate limiting

- Global: 300 req/min/user
- Auth endpoints: 10 req/min/IP
- LLM endpoints: 60 req/min/user
- File uploads: 30 req/min/user

Response `429` with `Retry-After` header.

---

## 10. Testing

- **Unit tests** for services (`*.test.ts` co-located).
- **Integration tests** for routes using `fastify.inject()`.
- **Test tenant factory** in `test/helpers.ts` — creates isolated tenant + user + JWT per test file.
- **RLS leak test** — for every table, one test attempts cross-tenant read; must fail.
- Run with `vitest --coverage`.
- CI enforces ≥85% coverage on `apps/api/src/modules/**` and ≥95% on `packages/domain`.

---

## 11. Deployment (Fly.io)

`fly.toml`:
```toml
app = "sonari-api"
primary_region = "bom"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[services.ports]]
  handlers = ["http", "tls"]
  port = 443
```

- Secrets via `fly secrets set`.
- `min_machines_running = 1` for warm start (avoid cold start on first bill of the day).
- Scale via `fly scale count 2` when CCU > 100.

---

## 12. Observability endpoints

- `GET /health` — Liveness (returns 200 always if process alive)
- `GET /ready` — Readiness (DB connected, Redis connected)
- `GET /metrics` — Prometheus format (behind admin token)
