# 02 — Data Model (Postgres / Supabase)

**Last-updated:** 2026-07-03
**Prereq:** [01-architecture.md](./01-architecture.md)

All tables live in Supabase Postgres. **Every business table has `tenant_id`.** All migrations go in `packages/db/migrations` and are applied via Supabase CLI (`supabase db push`).

---

## 1. Conventions

- **UUIDs everywhere** as PKs (`gen_random_uuid()`).
- **Timestamps:** `created_at`, `updated_at` (`TIMESTAMPTZ DEFAULT now()`). `updated_at` maintained by trigger.
- **Soft delete:** `deleted_at TIMESTAMPTZ` on user-facing entities. Never hard-delete financial records.
- **Money:** `NUMERIC(14,2)`. **Weight:** `NUMERIC(10,3)` (grams). **Purity:** `NUMERIC(6,3)` (e.g., 91.600 for 22K).
- **JSONB** for flexible metadata (never for money or weights).
- **Snake_case** table/column names.
- Every table ships with a `tenant_id` index and RLS policy (except platform tables `tenants`, `users`, `plans`).

---

## 2. Platform tables (Super Admin scope)

### `tenants`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| name | text | Store business name |
| slug | text unique | For subdomains: `acme.sonari.app` |
| plan_id | uuid FK plans | |
| status | enum(`trial`,`active`,`past_due`,`suspended`,`cancelled`) | |
| trial_ends_at | timestamptz | |
| gstin | text | Optional |
| country | text default 'IN' | |
| timezone | text default 'Asia/Kolkata' | |
| currency | text default 'INR' | |
| created_at, updated_at | | |

### `plans`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| name | text | e.g., "Starter", "Pro" |
| price_monthly_inr | numeric(10,2) | |
| max_branches | int | |
| max_staff | int | |
| features | jsonb | `{voice:true, karigar:true, ...}` |

### `feature_flags`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id | uuid nullable FK tenants | Null = global |
| flag_key | text | |
| enabled | bool | |
| rollout_pct | int 0-100 | For gradual rollout |

### `users` (mirrors Supabase auth.users via trigger)
| col | type | notes |
|-----|------|-------|
| id | uuid PK (= auth.users.id) | |
| email | text | |
| phone | text | |
| full_name | text | |
| avatar_url | text | |
| default_tenant_id | uuid FK tenants | |
| created_at | | |

### `memberships`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| user_id | uuid FK users | |
| tenant_id | uuid FK tenants | |
| branch_id | uuid nullable FK branches | Null = all branches |
| role | enum(`super_admin`,`store_owner`,`manager`,`staff`,`karigar`) | |
| status | enum(`invited`,`active`,`disabled`) | |
| created_at | | |
| UNIQUE(user_id, tenant_id, branch_id) | | |

---

## 3. Tenant core

### `branches`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id | uuid FK tenants | |
| name | text | |
| is_default | bool | Exactly one per tenant enforced by partial unique index |
| address | jsonb | `{line1, line2, city, state, pincode}` |
| gstin | text | Branch-specific GSTIN (state) |
| phone, email | text | |
| logo_url | text | |
| invoice_prefix | text | e.g., "ACME/24-25/" |
| invoice_counter | bigint | Monotonic per branch |
| settings | jsonb | Print size, default making %, etc. |
| deleted_at | timestamptz | |

### `metal_rates`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id | uuid FK tenants | |
| metal | enum(`gold`,`silver`,`platinum`) | |
| purity | numeric(6,3) | e.g., 99.900, 91.600, 75.000 |
| rate_per_gram | numeric(14,2) | INR |
| effective_from | timestamptz | |
| source | enum(`manual`,`feed`) | |
| set_by | uuid FK users | |
| created_at | | |

Rate at any point in time = latest row per `(tenant_id, metal, purity)` with `effective_from <= now()`.

### `metal_rate_history` (event-sourced view)
Materialised via the above table — no separate table. Query with window function.

---

## 4. Inventory

### `categories`
Tree structure for stock organisation.
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id | uuid FK tenants | |
| parent_id | uuid nullable FK categories | |
| name | text | e.g., "Necklaces > Chains > Rope Chains" |
| slug | text | |

