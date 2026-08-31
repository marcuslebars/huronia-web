import type { Metadata } from 'next'
import { Hero } from '@/components/marketing/Hero'
import { Section } from '@/components/marketing/Section'
import { ServiceGrid } from '@/components/marketing/ServiceGrid'
import { servicesIndex } from '@/content/pages'
import { services } from '@/content/services'
import { JsonLd } from '@/components/ui/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'

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
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: servicesIndex.heading, path: '/services' },
        ])}
      />
    </>
  )
}
