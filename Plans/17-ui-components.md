# 17 — UI Components Library & Reuse Rules

**Last-updated:** 2026-07-03
**Prereq:** [00-MASTER-PLAN.md](./00-MASTER-PLAN.md), [15-coding-standards.md](./15-coding-standards.md)

**This is a HARD RULE document.** Every human and AI agent MUST follow the reuse workflow before creating any UI component.

---

## 1. UI stack (locked)

| Layer | Choice | Why |
|-------|--------|-----|
| **Primitives** | **Radix UI** | Unstyled, accessible, keyboard-navigable — a11y for free |
| **Base components** | **shadcn/ui** | Copy-paste ownership; built on Radix + Tailwind; zero runtime dep |
| **India-specific components** | **IndiaCN UI** (where available) | Pre-built for INR, GSTIN, PAN, Aadhaar, Indian phone, regional locales |
| **Styling** | **Tailwind CSS + CSS variables (design tokens)** | Utility-first, tree-shakeable, no runtime CSS-in-JS |
| **Icons** | **Lucide** | Consistent, tree-shakeable, ~2KB per icon |
| **Charts** | **Recharts** (Phase 1) → **Tremor** (Phase 3 dashboards) | Composable, React-first |
| **Data tables** | **TanStack Table v8** | Headless, virtualized, sort/filter/pagination logic separate from UI |

**Why NOT Ant Design / MUI:**
- Ant Design: ~300KB gzipped, opinionated "Ant" look, hard to customize deeply, feels enterprise-Chinese. Doesn't fit premium jewellery aesthetic.
- MUI: ~350KB gzipped, Material Design vibe (feels Google-ish), Emotion CSS-in-JS = runtime cost, theming is complex.
- Both violate our **minimalist, ownership, small bundle** principles.

**Why shadcn + IndiaCN wins:**
- You own the code (in `packages/ui`) — no vendor updates breaking things
- Bundle only ships what you use (tree-shakeable)
- India-specific components (rupee, GSTIN, HUID) reduce building time
- Accessibility baked in via Radix
- Same components used by Linear, Cal.com, Vercel, Resend — proven at scale

---

## 2. `packages/ui` — the single source of truth

**Every reusable UI component lives here. Period.**

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── primitives/                # Base shadcn/Radix wrappers
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Combobox.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Sheet.tsx              # Side drawer
│   │   │   ├── Popover.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── RadioGroup.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Separator.tsx
│   │   │   └── ...
│   │   ├── india/                     # India-specific (from IndiaCN or custom)
│   │   │   ├── RupeeInput.tsx         # ₹ prefix, thousands separator (lakh/crore format)
│   │   │   ├── RupeeDisplay.tsx       # "₹1,42,857.50" formatter
│   │   │   ├── IndianPhoneInput.tsx   # +91, 10-digit validation
│   │   │   ├── GstinInput.tsx         # 15-char validation with regex
│   │   │   ├── PanInput.tsx           # 10-char, ABCDE1234F format
│   │   │   ├── AadhaarInput.tsx       # 12-digit, masked display
│   │   │   ├── PincodeInput.tsx       # 6-digit, auto-fills city/state
│   │   │   ├── HuidInput.tsx          # BIS 6-char alphanumeric
│   │   │   ├── WeightInput.tsx        # Grams/tola/kg toggle
│   │   │   ├── PurityInput.tsx        # Karat/percent toggle (24K/22K/916)
│   │   │   └── IndianDatePicker.tsx   # DD/MM/YYYY default, FY-aware
│   │   ├── compound/                  # Composed components used in ≥2 places
│   │   │   ├── DataTable.tsx          # TanStack Table wrapper
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── SearchInput.tsx        # Debounced, with hotkey
│   │   │   ├── FilterChips.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── CommandPalette.tsx     # Cmd+K
│   │   │   ├── FormField.tsx          # Label + input + error + hint
│   │   │   ├── FileDropzone.tsx
│   │   │   ├── ImageUploader.tsx      # With crop + compress
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── StatusPill.tsx
│   │   │   ├── UserAvatar.tsx
│   │   │   ├── LoadingButton.tsx
│   │   │   └── ...
│   │   └── layouts/                   # Page-level layouts
│   │       ├── AppShell.tsx           # Sidebar + topbar wrapper
│   │       ├── AuthLayout.tsx         # For login/signup
│   │       ├── SplitLayout.tsx        # 55/45 split (used by chat billing)
│   │       └── PrintLayout.tsx        # For invoices
│   ├── hooks/
│   │   ├── useToast.ts
│   │   ├── useHotkey.ts
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── useClickOutside.ts
│   ├── icons/                         # Lucide re-exports + custom SVGs
│   │   ├── index.ts                   # Barrel export
│   │   └── custom/                    # Custom jewellery icons (ring, gem, karigar, etc.)
│   ├── styles/
│   │   ├── tokens.css                 # CSS variables (colors, radius, spacing)
│   │   └── globals.css                # Base reset + Tailwind
│   ├── lib/
│   │   ├── cn.ts                      # className merger (clsx + tailwind-merge)
│   │   └── format.ts                  # Rupee, weight, date formatters
│   └── index.ts                       # Public API - ONLY export from here
├── COMPONENTS.md                       # Auto-generated component catalog
├── README.md
└── package.json
```

---

## 3. The Reuse Workflow — MANDATORY

Before creating ANY new UI component, follow this decision tree:

```
Need a UI element?
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 1: Search packages/ui/COMPONENTS.md                 │
│         Does it exist? → Import from @sonari/ui. DONE.   │
└──────────────────────────────────────────────────────────┘
    │
    │ Not found
    ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 2: Check IndiaCN UI catalog                         │
