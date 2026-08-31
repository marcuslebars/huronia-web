import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type SectionProps = {
  heading?: string
  body?: string
  /** Rendered top-right of the heading row, typically a link to an index page. */
  aside?: ReactNode
  surface?: 'paper' | 'panel' | 'ink' | 'accent'
  headingLevel?: 'h2' | 'h3'
  id?: string
  children: ReactNode
  className?: string
}

export function Section({
  heading,
  body,
  aside,
  surface = 'paper',
  headingLevel: Heading = 'h2',
  id,
  children,
  className,
}: SectionProps) {
  return (
    <section
      data-surface={surface}
      id={id}
      className={cn('px-4 py-16 sm:px-6 sm:py-20', className)}
    >
      <div className="mx-auto max-w-7xl">
        {heading ? (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Heading className="font-heading text-3xl font-semibold sm:text-4xl">
                {heading}
              </Heading>
              {body ? (
                <p className="max-w-measure mt-3 text-[var(--surface-muted)]">{body}</p>
              ) : null}
            </div>
            {aside}
          </div>
        ) : null}
        <div className={heading ? 'mt-10' : undefined}>{children}</div>
      </div>
    </section>
  )
}
