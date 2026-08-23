import type { HTMLAttributes, ReactElement } from 'react'
import { cn } from '../../lib/cn.js'

export type StatusPillTone = 'success' | 'warning' | 'destructive' | 'muted' | 'gold'

export type StatusPillProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusPillTone
}

export function StatusPill({
  className,
  tone = 'muted',
  ...props
}: StatusPillProps): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        tone === 'success' && 'bg-success/10 text-success',
        tone === 'warning' && 'bg-warning/10 text-warning',
        tone === 'destructive' && 'bg-destructive/10 text-destructive',
        tone === 'muted' && 'bg-muted text-muted-foreground',
        tone === 'gold' && 'bg-gold/10 text-gold',
        className,
      )}
      {...props}
    />
  )
}
