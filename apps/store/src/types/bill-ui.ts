export type BillUiStatus = 'Draft' | 'Ready' | 'Paid' | 'Pending' | 'Partial'

export type BillListRow = {
  id: string
  no: string
  date: string
  customer: string
  items: number
  weight: string
  total: string
  paid: string
  balance: string
  status: BillListRowStatus
}

export type BillListRowStatus = 'Paid' | 'Pending' | 'Partial'

export type BillingMode = 'live' | 'ai' | 'voice'

export type BillItemUi = {
  id: string
  product: string
  purity: string
  hsn: string
  grossWeight: number
  netMetalWeight: number
  rate: number
  makingCharges: number
  wastage: number
  sgst: number
  cgst: number
  discount: number
}

export type BillUi = {
  id: string
  billNo: string
  date: string
  customerName: string
  customerPhone: string
  customerGstin?: string
  type: string
  branch: string
  items: BillItemUi[]
  paymentMethod?: 'Cash' | 'UPI' | 'Card' | 'Credit'
  status: BillUiStatus
}

/**
 * Mock display helpers only. Real money math must live in packages/domain/billing (Decimal).
 * Do not treat these as source of truth for GST or invoice totals.
 */
export function mockItemTotal(item: BillItemUi): number {
  const metalValue = item.netMetalWeight * item.rate
  const baseValue = metalValue + item.makingCharges
  const taxableValue = baseValue - item.discount
  const sgstValue = taxableValue * (item.sgst / 100)
  const cgstValue = taxableValue * (item.cgst / 100)
  return taxableValue + sgstValue + cgstValue
}

export function formatInr(amount: number): string {
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}
