import type { InputHTMLAttributes, ReactElement } from 'react'
import { Search } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  containerClassName?: string
}

export function SearchInput({
  className,
  containerClassName,
  ...props
}: SearchInputProps): ReactElement {
  return (
    <div className={cn('relative', containerClassName)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  )
}
