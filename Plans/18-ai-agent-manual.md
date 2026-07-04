# 18 — AI Agent Operating Manual

**Last-updated:** 2026-07-04
**Applies to:** every AI agent (Claude, Cursor, GitHub Copilot, Windsurf, Cody, Aider, or any future model) working on this codebase.

> **This document is your constitution.** If you're an AI agent reading this, you must read it fully before touching any code. If you're a human onboarding an AI, point it here first.

---

## 🛑 The 5 Prime Directives (violation = revert your PR)

1. **READ before WRITE.** Never write code without first reading the plans that govern it.
2. **REUSE before REBUILD.** Never create what already exists.
3. **ASK before ASSUME.** Never guess a business rule. Ask, or add to `DECISIONS.md`.
4. **MEASURE before OPTIMIZE, but PROFILE before you ship.** Never ship an N+1 or N×N query. Ever.
5. **UPDATE before FORGET.** Never leave plans stale. If you change reality, change the docs in the same PR.

---

## 1. The mandatory read order (before any task)

**Every task, no exception. Even if you "know" the codebase.**

### 1.1 Always read (Tier 0 — every task)
- [ ] `00-MASTER-PLAN.md` — the north star
- [ ] `15-coding-standards.md` — how to write code here
- [ ] `18-ai-agent-manual.md` — this file (rules for you)

### 1.2 Task-based read map (Tier 1 — pick what applies)

| If the task involves… | You MUST read |
|-----------------------|---------------|
| **UI / new component / styling** | `17-ui-components.md` → then check `packages/ui/COMPONENTS.md` |
| **Any screen / route** | `04-frontend-store-app.md` (store) or `05-frontend-super-admin.md` (admin) |
| **Database / schema / migration** | `02-data-model.md` |
| **API endpoint / backend logic** | `03-backend-api.md` |
| **Bill math / GST / HUID / rates** | `08-billing-engine.md` + `packages/domain/README.md` |
| **Notifications / SMS / WhatsApp / Email** | `06-shared-modules.md` §4 |
| **LLM / voice / chat billing** | `06-shared-modules.md` §5 + `13-phase-3-voice-ai.md` |
| **Offline / sync / Dexie / IndexedDB** | `07-offline-sync.md` |
| **PDF / print / invoice template** | `06-shared-modules.md` §7 + `08-billing-engine.md` §11 |
| **Tenant isolation / RLS / auth** | `01-architecture.md` §3 & §7 + `02-data-model.md` §12 |
| **New feature scope** | The relevant phase file `10-` through `14-` |
| **Deployment / infra / env vars** | `00-MASTER-PLAN.md` §5 + `10-phase-0-foundation.md` |
| **Figma / mockup / design** | `09-stitch-figma-prompts.md` |
| **Performance / query optimization** | This file §5 (Query Efficiency Rules) |

### 1.3 The 2-minute pre-task ritual

Before writing code, output this checklist to the user (proves you read the plans):

```
Task: <one-line summary>
Read:
  ✓ 00-MASTER-PLAN.md
  ✓ 15-coding-standards.md
  ✓ 18-ai-agent-manual.md (this file)
  ✓ <task-specific plan files>
Modules impacted:
  - <list every package / app / table that will change>
Contracts I need to respect:
  - <API contracts, Zod schemas, RLS rules, etc.>
Questions before I start:
  - <if none, say "None">
```

**If any answer to "Questions" is non-trivial → stop and ASK before coding.**

---

## 2. When to ASK vs when to PROCEED

### 2.1 STOP and ASK the user (or add to `DECISIONS.md`) when:

- ❓ The task touches money math and the plan doesn't explicitly cover the rule
- ❓ You need a new library not in `00-MASTER-PLAN.md` §4 stack table
- ❓ Two plan files contradict each other
- ❓ A business rule is ambiguous (e.g., "should return bills allow negative old-gold?")
- ❓ A UI decision could reasonably go 2+ ways (which mode? where in nav?)
- ❓ A migration would need destructive changes (drop column, rename table)
- ❓ A change would break the tenant isolation model
- ❓ A change would affect >5 files across >2 modules — propose a plan first
- ❓ The user's request contradicts a locked decision in a plan file

