import type { LucideIcon } from 'lucide-react'
import type { ReactElement, ReactNode } from 'react'
import { useState } from 'react'
import { cn } from '../../lib/cn.js'

export type AppShellNavItem = {
  key: string
  label: string
  icon: LucideIcon
  active?: boolean
  disabled?: boolean
  onSelect?: () => void
}

export type AppShellProps = {
  children: ReactNode
  navItems: AppShellNavItem[]
  brandLabel?: string
  className?: string
}

export function AppShell({
  children,
  navItems,
  brandLabel = 'Sonari',
  className,
}: AppShellProps): ReactElement {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn('flex h-screen w-full overflow-hidden bg-background', className)}>
      <aside
        className={cn(
          'z-20 flex h-screen shrink-0 flex-col border-r border-border bg-card py-4 transition-all duration-300 ease-in-out',
          expanded ? 'w-60' : 'w-16',
        )}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className="mb-8 flex items-center px-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded bg-gold/20">
            <span className="font-serif text-sm font-bold text-gold">S</span>
          </div>
          {expanded ? (
            <span className="ml-3 truncate font-semibold tracking-wide text-foreground">
              {brandLabel}
            </span>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Main">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                disabled={item.disabled}
                onClick={item.onSelect}
                className={cn(
                  'flex h-10 items-center rounded-md px-2 transition-colors',
                  item.active
                    ? 'bg-gold/10 font-medium text-gold'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                  item.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
                )}
                title={item.label}
              >
                <Icon size={20} className="shrink-0" aria-hidden />
                {expanded ? (
                  <span className="ml-3 truncate text-sm whitespace-nowrap">{item.label}</span>
                ) : null}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}
