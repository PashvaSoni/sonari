import type { ReactElement } from 'react'
import { useState } from 'react'
import { AlertTriangle, Check, Send, toast } from '@sonari/ui'
import type { BillUi } from '../../../types/bill-ui.js'

export type AICopilotModeProps = {
  bill: BillUi
}

export function AICopilotMode({ bill }: AICopilotModeProps): ReactElement {
  const [input, setInput] = useState('')

  const checklist = [
    { label: 'Customer', valid: Boolean(bill.customerName && bill.customerPhone) },
    { label: 'Product', valid: Boolean(bill.items[0]?.product) },
    { label: 'Purity', valid: Boolean(bill.items[0]?.purity) },
    { label: 'Gross weight', valid: (bill.items[0]?.grossWeight ?? 0) > 0 },
    { label: 'Net weight', valid: (bill.items[0]?.netMetalWeight ?? 0) > 0 },
    { label: 'Rate', valid: (bill.items[0]?.rate ?? 0) > 0 },
    { label: 'Making', valid: (bill.items[0]?.makingCharges ?? 0) > 0 },
    { label: 'Payment method', valid: Boolean(bill.paymentMethod) },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">AI Copilot</h2>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-gold" aria-hidden />
          UI stub — chat billing lands Week 8
        </p>
      </div>

      <div className="mb-4 flex flex-1 flex-col gap-4 overflow-auto pr-2 text-sm">
        <div className="flex max-w-[85%] flex-col gap-1 self-start">
          <div className="rounded-lg rounded-tl-none bg-foreground/5 px-3 py-2 text-foreground">
            I found {bill.customerName || 'a customer'}. Is this correct?
          </div>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              className="rounded-full border border-border bg-card px-3 py-1 text-xs hover:border-gold hover:text-gold"
              onClick={() => toast.info('AI answers — Week 8')}
            >
              Yes
            </button>
            <button
              type="button"
              className="rounded-full border border-border bg-card px-3 py-1 text-xs"
              onClick={() => toast.info('AI answers — Week 8')}
            >
              No
            </button>
          </div>
        </div>
        <div className="flex max-w-[85%] flex-col items-end gap-1 self-end">
          <div className="rounded-lg rounded-tr-none bg-gold px-3 py-2 text-primary-foreground">
            Yes, 18 karat stud earrings
          </div>
        </div>
        <div className="flex max-w-[85%] flex-col gap-1 self-start">
          <div className="rounded-lg rounded-tl-none bg-foreground/5 px-3 py-2 text-foreground">
            Got it. What is the gross weight?
          </div>
        </div>
      </div>

      <div className="mb-4 border-t border-border pt-4">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Bill Progress
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {checklist.map((item) => (
            <div
              key={item.label}
              className={
                item.valid ? 'flex items-center gap-2 text-success' : 'flex items-center gap-2 text-muted-foreground'
              }
            >
              {item.valid ? (
                <Check size={14} aria-hidden />
              ) : (
                <AlertTriangle size={14} className="text-warning" aria-hidden />
              )}
              <span className={item.valid ? 'text-foreground' : undefined}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Type your answer..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-11 w-full rounded-md border border-border bg-card py-3 pl-4 pr-12 text-sm focus-visible:border-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
          onKeyDown={(e) => {
            if (e.key === 'Enter') toast.info('AI chat — Week 8')
          }}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-gold"
          aria-label="Send"
          onClick={() => toast.info('AI chat — Week 8')}
        >
          <Send size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}
