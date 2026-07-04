# 09 — Stitch / Figma AI Prompts

**Last-updated:** 2026-07-03

Copy-paste prompts for **Google Stitch** (or v0, Uizard, Galileo) to generate minimalist mockups. Use in this order — each prompt builds on the previous.

Every prompt embeds the design system so you get consistent output.

---

## Global style block (paste at start of every prompt)

> **Design system:** Enterprise-grade jewellery ERP. Minimalist, "Notion meets Linear" aesthetic. Off-white background `#FBFAF7`, near-black `#0F172A` primary text, muted gold accent `#D4A257` used sparingly (only for primary actions, ratings, and monetary highlights). Success `#16A34A`, warning `#F59E0B`, danger `#DC2626`. Cards with `border: 1px solid #E5E7EB`, `border-radius: 12px`, no drop shadow. Inter font for UI, JetBrains Mono for currency and weights. Generous spacing (24px base). Icons: Lucide, 20px, stroke 1.5. Every screen prioritises information density with white space; no gradients, no glass, no illustrations. Feel: premium, understated, high-trust. Optimise for a desktop 1440×900 first, then responsive to 375px width.

---

## Screen 1 — Landing / marketing home

> Using the design system above, design a marketing landing page for "Sonari", a jewellery billing and ERP SaaS. Hero: one-line headline "Bills, stock, and karigars — one calm workspace." Subheadline: "Built for Indian jewellery shops. HUID, GST, offline, three ways to bill." Two CTAs: primary "Start free" (gold), secondary "See it work". Below hero: a screenshot placeholder of the live-edit bill screen. Then a 3-column feature strip (Live-edit bills, Voice billing beta, Offline PWA). Then a "How you bill" 3-tab section demoing the three modes with static mockups. Then testimonials (empty state — a placeholder card grid of 3). Then pricing (3 tiers: Starter free / Pro ₹1,499/mo / Scale ₹3,999/mo). Then footer. Keep everything minimalist, use lots of white space.

---

## Screen 2 — Login

> Design a minimalist login screen. Left half: brand mark "Sonari" small at top-left, generous whitespace, single form card centred vertically with email + password fields, "Continue" button (near-black), an "OR" divider, "Continue with phone (OTP)" secondary button, small "Forgot password?" link. Below: microcopy "New here? Create your store." Right half: full-bleed image slot with a single, tasteful monochrome photo of a jeweller's workbench (placeholder). No marketing fluff. Very Linear.app in feel.

---

## Screen 3 — Onboarding (post-signup)

> Design a 3-step onboarding wizard for the store owner. Full-screen layout, progress bar at top ("Store details → Branch → Rates"). Step 1: fields are Store name, GSTIN (optional), Logo upload (drag-drop dashed area). Step 2: default branch details (name, address auto-filled from pincode, phone, invoice prefix like "ACME/25-26/"). Step 3: today's metal rates — three number fields (24K, 22K, Silver 999). Each step has "Back" and "Continue"; step 3 has "Finish setup" as gold primary. Minimalist, no illustrations, one input focused at a time. Show helper microcopy under each label.

---

## Screen 4 — App shell (authenticated home / dashboard)

> Design the authenticated app shell for a jewellery ERP.
>
> **Left sidebar** (240px, `#FBFAF7`, collapsible to 64px, one-click): brand mark "Sonari" at top, then a compact nav: Dashboard, Bills, Stock, Customers, Rates, Reports, Settings. Each item icon + label. Small "Karigars" and "Schemes" sections labelled "Coming soon" and greyed out (Phase 2 preview).
>
> **Top bar** (56px, white, thin bottom border): left: branch selector "Main Branch ▾" (hidden if only one branch); centre: a search input placeholder "Search anything (Ctrl+K)"; right: live rate ticker chips showing "22K ₹6,420 ▲" "24K ₹7,020" "Silver ₹88", then a sync-status dot (green when synced), then user avatar.
>
> **Main content — Dashboard grid** of six cards, 3 columns:
>
> 1. "Today's sales" — big number ₹1,42,800, sub-number "12 bills · avg ₹11,900". Small chart underneath (last 7 days sparkline).
> 2. "Live rates" — three rows (22K, 24K, Silver) with rate and change vs yesterday.
> 3. "Low stock" — a short list of 3 items with names and current weight/value.
> 4. "Pending karigar returns" (Phase 2 placeholder — empty state "Available next month").
> 5. "Scheme installments due today" (empty state).
> 6. "Recent bills" — 5 rows, click-through.
>
> Every card has a subtle border, no shadow, generous padding. Numbers in JetBrains Mono. Gold accent only on primary CTAs and increments.

