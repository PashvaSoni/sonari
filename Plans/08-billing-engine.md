# 08 — Billing Engine

**Last-updated:** 2026-07-03
**Prereq:** [02-data-model.md](./02-data-model.md), [06-shared-modules.md](./06-shared-modules.md)

The financial correctness spec. Every rupee is computed by `packages/domain/billing`. Both server and client call the same functions.

---

## 1. Inputs to a bill line

```ts
type LineInput = {
  clientUuid: string
  itemId?: string
  description: string
  hsnCode: string           // usually '7113'
  metal: 'gold' | 'silver' | 'platinum' | 'other'
  purity: number            // e.g., 91.6 for 22K
  grossWeight: number       // grams
  netWeight: number         // grams (excludes stones)
  stones?: Array<{ name: string; weightCt: number; ratePerCt: number; count: number }>
  makingChargeType: 'flat' | 'per_gram' | 'percent'
  makingChargeValue: number
  wastagePercent: number    // 0-30
  lineDiscount?: number
  taxRate: number           // 3.0 for jewellery normally
}
```

## 2. Line computation formula (single source of truth)

```
metalValue      = netWeight × ratePerGram(metal, purity)
makingCharge    = switch(makingChargeType):
                    flat     → makingChargeValue
                    per_gram → netWeight × makingChargeValue
                    percent  → metalValue × makingChargeValue / 100
wastageAmount   = metalValue × wastagePercent / 100
stoneValue      = Σ (stone.weightCt × stone.ratePerCt × stone.count)
lineSubtotal    = metalValue + makingCharge + wastageAmount + stoneValue − lineDiscount
lineTax         = lineSubtotal × taxRate / 100
lineTotal       = lineSubtotal + lineTax
```

Rounding: **half-up to 2 decimals at every step**, using Decimal.js. Not JavaScript floating point.

## 3. Bill totals

```
subtotal        = Σ lineSubtotal
totalTax        = Σ lineTax
                → split into CGST/SGST (intra-state) or IGST (inter-state) based on:
                    buyer state == seller state → CGST = SGST = tax/2
                    else → IGST = tax
oldGoldCredit   = Σ oldGoldExchange.value
discount        = subtotal-level discount (₹ or %)
taxableAmount   = subtotal − discount
tcs             = if cumulative_sale_to_customer > 50L in FY: 0.1% of grand amount
grandBeforeRoundOff = taxableAmount + totalTax + tcs − oldGoldCredit
roundOff        = round-to-rupee delta (max ±0.50)
grandTotal      = grandBeforeRoundOff + roundOff
balanceDue      = grandTotal − Σ payments.amount
```

## 4. GST split rules (jewellery in India — Phase 1)

- Metal + making + wastage: 3% GST (HSN 7113 chapter)
- Stones (loose diamonds/pearls): typically 0.25%-3% depending on classification. Configurable per stone type.
- Compulsory `place_of_supply` on bill (buyer state).
- If seller.state == buyer.state: CGST 1.5% + SGST 1.5%.
- Else IGST 3%.
- If buyer state missing: default to seller state.
- Composition scheme (small dealers): flat 1% on turnover — configurable per tenant, changes line-level math to only 1% and no CGST/SGST split.

## 5. TCS (Section 206C(1H))

- Applies when a seller's aggregate sales to a **single PAN** in a financial year > ₹50L.
- Rate: 0.1% (0.075% during specific govt-relief windows — configurable).
- Requires buyer PAN on bill; if missing and threshold crossed → block confirmation with "PAN required".

Implementation:
- Job runs nightly: refresh `customers.fy_purchase_sum` per FY.
- Live check on bill confirm: recompute this bill's contribution + prior sum vs threshold.
- Threshold config in tenant settings (default 5000000).

## 6. HUID handling

- 6-character BIS Hallmark Unique ID. Alphanumeric uppercase.
- Validated by regex `^[A-Z0-9]{6}$`.
- Must be captured for every gold item ≥ specific weight per BIS rules (currently no lower limit for hallmarked jewellery in listed districts — configurable).
- Bill line stores HUID from the linked item, or user enters if ad-hoc.
- Duplicate HUID within tenant → warn (but allow; sometimes items get re-hallmarked).

## 7. Making charge modes

- **Flat**: `₹X per piece` (used for finished designs, imports).
- **Per gram**: `₹X per gram` × net weight (most common in gold).
- **Percent**: `X%` of metal value (common in premium/branded).

Each item can default to one; bill line inherits but overrides allowed.

## 8. Wastage

- Percent of net weight (default) or gross weight (config).
- Cap at 30% (system warning; blocked at 50%).
- Applied on top of net weight × rate — displayed separately for transparency.

## 9. Old gold exchange

- One or more `old_gold_exchange` rows attached to bill.
- Each: metal + purity + gross + net (after deduction) + rate applied + value.
- Rate applied is generally **today's buy-back rate**, which is `sell_rate − buyback_deduction%` (config per tenant, default 3%).
- Sum of values is deducted from grand total.
- Also creates a `customer_metal_ledger` entry so future bills can use the customer's "metal-in-account" balance.

## 10. Payments

- Multiple payment methods per bill.
- Sum must equal grand total (or leave balance_due > 0 with tenant setting allowed).
- On confirm, methods that credit stock (old_gold, loyalty, scheme) are applied atomically.

## 11. Invoice numbering

- Format: `{prefix}/{FY}/{seq}` (e.g., `ACME/25-26/000123`).
- Prefix per branch, seq per branch, resets each FY (starting April 1st in India).
- Reservation on confirm (not create) — drafts don't burn numbers.
- If bill cancelled → number keeps its slot with `status=cancelled` (per GST rules; never reuse a number).

## 12. Returns / credit notes

- `type = 'return'` with `ref_bill_id`.
- All quantities/lines negative.
- Cannot exceed original bill quantities.
- Regenerates a credit note in the same invoice sequence family (GST rule).

## 13. Estimates → conversion

- Type `estimate` — no stock impact, no financial recording.
- "Convert to sale" copies lines into a new `sale` bill and links via `estimate_bill_id`.

## 14. Repairs (Phase 2)

Different line structure — no metal purity change, only labour + added metal + stones. Covered in Phase 2 file.

## 15. Precision & rounding — the golden rules

- **Money in Postgres:** `NUMERIC(14, 2)`.
- **Weights:** `NUMERIC(10, 3)`.
- **Rates:** `NUMERIC(14, 2)` per gram (₹) or per carat.
- **Percentages:** `NUMERIC(6, 3)` (allows 0.001% precision).
- All intermediate math in `packages/domain` uses `Decimal.js` (`Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })`).
- Round to 2 dp when writing money to DB and displaying.
- Do NOT sum pre-rounded lines vs summing precise lines then rounding — pick one and stick. **Sonari standard: round line totals, then sum → matches printed invoice exactly.**

## 16. Test corpus

`packages/domain/billing/tests/` includes:
- `fixtures.json` — 50 real-world bills (with expected totals) provided by domain expert.
- Property-based tests via `fast-check` — random line configs, invariants:
  - `grandTotal = subtotal − discount + tax + tcs − oldGoldCredit + roundOff`
  - `|roundOff| ≤ 0.5`
  - `Σ payments = grandTotal ⇒ balanceDue = 0`
- Snapshot tests for GST split (5 scenarios: same state, other state, IGST-only, composition, exempt).

Any change to formulas requires the test corpus to still pass — this is the acceptance gate.
