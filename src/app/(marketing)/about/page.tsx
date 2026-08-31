import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { Unconfirmed } from '@/components/ui/Unconfirmed'
import { Hero } from '@/components/marketing/Hero'
import { Section } from '@/components/marketing/Section'
import { telHref } from '@/content/business'
import { about } from '@/content/pages'
import { ui } from '@/content/ui'

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

      <Section surface="panel" heading={about.teamHeading}>
        <div className="max-w-measure">
          <Unconfirmed>Staff names and roles for the About page</Unconfirmed>
        </div>
      </Section>

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
    </>
  )
}
