# 16 — Differentiators (Features competitors don't have)

**Last-updated:** 2026-07-03

Ornate, Tally, WingoldNext, Orivraa, Jewelscore — all serve the market. What makes **Sonari** worth switching to? These are the *unfair advantages* baked into the plan.

---

## 1. Three billing modes in one product
Nobody else offers **Live-edit + Chat + Voice** in a single tool. Users choose per session or per staff preference. Older staff love chat, younger staff love voice, veterans use live-edit.

## 2. True offline PWA
Every jewellery ERP claims "works on low internet". Almost none actually let you **create and confirm a bill fully offline** for a whole day and sync later without conflicts. We do. This is the #1 rural/tier-2 sales pitch.

## 3. Command palette (Cmd+K)
Every action reachable in 2 keystrokes: "new bill", "22k rate 6500", "customer 9876…". Nobody in this vertical has this. Feels like Linear + Notion — a big vibes upgrade.

## 4. Live-preview bill as the editor
Not "form on left → preview on right". The **invoice itself is editable**. Type on the bill, see the bill. Reduces training time to under 15 minutes.

## 5. Rate ticker + realtime bill updates
Rates change all day. Open bills subtly re-flow when rate updates (unless user overrode). No more "arre yaar, purana rate laga diya" mistakes.

## 6. Barcode + camera + USB, unified
Camera scan on mobile/tablet, USB HID scanner on desktop, both feed the same event bus. No app switching, no config screen.

## 7. Idempotency by default
Double-click, network flake, retry — **never** creates a duplicate bill. Every mutation carries a client UUID. Competitors regularly ship duplicate bill bugs.

## 8. Karigar self-view (Phase 2)
Artisans get a limited login to see their own pending jobs, mark them as ready, upload photos. Reduces store owner's "arre kab tak hoga" phone calls. Nobody offers this cleanly.

## 9. Loyalty + Scheme + Old-gold as first-class payment methods
On the bill payment step, "Loyalty points", "Scheme balance", and "Old gold" are payment options alongside cash/UPI. Ledger updates atomically. Most competitors treat these as afterthoughts.

## 10. GSTR-1 preview + JSON export
Ready-to-file JSON compatible with the GST offline utility. No re-typing during month-end. Bookkeepers will love you.

## 11. Impersonation with audit
When (not if) something breaks for a customer, you (as super admin) log in as them with one click. Every action recorded. Support tickets close in minutes, not days.

## 12. LLM insights (Phase 3)
Daily one-paragraph brief: "Silver rose 3% overnight; five items showing wastage above karigar average; Mrs Kapoor's anniversary tomorrow — draft ready." That's ChatGPT-for-jewellers embedded in the app.

## 13. Voice billing in Indian languages
Hindi, Marathi, Gujarati, Tamil support (Phase 3). No competitor speaks jewellery vocabulary in regional languages naturally.

## 14. Zero-vendor-lock provider abstraction
Change from Twilio → MSG91 without redeploying. Change from OpenAI → Anthropic per tenant. Change WhatsApp providers. Configured via feature flags. No other tool gives you this control.

## 15. One-click data export
Export your entire tenant data as JSON with one click. No lock-in. Confidence-inducing for owners considering the switch — "worst case I can always leave".

## 16. Playwright-tested offline replay
CI actually simulates 24 hours offline. Competitors don't test this. We can promise it.

## 17. Semantic search over notes and item history (Phase 3)
Search "chain we made for Mrs Kapoor's daughter last Diwali" — pgvector-backed. Finds it.

## 18. Anomaly alerts
Wastage above karigar's usual band, unusually high discount, unusual payment mix — Super Admin gets a nudge, protects the owner from staff fraud without being creepy.

## 19. Composition scheme + regular GST toggle
Small dealers on composition scheme have completely different math. We handle both cleanly. Most competitors force one path.

## 20. Print-perfect A4 that matches accountant expectations
We test against real accountant-approved fixtures. HSN, HUID, place of supply, TCS, all correct on invoice. This alone flips CA-heavy customers.

---

## Pitch line (for landing page)

> **The calmest jewellery ERP in India. Bills three ways. Offline always. Nothing to relearn.**

---

## Not on the roadmap (deliberately)

- Point-of-sale integration with third-party retail systems — we ARE the POS
- Investment/gold-loan management — different vertical
- E-commerce storefront — different product; may partner instead
- Full accounting suite — we export to Tally/Zoho; not competing with them at the ledger level
