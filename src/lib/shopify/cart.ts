import { z } from 'zod'
import { ShopifyError, storefront } from '@/lib/shopify/client'
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from '@/lib/shopify/cart-queries'
import type { Cart, CartLine } from '@/types/cart'

const moneySchema = z.object({ amount: z.string(), currencyCode: z.string() })

const imageSchema = z.object({
  url: z.url(),
  altText: z.string().nullable(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

const rawCartSchema = z.object({
  id: z.string(),
  checkoutUrl: z.string(),
  totalQuantity: z.number().int().nonnegative(),
  cost: z.object({ subtotalAmount: moneySchema, totalAmount: moneySchema }),
  lines: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        quantity: z.number().int().positive(),
        cost: z.object({ totalAmount: moneySchema }),
        merchandise: z.object({
          id: z.string(),
          title: z.string(),
          price: moneySchema,
          image: imageSchema.nullable(),
          product: z.object({ handle: z.string(), title: z.string() }),
        }),
      }),
    ),
  }),
})

type RawCart = z.infer<typeof rawCartSchema>

const amount = (value: string): number => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toCart(raw: RawCart): Cart {
  const lines: CartLine[] = raw.lines.nodes.map((line) => ({
    id: line.id,
    quantity: line.quantity,
    variantId: line.merchandise.id,
    variantTitle: line.merchandise.title,
    productTitle: line.merchandise.product.title,
    productHandle: line.merchandise.product.handle,
    image: line.merchandise.image,
    unitPrice: amount(line.merchandise.price.amount),
    lineTotal: amount(line.cost.totalAmount.amount),
  }))

  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotal: amount(raw.cost.subtotalAmount.amount),
    total: amount(raw.cost.totalAmount.amount),
    currencyCode: raw.cost.totalAmount.currencyCode,
    lines,
  }
}

const userErrorsSchema = z.array(
  z.object({ field: z.array(z.string()).nullable(), message: z.string() }),
)

/**
 * Shopify reports cart problems in userErrors with a 200 status, so they have
 * to be checked explicitly or a failed add looks like a success.
 */
function unwrap(payload: unknown, key: string): Cart {
  const parsed = z
    .object({
      [key]: z.object({
        cart: rawCartSchema.nullable(),
        userErrors: userErrorsSchema,
      }),
    })
    .parse(payload)

  const result = parsed[key]
  if (result === undefined) throw new ShopifyError(`Missing ${key} in cart response`)

  if (result.userErrors.length > 0) {
    throw new ShopifyError(
      result.userErrors.map((error) => error.message).join('; '),
      result.userErrors,
    )
  }
  if (result.cart === null) throw new ShopifyError(`${key} returned no cart`)

  return toCart(result.cart)
}

/** Carts are per-visitor and must never be cached. */
const NO_CACHE = { revalidate: 0 } as const

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await storefront<unknown>(CART_QUERY, { id: cartId }, NO_CACHE)
  const parsed = z.object({ cart: rawCartSchema.nullable() }).parse(data)
  return parsed.cart === null ? null : toCart(parsed.cart)
}

export async function createCart(variantId: string, quantity: number): Promise<Cart> {
  const data = await storefront<unknown>(
    CART_CREATE_MUTATION,
    { lines: [{ merchandiseId: variantId, quantity }] },
    NO_CACHE,
  )
  return unwrap(data, 'cartCreate')
}

export async function addCartLine(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<Cart> {
  const data = await storefront<unknown>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    NO_CACHE,
  )
  return unwrap(data, 'cartLinesAdd')
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const data = await storefront<unknown>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
    NO_CACHE,
  )
  return unwrap(data, 'cartLinesUpdate')
}

export async function removeCartLine(cartId: string, lineId: string): Promise<Cart> {
  const data = await storefront<unknown>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds: [lineId] },
    NO_CACHE,
  )
  return unwrap(data, 'cartLinesRemove')
}
