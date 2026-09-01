'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { addToCart, removeLine, setLineQuantity } from '@/lib/cart-actions'
import type { Cart } from '@/types/cart'

/**
 * Cart state for the whole site.
 *
 * React context, not a state library (CLAUDE.md). The cart is fetched from
 * /api/cart on mount rather than read in the root layout, because touching
 * cookies during render would make every page dynamic and give up the static
 * rendering the whole stack was chosen for.
 */

type CartContextValue = {
  cart: Cart | null
  /** True while a mutation is in flight. */
  pending: boolean
  isOpen: boolean
  open: () => void
  close: () => void
  add: (variantId: string, quantity?: number) => Promise<void>
  setQuantity: (lineId: string, quantity: number) => Promise<void>
  remove: (lineId: string) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (value === null) throw new Error('useCart must be used inside a CartProvider')
  return value
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [pending, setPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    void fetch('/api/cart')
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { cart?: Cart | null } | null) => {
        if (!cancelled && body?.cart) setCart(body.cart)
      })
      .catch(() => {
        // An unreachable cart endpoint should leave the site usable, not break it.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const run = useCallback(async (operation: () => Promise<Cart | null>) => {
    setPending(true)
    try {
      setCart(await operation())
    } finally {
      setPending(false)
    }
  }, [])

  const add = useCallback(
    async (variantId: string, quantity = 1) => {
      await run(() => addToCart(variantId, quantity))
      setIsOpen(true)
    },
    [run],
  )

  const setQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      await run(() => setLineQuantity(lineId, quantity))
    },
    [run],
  )

  const remove = useCallback(
    async (lineId: string) => {
      await run(() => removeLine(lineId))
    },
    [run],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      pending,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQuantity,
      remove,
    }),
    [cart, pending, isOpen, add, setQuantity, remove],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
