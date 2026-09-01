'use client'

import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { CartLines } from '@/components/shop/CartLines'
import { useCart } from '@/components/shop/CartProvider'
import { Price } from '@/components/shop/Price'
import { shop } from '@/content/shop'

export function CartDrawer() {
  const { cart, isOpen, close } = useCart()
  const isEmpty = (cart?.lines.length ?? 0) === 0

  return (
    <Drawer open={isOpen} onClose={close} title={shop.cart.drawerTitle}>
      {isEmpty ? (
        <div>
          <p className="font-heading text-lg font-semibold">{shop.cart.emptyHeading}</p>
          <p className="mt-2 text-sm text-[var(--surface-muted)]">
            {shop.cart.emptyBody}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button href="/shop" block onClick={close}>
              {shop.cart.browseCta}
            </Button>
            <Button href="/quote" variant="secondary" block onClick={close}>
              {shop.cart.quoteCta}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <CartLines variant="drawer" />

          <div className="mt-auto border-t border-[var(--surface-line)] pt-4">
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
            <p className="mt-1 text-xs text-[var(--surface-muted)]">
              {shop.cart.taxNote}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {/* Shopify's hosted checkout. We never touch payment (§7). */}
              <Button href={cart?.checkoutUrl ?? '/cart'} block>
                {shop.cart.checkout}
              </Button>
              <Button href="/cart" variant="secondary" block onClick={close}>
                {shop.cart.viewCart}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}
