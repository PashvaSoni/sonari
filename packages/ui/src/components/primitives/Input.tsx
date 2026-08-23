import type { InputHTMLAttributes, ReactElement } from 'react'
import { cn } from '../../lib/cn.js'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps): ReactElement {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring placeholder:text-muted-foreground focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
