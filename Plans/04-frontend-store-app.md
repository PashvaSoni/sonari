# 04 — Store App (Frontend)

**Last-updated:** 2026-08-23 (updated: switched from Next.js to Vite + React)

> **Change note (2026-08-23):** Store name is collected once at signup/bootstrap; onboarding step 1 is GSTIN-only (name shown in page header).

> **Change note (2026-08-23):** `ProtectedRoute` requires tenant bootstrap; email-confirmed users complete store setup on `/signup` before `/onboarding`.
**Prereq reading:** [00-MASTER-PLAN.md](./00-MASTER-PLAN.md), [03-backend-api.md](./03-backend-api.md)

The main product. Where store owners and staff live all day.

Built as a **Vite + React SPA** — pure client-side, PWA-first, offline-capable. No SSR (no benefit for auth-gated app). Bundle < 250KB gzipped, HMR < 50ms.

---

## 1. Design principles (recap for this app)

1. **Minimalist.** White surface, one accent color per action group, generous spacing.
2. **Three-input rule.** Every screen's primary action needs ≤ 3 inputs above the fold.
3. **Keyboard-first.** Every action has a hotkey. Barcode scanner is a keyboard.
4. **Progressive disclosure.** Advanced options hidden behind "More".
5. **Instant feedback.** Every action shows loading/success within 100ms (optimistic UI).
6. **Offline-invisible.** UI never says "you are offline" unless a sync error requires user action.

**Palette (locked, avoid fighting later):**
- Primary: `#0F172A` (near-black, "graphite")
- Accent: `#D4A257` (muted gold — one accent only)
- Success: `#16A34A`
- Warning: `#F59E0B`
- Danger: `#DC2626`
- Surface: `#FFFFFF` / dark mode `#0B1220`
- Border: `#E5E7EB`

Typography: **Inter** for UI, **JetBrains Mono** for numbers on invoices.

---

## 2. Folder layout — `apps/store` (Vite + React)

```
apps/store/
├── index.html                          # Vite entry HTML
├── vite.config.ts                      # Vite + PWA config
├── src/
│   ├── main.tsx                        # ReactDOM root + Router
│   ├── App.tsx                         # Root layout providers
│   ├── router.tsx                      # createBrowserRouter with all routes
│   ├── routes/                         # One folder per top-level route
│   │   ├── _public/                    # Non-authenticated
│   │   │   ├── login.tsx
│   │   │   └── accept-invite.tsx
│   │   ├── _app/                       # Authenticated shell (layout wrapper)
│   │   │   ├── layout.tsx              # Sidebar + topbar + PWA install
│   │   │   ├── dashboard.tsx
│   │   │   ├── bills/
│   │   │   │   ├── index.tsx           # List
│   │   │   │   ├── new/
│   │   │   │   │   ├── index.tsx       # Mode picker
│   │   │   │   │   ├── live.tsx        # Live-edit mode
│   │   │   │   │   ├── chat.tsx        # Chat mode
│   │   │   │   │   └── voice.tsx       # Voice mode (Phase 3)
│   │   │   │   └── $id.tsx             # View + print
│   │   │   ├── stock/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── new.tsx
│   │   │   │   ├── scan.tsx            # Camera barcode
│   │   │   │   └── $id.tsx
│   │   │   ├── customers/
│   │   │   ├── rates/
│   │   │   ├── karigars/               # Phase 2
│   │   │   ├── schemes/                # Phase 2
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   │   ├── index.tsx           # Store profile
│   │   │   │   ├── branches.tsx
│   │   │   │   ├── staff.tsx
│   │   │   │   ├── invoice.tsx         # Template + prefix
│   │   │   │   └── notifications.tsx   # Templates
│   │   │   └── sync.tsx                # Debug sync queue
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                         # From packages/ui (shadcn)
│   │   ├── bill/
│   │   │   ├── LiveBillEditor.tsx
│   │   │   ├── ChatBillFlow.tsx
│   │   │   ├── VoiceBillFlow.tsx       # Phase 3
│   │   │   ├── BillLine.tsx
│   │   │   ├── BillTotals.tsx
│   │   │   └── PrintPreview.tsx
│   │   ├── stock/
│   │   │   ├── ItemForm.tsx
│   │   │   ├── BarcodeScanner.tsx
│   │   │   └── StockTable.tsx
│   │   ├── shared/
│   │   │   ├── AppShell.tsx
│   │   │   ├── CommandPalette.tsx      # Cmd+K / Ctrl+K
│   │   │   ├── OfflineIndicator.tsx    # Only visible on sync error
│   │   │   ├── ProtectedRoute.tsx      # Auth guard wrapper
│   │   │   └── RateTicker.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api-client.ts               # Wraps fetch, JWT, retries
│   │   ├── auth.ts                     # Supabase client
│   │   ├── db.ts                       # Dexie (IndexedDB)
│   │   ├── sync.ts                     # Sync engine hooks
│   │   ├── hotkeys.ts
│   │   ├── query-client.ts             # TanStack Query + persistQueryClient
│   │   └── analytics.ts
│   ├── hooks/
│   │   ├── useLiveRates.ts
│   │   ├── useBillDraft.ts
│   │   ├── useBarcodeScanner.ts
│   │   ├── useAuth.ts
│   │   └── useOffline.ts
│   ├── stores/                         # Zustand
│   │   ├── bill-draft.store.ts
│   │   └── ui.store.ts
│   ├── styles/
│   │   └── globals.css                 # Tailwind
│   └── env.ts                          # Zod-validated import.meta.env
├── public/
│   ├── manifest.webmanifest
│   ├── icons/
│   └── favicon.svg
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

**Notes on Vite specifics:**
- `import.meta.env.VITE_*` for env vars (must prefix with `VITE_` to be exposed to client).
- Wrap in `src/env.ts` with Zod validation at boot, so a missing env fails loudly.
- Absolute imports via `tsconfig.json` `paths` + `vite-tsconfig-paths` plugin (`@/components/...`).

---

## 3. Vite config

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          { urlPattern: /\/api\/v1\/rates.*/, handler: 'StaleWhileRevalidate', options: { cacheName: 'rates' } },
          { urlPattern: /\/api\/v1\/items.*/, handler: 'NetworkFirst', options: { cacheName: 'items', networkTimeoutSeconds: 3 } },
          { urlPattern: /\/api\/v1\/bills.*/, handler: 'NetworkOnly' },  // never cache bills, use IDB
          { urlPattern: /\.(png|jpg|jpeg|webp|svg)$/, handler: 'CacheFirst', options: { cacheName: 'images', expiration: { maxEntries: 200 } } },
        ],
      },
      manifest: {
        name: 'Sonari',
        short_name: 'Sonari',
        theme_color: '#0F172A',
        background_color: '#FBFAF7',
        display: 'standalone',
        start_url: '/',
        icons: [/* ... */],
      },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu' /*, ...*/],
        },
      },
    },
  },
  server: { port: 5173 },
})
```

