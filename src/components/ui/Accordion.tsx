import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type AccordionItem = {
  readonly id: string
  readonly question: string
  readonly answer: ReactNode
}

export type AccordionProps = {
  items: readonly AccordionItem[]
  /** Renders the first item open. Useful when the accordion is the page's main content. */
  defaultOpenId?: string
  className?: string
}

/**
 * Built on native <details>/<summary>: keyboard operation, the expanded state
 * and screen-reader semantics come from the platform rather than from ARIA we
 * would have to maintain. No JavaScript, so it works in a Server Component.
 */
export function Accordion({ items, defaultOpenId, className }: AccordionProps) {
  return (
    <div
      className={cn(
        'divide-y divide-[var(--surface-line)] border-y border-[var(--surface-line)]',
        className,
      )}
    >
      {items.map((item) => (
        <details key={item.id} open={item.id === defaultOpenId} className="group">
          <summary
            className={cn(
              'flex cursor-pointer list-none items-center justify-between gap-4 py-4',
              'font-heading text-lg font-medium marker:hidden',
              'hover:text-[var(--surface-link-hover)]',
            )}
          >
            {item.question}
            <span
              aria-hidden="true"
              className="shrink-0 text-2xl leading-none transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="max-w-measure pb-5 text-[var(--surface-muted)]">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  )
}
