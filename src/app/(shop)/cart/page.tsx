import type { Metadata } from 'next'
import { CartPageContent } from './CartPageContent'
import { Hero } from '@/components/marketing/Hero'
import { Section } from '@/components/marketing/Section'
import { shop } from '@/content/shop'

export const metadata: Metadata = {
  title: shop.cart.title,
  description: shop.cart.metaDescription,
  alternates: { canonical: '/cart' },
  // A personal, per-visitor page. Nothing here belongs in an index.
  robots: { index: false, follow: true },
}

export default function CartPage() {
  return (
    <>
      <Hero surface="panel" heading={shop.cart.heading} />
      <Section>
        <CartPageContent />
      </Section>
    </>
  )
}
