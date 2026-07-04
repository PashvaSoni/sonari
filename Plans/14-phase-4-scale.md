# 14 — Phase 4: Scale

**Last-updated:** 2026-07-03
**Duration:** 4 weeks
**Goal:** hardware, enterprise features, and cost-efficient scale.

---

## Feature list

### Hardware
- [ ] Thermal printer (58mm + 80mm) via WebUSB / native app helper
- [ ] Weighing scale integration (RS232/USB via native helper)
- [ ] Cash drawer trigger on payment confirm
- [ ] RFID tray scanner (batch stock take)

### Wholesale / B2B mode
- [ ] Approvals-based bill flow
- [ ] Consignment stock tracking
- [ ] Party-wise ledger with credit terms

### Franchise / white-label
- [ ] Custom domain per tenant
- [ ] Themeable primary color + logo everywhere
- [ ] White-label email templates

### Native apps (thin wrappers)
- [ ] Capacitor build for Android (Play Store)
- [ ] Capacitor build for iOS (TestFlight → App Store)
- [ ] Push notifications
- [ ] Hardware integration bridge

### Advanced multi-branch
- [ ] Inter-branch stock transfers with in-transit state
- [ ] Central inventory view
- [ ] Branch performance leaderboard

### Scale hardening
- [ ] Postgres partitioning on `bills` and `bill_items` by `tenant_id + year`
- [ ] Read replicas for report-heavy tenants
- [ ] BullMQ workers on separate Fly.io machines
- [ ] Cost per tenant dashboard (Super Admin)

### AI Phase 2
- [ ] Predictive stock ordering (based on seasonality + karigar lead times)
- [ ] Price recommendation for new designs
- [ ] Fraud/theft anomaly detection

---

## Acceptance criteria

- [ ] Native apps in stores (both)
- [ ] 1000-tenant load test passes with < 300ms p95 API latency
- [ ] Cost per active tenant < ₹100/month at 1000 tenants
- [ ] Hardware integrations tested with 3 physical shop setups
