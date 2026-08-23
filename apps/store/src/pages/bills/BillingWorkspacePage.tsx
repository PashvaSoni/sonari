import type { ReactElement } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Badge,
  Button,
  ChevronDown,
  Printer,
  Save,
  Share2,
  toast,
} from '@sonari/ui'
import { LiveInvoice } from '../../components/bill/LiveInvoice.js'
import { ModeSwitcher } from '../../components/bill/ModeSwitcher.js'
import { AICopilotMode } from '../../components/bill/modes/AICopilotMode.js'
import { LiveEditMode } from '../../components/bill/modes/LiveEditMode.js'
import { VoiceMode } from '../../components/bill/modes/VoiceMode.js'
import { INITIAL_DRAFT_BILL } from '../../lib/mock-bills.js'
import type { BillItemUi, BillUi, BillingMode } from '../../types/bill-ui.js'

export function BillingWorkspacePage(): ReactElement {
  const navigate = useNavigate()
  const [mode, setMode] = useState<BillingMode>('live')
  const [bill, setBill] = useState<BillUi>(INITIAL_DRAFT_BILL)

  function updateBill(updates: Partial<BillUi>): void {
    setBill((prev) => ({ ...prev, ...updates }))
  }

  function updateItem(itemId: string, updates: Partial<BillItemUi>): void {
    setBill((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      ),
    }))
  }

  const firstItem = bill.items[0]
  const isBillReady =
    Boolean(bill.customerName) &&
    firstItem !== undefined &&
    firstItem.grossWeight > 0

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to bills"
            onClick={() => navigate('/bills')}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">Create Bill</h1>
              <Badge>Draft · Auto-saved</Badge>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {bill.customerName} · {bill.customerPhone}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <div className="font-mono font-medium text-foreground">{bill.billNo}</div>
            <div className="text-xs text-muted-foreground">{bill.date}</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <button
            type="button"
            className="flex items-center gap-1 font-medium hover:text-gold"
            onClick={() => toast.info('Bill type — Week 5')}
          >
            <span>{bill.type}</span>
            <ChevronDown size={14} aria-hidden />
          </button>
          <div className="h-8 w-px bg-border" />
          <div className="text-muted-foreground">{bill.branch}</div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex w-[450px] shrink-0 flex-col border-r border-border bg-card">
          <div className="shrink-0 p-6 pb-0">
            <ModeSwitcher mode={mode} onModeChange={setMode} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            {mode === 'live' ? <LiveEditMode /> : null}
            {mode === 'ai' ? <AICopilotMode bill={bill} /> : null}
            {mode === 'voice' ? (
              <VoiceMode
                bill={bill}
                onPaymentMethod={(method) => updateBill({ paymentMethod: method })}
              />
            ) : null}
          </div>

          <div className="border-t border-border bg-card p-4">
            {isBillReady ? (
              <div className="flex flex-col gap-2">
                <div className="mb-1 flex items-center justify-center gap-2 text-xs font-medium text-success">
                  <Save size={14} aria-hidden />
                  Bill ready
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toast.info('Save draft — not persisted (bills API Week 5+)')
                    }
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Print preview — Week 6')}
                  >
                    Print Preview
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={() =>
                    toast.success('Confirm & Print — UI only; API in Week 6')
                  }
                >
                  <Printer size={16} aria-hidden />
                  Confirm &amp; Print
                </Button>
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => toast.info('WhatsApp send — Week 7')}
                >
                  <Share2 size={14} aria-hidden />
                  Confirm &amp; WhatsApp
                </Button>
              </div>
            ) : (
              <Button className="w-full" disabled variant="secondary">
                Fill missing details to confirm
              </Button>
            )}
          </div>
        </div>

        <div className="relative min-w-0 flex-1 bg-invoice-canvas">
          <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground shadow-sm">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            LIVE INVOICE
          </div>
          <LiveInvoice
            bill={bill}
            mode={mode}
            onUpdateBill={updateBill}
            onUpdateItem={updateItem}
          />
        </div>
      </div>
    </div>
  )
}
