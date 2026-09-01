import type { ProductImage } from '@/types/catalogue'

/** Our own cart types. No Shopify shape escapes lib/shopify/. */

export type CartLine = {
  readonly id: string
  readonly quantity: number
  readonly variantId: string
  readonly variantTitle: string
  readonly productTitle: string
  readonly productHandle: string
  readonly image: ProductImage | null
  /** Per-unit price. Never zero: a zero-priced item cannot be added to a cart. */
  readonly unitPrice: number
  readonly lineTotal: number
}

export type Cart = {
  readonly id: string
  /** Shopify's hosted checkout. We redirect here and never touch payment. */
  readonly checkoutUrl: string
  readonly totalQuantity: number
  readonly subtotal: number
  readonly total: number
  readonly currencyCode: string
  readonly lines: readonly CartLine[]
}
