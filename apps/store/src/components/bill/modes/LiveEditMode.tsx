import type { ReactElement } from 'react'
import { Button, Plus, ScanLine, Search, toast } from '@sonari/ui'

export function LiveEditMode(): ReactElement {
  return (
    <div className="flex h-full flex-col text-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Live Edit</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Click any field on the invoice to edit directly.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </div>
          <Button
            className="w-full"
            onClick={() => toast.info('Add item — stock search wires in Week 5')}
          >
            <Plus size={16} aria-hidden />
            Add Item (Ctrl + /)
          </Button>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => toast.info('Barcode scan — Week 3+')}
            >
              <ScanLine size={20} className="text-muted-foreground" aria-hidden />
              <span className="text-xs">Scan Barcode</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => toast.info('Search stock — Week 5')}
            >
              <Search size={20} className="text-muted-foreground" aria-hidden />
              <span className="text-xs">Search Stock</span>
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-3 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Items
          </div>
          <div className="space-y-2">
            {[
              { name: 'Stud Earring 750', meta: '18K • 3.171g' },
              { name: 'Gold Chain 22K', meta: '22K • 12.450g' },
            ].map((item) => (
              <button
                key={item.name}
                type="button"
                className="group flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-left transition-colors hover:border-gold hover:text-gold"
                onClick={() => toast.info('Recent items — wire to stock in Week 5')}
              >
                <div>
                  <div className="text-xs font-medium">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground">{item.meta}</div>
                </div>
                <Plus
                  size={14}
                  className="text-gold opacity-0 group-hover:opacity-100"
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
