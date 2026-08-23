import type { HTMLAttributes, ReactElement } from 'react'
import { cn } from '../../lib/cn.js'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'muted' | 'gold' | 'success' | 'warning' | 'destructive'
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
        variant === 'default' && 'bg-foreground/5 text-muted-foreground',
        variant === 'muted' && 'bg-muted text-muted-foreground',
        variant === 'gold' && 'bg-gold/10 text-gold',
        variant === 'success' && 'bg-success/10 text-success',
        variant === 'warning' && 'bg-warning/10 text-warning',
        variant === 'destructive' && 'bg-destructive/10 text-destructive',
        className,
      )}
      {...props}
    />
  )
}