│         Does it exist there? → Copy into                 │
│         packages/ui/components/india/ + adapt to tokens  │
│         → Import from @sonari/ui. DONE.                  │
└──────────────────────────────────────────────────────────┘
    │
    │ Not found
    ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 3: Check shadcn/ui catalog                          │
│         Does it exist? → shadcn CLI install into         │
│         packages/ui/components/primitives/               │
│         → Import from @sonari/ui. DONE.                  │
└──────────────────────────────────────────────────────────┘
    │
    │ Not found (truly novel component)
    ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 4: Will it be used in >1 place ever?                │
│                                                          │
│  YES (or "probably yes") ──► Build in packages/ui/       │
│                              Follow "New component"      │
│                              checklist below. Update     │
│                              COMPONENTS.md.              │
│                                                          │
│  NO (truly one-off, tiny variant, page-specific tweak)   │
│                              ──► Build locally in        │
│                                  apps/<app>/components/  │
│                                  Add TODO comment if it  │
│                                  might be extracted.     │
└──────────────────────────────────────────────────────────┘
```

---

## 4. When to use the "escape hatch" (local component)

**OK to create locally in `apps/<app>/src/components/`:**

- ✅ Tiny styling variant of an existing shared component (e.g., a Dashboard-specific hero card that will only ever live on the dashboard)
- ✅ Compositions of multiple shared components used only in one screen (e.g., `<BillLineRow>` in Live-edit — combines many `@sonari/ui` primitives; too specific to promote)
- ✅ Prototypes still in flux (mark with `// TODO: promote to packages/ui when stable`)

**NOT OK — must be in `packages/ui`:**

- ❌ Any button, input, dialog, tooltip, badge — always shared
- ❌ Anything with India-specific logic (formatting, validation)
- ❌ Anything used in ≥2 screens
- ❌ Anything with a11y logic (Radix wrappers)
- ❌ Icons — always in `packages/ui/icons`

---

## 5. Checklist: adding a new component to `packages/ui`

When you (or an AI agent) add a component, complete this checklist:

