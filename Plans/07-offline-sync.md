# 07 — Offline Sync

**Last-updated:** 2026-07-03
**Prereq:** [01-architecture.md](./01-architecture.md), [02-data-model.md](./02-data-model.md)

Offline is the baseline, not a feature. This document is authoritative — any sync-related PR references this file.

---

## 1. Local storage — Dexie (IndexedDB)

DB name: `sonari_<tenant_id>`. Fresh DB per tenant so switching tenants is clean.

### 1.1 Object stores (mirror server tables for user-facing data)

- `items` — full item objects, indexed by `barcode`, `sku`, `huid`
- `customers` — indexed by `phone`
- `bills` — indexed by `client_uuid`, `status`, `bill_date`
- `bill_items` — indexed by `bill_id`
- `payments` — indexed by `bill_id`
- `categories`
- `metal_rates` — latest per (metal, purity)
- `staff` (memberships subset for name lookup)

### 1.2 Meta store

- `sync_state` — `{ table, last_pulled_at, cursor }`
- `pending_ops` — the outbound write queue

---

## 2. Write path (offline-first)

Every mutation follows this contract:

```ts
async function saveBillDraft(input: BillDraft) {
  const clientUuid = input.clientUuid ?? crypto.randomUUID()
  const now = new Date().toISOString()
  const record = { ...input, clientUuid, updatedAt: now, _syncStatus: 'pending' }

  await db.bills.put(record)                                   // 1. Write local
  await db.pending_ops.add({                                    // 2. Queue op
    id: crypto.randomUUID(),
    op: 'upsert',
    table: 'bills',
    clientUuid,
    payload: record,
    attempts: 0,
    createdAt: now,
  })
  syncEngine.wake()                                             // 3. Kick sync
  return record                                                 // 4. UI updates
}
```

The UI **never awaits network**. It awaits IndexedDB (single-digit ms).

---

## 3. Sync engine

State machine:

```
idle ──wake()──► pulling ──ok──► pushing ──ok──► idle
                    │                │
                    └────error───────┴──► backoff (exp: 2s, 4s, 8s, 30s max) ──► pulling
```

Triggers:
- App boot
- `navigator.onLine` becomes true
- Every 30s while online (cheap delta)
- Manual "Sync now" button
- After every enqueue in `pending_ops`

### 3.1 Pull

```
POST /api/v1/sync/pull
{
  since: <max updatedAt across all tables locally>,
  tables: ['items','customers','metal_rates','categories','bills','bill_items','payments']
}
→
{
  data: {
    items: [...],
    customers: [...],
    ...
  },
  server_ts: '2026-07-03T...'
}
```

Client:
- Applies rows into corresponding Dexie stores.
- Records `sync_state.last_pulled_at`.
- Skips rows where local version has `_syncStatus = 'pending'` and same `client_uuid` (avoids overwriting unsynced local changes).

Server implementation:
- Simple SQL per table: `WHERE tenant_id = $tenant AND updated_at > $since ORDER BY updated_at LIMIT 1000`
- Includes soft-deleted rows so client mirrors deletions.
- Paginated via `cursor` if > 1000 rows.

### 3.2 Push

Serialised. Batches of 50.

```
POST /api/v1/sync/push
[
  { op: 'upsert', table: 'bills', clientUuid: '...', payload: {...} },
  { op: 'upsert', table: 'bill_items', clientUuid: '...', payload: {...} },
  ...
]
→
[
  { clientUuid: '...', status: 'applied', serverId: '...', serverTs: '...' },
  { clientUuid: '...', status: 'rejected', code: 'CONFLICT', message: '...' },
  ...
]
```

Client on `applied`:
- Marks pending_ops row as done and deletes it.
- Updates the local record's `_syncStatus` to `synced`, replaces `id` with `serverId` if needed (bills use client_uuid as primary key locally to avoid rewiring).

Client on `rejected` (conflict):
- Applies resolution rule (see below).
- If unrecoverable: opens **sync error inbox** (see §5).

