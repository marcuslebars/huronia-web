import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section } from '@/components/marketing/Section'
import { ProductImage } from '@/components/shop/ProductImage'
import { VariantPicker } from '@/components/shop/VariantPicker'
import { JsonLd } from '@/components/ui/JsonLd'
import { telHref } from '@/content/business'
import { collections as collectionContent } from '@/content/collections'
import { shop } from '@/content/shop'
import { ui } from '@/content/ui'
import {
  absoluteUrl,
  breadcrumbSchema,
  BUSINESS_ID,
  type JsonLdObject,
} from '@/lib/schema'
import { getCollection, getCollectionProducts, getProduct } from '@/lib/shopify'
import type { Product } from '@/types/catalogue'

export const revalidate = 3600

export async function generateStaticParams() {
  const pages = await Promise.all(
    collectionContent.map(async (collection) => {
      const page = await getCollectionProducts(collection.slug, { first: 250 })
      return (page?.products ?? []).map((product) => ({
        collection: collection.slug,
        product: product.handle,
      }))
    }),
  )
  return pages.flat()
}

export async function generateMetadata({
  params,
}: PageProps<'/shop/[collection]/[product]'>): Promise<Metadata> {
  const { collection, product: handle } = await params
  const product = await getProduct(handle)
  if (product === null) return {}

  return {
    title: product.title,
    description:
      product.description.slice(0, 155) ||
      `${product.title} from Huronia Auto Glass in Midland, Ontario.`,
    alternates: { canonical: `/shop/${collection}/${handle}` },
  }
}

/**
 * Product schema.
 *
 * The Offer is omitted entirely for a quote-only product rather than emitted
 * with a zero price (§7). The product still renders fully and is still indexed;
 * it simply makes no price claim.
 */
function productSchema(product: Product, path: string): JsonLdObject {
  const base: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    url: absoluteUrl(path),
    sku: product.handle,
    ...(product.vendor ? { brand: { '@type': 'Brand', name: product.vendor } } : {}),
  }

  if (product.price === null) return base

  return {
    ...base,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currencyCode,
      availability: product.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: absoluteUrl(path),
      seller: { '@id': BUSINESS_ID },
    },
  }
}

export default async function ProductPage({
  params,
}: PageProps<'/shop/[collection]/[product]'>) {
  const { collection: collectionHandle, product: handle } = await params

  const [product, collection] = await Promise.all([
    getProduct(handle),
    getCollection(collectionHandle),
  ])

  if (product === null || collection === null) notFound()

  const path = `/shop/${collectionHandle}/${handle}`
  const gallery = product.images

  return (
    <>
      <Section className="pt-10 sm:pt-12">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--surface-muted)]">
          <Link href="/shop" className="hover:underline">
            {shop.index.heading}
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/shop/${collectionHandle}`} className="hover:underline">
            {collection.title}
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{product.title}</span>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <div>
            <ProductImage
              image={gallery[0] ?? null}
              fallbackAlt={product.title}
              placeholderLabel={shop.imagePlaceholderLabel}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="aspect-4/3 w-full rounded-lg object-cover"
            />

            {gallery.length > 1 ? (
              <ul className="mt-4 grid grid-cols-4 gap-3">
                {gallery.slice(1, 5).map((image) => (
                  <li key={image.url}>
                    <ProductImage
                      image={image}
                      fallbackAlt={product.title}
                      placeholderLabel={shop.imagePlaceholderLabel}
                      sizes="12vw"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            {product.vendor ? (
              <p className="text-sm tracking-wide text-[var(--surface-muted)] uppercase">
                {product.vendor}
              </p>
            ) : null}
            <h1 className="font-heading mt-1 text-3xl font-bold sm:text-4xl">
              {product.title}
            </h1>

            <div className="mt-6">
              <VariantPicker
                product={product}
                telHref={telHref}
                labels={{
                  optionsHeading: shop.product.optionsHeading,
                  quoteOnly: shop.product.quoteOnly,
                  quoteCta: shop.product.quoteCta,
                  quoteHelp: shop.product.quoteHelp,
                  addToCart: shop.product.addToCart,
                  soldOut: shop.product.soldOut,
                  adding: shop.cart.adding,
                  callLabel: ui.callCta,
                }}
              />
            </div>

            {product.description ? (
              <div className="mt-10 border-t border-[var(--surface-line)] pt-6">
                <h2 className="font-heading text-sm font-semibold tracking-wide uppercase">
                  {shop.product.detailsHeading}
                </h2>
                <p className="max-w-measure mt-3 text-[var(--surface-muted)]">
                  {product.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      <JsonLd schema={productSchema(product, path)} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: shop.index.heading, path: '/shop' },
          { name: collection.title, path: `/shop/${collectionHandle}` },
          { name: product.title, path },
        ])}
      />
    </>
  )
}