- [ ] File named `PascalCase.tsx` in the right subfolder (`primitives/`, `india/`, `compound/`, `layouts/`)
- [ ] Exported from `packages/ui/src/index.ts` (barrel)
- [ ] Named export (no default exports in shared package)
- [ ] Props typed with explicit interface, exported as `<ComponentName>Props`
- [ ] Uses design tokens (Tailwind classes referencing CSS vars) — no hardcoded hex colors
- [ ] Uses `cn()` helper for conditional classes
- [ ] Accessible: keyboard navigable, ARIA labels, focus rings
- [ ] Storybook story added (`ComponentName.stories.tsx`) — Phase 1: minimum required
- [ ] Unit test if it has behavior (not just presentational)
- [ ] Added to `COMPONENTS.md` catalog with one-line description + usage snippet
- [ ] Reviewed by another dev (or self-reviewed via checklist for solo)

---

## 6. Naming & prop conventions

**Component name:** noun or noun-phrase. `Button`, `RupeeInput`, `EmptyState`, `AppShell`.

**Props:**
- Boolean props are affirmative: `isLoading`, `hasError`, `isDisabled` — never `notReady`.
- Callbacks named `on<Event>`: `onChange`, `onSubmit`, `onSelectItem`.
- Value/onChange pairs are consistent: `value` + `onChange` (matches React convention).
- Optional slots as props (React.ReactNode): `leftIcon`, `rightAdornment`.
- Variants via a single `variant` prop with union type: `variant: 'primary' | 'secondary' | 'ghost' | 'danger'`.
- Sizes via `size` prop: `size: 'sm' | 'md' | 'lg'`.

**Example:**
```tsx
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  isDisabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  // ...
}
```

---

## 7. Design tokens (single source)

`packages/ui/src/styles/tokens.css`:

```css
:root {
  /* Colors */
  --color-primary: 15 23 42;         /* #0F172A  (near-black graphite) */
  --color-accent: 212 162 87;         /* #D4A257  (muted gold) */
  --color-success: 22 163 74;
  --color-warning: 245 158 11;
  --color-danger: 220 38 38;
  --color-surface: 255 255 255;
  --color-surface-muted: 251 250 247; /* #FBFAF7 */
  --color-border: 229 231 235;
  --color-text: 15 23 42;
  --color-text-muted: 100 116 139;

  /* Radius */
  --radius-sm: 6px;
  --radius: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* Spacing (rem-based) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Menlo', monospace;

  /* Shadow (subtle only) */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 4px 12px rgba(0,0,0,0.06);
}

[data-theme="dark"] {
  --color-primary: 226 232 240;
  --color-surface: 11 18 32;
  /* ... */
}
```

Tailwind config references these via `theme.extend.colors` using `rgb(var(--color-primary) / <alpha-value>)` pattern.

**NEVER hardcode hex colors in components.** Always token-driven.

---

## 8. `COMPONENTS.md` — the living catalog

Auto-updated file listing every component in `packages/ui` with:
- Name
- Subfolder
- One-line description
- Import path
- Basic usage snippet
- Link to Storybook story

**Every PR that adds/removes a component MUST update `COMPONENTS.md`.**

Format:
```markdown
### RupeeInput
Path: `india/RupeeInput.tsx` · Import: `import { RupeeInput } from '@sonari/ui'`
Rupee-formatted number input with lakh/crore separators.

```tsx
<RupeeInput value={amount} onChange={setAmount} size="md" placeholder="0.00" />
```
```

CI check: PR that adds a `.tsx` in `packages/ui/src/components/**` fails if `COMPONENTS.md` isn't updated in the same commit.

---

## 9. Storybook (recommended, Phase 1 optional → Phase 2 required)

- Storybook 8 configured in `packages/ui/.storybook/`
- One story per component
- Deployed to Chromatic or Cloudflare Pages under `storybook.sonari.app`
- Visual regression tests in CI (Chromatic free tier fits)
- Living style guide for anyone joining the project

---

## 10. Enforcement — how we keep this rule

### 10.1 ESLint rule (custom)

`.eslintrc` in each app:
```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["@radix-ui/*", "cmdk", "sonner"],
        "message": "Import UI primitives from @sonari/ui, not directly."
      }]
    }]
  }
}
```

### 10.2 PR checklist gate

