import type { ChangeEvent, ReactElement } from 'react'
import type { BillItemUi, BillUi, BillingMode } from '../../types/bill-ui.js'
import { formatInr, mockItemTotal } from '../../types/bill-ui.js'
import { cn } from '@sonari/ui'

export type LiveInvoiceProps = {
  bill: BillUi
  mode: BillingMode
  onUpdateBill: (updates: Partial<BillUi>) => void
  onUpdateItem: (itemId: string, updates: Partial<BillItemUi>) => void
}

type InlineEditProps = {
  value: string | number
  onChange: (value: string | number) => void
  editable: boolean
  className?: string
  type?: 'text' | 'number'
  prefix?: string
}

function InlineEdit({
  value,
  onChange,
  editable,
  className,
  type = 'text',
  prefix = '',
}: InlineEditProps): ReactElement {
  if (!editable) {
    return (
      <span className={className}>
        {prefix}
        {value}
      </span>
    )
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    const next = type === 'number' ? Number(e.target.value) : e.target.value
    onChange(next)
  }

  return (
    <span className="relative inline-block">
      {prefix ? (
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[inherit] text-muted-foreground">
          {prefix}
        </span>
      ) : null}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        className={cn(
          'invoice-field w-full rounded-sm bg-transparent px-1 -mx-1 text-[inherit] outline-none',
          prefix ? 'pl-4' : '',
          className,
        )}
      />
    </span>
  )
}

