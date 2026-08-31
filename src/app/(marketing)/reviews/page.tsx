import type { Metadata } from 'next'
import { Hero } from '@/components/marketing/Hero'
import { Reviews } from '@/components/marketing/Reviews'
import { Section } from '@/components/marketing/Section'
import { reviewsPage } from '@/content/pages'
import { reviews } from '@/content/reviews'

export const metadata: Metadata = {
  title: reviewsPage.title,
  description: reviewsPage.metaDescription,
  alternates: { canonical: '/reviews' },
}

export default function ReviewsPage() {
  return (
    <>
      <Hero surface="panel" heading={reviewsPage.heading} body={reviewsPage.intro} />
      <Section>
        <Reviews reviews={reviews} />
      </Section>
    </>
  )
}
