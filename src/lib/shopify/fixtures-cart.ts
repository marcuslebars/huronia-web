import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from '@/lib/shopify/cart-queries'
import { allFixtureProducts } from '@/lib/shopify/fixtures'

/**
 * An in-memory cart, used only while the Storefront access token is a
 * placeholder. It exists so the drawer, the cart page and the add / change
 * quantity / remove flows are testable before the store has any products.
 *
 * IMPORTANT: the checkout URL below is deliberately not a Shopify URL. Handing
 * off to a real hosted checkout cannot be faked, and a plausible-looking
 * myshopify.com URL here would let a passing test be mistaken for proof that
 * the handoff works. It does not prove that.
 */
export const FIXTURE_CHECKOUT_PREFIX = 'https://fixture.invalid/checkout/'

type FixtureLine = { id: string; variantId: string; quantity: number }

/**
 * Held on globalThis, not in a module-level binding.
 *
 * Server actions and route handlers are bundled separately, so each gets its
 * own instance of this module and its own Map. The cart would then appear to
 * empty itself on every page load: the cookie survives, but the lookup lands in
 * a different Map. A real Shopify backend is shared state and has no such
 * problem; this is purely an artefact of faking it in process.
 */
const store = globalThis as typeof globalThis & {
  __huroniaFixtureCarts?: Map<string, FixtureLine[]>
  __huroniaFixtureCartSeq?: number
}

store.__huroniaFixtureCarts ??= new Map<string, FixtureLine[]>()
store.__huroniaFixtureCartSeq ??= 1

const carts = store.__huroniaFixtureCarts

const nextLineId = (): string => {
  store.__huroniaFixtureCartSeq = (store.__huroniaFixtureCartSeq ?? 1) + 1
  return String(store.__huroniaFixtureCartSeq)
}

type Variables = Record<string, unknown>

function findVariant(variantId: string) {
  for (const product of allFixtureProducts) {
    const variant = product.variants.nodes.find((node) => node.id === variantId)
    if (variant) return { product, variant }
  }
  return null
}

function renderCart(cartId: string) {
  const lines = carts.get(cartId) ?? []

  const nodes = lines.flatMap((line) => {
    const found = findVariant(line.variantId)
    if (found === null) return []

    const unit = Number.parseFloat(found.variant.price.amount)
    const total = (Number.isFinite(unit) ? unit : 0) * line.quantity

    return [
      {
        id: line.id,
        quantity: line.quantity,
        cost: { totalAmount: { amount: total.toFixed(2), currencyCode: 'CAD' } },
        merchandise: {
          id: found.variant.id,
          title: found.variant.title,
          price: found.variant.price,
          image: null,
          product: { handle: found.product.handle, title: found.product.title },
        },
      },
    ]
  })

  const subtotal = nodes.reduce(
    (sum, node) => sum + Number.parseFloat(node.cost.totalAmount.amount),
    0,
  )

  return {
    id: cartId,
    checkoutUrl: `${FIXTURE_CHECKOUT_PREFIX}${encodeURIComponent(cartId)}`,
    totalQuantity: nodes.reduce((sum, node) => sum + node.quantity, 0),
    cost: {
      subtotalAmount: { amount: subtotal.toFixed(2), currencyCode: 'CAD' },
      totalAmount: { amount: subtotal.toFixed(2), currencyCode: 'CAD' },
    },
    lines: { nodes },
  }
}

function addLines(
  cartId: string,
  inputs: readonly { merchandiseId: string; quantity: number }[],
) {
  const lines = carts.get(cartId) ?? []

  for (const input of inputs) {
    const existing = lines.find((line) => line.variantId === input.merchandiseId)
    if (existing) existing.quantity += input.quantity
    else {
      lines.push({
        id: `gid://shopify/CartLine/${nextLineId()}`,
        variantId: input.merchandiseId,
        quantity: input.quantity,
      })
    }
  }

  carts.set(cartId, lines)
}

export function hasCartFixture(query: string): boolean {
  return (
    query === CART_QUERY ||
    query === CART_CREATE_MUTATION ||
    query === CART_LINES_ADD_MUTATION ||
    query === CART_LINES_UPDATE_MUTATION ||
    query === CART_LINES_REMOVE_MUTATION
  )
}

export function cartFixtureFor(query: string, variables: Variables): unknown {
  const lineInputs = (variables.lines ?? []) as {
    merchandiseId: string
    quantity: number
  }[]

  if (query === CART_CREATE_MUTATION) {
    const cartId = `gid://shopify/Cart/fixture-${nextLineId()}`
    carts.set(cartId, [])
    addLines(cartId, lineInputs)
    return { cartCreate: { cart: renderCart(cartId), userErrors: [] } }
  }

  if (query === CART_QUERY) {
    const cartId = String(variables.id ?? '')
    if (!carts.has(cartId)) return { cart: null }
    return { cart: renderCart(cartId) }
  }

  const cartId = String(variables.cartId ?? '')
  if (!carts.has(cartId)) {
    return {
      cartLinesAdd: {
        cart: null,
        userErrors: [{ field: null, message: 'Cart not found' }],
      },
    }
  }

  if (query === CART_LINES_ADD_MUTATION) {
    addLines(cartId, lineInputs)
    return { cartLinesAdd: { cart: renderCart(cartId), userErrors: [] } }
  }

  if (query === CART_LINES_UPDATE_MUTATION) {
    const updates = (variables.lines ?? []) as { id: string; quantity: number }[]
    const lines = carts.get(cartId) ?? []

    for (const update of updates) {
      const line = lines.find((entry) => entry.id === update.id)
      if (line) line.quantity = update.quantity
    }
    // Shopify drops a line set to zero rather than keeping it at zero.
    carts.set(
      cartId,
      lines.filter((line) => line.quantity > 0),
    )
    return { cartLinesUpdate: { cart: renderCart(cartId), userErrors: [] } }
  }

  if (query === CART_LINES_REMOVE_MUTATION) {
    const lineIds = (variables.lineIds ?? []) as string[]
    carts.set(
      cartId,
      (carts.get(cartId) ?? []).filter((line) => !lineIds.includes(line.id)),
    )
    return { cartLinesRemove: { cart: renderCart(cartId), userErrors: [] } }
  }

  throw new Error('No cart fixture for this query')
}
