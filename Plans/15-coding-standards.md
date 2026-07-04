# 15 — Coding Standards & Definition of Done

**Last-updated:** 2026-07-04
**Applies to:** every human and every AI agent working in this repo.

---

## 1. Language & framework

- **TypeScript strict.** `"strict": true`, `noUncheckedIndexedAccess: true`. No `any`. Use `unknown` and narrow.
- **React 18** with function components + hooks. No class components.
- **Vite + React SPA** for both frontends. React Router v6 (data routers) for routing. No Next.js (see `00-MASTER-PLAN.md` for rationale).
- **Fastify 4/5**. All plugins are async.
- **ESM everywhere.** No CJS in new code.

---

## 2. Folder & naming

- `kebab-case` file names. Exception: React component files `PascalCase.tsx`.
- One default export per file where it aids DX (React components). Named exports otherwise.
- Modules follow **feature-folder** layout (see `apps/api` in `03-backend-api.md`).
- Never a `utils/` bin. Utilities live in the closest module or a shared package.

---

## 3. Type discipline

- Every function has explicit parameter and return types.
- Types shared across FE/BE live in `packages/types`.
- Zod schemas are the source of truth; TS types are `z.infer<>`.
- Booleans named affirmatively: `isReady`, not `notReady`.
- Enums as `as const` object literals + Zod enum. Avoid TS `enum` keyword.

---

## 4. Money & weight rules (hard)

- Money in Postgres: `NUMERIC(14,2)`.
- Weight: `NUMERIC(10,3)`.
- **Never** compute money with JS `number` in `packages/domain`. Use `Decimal.js`.
- On the wire, money as `string` in JSON (e.g., `"51240.00"`). Parse on read.
- Currency formatter is centralised in `packages/ui`.

---

## 5. Error handling

- API returns structured error `{ code, message, details, requestId }`.
- Never expose Postgres or Supabase internals in error messages.
- Frontends surface user-friendly messages via toast; log full detail to Sentry.
- Async never throws silently — always caught at boundary + logged.

---

## 6. Testing

- **Vitest** for unit + integration.
- **Playwright** for E2E, one happy path per feature + one offline path.
- `packages/domain` requires ≥ 95% line coverage. Enforced in CI.
- `apps/api/src/modules/**` requires ≥ 85% coverage.
- RLS leak test for every tenant-scoped table.
- Fixtures live in `__fixtures__` folders adjacent to tests.

---

## 7. Git & PRs

- **Trunk-based.** Feature branches `feature/<slug>`, fix branches `fix/<slug>`.
- **Conventional commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- **PR ≤ 400 lines diff** except for scaffolds. Larger requires ADR reference.
- Every PR references the sub-plan file it's implementing.
- PR template includes the DoD checklist.
- Squash-merge to `main`.

---

## 8. Reviews

- One reviewer required. Two for `packages/domain`, DB migrations, and auth code.
- CODEOWNERS enforces the "two reviewers" rule.
- No self-approval. AI agents can propose but a human merges.

---

## 9. Definition of Done (checklist per feature)

- [ ] Zod schema in `packages/types` (or existing one reused)
- [ ] Domain logic in `packages/domain` when applicable, with tests ≥ 95%
- [ ] API endpoint with integration test
- [ ] UI has loading, empty, error states designed
- [ ] Mobile responsive at 375px width
- [ ] Keyboard navigable; icon-only buttons have `aria-label`
- [ ] Works offline for write paths (or explicitly documented as online-only)
- [ ] Idempotent (client_uuid or Idempotency-Key)
- [ ] RLS policy tested with a second tenant
- [ ] Sentry error boundary in place
- [ ] Docs updated (relevant sub-plan MD)
- [ ] One Playwright happy-path test
- [ ] Feature flag if risky (default off, roll out via Super Admin)

---

## 10. Style

- **Prettier** enforced. No debate.
- **ESLint** with `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y`.
- Tailwind class order sorted by `prettier-plugin-tailwindcss`.
- Comments explain **why**, not **what**. If a function needs a "what" comment, refactor it.

---

## 11. Security

- Never log JWTs, passwords, PII in plaintext.
- No `dangerouslySetInnerHTML` without an ADR.
- CSRF: JWT-in-header prevents most; use `SameSite=Lax` cookies where cookies are used.
- CSP headers on both apps (set at Cloudflare Pages / host headers, or `index.html` meta — not Next.js config).
- Dependabot enabled. Renovate weekly. High-severity CVEs patched within 72h.

---

## 12. Performance budgets

- Store app LCP < 2.5s on 3G, TTI < 5s
- Main JS bundle < 250KB gzipped
- API p95 < 200ms
- Lighthouse CI in every PR — regression fails the build

---

## 13. AI agent behaviour rules

Any AI agent working here must:

1. Read `00-MASTER-PLAN.md` first, then the relevant sub-plan.
2. **Read `17-ui-components.md` before creating any UI element.** Search `packages/ui/COMPONENTS.md` first. Reuse before rebuild.
3. **Never** exceed the scope of the current phase without an explicit go.
4. **Never** invent a new library not in the master plan's stack table without proposing via `DECISIONS.md` entry.
5. **Never** break tenant isolation. Every query filters by `tenant_id`.
6. **Never** use JS `number` for money in domain code.
7. **Never** disable ESLint / TS rules without a comment explaining why + owner name.
8. **Never** import directly from `@radix-ui/*`, `lucide-react`, `cmdk`, etc. — always through `@sonari/ui`.
9. **Never** create UI components in `apps/*/components/` if they're used in more than one place — must live in `packages/ui`.
10. Write tests as you go. TDD not required but ≥ 85% coverage is.
11. **Always** update the relevant plan MD in the **same change** as code — do not wait to be asked. Bump `Last-updated:`, add a Changelog line. Non-trivial deviations also get an ADR in `DECISIONS.md`. **Always tell the user** what diverged from the plan and why (Plan deviations table).

12. When ambiguous, add to `DECISIONS.md` and ask the human before guessing.
13. When touching billing math, run the full `packages/domain` test suite locally before pushing.
14. When adding a new shared UI component, follow the checklist in `17-ui-components.md §5` including updating `COMPONENTS.md`.

## Changelog

- **2026-07-04:** CSP note uses host headers (not Next.js config). Agent rule #11: plans update is mandatory without being asked.

