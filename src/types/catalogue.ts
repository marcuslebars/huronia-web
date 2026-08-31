/**
 * Our own catalogue types. Nothing outside lib/shopify/ imports Shopify shapes;
 * the boundary transforms into these (CLAUDE.md hard rule 2).
 */

export type ProductImage = {
  readonly url: string
  readonly altText: string | null
  readonly width: number
  readonly height: number
}

export type SelectedOption = {
  readonly name: string
  readonly value: string
}

export type ProductVariant = {
  readonly id: string
  readonly title: string
  readonly available: boolean
  /**
   * null means quote-only. Every product in the current catalogue is $0.00
   * (§13.1), so null is the normal case, not an edge case. Any component that
   * renders a price must handle it explicitly. Never render "$0.00" or "Free".
   */
  readonly price: number | null
  readonly selectedOptions: readonly SelectedOption[]
}

export type ProductOption = {
  readonly name: string
  readonly values: readonly string[]
}

export type Product = {
  readonly id: string
  readonly handle: string
  readonly title: string
  readonly description: string
  readonly descriptionHtml: string
  readonly vendor: string | null
  readonly available: boolean
  readonly images: readonly ProductImage[]
  readonly options: readonly ProductOption[]
  readonly variants: readonly ProductVariant[]
  /** Lowest price across variants, or null when the product is quote-only. */
  readonly price: number | null
  /** Present only when variants genuinely differ in price. */
  readonly priceRange: { readonly min: number; readonly max: number } | null
  readonly currencyCode: string
}

export type Collection = {
  readonly id: string
  readonly handle: string
  readonly title: string
  readonly description: string
  readonly image: ProductImage | null
}

export type ProductPage = {
  readonly products: readonly Product[]
  readonly hasNextPage: boolean
  readonly endCursor: string | null
}

/** True when nothing in the catalogue can be bought without a conversation. */
export const isQuoteOnly = (product: Product): boolean => product.price === null