---

## 4. Routing — React Router v6 (data routers)

`src/router.tsx`:
```ts
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './routes/_app/layout'
import { ProtectedRoute } from './components/shared/ProtectedRoute'
// ... other lazy imports

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'bills', children: [
        { index: true, lazy: () => import('./routes/_app/bills') },
        { path: 'new', lazy: () => import('./routes/_app/bills/new') },
        { path: 'new/live', lazy: () => import('./routes/_app/bills/new/live') },
        { path: 'new/chat', lazy: () => import('./routes/_app/bills/new/chat') },
        { path: 'new/voice', lazy: () => import('./routes/_app/bills/new/voice') },
        { path: ':id', lazy: () => import('./routes/_app/bills/detail') },
      ]},
      // ... stock, customers, rates, reports, settings, sync
    ],
  },
  { path: '/login', lazy: () => import('./routes/_public/login') },
  { path: '/accept-invite', lazy: () => import('./routes/_public/accept-invite') },
  { path: '*', element: <NotFound /> },
])
```

Route-level code splitting via React Router's `lazy` — matches App Router's automatic splitting without the Next.js baggage.

---

## 5. Auth guard (ProtectedRoute)

```tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, bootstrapped } = useAuthSession()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!bootstrapped) return <Navigate to="/signup" replace />
  return <>{children}</>
}
```

Email-confirmed users land on `/signup` in **finish setup** mode (confirm name + create tenant via bootstrap API) before onboarding. Store name from signup is prefilled read-only via `sessionStorage` + Supabase `user_metadata.store_name`.

Onboarding wizard step 1 (**Store details**): GSTIN only — store name is already set at bootstrap and shown in the page title.

---

## 6. Information architecture

**Left sidebar (collapsible, single-tap toggle on mobile):**

```
🏠 Dashboard
🧾 Bills           (default landing after login for staff)
📦 Stock
👥 Customers
💰 Rates
─────────────
🎨 Karigars        (Phase 2)
💳 Schemes         (Phase 2)
🔧 Repairs         (Phase 2)
─────────────
📊 Reports
⚙️  Settings
```

**Top bar (persistent):**
- Left: current branch selector (single branch = hidden)
- Center: search / command palette trigger `Ctrl+K`
- Right: live rate ticker (22K/24K/silver), sync status dot, user menu

---

## 7. Dashboard (landing for owner/manager)

Minimalist widgets — max 6:

1. **Today's sales** — total bills, total value, avg ticket
2. **Live rates** — with delta from yesterday
3. **Low stock alerts** — items where quantity/value dipped below threshold
4. **Pending karigar returns** (Phase 2)
5. **Scheme installments due today** (Phase 2)
6. **Recent bills** (last 5, quick-open)

Staff role sees only #1 (their own sales) and #6.

---

## 8. Billing — the three modes

### 8.1 Mode picker (`/bills/new`)

Three big cards. User taps one. Preference stored per-user.

```
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│  ⚡ Live Edit       │  │  💬 Guided Chat     │  │  🎙 Voice           │
│  Directly type      │  │  Answer questions  │  │  Just speak         │
│  Fastest for pros   │  │  Best for new users│  │  Hands-free (β)     │
│  [ Start ]          │  │  [ Start ]         │  │  [ Start ]          │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

### 8.2 Live-edit mode — the killer feature

Full-page bill preview that IS the editor. No separate "form" → "preview". The invoice mockup on screen is directly editable.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Customer: phone/name search or "Walk-in" ▾]  Bill #___     │
├─────────────────────────────────────────────────────────────┤
│ [+] Add item ▾  [📷 Scan]  [Quick: 22K chain, Silver ring…] │
├─────────────────────────────────────────────────────────────┤
│  # │ Description       │ Gross│ Net │ Rate │ Making │ Total │
│ ── │ ──── inline edit ─── each cell tab-navigable ─────  │
│  1 │ 22K Chain (HUID)  │ 8.240│7.980│ 6,420│  12%  │51,240 │
│  2 │ [click to add]                                        │
├─────────────────────────────────────────────────────────────┤
│                              Subtotal:              51,240  │
│                              GST 3%:                 1,537  │
│                              Old gold credit:       -8,120  │
│                              Total:                44,657  │
├─────────────────────────────────────────────────────────────┤
│  [Save Draft]  [Confirm & Print]  [Confirm & WhatsApp]      │
└─────────────────────────────────────────────────────────────┘
```

**Interaction rules:**
- Every cell is `contenteditable`-like (Tab/Shift-Tab moves cell; Enter = next row).
- Barcode scan while cursor anywhere → auto-add row with item pre-filled.
- Typing customer phone auto-suggests existing customer; press Enter to autofill address, GSTIN, loyalty.
- Rate changes on server → row rate updates with subtle highlight (unless user has manually overridden that cell).
- Totals recompute in real-time using `packages/domain` (pure function, same code as backend).
- All changes stored to IndexedDB after 250ms debounce → survives crash/refresh.
- "Confirm" triggers POST /bills → status becomes `confirmed`, PDF pre-generated, notification queued.

**Keyboard shortcuts:**
- `Ctrl+K` — command palette
- `Ctrl+/` — add row
- `Ctrl+Shift+D` — apply discount
- `Ctrl+P` — print
- `Ctrl+Enter` — confirm bill
- `Esc` — save draft and exit

### 8.3 Chat mode

Sequential questions with smart defaults. User can type or tap chip suggestions.

```
Bot: "Who is the customer? 📱 Type phone or name, or say 'walk-in'."
User: "9876543210"
Bot: "Ramesh Patel — is that right?"  [Yes] [No, someone else]
User: [Yes]
Bot: "What are we billing? Scan/type barcode, or describe."
     [📷 Scan]  [Chain]  [Ring]  [Bangle]  [Other]
...
```

Each answer maps to a draft field. **The draft is visible on the right side always** — so it's chat + live-preview split view. When bot says "Ready to confirm?", user can also just switch to Live-Edit view without losing state.

Chat state stored in `bill_draft.store.ts` (Zustand) + IndexedDB.

### 8.4 Voice mode (Phase 3 — architecture-ready in Phase 1)

Same underlying draft model. Voice → transcription (Whisper) → LLM extracts intent → same reducer that chat mode uses fills the draft. Wireframe stubbed in Phase 1, fully wired in Phase 3.

---

## 9. Stock module

### 9.1 List view
- Virtual scroll table (10k+ items smooth) via `@tanstack/react-virtual`.
- Filters: category, metal, purity range, status, weight range.
- Search: SKU, HUID, barcode, description.
- Bulk actions: adjust status, apply category, export.

### 9.2 Add/edit item
- **Minimum inputs:** category → metal auto-inferred, purity default, weight, images.
- Barcode/SKU auto-generated (editable).
- Stone details: expandable list, each row = one stone.
- Making charge: single dropdown (flat / per gram / % of metal value) + one number.
- Image upload: camera or file, auto-compressed client-side to WebP < 200KB (using `browser-image-compression`).

