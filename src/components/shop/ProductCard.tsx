import Link from 'next/link'
import { Price } from '@/components/shop/Price'
import { ProductImage } from '@/components/shop/ProductImage'
import type { Product } from '@/types/catalogue'

export type ProductCardProps = {
  product: Product
  collectionHandle: string
  labels: {
    quoteOnly: string
    imagePlaceholder: string
    soldOut: string
  }
}

export function ProductCard({ product, collectionHandle, labels }: ProductCardProps) {
  const image = product.images[0] ?? null

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/shop/${collectionHandle}/${product.handle}`}
        className="flex h-full flex-col rounded-lg border border-[var(--surface-line)] transition-colors hover:border-[var(--color-accent)]"
      >
        <ProductImage
          image={image}
          fallbackAlt={product.title}
          placeholderLabel={labels.imagePlaceholder}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-4/3 w-full rounded-t-lg object-cover"
        />

        <div className="flex flex-1 flex-col p-4">
          {product.vendor ? (
            <p className="text-xs tracking-wide text-[var(--surface-muted)] uppercase">
              {product.vendor}
            </p>
          ) : null}

          <h3 className="font-heading mt-1 font-medium group-hover:text-[var(--surface-link)]">
            {product.title}
          </h3>

          <div className="mt-auto pt-3 text-sm">
            {product.available ? (
              <Price
                price={product.price}
                currencyCode={product.currencyCode}
                quoteOnlyLabel={labels.quoteOnly}
              />
            ) : (
              <span className="text-[var(--surface-muted)]">{labels.soldOut}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
