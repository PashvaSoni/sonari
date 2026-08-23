import type { ReactElement } from 'react'
import { AlertTriangle, Check, Mic, toast } from '@sonari/ui'
import type { BillUi } from '../../../types/bill-ui.js'

export type VoiceModeProps = {
  bill: BillUi
  onPaymentMethod?: (method: NonNullable<BillUi['paymentMethod']>) => void
}

export function VoiceMode({ bill, onPaymentMethod }: VoiceModeProps): ReactElement {
  const checklist = [
    { label: 'Customer', value: bill.customerName },
    { label: 'Product', value: bill.items[0]?.product },
    { label: 'Purity', value: bill.items[0]?.purity },
    {
      label: 'Gross weight',
      value: bill.items[0] ? `${bill.items[0].grossWeight} g` : '—',
    },
    { label: 'Making', value: '12%' },
  ]

  return (
    <div className="flex h-full flex-col items-center py-8">
      <h2 className="mb-1 text-lg font-semibold">Voice Billing</h2>
      <p className="mb-12 text-sm text-muted-foreground">UI stub — Phase 3</p>

      <button
        type="button"
        className="relative mb-8 flex size-24 items-center justify-center rounded-full border-2 border-gold bg-card text-gold transition-transform hover:scale-105"
        aria-label="Tap to speak"
        onClick={() => toast.info('Voice capture — Phase 3')}
      >
        <Mic size={32} aria-hidden />
      </button>

      <p className="mb-12 text-sm text-muted-foreground">Tap to speak</p>

      <div className="relative mb-8 w-full rounded-lg bg-foreground/5 p-4 text-sm italic text-foreground">
        <span className="absolute -top-3 left-4 bg-background px-2 text-xs not-italic text-muted-foreground">
          Transcript
        </span>
        &ldquo;Make a bill for Saroj, 18 karat stud earrings, three point one seven one grams,
        making twelve percent.&rdquo;
      </div>

      <div className="w-full">
        <div className="mb-3 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Understood
        </div>
        <div className="mb-6 flex flex-col gap-2 text-sm">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground">
                <Check size={14} className="text-success" aria-hidden />
                <span>{item.label}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {!bill.paymentMethod ? (
          <div className="mb-3 flex items-center gap-2 rounded-md bg-warning/10 px-4 py-3 text-sm text-warning">
            <AlertTriangle size={16} aria-hidden />
            <span>
              Missing: <strong>Payment method</strong>
            </span>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {(['Cash', 'UPI', 'Card', 'Credit'] as const).map((method) => (
            <button
              key={method}
              type="button"
              className="rounded-full border border-border bg-card px-4 py-2 text-xs transition-colors hover:border-gold hover:text-gold"
              onClick={() => onPaymentMethod?.(method)}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