export function LiveInvoice({
  bill,
  mode,
  onUpdateBill,
  onUpdateItem,
}: LiveInvoiceProps): ReactElement {
  const isEditable = mode === 'live'
  const totalAmount = bill.items.reduce((sum, item) => sum + mockItemTotal(item), 0)
  const totalGrossWt = bill.items.reduce((sum, item) => sum + item.grossWeight, 0)
  const taxableApprox = totalAmount / 1.03

  return (
    <div className="flex h-full justify-center overflow-auto bg-invoice-canvas p-8 pb-32">
      <div className="w-[800px] shrink-0 border border-border bg-card text-sm shadow-sm">
        <div className="flex items-start justify-between border-b-2 border-foreground p-8 pb-4">
          <div>
            <h2 className="mb-1 text-xl font-bold uppercase tracking-widest text-foreground">
              Tax Invoice
            </h2>
            <div className="text-xs text-muted-foreground">
              <div className="text-base font-semibold text-foreground">Aarohi Jewellers</div>
              <div>123, MG Road, Kolkata, WB</div>
              <div>GSTIN: 19AAAAA1234A1Z9</div>
              <div>Phone: +91 98765 43210</div>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="mb-4 inline-block bg-foreground/5 px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-foreground">
              Customer Copy
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left">
              <span className="text-muted-foreground">Invoice No:</span>
              <span className="font-mono font-medium">{bill.billNo}</span>
              <span className="text-muted-foreground">Date:</span>
              <span className="font-mono">{bill.date}</span>
              <span className="text-muted-foreground">State Code:</span>
              <span className="font-mono">19 (WB)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between border-b border-border px-8 py-4 text-xs">
          <div className="w-1/2 border-r border-border pr-4">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Billed To
            </div>
            <div className="mb-1 text-sm font-medium">
              <InlineEdit
                value={bill.customerName}
                editable={isEditable}
                onChange={(v) => onUpdateBill({ customerName: String(v) })}
              />
            </div>
            <div className="text-muted-foreground">
              Ph:{' '}
              <InlineEdit
                value={bill.customerPhone}
                editable={isEditable}
                onChange={(v) => onUpdateBill({ customerPhone: String(v) })}
              />
            </div>
          </div>
          <div className="w-1/2 pl-4">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Shipping Details
            </div>
            <div className="text-muted-foreground">Same as billing address</div>
          </div>
        </div>

        <div className="flex gap-6 border-b border-border bg-foreground/5 px-8 py-2 font-mono text-[10px] text-muted-foreground">
          <span>Standard Rates:</span>
          <span>24K: ₹7,100/g</span>
          <span>22K: ₹6,550/g</span>
          <span>18K: ₹5,446/g</span>
        </div>

        <div className="px-8 py-4">
          <table className="w-full text-left text-[10px]">
            <thead className="border-b border-border font-medium uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-4 py-2">#</th>
                <th className="py-2">Description</th>
                <th className="py-2">HSN</th>
                <th className="py-2">Purity</th>
                <th className="py-2 text-right">Gross Wt</th>
                <th className="py-2 text-right">Net Wt</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-right">Making</th>
                <th className="py-2 text-right">GST</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5 font-mono">
              {bill.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-3 text-muted-foreground">{index + 1}</td>
                  <td className="py-3 font-sans font-medium">
                    <InlineEdit
                      value={item.product}
                      editable={isEditable}
                      onChange={(v) => onUpdateItem(item.id, { product: String(v) })}
                    />
                  </td>
                  <td className="py-3">
                    <InlineEdit
                      value={item.hsn}
                      editable={isEditable}
                      onChange={(v) => onUpdateItem(item.id, { hsn: String(v) })}
                    />
                  </td>
                  <td className="py-3">
                    <InlineEdit
                      value={item.purity}
                      editable={isEditable}
                      onChange={(v) => onUpdateItem(item.id, { purity: String(v) })}
                    />
                  </td>
                  <td className="py-3 text-right">
                    <InlineEdit
                      type="number"
                      value={item.grossWeight}
                      editable={isEditable}
                      onChange={(v) => onUpdateItem(item.id, { grossWeight: Number(v) })}
                    />{' '}
                    g
                  </td>
                  <td className="py-3 text-right">
                    <InlineEdit
                      type="number"
                      value={item.netMetalWeight}
                      editable={isEditable}
                      onChange={(v) => onUpdateItem(item.id, { netMetalWeight: Number(v) })}
                    />{' '}
                    g
                  </td>
                  <td className="py-3 text-right">
                    <InlineEdit
                      type="number"
                      prefix="₹"
                      value={item.rate}
                      editable={isEditable}
                      onChange={(v) => onUpdateItem(item.id, { rate: Number(v) })}
                    />
                  </td>
                  <td className="py-3 text-right">
                    <InlineEdit
                      type="number"
                      prefix="₹"
                      value={item.makingCharges}
                      editable={isEditable}
                      onChange={(v) => onUpdateItem(item.id, { makingCharges: Number(v) })}
                    />
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {item.cgst + item.sgst}%
                  </td>
                  <td className="py-3 text-right font-medium">
                    ₹{formatInr(mockItemTotal(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex min-h-[200px] flex-col border-t border-border">
          <div className="flex flex-1">
            <div className="flex w-1/2 flex-col justify-between border-r border-border p-8 text-xs">
              <div>
                <div className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Payment Details
                </div>
                <div className="mb-6 grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium">{bill.paymentMethod ?? 'Pending'}</span>
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-mono font-medium">₹0.00</span>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground">
                <div className="mb-1 font-medium text-foreground">Terms &amp; Conditions:</div>
                <ul className="list-disc space-y-1 pl-3">
                  <li>Goods once sold will not be taken back or exchanged.</li>
                  <li>Subject to Kolkata jurisdiction.</li>
                  <li>This is a computer generated invoice.</li>
                </ul>
              </div>
            </div>
            <div className="w-1/2 bg-foreground/[0.02] p-8">
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Gross Weight</span>
                  <span>{totalGrossWt.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Taxable Value</span>
                  <span>₹{formatInr(taxableApprox)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Add: CGST @ 1.5%</span>
                  <span>₹{formatInr(taxableApprox * 0.015)}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-3 text-muted-foreground">
                  <span>Add: SGST @ 1.5%</span>
                  <span>₹{formatInr(taxableApprox * 0.015)}</span>
                </div>
                <div className="flex justify-between pt-1 font-sans text-base font-bold text-foreground">
                  <span>Grand Total</span>
                  <span>₹{formatInr(totalAmount)}</span>
                </div>
              </div>
              <div className="mt-8 border-t border-border pt-8 text-center text-[10px] text-muted-foreground">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
