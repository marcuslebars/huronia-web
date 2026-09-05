import type { Metadata } from 'next'
import { Suspense } from 'react'
import { QuoteForm } from './QuoteForm'
import { Hero } from '@/components/marketing/Hero'
import { Section } from '@/components/marketing/Section'
import { quote } from '@/content/quote'
import { JsonLd } from '@/components/ui/JsonLd'
import { breadcrumbSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: quote.title,
  description: quote.metaDescription,
  alternates: { canonical: '/quote' },
}

export default function QuotePage() {
  return (
    <>
      <Hero surface="panel" heading={quote.heading} body={quote.intro} />
      <Section>
        <div className="max-w-3xl">
          {/* useSearchParams needs a boundary: the step lives in the URL (§3 rule 5).
              The fallback reserves the form's height rather than rendering
              nothing — a null fallback collapses the page and then pushes it
              back open on hydration, which Lighthouse scored as layout shift. */}
          <Suspense fallback={<div aria-hidden="true" className="min-h-[40rem]" />}>
            <QuoteForm />
          </Suspense>
        </div>
      </Section>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: quote.heading, path: '/quote' },
        ])}
      />
    </>
  )
}
