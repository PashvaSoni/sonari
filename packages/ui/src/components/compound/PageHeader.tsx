import type { ReactElement, ReactNode } from 'react'
import { cn } from '../../lib/cn.js'

export type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps): ReactElement {
  return (
    <header
      className={cn(
        'flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-6 lg:px-8',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold text-foreground">{title}</h1>
        {description ? (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </header>
  )
}
