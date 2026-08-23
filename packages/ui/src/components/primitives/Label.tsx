import type { LabelHTMLAttributes, ReactElement } from 'react'
import { cn } from '../../lib/cn.js'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, ...props }: LabelProps): ReactElement {
  return (
    <label
      className={cn('text-sm font-medium leading-none text-foreground', className)}
      {...props}
    />
  )
}
