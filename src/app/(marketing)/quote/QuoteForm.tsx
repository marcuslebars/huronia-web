'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { towns } from '@/content/areas'
import { business, telHref } from '@/content/business'
import {
  ADAS_ANSWERS,
  DAMAGE_EXTENTS,
  JOB_TYPES,
  SERVICE_LOCATIONS,
  URGENCIES,
  quote as copy,
} from '@/content/quote'
import { cn } from '@/lib/cn'
import {
  buildQuotePayload,
  emptyDraft,
  isStep,
  validateDraft,
  validateStep,
  type QuoteDraft,
  type Step,
} from '@/lib/quote/draft'
import { describeQuote } from '@/lib/quote/email'
import { isGlassJob, quoteSchema, type QuoteFieldErrors } from '@/lib/quote/schema'

type Status = 'editing' | 'submitting' | 'sent' | 'failed'

const TOWN_OPTIONS = [
  { value: '', label: 'Select a town' },
  ...towns.map((town) => ({ value: town.name, label: town.name })),
  { value: 'Other', label: 'Somewhere else' },
]

export function QuoteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const stepParam = Number(searchParams.get('step') ?? '1')
  const step: Step = isStep(stepParam) ? stepParam : 1
  const productHandle = searchParams.get('product') ?? ''

  /**
   * Support ?product=handle to prefill step 1 from a product page (§8).
   * Seeded at mount rather than synced in an effect: the handle is fixed for
   * the life of the form, and an effect here would cascade an extra render.
   * The catalogue is quote-only, so a product enquiry starts as an accessories
   * request with the handle carried through to the shop's email.
   */
  const [draft, setDraft] = useState<QuoteDraft>(() => {
    const initial = emptyDraft()
    if (productHandle === '') return initial
    return { ...initial, productHandle, jobType: 'accessories' }
  })
  const [errors, setErrors] = useState<QuoteFieldErrors>({})
  const [status, setStatus] = useState<Status>('editing')
  const [formError, setFormError] = useState<string | null>(null)

  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const hasMounted = useRef(false)

  /** Move focus to the new step's heading so the change is announced. */
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    headingRef.current?.focus()
  }, [step])

  const goToStep = useCallback(
    (next: Step) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('step', String(next))
      router.push(`/quote?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const update = useCallback(
    <K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) => {
      setDraft((current) => ({ ...current, [key]: value }))
      setErrors((current) => {
        if (current[key as string] === undefined) return current
        const next = { ...current }
        delete next[key as string]
        return next
      })
    },
    [],
  )

  const showErrors = useCallback((found: QuoteFieldErrors) => {
    setErrors(found)
    // Focus the summary rather than the first field, so the reader hears how
    // many problems there are before being dropped into one of them (§8).
    requestAnimationFrame(() => errorSummaryRef.current?.focus())
  }, [])

  function handleNext() {
    const found = validateStep(step, draft)
    if (Object.keys(found).length > 0) {
      showErrors(found)
      return
    }
    setErrors({})
    if (step < 4) goToStep((step + 1) as Step)
  }

  async function handleSubmit() {
    const result = validateDraft(draft)
    if (!result.ok) {
      showErrors(result.fieldErrors)
      return
    }

    setStatus('submitting')
    setFormError(null)

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        // The honeypot rides with the payload; a real person leaves it empty.
        body: JSON.stringify({ ...buildQuotePayload(draft), website: '' }),
      })
      const body: unknown = await response.json()

      if (response.ok) {
        setStatus('sent')
        return
      }

      const parsed = body as { formError?: string; fieldErrors?: QuoteFieldErrors }
      if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
        setStatus('editing')
        showErrors(parsed.fieldErrors)
        return
      }
      setStatus('failed')
      setFormError(parsed.formError ?? copy.failureBody)
    } catch {
      setStatus('failed')
      setFormError(copy.failureBody)
    }
  }

  if (status === 'sent') {
    return (
      <div data-surface="panel" className="rounded-lg p-8">
        <h2 className="font-heading text-2xl font-semibold">{copy.successHeading}</h2>
        <p className="max-w-measure mt-3 text-[var(--surface-muted)]">
          {copy.successBody}
        </p>
      </div>
    )
  }

  const glass = isGlassJob(draft.jobType)
  const errorEntries = Object.entries(errors).filter(([, message]) => Boolean(message))
  const currentStep = copy.steps.find((entry) => entry.id === step)

  return (
    <div>
      <ol className="mb-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {copy.steps.map((entry) => (
          <li
            key={entry.id}
            aria-current={entry.id === step ? 'step' : undefined}
            className={cn(
              'flex items-center gap-2',
              entry.id === step
                ? 'font-medium text-[var(--surface-fg)]'
                : 'text-[var(--surface-muted)]',
            )}
          >
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full border text-xs',
                entry.id === step
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-paper)]'
                  : 'border-[var(--surface-line)]',
              )}
              aria-hidden="true"
            >
              {entry.id}
            </span>
            {entry.title}
          </li>
        ))}
      </ol>

      {errorEntries.length > 0 ? (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-8 rounded-md border-l-4 border-[var(--color-signal)] bg-[var(--color-panel)] p-4"
        >
          <h2 className="font-heading font-semibold">{copy.errorSummaryHeading}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {errorEntries.map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {status === 'failed' && formError ? (
        <div
          role="alert"
          className="mb-8 rounded-md border border-[var(--surface-line)] p-4"
        >
          <h2 className="font-heading font-semibold">{copy.failureHeading}</h2>
          <p className="mt-1 text-sm text-[var(--surface-muted)]">{formError}</p>
          <p className="mt-2 text-sm">
            <a href={telHref} className="text-[var(--surface-link)] underline">
              {business.phone}
            </a>
          </p>
        </div>
      ) : null}

      <h2
        ref={headingRef}
        tabIndex={-1}
        // scroll-mt clears the sticky header when focus scrolls this into view.
        className="font-heading scroll-mt-24 text-2xl font-semibold outline-none"
      >
        {currentStep?.title}
      </h2>

      <form
        className="mt-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          if (step === 4) void handleSubmit()
          else handleNext()
        }}
      >
        {/* Honeypot. Positioned off-screen rather than display:none so bots that
            skip hidden inputs still fill it. Never announced, never focusable. */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {step === 1 ? (
          <RadioGroup
            legend={copy.step1.legend}
            name="jobType"
            variant="cards"
            options={JOB_TYPES.map((job) => ({ value: job.value, label: job.label }))}
            value={draft.jobType}
            error={errors.jobType}
            onChange={(value) => update('jobType', value)}
          />
        ) : null}

        {step === 2 ? (
          <div className="space-y-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={copy.step2.year}
                name="vehicleYear"
                inputMode="numeric"
                required
                value={draft.vehicleYear}
                error={errors.vehicleYear}
                onChange={(value) => update('vehicleYear', value)}
              />
              <Field
                label={copy.step2.make}
                name="vehicleMake"
                required
                value={draft.vehicleMake}
                error={errors.vehicleMake}
                onChange={(value) => update('vehicleMake', value)}
              />
              <Field
                label={copy.step2.model}
                name="vehicleModel"
                required
                value={draft.vehicleModel}
                error={errors.vehicleModel}
                onChange={(value) => update('vehicleModel', value)}
              />
              <Field
                label={copy.step2.trim}
                name="vehicleTrim"
                description={copy.step2.trimHelp}
                value={draft.vehicleTrim}
                error={errors.vehicleTrim}
                onChange={(value) => update('vehicleTrim', value)}
              />
            </div>

            {glass ? (
              <>
                <RadioGroup
                  legend={copy.step2.damageLegend}
                  name="damage"
                  options={DAMAGE_EXTENTS}
                  value={draft.damage}
                  error={errors.damage}
                  onChange={(value) => update('damage', value)}
                />
                <RadioGroup
                  legend={copy.step2.adasLegend}
                  name="adas"
                  description={copy.step2.adasHelp}
                  options={ADAS_ANSWERS}
                  value={draft.adas}
                  error={errors.adas}
                  onChange={(value) => update('adas', value)}
                />
              </>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-8">
            <RadioGroup
              legend={copy.step3.locationLegend}
              name="serviceLocation"
              options={SERVICE_LOCATIONS}
              value={draft.serviceLocation}
              error={errors.serviceLocation}
              onChange={(value) => update('serviceLocation', value)}
            />
            <RadioGroup
              legend={copy.step3.urgencyLegend}
              name="urgency"
              options={URGENCIES}
              value={draft.urgency}
              error={errors.urgency}
              onChange={(value) => update('urgency', value)}
            />
            <div className="max-w-sm">
              <Field
                as="select"
                label={copy.step3.town}
                name="town"
                required
                options={TOWN_OPTIONS}
                value={draft.town}
                error={errors.town}
                onChange={(value) => update('town', value)}
              />
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="insuranceEnabled"
                  checked={draft.insuranceEnabled}
                  onChange={(event) => update('insuranceEnabled', event.target.checked)}
                  className="size-4 accent-[var(--color-accent)]"
                />
                <span>{copy.step3.insuranceToggle}</span>
              </label>

              {draft.insuranceEnabled ? (
                <div className="mt-4 grid gap-5 border-l-2 border-[var(--surface-line)] pl-5 sm:grid-cols-2">
                  <Field
                    label={copy.step3.insurer}
                    name="insurer"
                    required
                    value={draft.insurer}
                    error={errors['insurance.insurer'] ?? errors.insurer}
                    onChange={(value) => update('insurer', value)}
                  />
                  <Field
                    label={copy.step3.claimNumber}
                    name="claimNumber"
                    description={copy.step3.claimNumberHelp}
                    value={draft.claimNumber}
                    error={errors['insurance.claimNumber'] ?? errors.claimNumber}
                    onChange={(value) => update('claimNumber', value)}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={copy.step4.name}
                name="name"
                required
                autoComplete="name"
                value={draft.name}
                error={errors.name}
                onChange={(value) => update('name', value)}
              />
              <Field
                label={copy.step4.phone}
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                value={draft.phone}
                error={errors.phone}
                onChange={(value) => update('phone', value)}
              />
              <Field
                label={copy.step4.email}
                name="email"
                type="email"
                required
                autoComplete="email"
                value={draft.email}
                error={errors.email}
                onChange={(value) => update('email', value)}
                className="sm:col-span-2"
              />
              <Field
                as="textarea"
                label={copy.step4.notes}
                name="notes"
                value={draft.notes}
                error={errors.notes}
                onChange={(value) => update('notes', value)}
                className="sm:col-span-2"
              />
            </div>

            <Review draft={draft} />
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => goToStep((step - 1) as Step)}
            >
              {copy.nav.back}
            </Button>
          ) : null}

          <Button type="submit" disabled={status === 'submitting'}>
            {step === 4
              ? status === 'submitting'
                ? copy.step4.submitting
                : copy.step4.submit
              : copy.nav.next}
          </Button>
        </div>
      </form>
    </div>
  )
}

/** Read-back of everything answered, before it is sent (§8 step 4). */
function Review({ draft }: { draft: QuoteDraft }) {
  const parsed = quoteSchema.safeParse(buildQuotePayload(draft))
  if (!parsed.success) return null

  return (
    <section data-surface="panel" className="rounded-lg p-6">
      <h3 className="font-heading text-lg font-semibold">{copy.step4.reviewHeading}</h3>
      <dl className="mt-4 space-y-3">
        {describeQuote(parsed.data).map((field) => (
          <div key={field.label} className="grid gap-1 sm:grid-cols-[14rem_1fr] sm:gap-4">
            <dt className="text-sm text-[var(--surface-muted)]">{field.label}</dt>
            <dd className="text-sm">{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
