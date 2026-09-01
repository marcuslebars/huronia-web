'use client'

import { Button } from '@/components/ui/Button'
import { CartLines } from '@/components/shop/CartLines'
import { useCart } from '@/components/shop/CartProvider'
import { Price } from '@/components/shop/Price'
import { shop } from '@/content/shop'

export function CartPageContent() {
  const { cart } = useCart()
  const isEmpty = (cart?.lines.length ?? 0) === 0

  if (isEmpty) {
    return (
      <div className="max-w-measure">
        <h2 className="font-heading text-xl font-semibold">{shop.cart.emptyHeading}</h2>
        <p className="mt-2 text-[var(--surface-muted)]">{shop.cart.emptyBody}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/shop">{shop.cart.browseCta}</Button>
          <Button href="/quote" variant="secondary">
            {shop.cart.quoteCta}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
      <CartLines variant="page" />

      <aside data-surface="panel" className="h-fit rounded-lg p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-medium">{shop.cart.subtotal}</span>
          <span data-testid="cart-subtotal">
            <Price
              price={cart?.subtotal ?? null}
              currencyCode={cart?.currencyCode}
              quoteOnlyLabel={shop.product.quoteOnly}
              className="font-heading text-lg font-semibold"
            />
          </span>
        </div>
        <p className="mt-2 text-sm text-[var(--surface-muted)]">{shop.cart.taxNote}</p>

        {/* Hosted Shopify checkout. We never handle payment (§7). */}
        <Button href={cart?.checkoutUrl ?? '/cart'} block className="mt-5">
          {shop.cart.checkout}
        </Button>
      </aside>
    </div>
  )
}
