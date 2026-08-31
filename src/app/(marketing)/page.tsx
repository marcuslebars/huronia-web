import type { Metadata } from 'next'
import Link from 'next/link'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Areas } from '@/components/marketing/Areas'
import { Hero } from '@/components/marketing/Hero'
import { Reviews } from '@/components/marketing/Reviews'
import { Section } from '@/components/marketing/Section'
import { ServiceGrid } from '@/components/marketing/ServiceGrid'
import { TrustStrip } from '@/components/marketing/TrustStrip'
import { towns } from '@/content/areas'
import { telHref } from '@/content/business'
import { faqs } from '@/content/faqs'
import { home } from '@/content/pages'
import { reviews } from '@/content/reviews'
import { services } from '@/content/services'
import { ui } from '@/content/ui'

export const metadata: Metadata = {
  title: home.title,
  description: home.metaDescription,
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <Hero
        heading={home.hero.heading}
        body={home.hero.body}
        actions={
          <>
            <Button href="/quote" size="lg">
              {ui.quoteCta}
            </Button>
            <Button href={telHref} size="lg" variant="secondary">
              {ui.callCta}
            </Button>
          </>
        }
      />

      <TrustStrip items={home.trust} />

      <Section
        heading={home.servicesHeading}
        body={home.servicesBody}
        aside={
          <Link href="/services" className="text-[var(--surface-link)] hover:underline">
            {ui.allInSection('Services')}
          </Link>
        }
      >
        <ServiceGrid services={services} />
      </Section>

      <Section
        surface="panel"
        heading={home.reviewsHeading}
        body={home.reviewsBody}
        aside={
          <Link href="/reviews" className="text-[var(--surface-link)] hover:underline">
            {ui.allInSection('Reviews')}
          </Link>
        }
      >
        <Reviews reviews={reviews.slice(0, 3)} />
      </Section>

      <Section
        heading={home.areasHeading}
        body={home.areasBody}
        aside={
          <Link href="/areas" className="text-[var(--surface-link)] hover:underline">
            {ui.allInSection('Areas')}
          </Link>
        }
      >
        <Areas towns={towns} />
      </Section>

      <Section surface="panel" heading={home.faqHeading}>
        <div className="max-w-3xl">
          <Accordion
            defaultOpenId={faqs[0]?.id}
            items={faqs.map((faq) => ({
              id: faq.id,
              question: faq.question,
              answer: <p>{faq.answer}</p>,
            }))}
          />
        </div>
      </Section>
    </>
  )
}
