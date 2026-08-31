import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type HeroProps = {
  heading: string
  body?: string
  actions?: ReactNode
  surface?: 'paper' | 'panel' | 'ink' | 'accent'
  className?: string
}

/**
 * Type-led hero. There is no photography of the shop, the team or finished work
 * (§13.3), so this is built to work without an image rather than to wait for
 * one. A photograph can be added later as a background without changing the
 * layout or the heading's position.
 */
export function Hero({ heading, body, actions, surface = 'ink', className }: HeroProps) {
  return (
    <section
      data-surface={surface}
      className={cn('px-4 py-20 sm:px-6 sm:py-28', className)}
    >
      <div className="mx-auto max-w-7xl">
        <h1 className="font-heading max-w-4xl text-4xl leading-[1.05] font-bold sm:text-6xl">
          {heading}
        </h1>
        {body ? (
          <p className="max-w-measure mt-6 text-lg text-[var(--surface-muted)]">{body}</p>
        ) : null}
        {actions ? <div className="mt-9 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  )
}
