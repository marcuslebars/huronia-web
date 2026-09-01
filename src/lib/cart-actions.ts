'use server'

import { cookies } from 'next/headers'
import {
  addCartLine,
  createCart,
  getCart,
  removeCartLine,
  updateCartLine,
} from '@/lib/shopify'
import type { Cart } from '@/types/cart'

/**
 * Cart mutations — PROJECT_BRIEF.md §7.
 *
 * The cart id lives in an httpOnly cookie: it is a capability that grants
 * access to someone's cart, so client JavaScript has no business reading it.
 * Everything here runs on the server and returns our own Cart type.
 */

const COOKIE = 'cartId'
const THIRTY_DAYS = 60 * 60 * 24 * 30

async function readCartId(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE)?.value ?? null
}

async function writeCartId(cartId: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: THIRTY_DAYS,
  })
}

async function clearCartId(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE)
}

/** Reads the current cart, or null when there is no cart yet. */
export async function readCart(): Promise<Cart | null> {
  const cartId = await readCartId()
  if (cartId === null) return null

  const cart = await getCart(cartId)
  // Shopify expires carts. A stale cookie should behave like no cart at all,
  // not like an error the visitor has to clear themselves.
  if (cart === null) await clearCartId()
  return cart
}

export async function addToCart(variantId: string, quantity = 1): Promise<Cart> {
  const cartId = await readCartId()

  if (cartId === null) {
    const created = await createCart(variantId, quantity)
    await writeCartId(created.id)
    return created
  }

  try {
    return await addCartLine(cartId, variantId, quantity)
  } catch {
    // The cookie pointed at a cart Shopify no longer has. Start a fresh one
    // rather than surfacing an error for something the visitor cannot fix.
    const created = await createCart(variantId, quantity)
    await writeCartId(created.id)
    return created
  }
}

export async function setLineQuantity(
  lineId: string,
  quantity: number,
): Promise<Cart | null> {
  const cartId = await readCartId()
  if (cartId === null) return null

  // Shopify treats a quantity of zero as a removal, which is what we want.
  const safe = Math.max(0, Math.trunc(quantity))
  return updateCartLine(cartId, lineId, safe)
}

export async function removeLine(lineId: string): Promise<Cart | null> {
  const cartId = await readCartId()
  if (cartId === null) return null
  return removeCartLine(cartId, lineId)
}
