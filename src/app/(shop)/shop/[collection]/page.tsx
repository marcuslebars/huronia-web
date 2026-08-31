import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section } from '@/components/marketing/Section'
import { Filters } from '@/components/shop/Filters'
import { ProductCard } from '@/components/shop/ProductCard'
import { JsonLd } from '@/components/ui/JsonLd'
import { collections as collectionContent } from '@/content/collections'
import { shop } from '@/content/shop'
import { breadcrumbSchema } from '@/lib/schema'
import { applyFilters, brandsOf, paginate, parseFilters } from '@/lib/shop-filters'
import { getCollection, getCollectionProducts } from '@/lib/shopify'

export const revalidate = 3600

export function generateStaticParams() {
  return collectionContent.map((collection) => ({ collection: collection.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/shop/[collection]'>): Promise<Metadata> {
  const { collection: handle } = await params
  const collection = await getCollection(handle)
  if (collection === null) return {}

  return {
    title: collection.title,
    description:
      collection.description ||
      `${collection.title} for trucks and work vehicles, supplied and fitted in Midland, Ontario. Ask us for a price.`,
    alternates: { canonical: `/shop/${handle}` },
  }
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<'/shop/[collection]'>) {
  const { collection: handle } = await params
  const query = await searchParams

  const [collection, page] = await Promise.all([
    getCollection(handle),
    getCollectionProducts(handle, { first: 250 }),
  ])

  if (collection === null || page === null) notFound()

  const filters = parseFilters(query)
  const filtered = applyFilters(page.products, filters)
  const paged = paginate(filtered, filters.page)

  // Brands come from the whole collection, not the filtered subset, so choosing
  // one does not remove the others from the dropdown.
  const brands = brandsOf(page.products)

  const pageHref = (target: number) => {
    const params = new URLSearchParams()
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.sort !== 'featured') params.set('sort', filters.sort)
    if (filters.inStockOnly) params.set('inStock', '1')
    if (target > 1) params.set('page', String(target))
    const search = params.toString()
    return search === '' ? `/shop/${handle}` : `/shop/${handle}?${search}`
  }

  return (
    <>
      <Section surface="panel" className="py-10 sm:py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--surface-muted)]">
          <Link href="/shop" className="hover:underline">
            {shop.index.heading}
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{collection.title}</span>
        </nav>
        <h1 className="font-heading mt-3 text-4xl font-bold">{collection.title}</h1>
        {collection.description ? (
          <p className="max-w-measure mt-3 text-[var(--surface-muted)]">
            {collection.description}
          </p>
        ) : null}
      </Section>

      <Section>
        {page.products.length === 0 ? (
          <div className="max-w-measure">
            <h2 className="font-heading text-xl font-semibold">
              {shop.collection.emptyHeading}
            </h2>
            <p className="mt-2 text-[var(--surface-muted)]">
              {shop.collection.emptyBody}
            </p>
          </div>
        ) : (
          <>
            <Filters
              brands={brands}
              sortOptions={shop.sortOptions}
              labels={{
                heading: shop.filters.heading,
                brand: shop.filters.brand,
                allBrands: shop.filters.allBrands,
                sort: shop.filters.sort,
                availability: shop.filters.availability,
                inStockOnly: shop.filters.inStockOnly,
                clearFilters: shop.collection.clearFilters,
              }}
            />

            {paged.items.length === 0 ? (
              <div className="max-w-measure mt-10">
                <h2 className="font-heading text-xl font-semibold">
                  {shop.collection.noMatchesHeading}
                </h2>
                <p className="mt-2 text-[var(--surface-muted)]">
                  {shop.collection.noMatchesBody}
                </p>
              </div>
            ) : (
              <ul
                data-testid="product-grid"
                className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              >
                {paged.items.map((product) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      collectionHandle={handle}
                      labels={{
                        quoteOnly: shop.product.quoteOnly,
                        imagePlaceholder: shop.imagePlaceholderLabel,
                        soldOut: shop.product.soldOut,
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}

            {paged.totalPages > 1 ? (
              <nav
                aria-label="Pagination"
                className="mt-12 flex items-center justify-between gap-4"
              >
                {paged.page > 1 ? (
                  <Link href={pageHref(paged.page - 1)} className="underline">
                    {shop.pagination.previous}
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-sm text-[var(--surface-muted)]">
                  {paged.page} / {paged.totalPages}
                </span>
                {paged.page < paged.totalPages ? (
                  <Link href={pageHref(paged.page + 1)} className="underline">
                    {shop.pagination.next}
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            ) : null}
          </>
        )}
      </Section>

      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: shop.index.heading, path: '/shop' },
          { name: collection.title, path: `/shop/${handle}` },
        ])}
      />
    </>
  )
}
