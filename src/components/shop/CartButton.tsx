'use client'

import { useCart } from '@/components/shop/CartProvider'
import { shop } from '@/content/shop'

/** Header cart control. Renders the count only once the cart has hydrated. */
export function CartButton() {
  const { cart, open } = useCart()
  const count = cart?.totalQuantity ?? 0

  return (
    <button
      type="button"
      onClick={open}
      className="relative -m-2 rounded-md p-2 hover:bg-[var(--btn-subtle-hover)]"
    >
      <span aria-hidden="true" className="block text-lg leading-none">
        &#128722;
      </span>
      <span className="sr-only">
        {shop.cart.openLabel}
        {count > 0 ? ` (${count})` : ''}
      </span>
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-medium text-[var(--color-paper)]"
        >
          {count}
        </span>
      ) : null}
    </button>
  )
}
