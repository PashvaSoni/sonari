import Decimal from 'decimal.js'

/** Pure domain package — no I/O. Billing math lands here in Phase 1. */
export function toMoneyString(value: Decimal.Value): string {
  return new Decimal(value).toFixed(2)
}
