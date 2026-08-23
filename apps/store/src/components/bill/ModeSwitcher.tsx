import type { ReactElement } from 'react'
import type { BillingMode } from '../../types/bill-ui.js'
import { cn, Mic, PenLine, Sparkles } from '@sonari/ui'

const MODES: { id: BillingMode; label: string; icon: typeof PenLine }[] = [
  { id: 'live', label: 'Live Edit', icon: PenLine },
  { id: 'ai', label: 'AI Copilot', icon: Sparkles },
  { id: 'voice', label: 'Voice', icon: Mic },
]

export type ModeSwitcherProps = {
  mode: BillingMode
  onModeChange: (mode: BillingMode) => void
}

export function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps): ReactElement {
  return (
    <div
      className="mb-6 flex w-fit items-center gap-1 rounded-md bg-foreground/5 p-1"
      role="tablist"
      aria-label="Billing mode"
    >
      {MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={mode === id}
          onClick={() => onModeChange(id)}
          className={cn(
            'flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors',
            mode === id
              ? 'bg-card font-medium text-gold shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon size={14} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  )
}