---

## 4. Conflict resolution rules

Table-by-table policy. Deterministic — no user prompt for common cases.

| Table | Rule |
|-------|------|
| `items` (attributes) | Last-writer-wins on `updated_at` |
| `items` (status transitions) | Server wins if state was `sold` — you can't "un-sell" offline |
| `customers` | Last-writer-wins on `updated_at`; phone conflicts merge via server function |
| `bills` (draft) | Client wins if `status = draft` locally |
| `bills` (confirmed) | **Confirmed bills are immutable.** Client attempt to edit a server-confirmed bill → rejected, local reverts |
| `bill_items` | Only editable while parent bill is draft; cascade rule of bill |
| `payments` | Append-only; never conflicts |
| `stock_movements` | Append-only; server assigns final `id` |
| `metal_rates` | Server wins always |

If two devices both confirmed the same bill (`client_uuid` collision):
- Server returns the first-confirmed one.
- Second device's confirmation is rejected with code `ALREADY_CONFIRMED`.
- Client shows a toast: "This bill was already confirmed on another device. Loading server copy."

---

## 5. Sync error inbox

Route: `/sync`.

When an op fails after 5 retries or is unrecoverably rejected:
- Move it from `pending_ops` to `sync_failures` local store.
- Increment a counter in the topbar (small red dot).
- User opens `/sync` → sees each failure with a diff (local vs server), can:
  - **Retry**
  - **Keep local** (force-push with `override=true` flag; audit-logged)
  - **Discard local** (accept server state)

This is the only place the UI ever exposes offline complexity.

---

## 6. What is safe offline

**Fully offline (no network needed):**
- Create bills (draft + confirm)
- Add/edit stock items (except image upload — queued)
- Add/edit customers
- Create payments
- Print PDFs (client-side renderer)
- View any data previously pulled

**Requires online:**
- Sending WhatsApp/SMS/Email (queued but flagged as `pending_send` until online)
- File uploads (queued, uploaded on reconnect)
- Voice/LLM billing (Phase 3) — falls back to chat/live-edit modes
- Live rate updates (uses last cached rate with a "stale" warning if > 4h)
- Reports (some can be computed locally; complex ones require server)

---

## 7. First-time login

On login:
- Full snapshot pull: items, customers, categories, rates, staff, latest 90 days of bills.
- Progress bar visible.
- Estimated: 500 items + 200 customers + 300 bills ≈ 2 MB, < 5s on 4G.
- Post-snapshot: incremental delta pulls only.

For very large tenants (Phase 2+): partial hydration — load items only when the user opens Stock; bills only when user opens Bills.

---

## 8. Cache eviction

- Bills > 1 year old kept on server only; lazily loaded when user searches.
- Images: LRU cache, 100MB cap. Missing images show placeholder + fetch on demand.
- Old drafts (`status=draft` + `updated_at > 30 days` + no server presence) auto-purged with confirmation banner.

---

## 9. Testing offline

- Playwright tests use `page.context().setOffline(true)`.
- Manual QA checklist in [15-coding-standards.md](./15-coding-standards.md) → "Offline release gate".
- CI runs a synthetic **24-hour offline replay** — writes 200 bills offline, then goes online, must sync in < 30s.

---

## 10. Failure modes the user sees

| Situation | UX |
|-----------|-----|
| Currently offline, all writes succeed locally | No indicator. Small dot on user avatar shows "queued: N". |
| Sync catching up on reconnect | Progress bar under topbar, dismisses when done. |
| Conflict resolved automatically | No indicator. |
| Conflict requires user action | Red dot on topbar → `/sync` inbox. |
| Server rejected a confirmed bill | Toast + local revert to server state. |
| Server unreachable > 5 min | Small banner: "Reconnecting…"; no work interrupted. |
| Auth expired offline | User can keep working; blocked at sync time; prompted to re-auth. Local writes preserved. |