---

## Screen 5 — Bills list

> Design a Bills list screen. Header: page title "Bills", primary "New bill" gold button on the right, secondary "Import" button next to it. A filter bar below: date range picker, status pills (All · Draft · Confirmed · Paid · Cancelled), customer search input. A table with columns: Bill # · Date · Customer · Type · Grand total · Paid · Balance · Status pill · Actions ⋯. Rows have hover state. Total 15 rows visible, pagination at bottom. Sticky header on scroll. Empty state shown as an inline banner "No bills yet — Create your first" with a gold action button. Numbers right-aligned, currency prefixed ₹.

---

## Screen 6 — New bill (mode picker) — CRITICAL

> Design a screen titled "Create bill". Below the header, three large equal-width cards side by side, each 300px tall, minimal outline style.
>
> Card 1 — "⚡ Live-edit" — heading, subhead "Type directly into the invoice. Fastest for daily counter work.", bulleted micro-features "Tab-navigable · Barcode scan · Auto-totals · Print-ready". A ghost "Start" button.
>
> Card 2 — "💬 Guided chat" — heading, subhead "Answer a few questions. Great for training or complex bills.", bullets "Smart defaults · Handles old-gold exchange · Any language". Ghost "Start".
>
> Card 3 — "🎙️ Voice (beta)" — heading, subhead "Just speak. We'll extract items, weights, and rates.", bullets "Hindi + English · Hands-free · Confirmable draft". A small "beta" pill, ghost "Try beta".
>
> Below the three cards, a small "Continue where you left off" link if any drafts exist.

---

## Screen 7 — Live-edit bill (the money screen)

> Design the "Live-edit bill" workspace. This is the flagship screen. Full-page invoice that IS the editor — no separate form and preview.
>
> **Top strip:** left: customer search input with dropdown "Phone or name" (autocompletes to existing customers with avatar-initial + phone + tier badge). Right: bill number "Draft" (grey), bill type dropdown "Sale ▾", branch label.
>
> **Action bar:** "[+] Add item ▾" dropdown, "📷 Scan" button, quick-add chips of recent items (e.g., "22K chain 8g", "Silver ring 5g").
>
> **Line-items table:** columns # · Description · Gross g · Net g · Rate ₹/g · Making · Wastage % · Stones · Discount · Line total. Each cell is inline-editable (contenteditable look). One row filled in ("22K Chain HUID ABC123 · 8.240 · 7.980 · 6,420 · 12% · 3% · — · — · 51,240"), one empty row prompting "Click to add or scan a barcode".
>
> **Right sidebar (300px):** live totals summary — Subtotal, Discount, CGST 1.5%, SGST 1.5%, TCS if any, Old gold credit, Round-off, Grand total (large gold number). Below: quick-add section "Old gold" with a small form.
>
> **Bottom sticky bar:** left: "Draft auto-saved 2s ago". Right: "Save draft" (ghost), "Confirm & Print" (near-black), "Confirm & WhatsApp" (gold).
>
> Everything numeric in JetBrains Mono. Very high signal-to-noise. Muted golden highlight when a cell is focused. Show a tiny keyboard hint tooltip on hover of the "+" button reading "Ctrl+/".

---

## Screen 8 — Chat bill mode