### `items` (master stock)
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id | uuid FK tenants | |
| branch_id | uuid FK branches | Which branch physically holds it |
| category_id | uuid FK categories | |
| sku | text | Auto-generated, unique per tenant |
| barcode | text unique per tenant | For scanning |
| huid | text | BIS Hallmark Unique ID (6 chars) |
| name | text | "22K Gold Chain 8gm" |
| description | text | |
| metal | enum(`gold`,`silver`,`platinum`,`other`) | |
| purity | numeric(6,3) | |
| gross_weight | numeric(10,3) | grams |
| net_weight | numeric(10,3) | grams (excludes stones) |
| stone_details | jsonb[] | `[{name, weight_ct, rate_per_ct, count}]` |
| making_charge_type | enum(`flat`,`per_gram`,`percent`) | |
| making_charge_value | numeric(14,2) | |
| wastage_percent | numeric(6,3) | |
| hsn_code | text | For GST (typically 7113) |
| tax_rate | numeric(6,3) | GST%, typically 3.0 |
| status | enum(`in_stock`,`sold`,`reserved`,`in_repair`,`with_karigar`,`melted`) | |
| cost_price | numeric(14,2) | Purchase cost, hidden from staff |
| images | text[] | Supabase Storage URLs |
| created_at, updated_at, deleted_at | | |

### `stock_movements`
Every state change to an item is logged.
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id | uuid FK tenants | |
| item_id | uuid FK items | |
| from_status | enum | |
| to_status | enum | |
| reason | text | e.g., "bill:<uuid>", "adjust:count", "karigar:issue" |
| ref_id | uuid | Points to bill / karigar job / etc. |
| performed_by | uuid FK users | |
| created_at | | |

---

## 5. Customers

### `customers`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id | uuid FK tenants | |
| full_name | text | |
| phone | text | Indexed, tenant-unique-per-phone soft constraint |
| email | text | |
| address | jsonb | |
| gstin | text | For B2B invoices |
| pan | text | Required for TCS threshold |
| date_of_birth | date | |
| anniversary | date | |
| loyalty_points | int default 0 | |
| kyc_verified | bool | |
| tags | text[] | e.g., `['vip','wholesale']` |
| notes | text | |
| created_at, updated_at, deleted_at | | |

### `customer_metal_ledger`
Tracks old gold customer has given (metal-in-account).
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id, customer_id | | |
| metal | enum | |
| purity | numeric(6,3) | |
| weight | numeric(10,3) | +ve = credit, -ve = debit |
| ref_type | enum(`old_gold_deposit`,`bill_adjustment`,`refund`) | |
| ref_id | uuid | |
| created_at | | |

---

## 6. Billing

### `bills`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| client_uuid | uuid unique | Idempotency key from client |
| tenant_id, branch_id | | |
| bill_number | text | Formatted "ACME/24-25/000123" |
| customer_id | uuid nullable FK customers | Walk-in = null |
| bill_date | timestamptz | |
| type | enum(`sale`,`return`,`estimate`,`repair`,`custom_order`) | |
| status | enum(`draft`,`confirmed`,`paid`,`partial_paid`,`cancelled`) | |
| subtotal | numeric(14,2) | Sum of line totals before GST |
| discount | numeric(14,2) | |
| taxable_amount | numeric(14,2) | |
| cgst | numeric(14,2) | |
| sgst | numeric(14,2) | |
| igst | numeric(14,2) | For inter-state |
| tcs | numeric(14,2) | Sec 206C(1H) |
| round_off | numeric(6,2) | |
| grand_total | numeric(14,2) | |
| paid_amount | numeric(14,2) | |
| balance_due | numeric(14,2) | |
| old_gold_credit | numeric(14,2) | From old_gold_exchange table |
| rate_snapshot | jsonb | `{gold_22k: 6420, silver_999: 88}` frozen at bill time |
| notes | text | |
| created_by | uuid FK users | |
| created_at, updated_at, confirmed_at | | |

### `bill_items`
One row per line in the bill.
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| bill_id | uuid FK bills ON DELETE CASCADE | |
| tenant_id | uuid | Denormalised for RLS speed |
| item_id | uuid nullable FK items | Nullable for ad-hoc lines |
| line_type | enum(`item`,`stone`,`making`,`wastage`,`custom`) | |
| description | text | Snapshot at bill time |
| hsn_code, purity, metal | | Snapshot |
| gross_weight, net_weight | | Snapshot |
| rate_per_gram | numeric(14,2) | Snapshot |
| metal_value | numeric(14,2) | net_weight * rate |
| making_charge | numeric(14,2) | Computed |
| wastage_amount | numeric(14,2) | Computed |
| stone_value | numeric(14,2) | |
| line_discount | numeric(14,2) | |
| tax_rate | numeric(6,3) | |
| line_total | numeric(14,2) | |
| position | int | Order in bill |

### `payments`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| bill_id | uuid FK bills | |
| tenant_id | uuid | |
| amount | numeric(14,2) | |
| method | enum(`cash`,`upi`,`card`,`bank_transfer`,`old_gold`,`loyalty`,`scheme`) | |
| reference | text | UPI ref / card last4 |
| received_at | timestamptz | |
| received_by | uuid FK users | |

