# 12 — Phase 2: Depth

**Last-updated:** 2026-07-03
**Duration:** 6–8 weeks
**Goal:** feature parity with Ornate/Tally add-ons on core jewellery workflows.

---

## Feature list

### Karigar (artisan) module
- [ ] Karigar CRUD + trust score
- [ ] Issue metal (job creation)
- [ ] Receive finished piece (with weight/purity reconciliation, wastage vs allowed)
- [ ] Automatic conversion of received piece → stock item
- [ ] Karigar payment tracking + running ledger
- [ ] Photos at each stage
- [ ] Karigar self-view (limited role login)

### Repair orders
- [ ] Customer walks in with broken item → repair order created
- [ ] Item weight/photos captured
- [ ] Assigned to karigar (optional link)
- [ ] Status flow: received → in_repair → ready → delivered
- [ ] Repair bill on completion with labour + added metal + stones

### Custom orders
- [ ] Advance booking with deposit
- [ ] Design blueprint attachments
- [ ] ETA + reminders
- [ ] Convert to bill on delivery

### Old gold exchange (advanced)
- [ ] Multi-tier deductions (impurities, melting loss)
- [ ] Melting scheduled with karigar (link to karigar job)
- [ ] Customer certificate PDF for their records

### Savings schemes / chit
- [ ] Scheme master (e.g., "11-month gold scheme")
- [ ] Enrollment CRUD
- [ ] Installment tracking + reminders (SMS/WhatsApp cron)
- [ ] Maturity payout logic
- [ ] Scheme balance shown at bill time (usable as payment method)

### Loyalty program
- [ ] Tier ladder (Bronze/Silver/Gold/Platinum by lifetime spend)
- [ ] Points on bill confirm
- [ ] Redeem points on bill (config: 1 point = X ₹)
- [ ] Birthday/anniversary greetings automated
- [ ] Referral tracking

### SaaS billing (Razorpay Subscriptions)
- [ ] Plan selection during onboarding (default free trial 14 days)
- [ ] Razorpay checkout for plan upgrade
- [ ] Webhook to update tenant.status
- [ ] Grace period + dunning emails
- [ ] Invoice PDFs for SaaS payments
- [ ] Super Admin dashboard: MRR / churn / cohort

### Multi-branch depth
- [ ] Stock transfer between branches
- [ ] Branch-level P&L
- [ ] Per-branch invoice sequence continuity

### Reports (deeper)
- [ ] Karigar reconciliation
- [ ] Wastage analytics per karigar / category
- [ ] Dead-stock report (items idle > N days)
- [ ] Customer segmentation (RFM)
- [ ] GSTR-1 export as JSON compatible with offline GST utility
- [ ] TCS report per FY

### Data & imports
- [ ] Import from Tally (CSV/Excel mapping wizard)
- [ ] Import from Ornate (guided)
- [ ] Google Sheets rate feed integration

### Backup & security
- [ ] One-click JSON export
- [ ] Encrypted local backup to Google Drive / Dropbox (opt-in)
- [ ] 2FA (TOTP) for owners + admins

---

## Non-goals for Phase 2
- Voice/LLM billing (Phase 3)
- Hardware (Phase 4)
- White-label / franchise (Phase 4)

---

## Acceptance criteria

- [ ] A store can run a full quarter with karigar workflow end-to-end
- [ ] SaaS billing collects at least ₹10,000 in test-mode revenue in a dry run
- [ ] Scheme reminder cron sends on time in a scheduled Playwright test
- [ ] Loyalty math validated by fixtures in `packages/domain/loyalty/tests`
- [ ] Tally-import wizard imports at least 3 sample datasets from real shops
