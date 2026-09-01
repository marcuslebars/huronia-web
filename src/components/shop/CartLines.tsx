'use client'

import { useCart } from '@/components/shop/CartProvider'
import { Price } from '@/components/shop/Price'
import { ProductImage } from '@/components/shop/ProductImage'
import { shop } from '@/content/shop'
import { cn } from '@/lib/cn'

export type CartLinesProps = {
  /** Compact spacing for the drawer, roomier on the cart page. */
  variant?: 'drawer' | 'page'
}

export function CartLines({ variant = 'page' }: CartLinesProps) {
  const { cart, pending, setQuantity, remove } = useCart()
  const lines = cart?.lines ?? []

  if (lines.length === 0) return null

  return (
    <ul className="divide-y divide-[var(--surface-line)]">
      {lines.map((line) => (
        <li
          key={line.id}
          className={cn('flex gap-4', variant === 'drawer' ? 'py-4' : 'py-6')}
        >
          <ProductImage
            image={line.image}
            fallbackAlt={line.productTitle}
            placeholderLabel={shop.imagePlaceholderLabel}
            compact
            sizes="80px"
            className={cn(
              'shrink-0 rounded-md object-cover',
              variant === 'drawer' ? 'size-20' : 'size-28',
            )}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Not a link: the product route is /shop/[collection]/[product] and a
                cart line does not carry its collection, so the URL cannot be
                built from here. Linking to /shop instead would be misleading.
                Revisit by storing the collection as a cart line attribute. */}
            <p data-testid="cart-line-title" className="font-medium">
              {line.productTitle}
            </p>
            {/* Shopify's placeholder title for a single-variant product. */}
            {line.variantTitle !== 'Default Title' ? (
              <p className="text-sm text-[var(--surface-muted)]">{line.variantTitle}</p>
            ) : null}

            <div className="mt-auto flex flex-wrap items-center gap-4 pt-3">
              <div
                className="inline-flex items-center rounded-md border border-[var(--surface-line)]"
                role="group"
                aria-label={`${shop.cart.quantity}: ${line.productTitle}`}
              >
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void setQuantity(line.id, line.quantity - 1)}
                  className="size-9 disabled:opacity-45"
                >
                  <span aria-hidden="true">−</span>
                  <span className="sr-only">{shop.cart.decrease}</span>
                </button>
                <output className="w-8 text-center text-sm tabular-nums">
                  {line.quantity}
                </output>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void setQuantity(line.id, line.quantity + 1)}
                  className="size-9 disabled:opacity-45"
                >
                  <span aria-hidden="true">+</span>
                  <span className="sr-only">{shop.cart.increase}</span>
                </button>
              </div>

              <button
                type="button"
                disabled={pending}
                onClick={() => void remove(line.id)}
                className="text-sm text-[var(--surface-link)] underline disabled:opacity-45"
              >
                {shop.cart.remove}
                {/* Reads as "Remove Batteries sample 1" rather than "Remove :". */}
                <span className="sr-only"> {line.productTitle}</span>
              </button>
            </div>
          </div>

          <Price
            price={line.lineTotal}
            currencyCode={cart?.currencyCode}
            quoteOnlyLabel={shop.product.quoteOnly}
            className="shrink-0 font-medium"
          />
        </li>
      ))}
    </ul>
  )
}