### 2.2 PROCEED without asking (obvious defaults) when:

- ✅ Task is a tiny fix (typo, alignment, obvious bug)
- ✅ Task is a straightforward add and the plan explicitly covers it
- ✅ Task is a refactor within one file that doesn't change contracts
- ✅ Task is writing tests for existing behavior

### 2.3 How to ASK well (question quality standards)

Bad: "How should I do this?"
Good: "The plan says X for case A, but doesn't cover case B. I see two options: [1] extend X to handle B, [2] add a separate handler. Option 1 is simpler but couples them. Option 2 is cleaner but adds a module. My recommendation: Option 1. Confirm?"

**Every question has:**
- Context (what plan section, what's ambiguous)
- 2-3 options with tradeoffs
- Your recommendation
- Why you recommend it

Never ask open-ended "what should I do" — always narrow it to a choice.

---

## 3. Reuse rules — the sacred first step

### 3.1 Before creating ANY UI component

Read `17-ui-components.md` §3 (the 4-step decision tree). Summary:

```
1. Search packages/ui/COMPONENTS.md → exists? Import it.
2. Check IndiaCN catalog → exists? Copy in, adapt to tokens.
3. Check shadcn catalog → exists? `pnpm dlx shadcn add <name>`.
4. Truly new + reusable? → Build in packages/ui. Update COMPONENTS.md.
   Truly one-off? → OK in apps/*/components/ with TODO comment.
```

### 3.2 Before creating ANY domain function

- Search `packages/domain/` for existing helpers.
- Search `packages/types/` for existing schemas.
- If money/weight/GST-related: 99% chance it exists already.

### 3.3 Before creating ANY API endpoint

- Check `03-backend-api.md` §5 endpoint contract list.
- If the endpoint exists in the plan but is unimplemented, implement per the spec.
- If it doesn't exist, propose it in a `DECISIONS.md` entry with the URL, method, request/response schemas.

### 3.4 Before creating ANY database table or column

- Search `02-data-model.md`.
- Search `packages/db/migrations/` for existing schema.
- If it doesn't exist, propose migration in `DECISIONS.md` with SQL + RLS policy + rollback SQL.

---

## 4. Modules Impact Analysis — REQUIRED before any change

Before touching code, produce this table. Post it in the PR description.

| Module / File | Nature of change | Contract impact | Tests needed |
|---------------|------------------|-----------------|--------------|
| `packages/domain/billing/compute-line.ts` | Add stone value rule | Breaking (bill_items schema) | Update fixtures |
| `apps/api/src/modules/bills/service.ts` | Wire new stone rule | Non-breaking | Add integration test |
| `apps/store/src/components/bill/BillLine.tsx` | Show new stone field | Non-breaking | Playwright happy path |
| `packages/db/migrations/YYYYMMDD_bill_items_stone.sql` | New column | DB migration | Rollback SQL required |
| `packages/types/src/bill.ts` | Update BillLineSchema | Breaking (API consumers) | Update both FE + BE |

**Rule:** if the "Contract impact" column has "Breaking" anywhere, you must:
1. Bump the API version if the endpoint is public
2. Coordinate FE and BE PRs (ship together or gate behind feature flag)
3. Document in `DECISIONS.md`

**If you can't fill this table, you don't understand the change yet — stop and read more.**

---

## 5. Query Efficiency Rules (the anti-N+1 shield)

This is the section that saves us from Supabase bill shock and 30-second page loads.

### 5.1 The Golden Rules

1. **Never call an API inside a `for` / `map` / `forEach` loop.** Batch instead.
2. **Never call a database query inside another query's callback.** Join or preload.
3. **Never render 100 rows that each fetch their own data.** Query once, pass down as props.
4. **Every list endpoint returns the data needed by the list — no follow-up fetches.**
5. **Every detail endpoint returns the aggregate needed by the detail view — no follow-up fetches.**

### 5.2 The N+1 detector — how to spot it

**You have an N+1 problem if:**
- You fetch a list of N items
- Then for each item, you fetch something related
- Total DB queries = 1 + N

**Example — bad:**
```ts
const bills = await supabase.from('bills').select('*')
for (const bill of bills.data!) {
  const items = await supabase.from('bill_items').select('*').eq('bill_id', bill.id)
  // 💥 100 bills = 101 queries
}
```

**Example — good (JOIN):**
```ts
const bills = await supabase
  .from('bills')
  .select('*, bill_items(*), payments(*), customer:customers(id, name, phone)')
// 🎯 1 query, uses Supabase's PostgREST embedded resource syntax
```

### 5.3 The N×N (Cartesian) trap

**Bad:**
```ts
customers.forEach(c => {
  bills.forEach(b => {
    if (b.customer_id === c.id) { /* ... */ }
  })
})
// 1000 customers × 5000 bills = 5,000,000 iterations
```

**Good:**
```ts
const billsByCustomer = new Map<string, Bill[]>()
for (const b of bills) {
  const arr = billsByCustomer.get(b.customer_id) ?? []
  arr.push(b); billsByCustomer.set(b.customer_id, arr)
}
customers.forEach(c => {
  const theirBills = billsByCustomer.get(c.id) ?? []
  // ...
})
// O(N + M) instead of O(N × M)
```

### 5.4 Decision tree — which query pattern to use

```
Need data on frontend?
│
├─ From ONE table, filtered?
│  └─► Supabase client with .select() + .eq()/.in()
│      Example: single customer profile
│
├─ From MULTIPLE tables, related?
│  └─► Supabase EMBEDDED SELECT (foreign-key expansion)
│      Example: bills with bill_items and payments
│      `.select('*, bill_items(*), payments(*)')`
│
├─ Complex aggregation (SUM, GROUP BY, window functions)?
│  └─► PostgreSQL VIEW or MATERIALIZED VIEW
│      Example: monthly sales, karigar wastage summary
│      Reads via `.from('vw_monthly_sales').select('*')`
│
├─ Business logic that runs on every read + needs SQL power?
│  └─► SQL FUNCTION (regular or SECURITY DEFINER)
│      Example: compute customer lifetime value with FY logic
│      Called via `.rpc('compute_customer_ltv', { customer_id })`
│
├─ Aggregation across TENANTS (super-admin only)?
│  └─► SECURITY DEFINER function that BYPASSES RLS carefully
│      Never expose row-level data to the caller — only aggregates
│
├─ Frequently-read, rarely-changing data (rates, categories)?
│  └─► CLIENT CACHE (TanStack Query + persistQueryClient) +
│      Supabase Realtime subscription for invalidation
│
├─ Same data read by 1000+ users per minute?
│  └─► EDGE FUNCTION (Supabase Edge / Cloudflare Worker) with
│      caching at the edge (KV / cache API)
│
├─ Data that must be computed FAST close to the user?
│  └─► EDGE FUNCTION at Cloudflare edge
│      Example: current rate lookup for public rate widget
│
├─ Heavy compute (report, PDF, ML)?
│  └─► BACKGROUND JOB (BullMQ) — never block API request
│      Return job ID; client polls or subscribes to Realtime
│
└─ Cross-request state (rate limit, session)?
   └─► REDIS (Upstash)
```

### 5.5 When to use what — reference table

| Pattern | Use case | Latency | Cost |
|---------|----------|---------|------|
| **Supabase client `.select()`** | Simple filtered read | ~30ms | Cheap |
| **Embedded select (`resource(*)`)** | Multi-table with FKs | ~40ms | Cheap |
| **Postgres VIEW** | Reusable filtered query | ~30ms | Free (indexed) |
| **Postgres MATERIALIZED VIEW** | Expensive aggregation, refresh scheduled | ~10ms read, expensive refresh | Storage cost |
| **Postgres FUNCTION / RPC** | Reusable logic in SQL, `security definer` for admin | ~50ms | Cheap |
| **Fastify API endpoint** | Business logic, orchestration, side effects | ~100ms | Fly.io CPU |
| **Edge Function** | Public read, edge cache, low latency | ~10-20ms | Cheap at scale |
| **BullMQ job** | > 3s tasks, retries, side effects | Async | Redis + worker CPU |
| **Client cache (TanStack Query)** | Read-heavy, rarely changing | 0ms (cached) | Free |
| **Realtime subscription** | Live data (rates, bill status) | Push-based | Supabase quota |

### 5.6 When to reach for VIEWS vs EDGE FUNCTIONS vs RPC

**Use a Postgres VIEW when:**
- Same complex `SELECT ... JOIN ... WHERE` is repeated in >2 places
- You want RLS to still apply automatically
- The result is a simple query result (no procedural logic)

**Use an RPC (Postgres FUNCTION) when:**
- You need procedural logic (loops, conditionals, transactions)
- You need to bypass RLS for aggregate reads (`SECURITY DEFINER` with care)
- Multiple statements need to run atomically in a single call

**Use an EDGE FUNCTION (Cloudflare Worker / Supabase Edge) when:**
- Public read that needs edge caching (e.g., current rate for a public widget)
- Third-party webhook receiver that must respond in <50ms
- Region-close computation (avoid India→US round-trip)

**Use a MATERIALIZED VIEW when:**
- Aggregation is expensive (>500ms)
- Data can be seconds/minutes stale
- Refresh scheduled (nightly, hourly) via `pg_cron`

### 5.7 API design rules to prevent N+1

- **List endpoints must accept `expand=` param** or return needed relations by default
  Example: `GET /bills?expand=items,payments,customer`
- **Aggregate counts** on the same query, not separate calls (`{ data, total_count }`)
- **Never** return an item and expect the client to fetch its details in the same view

### 5.8 Frontend rules to prevent N+1

- **Never** `useQuery` inside a `.map()` return in JSX
- **Never** call `supabase.from()` inside `useEffect` that runs per-item
- **Always** hoist queries to the page level; pass data as props to children
- **Use** TanStack Query's `queries: [{queryKey, queryFn}, ...]` (parallel) not sequential awaits

### 5.9 Performance budgets (enforced in CI Phase 2)

| Metric | Budget | Enforce |
|--------|--------|---------|
| API p95 latency | < 200ms | Fly.io metrics + alert |
| DB queries per API request | ≤ 3 | Log middleware, warn > 3, fail > 10 |
| Client render <100 rows | < 200ms | React Profiler in dev |
| Client route change | < 500ms | Lighthouse CI |
| N+1 detection | 0 | Custom lint rule + integration test |

### 5.10 The N+1 self-check ritual

Before any PR that adds a query, answer these:

1. "How many DB queries does this handler make when the list has 100 items?"
   - If your answer is ≥ 100, it's N+1. Rewrite with a JOIN.
2. "If a user has 10 bills each with 20 line items, how many queries?"
   - Target: 1 (via embedded select) or 2 (bills + IN-clause on line items).
3. "Am I fetching data for a UI component's siblings separately?"
   - If yes, hoist the query.

---

## 6. The Update-Docs-Or-Die rule

**Do this proactively. Never wait for the human to say "update the plans."** If code, layout, stack, deploy, or process diverges from `Plans/`, the plan update is part of the task — not optional follow-up.

### 6.1 When to update plan MD files

**Update the relevant plan file(s) in the SAME change as the code when:**
- You change a schema (`02-data-model.md`)
- You change an API contract (`03-backend-api.md`)
- You add/remove a UI component from `packages/ui` (`17-ui-components.md` + `COMPONENTS.md`)
- You change a phase's scope (`10-` through `14-`)
- You pick a different library than what's in the stack table (`00-MASTER-PLAN.md` §4)
- You change deployment/infra (`00-MASTER-PLAN.md` §5)
- You change any "locked" decision (bump `Last-updated:` and add a `Changed:` note at the top)

### 6.2 What to write

Every change to a plan file includes:
- Bump `Last-updated:` date
- Add a one-liner in the `## Changelog` at the bottom (create if missing)
- If it's a breaking-ish change, add a `> **Change note (YYYY-MM-DD):**` blockquote at the top

### 6.3 What NOT to update

- Don't rewrite whole sections when a small edit does
- Don't remove historical decisions — mark them "Superseded by …" instead
- Don't update phase files retroactively — they're the plan at that time; use ADRs (`DECISIONS.md`) for post-hoc changes

### 6.4 `DECISIONS.md` — the ADR log

Every non-trivial deviation from a plan → append an entry:

```markdown
## ADR-023: Switch bill numbering from per-branch to per-tenant
Date: 2026-08-14
Author: agent-claude / <human-reviewer>
Status: Accepted
Context: Tenants with 2 branches complained about split invoice sequences confusing accountants.
Decision: One shared sequence per tenant. Branch encoded in bill number suffix.
Consequences:
  - `02-data-model.md` §3 updated (bills.bill_number format)
  - Migration `20260814_bills_number_format.sql` reformats existing bills
  - Frontend `04-frontend-store-app.md` §12 (invoice template) updated
Alternatives considered:
  - Keep per-branch: rejected because it breaks continuity claim
  - Reset yearly per-branch: rejected because sequence conflicts across branches
```

**One ADR per non-trivial change. No exceptions.**

---

## 7. The Agent's PR Contract

Every PR you open MUST include:

```markdown
## What
<one paragraph — what changed and why>

## Plans read
- [x] 00-MASTER-PLAN.md
- [x] 18-ai-agent-manual.md
- [x] <task-specific>

## Modules impacted
<the impact table from §4>

## Query analysis
- New queries added: <N>
- N+1 self-check: <passed / N/A>
- Est. DB queries per request in worst case: <number>

## Docs updated
- [ ] Plan files (list them) OR "N/A — no plan impact"
- [ ] COMPONENTS.md (if UI added)
- [ ] DECISIONS.md (if deviation from plan)

## Questions raised for the user
<none / list>

## Definition of Done checklist
<from 15-coding-standards.md §9>
```

**PRs without this contract will be closed without review.**

---

## 8. Escalation triggers — STOP and ping the user

Halt immediately and ask before proceeding when you encounter:

1. **Any secret / credential / API key** that isn't in `.env.example`
2. **Any migration** that drops or renames a column with existing data
3. **Any change** to `packages/domain/billing/*` — money math needs human eyes
4. **Any change** to RLS policies — data leak risk
5. **Any new external service** (new SaaS vendor, new npm dep with runtime code)
6. **Any change** that would let a `staff` role see cost prices or another branch's data
7. **Any deletion** of a plan MD file
8. **Any change** to `.github/workflows/*` — CI can silently disable checks
9. **Any test being disabled / skipped / mocked** — must justify in ADR
10. **When the user's request contradicts a locked plan** — surface the conflict, don't silently choose

---

## 9. What NEVER happens (hard "no"s)

- ❌ Never install a library not in the stack table without an ADR
- ❌ Never use JS `number` for money — always Decimal.js in `packages/domain`, `NUMERIC` in DB
- ❌ Never bypass RLS in application code (unless explicitly a `SECURITY DEFINER` admin function)
- ❌ Never `SELECT *` from `bills` or `bill_items` in a loop
- ❌ Never write a UI component in `apps/*/components/` if it's used in >1 place
- ❌ Never import from `@radix-ui/*`, `cmdk`, `lucide-react` directly in apps — go through `@sonari/ui`
- ❌ Never `dangerouslySetInnerHTML` without an ADR
- ❌ Never commit `.env` files or secrets
- ❌ Never disable a test to make CI green — fix or ADR it
- ❌ Never delete or rewrite a plan file without an ADR
- ❌ Never work in the default branch — always feature branch
- ❌ Never push to `main` — always PR
- ❌ Never ship without offline test (for write paths)
- ❌ Never ship without a cross-tenant RLS leak test (for new tables)
- ❌ Never trust LLM output for money math — validate with `packages/domain` rules

---

## 10. Agent's daily habits

- **On every session start:** read `MEMORY.md` if this repo has one, plus `00-MASTER-PLAN.md` and this file.
- **On every task start:** run the §1.3 pre-task ritual.
- **Before every commit:** run local tests, lint, typecheck.
- **Before every PR:** fill the §7 contract completely.
- **When stuck for 15 minutes:** ask, don't guess.
- **When making a decision the plan doesn't cover:** add an ADR.
- **When finishing a task:** re-verify the plans you touched match reality.

---

## 11. Multi-agent coordination

If multiple agents are working simultaneously (e.g., you and Copilot, or two separate agents):

- **Feature branches per agent** — never share a branch
- **Read the other agent's open PRs** before starting — avoid conflicts
- **Lock decisions in `DECISIONS.md`** — first-agent-decides, others follow
- **UI components: first come, first coded** — check `packages/ui` and open PRs for name collisions
- **Domain functions: coordinate via ADR** — no two agents rewrite `computeLine` simultaneously

---

## 12. Failure recovery — when you screw up

You WILL make mistakes. That's fine. What matters:

1. **When tests fail:** don't skip them. Fix the code or fix the test with an ADR explaining why.
2. **When a plan is wrong:** update the plan in the same PR, don't silently work around it.
3. **When you break tenant isolation:** halt, roll back, add regression test.
4. **When a query is N+1:** rewrite before merging. No "we'll optimize later" — technical debt in money code is compound interest against you.
5. **When you install a bad dep:** remove it, add an ADR of what to use instead.
6. **When you can't fix something in the current PR:** open a follow-up issue with the exact context. Never leave `// TODO` without a linked issue.

---

## 13. The "small task" trap

Small tasks are where agents get sloppy. **The rules apply equally to a 5-line fix and a 500-line feature.** Especially:

- Even a typo fix in `packages/domain/billing/` needs a domain test run
- Even a color change needs to go through design tokens
- Even a "just add an index" needs a migration file with rollback
- Even a "just log this" needs to not log PII

---

## 14. Communication rules

When responding to the user:

- **Show your work.** After completing a task, list what you read, what you changed, what tests you ran.
- **Never say "done" without verification.** Say "tests pass locally, PR opened, ready for review."
- **Report failures honestly.** If a test fails, say so — don't hide it.
- **Reference file paths as `path:line`** — clickable in modern editors.
- **When you skipped something** (e.g., "didn't add integration test because…"), explain why.
- **When you deviated from the plan**, lead with a **Plan deviations** table (plan said → we did → why). Do not bury it. Also update `Plans/` + ADR in the same change. Never silently diverge.


---

## 15. The agent-friendly repo conventions

You'll find these markers to help you:

- `// AGENT-NOTE:` — a hint left for future agents (respect it)
- `// AGENT-BLOCKED:` — this section needs human input before touching
- `// AGENT-GENERATED:` — code an agent generated; verify before extending
- `// TODO(issue-N):` — a real backlog item with an issue link
- `<!-- plan-anchor: <id> -->` — a stable anchor in plan MDs you can reference

Use the same markers when leaving hints for the next agent.

---

## 16. Checklist you print at task start (copy-paste this)

```
====================================================
TASK: <one-line>
====================================================
Plans read:
[ ] 00-MASTER-PLAN.md
[ ] 15-coding-standards.md
[ ] 18-ai-agent-manual.md (this)
[ ] <task-specific plans>

Impact table filled: [ ]
Questions to user (or "None"): [ ]

Data reads/writes involved:
- Reads:
- Writes:

Query pattern chosen (client / view / RPC / edge / job):

Est. queries in worst case:

Reuse check (packages/ui, packages/domain):
- Reused: <list>
- New (justified): <list>

Plan updates required after this task:
- [ ] <file>: <what changes>

Ready to code: [ ]
====================================================
```

**If any `[ ]` is empty, you're not ready. Read more, think more, ask more.**

---

## 17. TL;DR (the one-paragraph version)

Read `00-MASTER-PLAN.md` + this file + the specific plans your task touches. Before any code: fill the impact table, run the pre-task ritual, and answer the query-efficiency self-check. Reuse from `packages/ui`, `packages/domain`, `packages/types` before creating. Ask when unclear — with options and a recommendation. Every PR updates the plans it changes. Never N+1. Never JS `number` for money. Never bypass RLS. Never work around tests. When in doubt, ADR it.

---

## Changelog

- **2026-07-04:** §6 — plan updates are proactive (never wait to be asked). §14 — must report plan deviations (what + why) to the user. Aligns with `.cursor/rules/sonari-plans-sync.mdc`.

- **2026-07-03:** Initial version.
