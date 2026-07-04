# 11 — Phase 1: MVP

**Last-updated:** 2026-07-03
**Duration:** 8–10 weeks
**Goal:** a store owner can sign up, set up their store, add stock, and create real bills — offline, GST-compliant, with HUID.

---

## Feature list (locked)

### Auth & tenancy
- [ ] Signup (email/password + phone OTP)
- [ ] Post-signup wizard: store profile, first branch, first rates
- [ ] Invite staff/manager by phone or email
- [ ] Role-based UI hiding (staff can't see cost prices, danger settings)

### Store setup
- [ ] Store profile (name, GSTIN, PAN, logo, address)
- [ ] Branches CRUD (default = 1)
- [ ] Staff CRUD with roles
- [ ] Invoice template settings (prefix, terms, signature line)
- [ ] Notification template overrides (bill.created only)

### Rates
- [ ] Manual rate entry per metal + purity
- [ ] History chart (30 days)
- [ ] Realtime propagation to open bill sessions

### Categories & stock
- [ ] Category tree CRUD
- [ ] Item CRUD with images
- [ ] SKU + barcode auto-generation
- [ ] HUID capture (BIS validated)
- [ ] Bulk CSV import
- [ ] Barcode scanning (camera + USB HID)
- [ ] Stock adjustments with reason

### Customers
- [ ] Customer CRUD
- [ ] Phone-based dedup lookup
- [ ] Customer metal ledger (basic view)

### Billing — the crown jewel
- [ ] Mode picker
- [ ] Live-edit mode (full functionality)
- [ ] Chat mode (deterministic Q&A tree, not LLM yet)
- [ ] Voice mode wireframe stub (Phase 3 wiring)
- [ ] Bill draft → confirm → PDF
- [ ] GST split (intra/inter state, composition supported)
- [ ] HSN + HUID on invoice
- [ ] Old gold exchange (single-tier, simple)
- [ ] Multiple payment methods
- [ ] Print (A4/A5) + Download PDF
- [ ] Share via WhatsApp/Email (link + PDF)
- [ ] Sequential bill numbering per branch + FY
- [ ] Estimate → sale conversion
- [ ] Return / credit note
- [ ] TCS threshold check on confirm

### Notifications
- [ ] Bill created — WhatsApp + Email + SMS
- [ ] Template editor with `{{placeholders}}`
- [ ] Provider abstraction (Resend / MSG91 / Meta WhatsApp Cloud)
- [ ] Delivery status log

### Offline
- [ ] Full offline for bill creation, stock, customers
- [ ] Sync engine with pending queue
- [ ] Sync error inbox at `/sync`
- [ ] Idempotency for all writes
- [ ] Playwright 24-hour offline replay test

### Reports (baseline)
- [ ] Sales register (date range, export CSV)
- [ ] Stock summary (weight, value at today's rate)
- [ ] GSTR-1 preview (simple, no e-filing)

### Super Admin (minimum viable)
- [ ] Tenants list + detail
- [ ] Impersonate (with audit)
- [ ] Feature flag toggle (global)
- [ ] Platform overview KPIs
- [ ] Plans CRUD (used but no payment yet — free trial for all)

---

## Milestones (weekly)

| Week | Ship |
|------|------|
| 1 | Auth + onboarding wizard + store profile + first branch |
| 2 | Rates + Categories + Items list (server-side) |
| 3 | Item form + image upload + barcode scan (camera) |
| 4 | Customers + IndexedDB local schema + sync pull |
| 5 | Sync push + idempotency + Live-edit bill (basic add row + totals) |
| 6 | Bill confirm + PDF + Print + numbering + GST split |
| 7 | Notifications (WhatsApp + Email + SMS) + template overrides |
| 8 | Chat billing (deterministic tree) + Old gold exchange + Reports (sales register + stock) |
| 9 | Super Admin app (tenants, impersonate, plans, feature flags) + polish + Playwright suite |
| 10 | Hardening: offline replay tests, RLS leak tests, Sentry noise floor, perf pass, launch checklist |

---

## Non-goals for Phase 1

- Voice/LLM billing (Phase 3)
- Karigar module (Phase 2)
- Repair orders (Phase 2)
- Savings schemes (Phase 2)
- Loyalty program logic (Phase 2 — data model exists but no runtime)
- Multi-branch UX polish (basic switching works; deeper analytics in Phase 4)
- Payment gateway (Phase 2)
- Thermal printer / weighing scale (Phase 4)
- Native mobile apps (Phase 4)

---

## Acceptance criteria

- [ ] A brand-new tenant can sign up and confirm their first real bill in < 10 minutes
- [ ] Offline: create 20 bills airplane-mode, reconnect, all synced with correct numbering in < 30 seconds
- [ ] RLS: automated test attempts to read Tenant A's bills using Tenant B's JWT → 0 rows
- [ ] Print: A4 invoice matches accountant-approved fixture
- [ ] Lighthouse (mobile) ≥ 90 Performance, ≥ 95 Accessibility on Store app
- [ ] API p95 < 200ms on Fly.io
- [ ] Two paying-user-shaped tenants ("Meena Jewellers", "Ramesh & Sons") run a full sales day on prod without a Sentry error above INFO
- [ ] Docs updated (each MD in this folder reflects reality)

---

## Launch checklist

- [ ] Custom domain (sonari.app or your choice) with wildcard SSL
- [ ] Terms of service + privacy policy pages
- [ ] Cookie banner (India + EU-friendly text)
- [ ] Email templates load in Gmail / Outlook / Superhuman without breakage
- [ ] WhatsApp template approved by Meta
- [ ] Backup restore tested (Supabase PITR)
- [ ] Status page (statuspage.io or Instatus free)
- [ ] Support email + WhatsApp number configured
- [ ] Onboarding video (2 minutes)
- [ ] First 10 pilot tenants signed up manually with concierge call
