import type { ButtonHTMLAttributes, ReactElement } from 'react'
import { cn } from '../../lib/cn.js'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold'
  size?: 'default' | 'sm' | 'icon'
}

export function Button({
  className,
  variant = 'primary',
  size = 'default',
  type = 'button',
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        size === 'default' && 'h-10 px-4',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'icon' && 'h-8 w-8',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:opacity-90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:opacity-90',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        variant === 'outline' &&
          'border border-border bg-card text-foreground hover:bg-accent',
        variant === 'gold' && 'bg-gold/10 text-gold hover:bg-gold/20',
        className,
      )}
      {...props}
    />
  )
}
