import { cn } from '@/lib/cn'

export type PriceProps = {
  /** null means quote-only. The component must be given the null, not a zero. */
  price: number | null
  currencyCode?: string
  /** What to show instead of a price. Supplied by the caller from content. */
  quoteOnlyLabel: string
  className?: string
}

/**
 * The only place a price is rendered.
 *
 * There is no code path here that can produce "$0.00" or "Free": zero never
 * reaches this component, because transforms.ts maps it to null at the API
 * boundary, and null renders the quote-only label instead (CLAUDE.md).
 */
export function Price({
  price,
  currencyCode = 'CAD',
  quoteOnlyLabel,
  className,
}: PriceProps) {
  if (price === null) {
    return (
      <span className={cn('text-[var(--surface-muted)]', className)}>
        {quoteOnlyLabel}
      </span>
    )
  }

  const formatted = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currencyCode,
  }).format(price)

  return <span className={cn('tabular-nums', className)}>{formatted}</span>
}
