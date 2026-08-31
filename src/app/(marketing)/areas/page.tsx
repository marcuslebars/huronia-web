import type { Metadata } from 'next'
import { Areas } from '@/components/marketing/Areas'
import { Hero } from '@/components/marketing/Hero'
import { Section } from '@/components/marketing/Section'
import { towns } from '@/content/areas'
import { areasIndex } from '@/content/pages'
import { JsonLd } from '@/components/ui/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: areasIndex.title,
  description: areasIndex.metaDescription,
  alternates: { canonical: '/areas' },
}

export default function AreasPage() {
  return (
    <>
      <Hero surface="panel" heading={areasIndex.heading} body={areasIndex.intro} />
      <Section>
        <Areas towns={towns} />
      </Section>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: areasIndex.heading, path: '/areas' },
        ])}
      />
    </>
  )
}