> Design the "Guided chat" bill mode. Split layout 55/45.
>
> **Left panel — chat:** conversation of bot ↔ user messages. Bot bubble style: light grey bubble, sonari mark avatar. User bubble: near-black background, white text, right-aligned. Bot messages include quick-reply chips beneath (e.g., "[Yes]  [No, someone else]  [Walk-in]") and free-text input at the bottom. One visible flow so far: Bot: "Who is the customer?" User: "9876543210" Bot: "Ramesh Patel — is that right? [Yes] [No]" User: [Yes tapped] Bot: "What are we billing? Scan or describe. [📷 Scan] [Chain] [Ring] [Bangle] [Other]".
>
> **Right panel — live invoice preview:** the live-edit bill (compact, read-only right now, but real values as the chat progresses). Header pill "Live preview updates as you answer". A subtle "Switch to Live-edit" link top-right that carries state over.
>
> Bottom of chat: "Type your answer or tap a chip" placeholder in the input, right-side send button.

---

## Screen 9 — Voice bill mode (beta)

> Design the "Voice bill" beta screen. Centred layout, generous negative space.
>
> Big circular pulsing mic button in the middle (48px, gold ring animation). Above it: current transcript in large text, dimmed for older segments. Below it: interim understanding as pills — "Customer: Ramesh · Item: 22K chain · Weight: 8.24g · Making: 12% · Old gold: 5g 22K". If any pill is uncertain, it shows a small "?" and tap opens a quick edit.
>
> A minimal side panel on the right shows the same live invoice preview from Screen 7.
>
> Bottom bar: "Stop and confirm" primary, "Cancel" ghost. Toggle "Language: English + Hindi ▾" and "Provider: Auto ▾" small controls in header.

---

## Screen 10 — Stock list

> Design the Stock list. Header: "Stock", "New item" gold primary right, "Import CSV" secondary, "📷 Scan to find" ghost.
>
> Filter bar: category chip picker, metal chips (Gold · Silver · Platinum), purity range, status chips (In stock · Sold · With karigar · Reserved), weight range.
>
> Table columns: Image thumb · SKU · Description · Metal/Purity · Gross g · Net g · Making · Status pill · Actions. Rows show a small image square, description bold, sub-line SKU and HUID small grey. Empty state banner if none.
>
> Right side: a small stats card row above the table — total items, total gross weight (grams), total value at today's rate.

---

## Screen 11 — Add item (drawer)

> Design the "Add item" side drawer (600px wide, slides from right). Fields (top-to-bottom, only 3 above the fold): Category (combobox with recent), Metal (chips Gold/Silver/Platinum), Purity (dropdown pre-populated for chosen metal: 24K/22K/18K…). Below the fold: Weight fields (Gross, Net — with a "same as gross" toggle for chains), Making charge (dropdown Flat/Per gram/Percent + number), Wastage %, Stones (expandable list), HUID (with "Scan" button), Barcode (with "Scan" and "Auto-generate"), Description (auto-filled from metal+purity+weight if empty), Cost price (hidden from staff role), Images (dashed drag-drop area with camera capture on mobile). Bottom sticky bar: "Save" gold primary, "Save and add another" secondary, "Cancel" ghost. Show a tiny microcopy under the drawer header: "Only 3 fields required to save."

---

## Screen 12 — Barcode scan (full-screen)

> Design a full-screen camera scan interface for barcodes. Camera viewport fills the screen. A rectangular ROI overlay in the centre with corner brackets and a horizontal scan line animation. Top bar: back arrow left, "Point at a barcode or HUID sticker" title, torch toggle right. Bottom sheet 25% up: shows "Last scanned" latest 3 items with thumbnails, or a big "Type it instead" fallback button if user prefers. On successful detection, sheet slides up with the item card and "Add to bill" or "Open item" primary buttons.

---

## Screen 13 — Customer profile

> Design a customer profile screen. Header: avatar-initial + name (large) + phone + tier pill (e.g., "Silver customer"). Right: "New bill for Ramesh" gold primary.
>
> Below header, 4 stat cards in a row: Total spent, Bills, Metal-in-account, Loyalty points.
>
> Tabs: Overview · Bills · Metal ledger · Schemes · Notes.
>
> Overview shows recent bills (5), scheme enrollments summary, and a KYC status card (PAN captured or not, GSTIN if any).