### 9.3 Barcode scan (`/stock/scan`)
- Full-screen camera view using `@zxing/browser`.
- Detected code → API lookup → if exists: opens item. If not: opens "New item with barcode = <code>" prefilled.
- USB HID scanner also works globally: any barcode-like input (digits + rapid Enter) is intercepted regardless of route.

---

## 10. Customers

Same principles: minimal-input add (phone + name enough to start). Everything else optional and progressively surfaced.

**Customer profile shows:**
- Recent bills (with re-order shortcut)
- Metal ledger balance (old gold in account)
- Loyalty points and tier
- Scheme enrollments (Phase 2)
- Notes and tags

---

## 11. Rates

- One number field per row (metal + purity). Save = updates all open bills' preview rates.
- History chart (Recharts, 30/90/365 days).
- Import from Google Sheets or paste JSON (Phase 2).

---

## 12. Settings

- Store profile: name, logo (crop tool), GSTIN, PAN, address per branch.
- Branches: add/edit; one is default.
- Staff: invite by phone/email, choose role.
- Invoice template: preview (React-PDF), prefix, terms text, signature.
- Notification templates: bill.created, scheme.reminder — editable with `{{placeholders}}`.
- Backup/export: download JSON of full tenant data.

---

## 13. Command palette (`Ctrl+K`)

Everything reachable in 2 keystrokes:
- "new bill" / "new item" / "customer 9876…"
- "bill #123"
- "22k rate 6500" — sets rate
- "add karigar Ramesh" (Phase 2)

Implemented with `cmdk` library.

---

## 14. PWA setup

Configured via `vite-plugin-pwa` in `vite.config.ts` (see §3). Key strategies:
- `manifest.webmanifest` auto-generated
- Service worker auto-registered with `autoUpdate`
- Install prompt: custom banner after 3rd session (using `beforeinstallprompt` event)
- Offline shell precached at build time (all JS + CSS + fonts)
- API calls handled per-route (see runtime caching config)

---

## 15. Print & PDF

- Invoice rendered with **@react-pdf/renderer** — same component tree, deterministic layout.
- Print preview modal uses `<iframe>` with the PDF blob URL.
- Server pre-generates PDF on bill confirm; client fetches when user hits Print.
- Thermal printer support (58mm/80mm) deferred to Phase 4 — Phase 1 uses A4/A5 laser.

---

## 16. State management

- **Zustand** for cross-page ephemeral state (current bill draft, UI toggles).
- **TanStack Query** for server data with `persistQueryClient` → IndexedDB adapter so cached queries survive reload and work offline.
- **Dexie** for offline write queue and mirror stores.
- **URL** is source of truth for filters/pagination.
- Never `useState` for anything that survives navigation.

---

## 17. Accessibility

- All interactive elements reachable via Tab.
- Focus rings visible (never `outline: none` without replacement).
- ARIA live regions for totals and sync status.
- Contrast ≥ 4.5:1 (checked via Storybook a11y addon).
- Screen reader labels on icon-only buttons.

---

## 18. Performance budgets (enforced by Lighthouse CI)

- LCP < 2.5s on 3G
- Main JS bundle < 250KB gzipped (route-level code splitting keeps this achievable)
- No blocking font requests (self-hosted `@fontsource/inter` + `@fontsource/jetbrains-mono`)
- Images lazy-loaded via native `loading="lazy"`; compressed client-side to WebP
- Route-based code splitting via React Router `lazy`

---

## 19. Deployment

- Build: `pnpm --filter store build` → produces static `dist/` folder
- Deploy to **Cloudflare Pages** (or Vercel) — literally point at the repo, set root `apps/store`, build command `pnpm --filter store build`, output `apps/store/dist`
- SPA fallback: configure `dist/_redirects` (`/* /index.html 200`) so client-side routes work on refresh
- Env vars: set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` in host UI

---

## 20. Why not Next.js — decision record

- **No SSR benefit:** app is auth-gated, no SEO
- **No `next/image` need:** we handle image compression client-side and use Cloudflare Images if needed
- **No API routes need:** Fastify backend is separate
- **No RSC benefit:** all our screens are interactive; Server Components would be `"use client"` everywhere anyway
- **Vite HMR wins:** 50ms vs Next.js ~500ms dev
- **Smaller bundle:** no framework runtime overhead (~30-40KB gzipped saved)
- **Simpler mental model:** one boundary (client), one build target
- **Marketing site deferred:** when we need SEO for a landing page/blog, add a separate `apps/marketing` using **Astro** (best-in-class static site generator) — completely independent of the app

## Changelog

- **2026-08-23:** Signup store name persisted (`sessionStorage` + `user_metadata.store_name`); finish-setup read-only prefilled; onboarding step 1 GSTIN-only.
