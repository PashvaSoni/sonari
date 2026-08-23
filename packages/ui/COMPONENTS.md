# @sonari/ui — Component Catalog

Search this file before creating any UI component. See `Plans/17-ui-components.md`.

| Component | Path | Notes |
|-----------|------|-------|
| `Button` | `src/components/primitives/Button.tsx` | primary / secondary / ghost / outline / gold |
| `Input` | `src/components/primitives/Input.tsx` | text input primitive |
| `Label` | `src/components/primitives/Label.tsx` | form label |
| `Badge` | `src/components/primitives/Badge.tsx` | small status chip |
| `Toaster` / `toast` | `src/components/primitives/Toast.tsx` | sonner wrapper |
| `AuthLayout` | `src/components/layouts/AuthLayout.tsx` | centered auth card shell |
| `AppShell` | `src/components/layouts/AppShell.tsx` | collapsible sidebar + content |
| `PageHeader` | `src/components/compound/PageHeader.tsx` | title + actions row |
| `SearchInput` | `src/components/compound/SearchInput.tsx` | search with icon |
| `EmptyState` | `src/components/compound/EmptyState.tsx` | dashed empty panel |
| `StatusPill` | `src/components/compound/StatusPill.tsx` | status tone pills |
| Icons | `src/icons/index.ts` | Lucide re-exports — apps must not import `lucide-react` |

## Changelog

- **2026-08-24:** Bills UI shell — AppShell, PageHeader, SearchInput, EmptyState, StatusPill, Badge, Toast, icons; Make palette tokens.
- **2026-07-06:** Phase 1 Week 1 — `Input`, `Label`, `AuthLayout`.