---

## Screen 14 — Rates

> Design a Rates management screen. Header "Metal rates", "Set new rate" gold primary.
>
> Left: current rates card — big rows for 24K, 22K, 18K, Silver 999, Silver 925, Platinum. Each row: current rate ₹/g, delta from yesterday (green/red arrow), last updated timestamp.
>
> Right: history chart (last 30 days, line chart per metal, toggle chips to add/remove series). Below chart: manual update panel — dropdown metal, number field rate, effective-from datetime, "Save" button. If a global feed is enabled, show a toggle "Use platform feed" at the top with a lock icon.

---

## Screen 15 — Reports

> Design a Reports index screen. Grid of 6 report cards, each with title, one-line description, and a "Run" button. Cards: Sales register, Stock report, GSTR-1 preview, GSTR-3B preview, Karigar reconciliation (Phase 2 placeholder), Loyalty ledger. Below the grid, a "Custom report builder" empty state (Phase 3 preview).

---

## Screen 16 — Settings home

> Design Settings home. Left inner nav: Store profile, Branches, Staff, Invoice template, Notifications, Integrations, Data & backup, Danger zone. Right pane defaults to Store profile: fields Business name, Legal name, GSTIN, PAN, Contact email, Phone, Address, Logo (crop tool), Business type (retail/wholesale/manufacturer), Composition scheme toggle. Save button top-right, disabled unless dirty. Minimal, no accordion drama.

---

## Screen 17 — Super Admin home

> Design the Super Admin "Overview" screen. Same design system, but the top bar background is `#0F172A` (dark) with white text and label "SONARI ADMIN" to distinguish from the tenant app. Six KPI cards: Total tenants (with trial/active/churned split), MRR (with delta), New signups 7d, Bills platform-wide 30d, Error rate, Uptime. Below: a table "Recent tenant activity" with columns tenant name, plan, last active, bills today. Right side: "Recently signed up" list of 5 tenants.

---

## Screen 18 — Super Admin tenants list

> Design the Super Admin "Tenants" screen. Table columns: Name (with logo initial), Plan pill, Status pill (trial/active/past_due/suspended), MRR, Staff, Bills 30d, Last active, Actions. Filter bar: plan, status, activity range. Row actions include ⋯ menu with "Open detail", "Impersonate", "Suspend", "Change plan". Impersonate action shows a modal requiring a reason field before enabling the confirm button (red gold).

---

## Screen 19 — Empty states set

> Design 6 empty-state illustrations in monochrome line-art style, minimal, single-color (`#0F172A` with 40% opacity). One each for: no bills, no items, no customers, no karigars, no schemes, no notifications. Each with a one-line message and a gold CTA button. Never cartoony — keep them classy and business-appropriate.

---

## Screen 20 — Print preview / invoice

> Design a printable A4 invoice for a jewellery bill. Header: store logo left, store name + GSTIN + address, right: "TAX INVOICE" and bill number + date. Below: bill to (customer name/phone/address/GSTIN/PAN) and place of supply. Table of items: Sr · HSN · Description · HUID · Metal/Purity · Gross · Net · Rate · Making · Wastage · Stones · Amount. Below table: right-aligned totals block (subtotal, discount, CGST, SGST/IGST, TCS, Old gold credit, Round-off, Grand total in words + digits). Footer: terms, signature area, "Thank you" line. Numbers in JetBrains Mono. Print-safe margins, no shadow, black-on-white with a subtle gold horizontal rule under the header.

---

## Prompt hygiene tips (for you)

1. Paste the **Global style block first** every time — otherwise Stitch drifts.
2. Reference **specific pixel values and hex codes** — AI mockup tools are very literal.
3. Ask for **desktop 1440×900 first**, then request "generate the mobile 375px variant of the same screen" as a second pass.
4. If output feels too colourful, add "monochrome accents, single gold pop only on primary actions" to the prompt.
5. Screenshots from Linear.app, Notion, Vercel dashboard, Cal.com are good reference — mention them.
