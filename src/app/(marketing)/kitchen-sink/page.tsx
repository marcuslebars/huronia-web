import type { Metadata } from 'next'
import { OverlayDemo } from './OverlayDemo'
import { Accordion } from '@/components/ui/Accordion'
import { Button, type ButtonVariant } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { Unconfirmed } from '@/components/ui/Unconfirmed'

export const metadata: Metadata = {
  title: 'Kitchen sink',
  description: 'Every UI primitive in every state. Not part of the public site.',
  robots: { index: false, follow: false },
}

const SURFACES = ['paper', 'panel', 'ink', 'accent'] as const
const VARIANTS: readonly ButtonVariant[] = ['primary', 'secondary', 'ghost']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--surface-line)] py-10">
      <h2 className="font-heading text-2xl font-semibold">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function KitchenSinkPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-4xl font-bold">Kitchen sink</h1>
      <p className="max-w-measure text-muted mt-3">
        Every primitive in every state, on each of the four surfaces. This route is
        noindexed and exists to be audited.
      </p>

      <Section title="Surfaces and buttons">
        <div className="grid gap-4">
          {SURFACES.map((surface) => (
            <div
              key={surface}
              data-surface={surface}
              className="rounded-lg border border-[var(--surface-line)] p-6"
            >
              <p className="font-heading text-sm font-semibold tracking-wide uppercase">
                {surface}
              </p>
              <p className="mt-1 text-sm text-[var(--surface-muted)]">
                Secondary text on {surface}.{' '}
                <a href="#main" className="text-[var(--surface-link)] underline">
                  A link
                </a>
                .
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {VARIANTS.map((variant) => (
                  <Button key={variant} variant={variant}>
                    {variant}
                  </Button>
                ))}
                <Button disabled>disabled</Button>
                <Button href="/kitchen-sink" variant="secondary">
                  as link
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button size="sm">small</Button>
                <Button size="md">medium</Button>
                <Button size="lg">large</Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Fields">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Full name" name="ks-name" placeholder="Jane Doe" required />
          <Field
            label="Email"
            name="ks-email"
            type="email"
            description="We only use this to reply to your request."
          />
          <Field
            label="Phone"
            name="ks-phone"
            type="tel"
            error="Enter a phone number we can reach you on."
          />
          <Field
            label="Disabled"
            name="ks-disabled"
            disabled
            placeholder="Not editable"
          />
          <Field
            as="select"
            label="Damage extent"
            name="ks-damage"
            options={[
              { value: '', label: 'Select one' },
              { value: 'chip', label: 'Small stone chip' },
              { value: 'crack-under-6', label: 'Crack under 6 inches' },
              { value: 'crack-over-6', label: 'Crack over 6 inches' },
              { value: 'shattered', label: 'Shattered or missing' },
            ]}
          />
          <Field
            as="textarea"
            label="Notes"
            name="ks-notes"
            description="Anything else we should know."
          />
        </div>
      </Section>

      <Section title="Radio groups">
        <div className="grid gap-8 sm:grid-cols-2">
          <RadioGroup
            legend="Where would you like the work done?"
            name="ks-location"
            options={[
              { value: 'in-shop', label: 'At the shop in Midland' },
              { value: 'mobile', label: 'You come to me' },
              { value: 'either', label: 'Either is fine' },
            ]}
          />
          <RadioGroup
            legend="How bad is the damage?"
            name="ks-damage-radio"
            error="Tell us how bad the damage is"
            description="Shown here in its error state."
            options={[
              { value: 'chip', label: 'Small stone chip' },
              { value: 'crack', label: 'Crack under 6 inches' },
            ]}
          />
        </div>
      </Section>

      <Section title="Accordion">
        <Accordion
          defaultOpenId="one"
          items={[
            {
              id: 'one',
              question: 'Built on native details and summary',
              answer: (
                <p>
                  Keyboard operation and expanded state come from the platform, so there
                  is no ARIA to keep in sync.
                </p>
              ),
            },
            {
              id: 'two',
              question: 'It works without JavaScript',
              answer: <p>Which means it can render in a Server Component.</p>,
            },
          ]}
        />
      </Section>

      <Section title="Overlays">
        <OverlayDemo />
      </Section>

      <Section title="Unconfirmed facts">
        <p className="max-w-measure text-muted">
          Amber in development, nothing in production, and a strict build fails outright.
          Eleven of these are open (§4).
        </p>
        <div className="max-w-measure mt-4">
          <Unconfirmed>Chip repair price, and price per additional chip</Unconfirmed>
          <Unconfirmed>
            Is ADAS recalibration done in-house, sublet, or referred out?
          </Unconfirmed>
        </div>
      </Section>
    </div>
  )
}