### `old_gold_exchange`
Detail of old gold accepted against a bill.
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| bill_id | uuid FK bills | |
| tenant_id | uuid | |
| metal | enum | |
| purity | numeric(6,3) | Post-melting |
| gross_weight | numeric(10,3) | |
| net_weight | numeric(10,3) | After deductions |
| deduction_reason | text | |
| rate_applied | numeric(14,2) | |
| value | numeric(14,2) | |
| photos | text[] | Storage URLs |

---

## 7. Karigar (Phase 2)

### `karigars`
Registered artisans.
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id | uuid | |
| user_id | uuid nullable FK users | If they log in |
| name, phone, address | | |
| specialization | text[] | |
| default_wastage_percent | numeric(6,3) | |
| default_making_rate | numeric(14,2) | |
| trust_score | int 0-100 | Computed |

### `karigar_jobs`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id, karigar_id | | |
| job_number | text | |
| description | text | |
| issued_weight | numeric(10,3) | Raw metal issued |
| issued_purity | numeric(6,3) | |
| received_weight | numeric(10,3) | Finished |
| received_purity | numeric(6,3) | |
| allowed_wastage_percent | numeric(6,3) | |
| actual_wastage_percent | numeric(6,3) | Computed |
| status | enum(`issued`,`in_progress`,`received`,`billed`,`disputed`) | |
| issued_at, received_at | | |
| making_charge | numeric(14,2) | |
| photos | text[] | |

---

## 8. Repairs & custom orders (Phase 2)

### `repair_orders`
### `custom_orders`
(Schemas in [12-phase-2-depth.md](./12-phase-2-depth.md).)

---

## 9. Schemes & loyalty (Phase 2)

### `savings_schemes` (master)
### `scheme_enrollments`
### `scheme_installments`
### `loyalty_tiers`
### `loyalty_transactions`
(Schemas in Phase 2 file.)

---

## 10. Notifications & audit

### `notification_log`
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id | uuid | |
| channel | enum(`email`,`sms`,`whatsapp`,`push`) | |
| provider | text | 'resend', 'msg91', 'meta_whatsapp' |
| template_key | text | 'bill.created', 'scheme.reminder' |
| to | text | |
| status | enum(`queued`,`sent`,`delivered`,`failed`,`read`) | |
| payload | jsonb | |
| provider_id | text | Provider msg id for webhooks |
| error | text | |
| sent_at, delivered_at, read_at | | |

### `audit_events`
Append-only. Never delete.
| col | type | notes |
|-----|------|-------|
| id | uuid PK | |
| tenant_id | uuid | |
| user_id | uuid | |
| entity_type | text | 'bill', 'item', 'customer' |
| entity_id | uuid | |
| action | text | 'create','update','delete','confirm','cancel' |
| before | jsonb | |
| after | jsonb | |
| ip | inet | |
| user_agent | text | |
| created_at | | |

---

## 11. Indexes (essentials — full list in migration files)

```sql
CREATE INDEX ON items (tenant_id, status);
CREATE INDEX ON items (tenant_id, barcode);
CREATE INDEX ON bills (tenant_id, bill_date DESC);
CREATE INDEX ON bills (tenant_id, customer_id);
CREATE UNIQUE INDEX ON bills (tenant_id, bill_number);
CREATE INDEX ON bill_items (bill_id);
CREATE INDEX ON customers (tenant_id, phone);
CREATE INDEX ON stock_movements (tenant_id, item_id, created_at DESC);
CREATE INDEX ON audit_events (tenant_id, entity_type, entity_id);
```

---

## 12. RLS policies (template)

For every tenant-scoped table:

```sql
ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;

-- Read: same tenant OR super_admin
CREATE POLICY <t>_read ON <t> FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- Write: same tenant, non-super-admin roles specific to table
CREATE POLICY <t>_write ON <t> FOR INSERT WITH CHECK (
  tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
);
CREATE POLICY <t>_update ON <t> FOR UPDATE
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

Role-level restrictions (e.g., staff can't delete bills) enforced in **API layer** with role checks, not RLS — keeps RLS simple.

---

## 13. Migration workflow

1. All changes as **timestamped SQL files** in `packages/db/migrations/`.
2. Local: `supabase db reset` re-applies from scratch (dev only).
3. Preview PR: GitHub Action runs `supabase db diff` to show delta.
4. Prod: `supabase db push --linked` (manual, gated by admin approval).
5. **Never** hand-edit prod DB. All changes via migrations.
6. Every migration must have a rollback SQL file (`XXX_rollback.sql`).
