import type { ButtonHTMLAttributes, ReactElement } from 'react'
import { cn } from '../../lib/cn.js'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:opacity-90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:opacity-90',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}
