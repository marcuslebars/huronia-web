'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Field } from '@/components/ui/Field'

export type FiltersProps = {
  brands: readonly string[]
  labels: {
    heading: string
    brand: string
    allBrands: string
    sort: string
    availability: string
    inStockOnly: string
    clearFilters: string
  }
  sortOptions: readonly { value: string; label: string }[]
}

/**
 * Filter state lives in the URL, never in component state (§3 rule 5). That is
 * what makes a filtered view shareable and survive a refresh or a Back.
 *
 * Uses replace rather than push so adjusting a filter does not fill the history
 * with intermediate states — Back should leave the grid, not step through every
 * dropdown change.
 */
export function Filters({ brands, labels, sortOptions }: FiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value === null || value === '') params.delete(key)
      else params.set(key, value)

      // Any filter change invalidates the current page position.
      params.delete('page')

      const query = params.toString()
      router.replace(query === '' ? pathname : `${pathname}?${query}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const brand = searchParams.get('brand') ?? ''
  const sort = searchParams.get('sort') ?? 'featured'
  const inStock = searchParams.get('inStock') === '1'
  const hasFilters = brand !== '' || sort !== 'featured' || inStock

  return (
    <section aria-label={labels.heading} className="flex flex-wrap items-end gap-4">
      <div className="w-48">
        <Field
          as="select"
          label={labels.brand}
          name="brand"
          value={brand}
          onChange={(value) => setParam('brand', value)}
          options={[
            { value: '', label: labels.allBrands },
            ...brands.map((entry) => ({ value: entry, label: entry })),
          ]}
        />
      </div>

      <div className="w-48">
        <Field
          as="select"
          label={labels.sort}
          name="sort"
          value={sort}
          onChange={(value) => setParam('sort', value === 'featured' ? null : value)}
          options={sortOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      </div>

      <label className="flex h-11 items-center gap-2">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(event) => setParam('inStock', event.target.checked ? '1' : null)}
          className="size-4 accent-[var(--color-accent)]"
        />
        <span className="text-sm">{labels.inStockOnly}</span>
      </label>

      {hasFilters ? (
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="h-11 text-sm text-[var(--surface-link)] underline"
        >
          {labels.clearFilters}
        </button>
      ) : null}
    </section>
  )
}
