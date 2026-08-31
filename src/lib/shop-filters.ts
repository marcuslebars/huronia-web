import type { Product } from '@/types/catalogue'

/**
 * Turns URL search params into a filtered, sorted product list.
 *
 * Pure and separate from the page so the URL contract can be tested directly.
 * Unknown or malformed values fall back to the default rather than throwing: a
 * hand-edited URL should degrade to the unfiltered grid, not a 500.
 */

export type SortKey = 'featured' | 'title-asc' | 'title-desc'

export type ShopFilters = {
  readonly brand: string | null
  readonly sort: SortKey
  readonly inStockOnly: boolean
  readonly page: number
}

const SORT_KEYS: readonly SortKey[] = ['featured', 'title-asc', 'title-desc']

const isSortKey = (value: string): value is SortKey =>
  SORT_KEYS.includes(value as SortKey)

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ShopFilters {
  const read = (key: string): string | null => {
    const value = params[key]
    if (Array.isArray(value)) return value[0] ?? null
    return value ?? null
  }

  const sortParam = read('sort') ?? ''
  const pageParam = Number.parseInt(read('page') ?? '1', 10)

  return {
    brand: read('brand'),
    sort: isSortKey(sortParam) ? sortParam : 'featured',
    inStockOnly: read('inStock') === '1',
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
  }
}

/** Brands present in the given products, for the filter dropdown. */
export function brandsOf(products: readonly Product[]): readonly string[] {
  const brands = new Set<string>()
  for (const product of products) {
    if (product.vendor !== null) brands.add(product.vendor)
  }
  return [...brands].sort((a, b) => a.localeCompare(b))
}

export function applyFilters(
  products: readonly Product[],
  filters: ShopFilters,
): readonly Product[] {
  let result = products

  if (filters.brand !== null && filters.brand !== '') {
    result = result.filter((product) => product.vendor === filters.brand)
  }

  if (filters.inStockOnly) {
    result = result.filter((product) => product.available)
  }

  if (filters.sort === 'title-asc') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title))
  } else if (filters.sort === 'title-desc') {
    result = [...result].sort((a, b) => b.title.localeCompare(a.title))
  }
  // 'featured' keeps Shopify's own collection order.

  return result
}

export const PAGE_SIZE = 12

export function paginate<T>(
  items: readonly T[],
  page: number,
): { readonly items: readonly T[]; readonly page: number; readonly totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * PAGE_SIZE

  return {
    items: items.slice(start, start + PAGE_SIZE),
    page: safePage,
    totalPages,
  }
}
