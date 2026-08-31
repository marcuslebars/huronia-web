import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { Hero } from '@/components/marketing/Hero'
import { Section } from '@/components/marketing/Section'
import { business, mailtoHref, telHref } from '@/content/business'
import { contact } from '@/content/pages'
import { ui } from '@/content/ui'

export const metadata: Metadata = {
  title: contact.title,
  description: contact.metaDescription,
  alternates: { canonical: '/contact' },
}

const { address } = business

/** Opens the address in whichever maps app the visitor uses. */
const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${business.name}, ${address.street}, ${address.city}, ${address.regionCode} ${address.postalCode}`,
)}`

export default function ContactPage() {
  return (
    <>
      <Hero surface="panel" heading={contact.heading} body={contact.intro} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-3">
          <div>
            <h2 className="font-heading text-xl font-semibold">{contact.visitHeading}</h2>
            <address className="mt-3 space-y-1 text-[var(--surface-muted)] not-italic">
              <p>{address.street}</p>
              <p>
                {address.city}, {address.regionCode} {address.postalCode}
              </p>
              <p>{address.country}</p>
            </address>
            <p className="mt-4">
              <a
                href={directionsHref}
                rel="noreferrer"
                className="text-[var(--surface-link)] hover:underline"
              >
                Get directions
              </a>
            </p>

            <dl className="mt-6 space-y-2">
              <div className="flex gap-2">
                <dt className="text-[var(--surface-muted)]">Phone</dt>
                <dd>
                  <a
                    href={telHref}
                    className="text-[var(--surface-link)] hover:underline"
                  >
                    {business.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[var(--surface-muted)]">Fax</dt>
                <dd>{business.fax}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[var(--surface-muted)]">Email</dt>
                <dd>
                  <a
                    href={mailtoHref}
                    className="text-[var(--surface-link)] hover:underline"
                  >
                    {business.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">{contact.hoursHeading}</h2>
            <dl className="mt-3 space-y-1 text-[var(--surface-muted)]">
              <div className="flex justify-between gap-4 border-b border-[var(--surface-line)] py-1">
                <dt>Monday–Friday</dt>
                <dd className="text-[var(--surface-fg)]">
                  {business.hours.weekdays.opens}–{business.hours.weekdays.closes}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--surface-line)] py-1">
                <dt>Saturday</dt>
                <dd>Closed</dd>
              </div>
              <div className="flex justify-between gap-4 py-1">
                <dt>Sunday</dt>
                <dd>Closed</dd>
              </div>
            </dl>

            <h2 className="font-heading mt-8 text-xl font-semibold">
              {contact.paymentHeading}
            </h2>
            <p className="mt-3 text-[var(--surface-muted)]">
              {business.payment.join(', ')}
            </p>
          </div>

          <div data-surface="panel" className="rounded-lg p-6">
            <h2 className="font-heading text-xl font-semibold">{contact.quoteHeading}</h2>
            <p className="mt-3 text-[var(--surface-muted)]">{contact.quoteBody}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Button href="/quote" block>
                {ui.quoteCta}
              </Button>
              <Button href={telHref} variant="secondary" block>
                {ui.callCta}
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
