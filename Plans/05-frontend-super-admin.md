# 05 — Super Admin App

**Last-updated:** 2026-07-03
**Prereq:** [00-MASTER-PLAN.md](./00-MASTER-PLAN.md)

Internal-only app for **you** (and future ops team) to manage the SaaS platform.

---

## 1. Purpose

- Onboard tenants (jewellery stores)
- Manage subscription plans and features
- Monitor platform health (usage, errors, revenue)
- Support (impersonate a tenant to debug)
- Feature flag rollouts
- Global metal rate feed (optional master feed all tenants consume)

---

## 2. Routes (`apps/admin`)

```
/                        → Overview dashboard
/tenants                 → All tenants (table)
/tenants/:id             → Tenant detail (usage, staff, plan, activity)
/tenants/:id/impersonate → Get temporary JWT to log in as tenant owner (audited)
/plans                   → CRUD plans
/features                → Feature flags, per-tenant + global
/rates/global            → Optional master rate feed
/notifications           → Global template management
/users                   → All admin users (invite fellow ops)
/audit                   → Cross-tenant audit event stream
/support                 → Incoming support requests (Phase 2)
/settings                → Platform-level settings
```

---

## 3. Design

Same design system as Store app but visually distinct — **darker header** with "SONARI ADMIN" mark so you never confuse it with tenant app. Restrict to `role = 'super_admin'` in JWT.

**Stack:** Same as Store — Vite + React + Tailwind + shadcn/ui + React Router. Deployed to Cloudflare Pages / Vercel from `apps/admin`.

---

## 4. Key screens

### 4.1 Tenants list

Table with columns:
- Name, plan, status, MRR, staff count, bills last 30d, last active, actions.

Filters: plan, status, activity range.

Row action: **Impersonate** → opens Store App in new tab with a scoped 1-hour JWT; event logged in `audit_events` with reason field required.

### 4.2 Tenant detail

Tabs:
- **Overview** — plan, status, MRR, GSTIN, address, branches count
- **Usage** — bills/month chart, active users, storage used
- **Staff** — list of users on this tenant
- **Billing** — subscription history, invoices (Phase 2 with Razorpay)
- **Feature flags** — per-tenant override list
- **Activity** — recent audit events
- **Danger zone** — suspend, cancel, delete (soft)

### 4.3 Plans CRUD
- Create/edit plans with feature bitmap.
- Cannot delete a plan with active tenants — must migrate first.

### 4.4 Feature flags
- Toggle globally, per-tenant, or by rollout %.
- Every flag has a description and `default: on|off`.
- Flag reads from Store App go through `useFeatureFlag('voice_billing')` hook that hits a cached endpoint.

### 4.5 Impersonation
- Generates JWT via server function `impersonate(tenant_id, reason)`.
- JWT valid 1h, marked with `impersonated_by: <admin_user_id>`.
- Every request during impersonation carries this marker → shown in Store app top bar with red banner "Viewing as tenant".
- All actions during impersonation are audit-logged with `actor = admin`.

---

## 5. Metrics (overview dashboard)

- Total tenants (trial / active / churned)
- MRR / ARR
- New signups (7d, 30d)
- Bills created platform-wide (7d, 30d)
- Error rate (from Sentry API)
- Uptime (from UptimeRobot API)

Charts via Recharts. Data via `/api/v1/admin/metrics`.

---

## 6. Security

- Separate Vercel deployment (`admin.sonari.app`).
- Only invited super_admins can log in. Signup disabled.
- 2FA required (Supabase Auth TOTP).
- IP allowlist optional (Phase 2).
- All admin actions audit-logged.
- No CSV export of tenant PII without a two-person approval (Phase 3).

---

## 7. Deployment

Same monorepo, deployed as separate Cloudflare Pages (or Vercel) project pointing to `apps/admin`.
Auth uses same Supabase project — role checked from JWT.
