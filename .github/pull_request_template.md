## What

<!-- One paragraph — what changed and why -->

## Plans read

- [ ] `00-MASTER-PLAN.md`
- [ ] `18-ai-agent-manual.md`
- [ ] `15-coding-standards.md`
- [ ] <!-- task-specific plans -->

## Modules impacted

| Module / File | Nature of change | Contract impact | Tests needed |
|---------------|------------------|-----------------|--------------|
| | | | |

## Query analysis

- New queries added:
- N+1 self-check: passed / N/A
- Est. DB queries per request (worst case):

## Docs updated

- [ ] Plan files (list) OR N/A — no plan impact
- [ ] `packages/ui/COMPONENTS.md` (if UI added)
- [ ] `Plans/DECISIONS.md` (if deviation from plan)

## Questions raised for the user

<!-- none / list -->

## Definition of Done

- [ ] Zod schema in `packages/types` (or existing reused)
- [ ] Domain logic in `packages/domain` when applicable, with tests
- [ ] API endpoint with integration test (if API change)
- [ ] UI has loading, empty, error states (if UI change)
- [ ] Mobile responsive at 375px (if UI change)
- [ ] Keyboard navigable; icon-only buttons have `aria-label`
- [ ] Works offline for write paths (or documented online-only)
- [ ] Idempotent (`client_uuid` or Idempotency-Key)
- [ ] RLS policy tested with a second tenant (if new table)
- [ ] Sentry error boundary in place (if UI surface)
- [ ] Docs updated (relevant sub-plan MD)
- [ ] One Playwright happy-path test (when E2E exists)
- [ ] Feature flag if risky
