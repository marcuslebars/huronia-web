import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/ui/JsonLd'
import { Hero } from '@/components/marketing/Hero'
import { Section } from '@/components/marketing/Section'
import { shop } from '@/content/shop'
import { getCollections } from '@/lib/shopify'
import { breadcrumbSchema } from '@/lib/schema'

export const revalidate = 3600

export const metadata: Metadata = {
  title: shop.index.title,
  description: shop.index.metaDescription,
  alternates: { canonical: '/shop' },
}

export default async function ShopPage() {
  const collections = await getCollections()

  return (
    <>
      <Hero surface="panel" heading={shop.index.heading} body={shop.index.intro} />

      <Section>
        <ul className="grid gap-px overflow-hidden rounded-lg border border-[var(--surface-line)] bg-[var(--surface-line)] sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => (
            <li key={collection.handle} data-surface="paper" className="group">
              <Link
                href={`/shop/${collection.handle}`}
                className="flex h-full flex-col p-6 transition-colors hover:bg-[var(--btn-subtle-hover)]"
              >
                <h2 className="font-heading text-lg font-semibold group-hover:text-[var(--surface-link)]">
                  {collection.title}
                </h2>
                {collection.description ? (
                  <p className="mt-2 text-sm text-[var(--surface-muted)]">
                    {collection.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: shop.index.heading, path: '/shop' },
        ])}
      />
    </>
  )
}