Every PR template includes:
```markdown
### UI Components
- [ ] Any new UI element was first searched in `packages/ui/COMPONENTS.md`
- [ ] New shared components added to `packages/ui/` and `COMPONENTS.md` updated
- [ ] Local components in `apps/*/components/` are justified (one-off / page-specific)
```

### 10.3 AI agent rule

Any AI agent (Claude, Cursor, Copilot) MUST:
1. Read `COMPONENTS.md` before creating any UI element
2. Use existing components if available (no reinventing Button, Input, etc.)
3. When creating new shared components, follow the checklist in §5
4. When creating local page components, add `// TODO: promote to packages/ui if reused`
5. Never import directly from `@radix-ui/*`, `cmdk`, `lucide-react`, etc. — always through `@sonari/ui`

### 10.4 Codeowners

`packages/ui/*` requires two approvals — protects against random unreviewed additions.

---

## 11. Installation & shadcn CLI usage

shadcn/ui is a CLI that scaffolds components into your codebase. Configured to output into `packages/ui/src/components/primitives/`.

`packages/ui/components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "tailwind": {
    "config": "../config/tailwind/index.ts",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "packages/ui/src/components/primitives",
    "utils": "packages/ui/src/lib/cn"
  }
}
```

Add a shadcn component:
```bash
cd packages/ui
pnpm dlx shadcn@latest add button
# ↑ Places Button.tsx in packages/ui/src/components/primitives/
# ↑ You now OWN this code — edit freely
```

Add an IndiaCN component (when available):
```bash
cd packages/ui
pnpm dlx indiacn@latest add rupee-input
# Places in packages/ui/src/components/india/
```

If IndiaCN doesn't have it → build in `packages/ui/src/components/india/` following the same shadcn pattern (Radix primitive + Tailwind styles + tokens).

---

## 12. India-specific components — priority build list (Phase 1)

If IndiaCN provides these, use them. Otherwise build in this order:

1. **RupeeInput / RupeeDisplay** — Indian number formatting (1,42,857.50 with lakh/crore separators, not 142,857.50)
2. **IndianPhoneInput** — +91 prefix, 10-digit validation, WhatsApp-friendly
3. **GstinInput** — 15-char format `22AAAAA0000A1Z5`, checksum validation
4. **PanInput** — `ABCDE1234F` format validation
5. **PincodeInput** — auto-fetches city/state via India Post API
6. **HuidInput** — BIS 6-char alphanumeric with scanner integration
7. **WeightInput** — grams primary, tola/kg toggle
8. **PurityInput** — 24K/22K/18K/14K dropdown + custom percent
9. **IndianDatePicker** — DD/MM/YYYY, financial-year aware (April-March)
10. **AadhaarInput** — 12-digit, masked (`XXXX XXXX 1234`) for privacy

Each of these has:
- Validation logic in `packages/domain` (pure)
- UI wrapper in `packages/ui/components/india/`
- Zod schema in `packages/types`

---

## 13. Bundle size budget

- `packages/ui` total (all components) < 100KB gzipped when everything imported
- Any single component < 5KB gzipped
- Tree-shakeable — apps only ship what they use
- No CSS-in-JS runtime (Tailwind is compile-time)

---

## 14. Common mistakes to avoid

- ❌ Copy-pasting a button from Stack Overflow instead of using `<Button>` from `@sonari/ui`
- ❌ Installing `@radix-ui/react-dialog` directly in an app — must go through `packages/ui`
- ❌ Creating `apps/store/components/Button.tsx` — belongs in `packages/ui`
- ❌ Hardcoding `#0F172A` — use `text-primary` (Tailwind → CSS var)
- ❌ Skipping `COMPONENTS.md` update — CI will fail
- ❌ Importing an icon like `import { Home } from 'lucide-react'` in an app — go through `@sonari/ui/icons`
- ❌ Building a rupee formatter inline — use `<RupeeDisplay />` or `formatRupee()`

---

## 15. Migration path if we outgrow shadcn+IndiaCN

Unlikely, but codified: since we OWN the code in `packages/ui`, migrating to another primitive layer (Ariakit, HeadlessUI, etc.) is a `packages/ui`-only change. Apps consuming `@sonari/ui` don't change. This is the whole point of the abstraction.
