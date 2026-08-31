import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { Hero } from '@/components/marketing/Hero'
import { Section } from '@/components/marketing/Section'
import { telHref } from '@/content/business'
import { about } from '@/content/pages'
import { ui } from '@/content/ui'
import { JsonLd } from '@/components/ui/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: about.title,
  description: about.metaDescription,
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <Hero surface="panel" heading={about.heading} body={about.intro} />

      <Section>
        <div className="max-w-measure space-y-5 text-lg">
          {about.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </Section>

      {/* A "The team" section is held back until staff names and roles are
          confirmed (§4 open item 11). Rendering the heading with an Unconfirmed
          marker under it produced an empty heading in production, since the
          marker renders null there — worse than not having the section. */}

      <Section surface="ink">
        <div className="flex flex-wrap gap-3">
          <Button href="/quote" size="lg">
            {ui.quoteCta}
          </Button>
          <Button href={telHref} size="lg" variant="secondary">
            {ui.callCta}
          </Button>
        </div>
      </Section>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: about.title, path: '/about' },
        ])}
      />
    </>
  )
}
