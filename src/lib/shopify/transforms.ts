import { z } from 'zod'
import type { Collection, Product, ProductImage, ProductVariant } from '@/types/catalogue'

/**
 * Shopify shapes in, our domain types out — the only place that knows both.
 *
 * Responses are validated with zod (§2: validation at every boundary), so a
 * change in the API surfaces as a loud error here rather than as `undefined`
 * halfway through a component.
 */

const moneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string(),
})

const imageSchema = z.object({
  url: z.url(),
  altText: z.string().nullable(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

const variantSchema = z.object({
  id: z.string(),
  title: z.string(),
  availableForSale: z.boolean(),
  price: moneySchema,
  selectedOptions: z.array(z.object({ name: z.string(), value: z.string() })),
})

export const rawProductSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string(),
  descriptionHtml: z.string(),
  vendor: z.string(),
  availableForSale: z.boolean(),
  options: z.array(
    z.object({
      name: z.string(),
      optionValues: z.array(z.object({ name: z.string() })),
    }),
  ),
  featuredImage: imageSchema.nullable(),
  images: z.object({ nodes: z.array(imageSchema) }),
  priceRange: z.object({
    minVariantPrice: moneySchema,
    maxVariantPrice: moneySchema,
  }),
  variants: z.object({ nodes: z.array(variantSchema) }),
})

export const rawCollectionSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string(),
  image: imageSchema.nullable(),
})

export type RawProduct = z.infer<typeof rawProductSchema>
export type RawCollection = z.infer<typeof rawCollectionSchema>

/**
 * The single most important function in this directory.
 *
 * Shopify returns prices as decimal strings. Every product in the current
 * catalogue is "0.0" (§13.1), which means "we have not priced this", not "this
 * is free". Zero and anything unparseable therefore become null — quote-only —
 * and the "never render $0.00 or Free" rule is enforced by the type system from
 * here on, because there is no zero left to render.
 *
 * A genuinely free item would need an explicit decision and a different signal.
 */
export function toPrice(amount: string): number | null {
  const value = Number.parseFloat(amount)
  if (!Number.isFinite(value) || value <= 0) return null
  return value
}

function toImage(raw: z.infer<typeof imageSchema>): ProductImage {
  return {
    url: raw.url,
    altText: raw.altText,
    width: raw.width,
    height: raw.height,
  }
}

function toVariant(raw: z.infer<typeof variantSchema>): ProductVariant {
  return {
    id: raw.id,
    title: raw.title,
    available: raw.availableForSale,
    price: toPrice(raw.price.amount),
    selectedOptions: raw.selectedOptions.map((option) => ({
      name: option.name,
      value: option.value,
    })),
  }
}

export function toProduct(raw: RawProduct): Product {
  const variants = raw.variants.nodes.map(toVariant)
  const prices = variants
    .map((variant) => variant.price)
    .filter((price): price is number => price !== null)

  const min = prices.length > 0 ? Math.min(...prices) : null
  const max = prices.length > 0 ? Math.max(...prices) : null

  // Featured image first, then the rest, without repeating it.
  const featured = raw.featuredImage ? [toImage(raw.featuredImage)] : []
  const rest = raw.images.nodes
    .map(toImage)
    .filter((image) => image.url !== raw.featuredImage?.url)

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    vendor: raw.vendor.trim() === '' ? null : raw.vendor,
    available: raw.availableForSale,
    images: [...featured, ...rest],
    options: raw.options.map((option) => ({
      name: option.name,
      values: option.optionValues.map((value) => value.name),
    })),
    variants,
    price: min,
    // Only a range when variants actually differ.
    priceRange: min !== null && max !== null && min !== max ? { min, max } : null,
    currencyCode: raw.priceRange.minVariantPrice.currencyCode,
  }
}

export function toCollection(raw: RawCollection): Collection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    image: raw.image ? toImage(raw.image) : null,
  }
}
