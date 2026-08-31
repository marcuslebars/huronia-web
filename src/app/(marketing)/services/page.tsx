import type { Metadata } from 'next'
import { Hero } from '@/components/marketing/Hero'
import { Section } from '@/components/marketing/Section'
import { ServiceGrid } from '@/components/marketing/ServiceGrid'
import { servicesIndex } from '@/content/pages'
import { services } from '@/content/services'

export const metadata: Metadata = {
  title: servicesIndex.title,
  description: servicesIndex.metaDescription,
  alternates: { canonical: '/services' },
}

export default function ServicesPage() {
  return (
    <>
      <Hero surface="panel" heading={servicesIndex.heading} body={servicesIndex.intro} />
      <Section>
        <ServiceGrid services={services} />
      </Section>
    </>
  )
}
