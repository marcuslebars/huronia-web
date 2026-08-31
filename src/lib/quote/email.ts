import {
  ADAS_ANSWERS,
  DAMAGE_EXTENTS,
  JOB_TYPES,
  SERVICE_LOCATIONS,
  URGENCIES,
  quote as quoteCopy,
} from '@/content/quote'
import { business } from '@/content/business'
import type { QuotePayload } from '@/lib/quote/schema'

export type LabelledField = { readonly label: string; readonly value: string }

const labelFor = (
  list: readonly { value: string; label: string }[],
  value: string | undefined,
): string | undefined => list.find((option) => option.value === value)?.label

/** User input reaches an HTML email body — escape before interpolating. */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * Every submitted field, labelled, in the order it was asked (§8).
 *
 * Fields the customer was never shown are absent from the payload and so are
 * absent here — the email reflects exactly what was asked and answered.
 */
export function describeQuote(payload: QuotePayload): readonly LabelledField[] {
  const fields: LabelledField[] = [
    {
      label: quoteCopy.step1.legend,
      value: labelFor(JOB_TYPES, payload.jobType) ?? payload.jobType,
    },
    { label: quoteCopy.step2.year, value: payload.vehicleYear },
    { label: quoteCopy.step2.make, value: payload.vehicleMake },
    { label: quoteCopy.step2.model, value: payload.vehicleModel },
  ]

  if (payload.vehicleTrim)
    fields.push({ label: quoteCopy.step2.trim, value: payload.vehicleTrim })
  if (payload.damage) {
    fields.push({
      label: quoteCopy.step2.damageLegend,
      value: labelFor(DAMAGE_EXTENTS, payload.damage) ?? payload.damage,
    })
  }
  if (payload.adas) {
    fields.push({
      label: quoteCopy.step2.adasLegend,
      value: labelFor(ADAS_ANSWERS, payload.adas) ?? payload.adas,
    })
  }

  fields.push(
    {
      label: quoteCopy.step3.locationLegend,
      value:
        labelFor(SERVICE_LOCATIONS, payload.serviceLocation) ?? payload.serviceLocation,
    },
    {
      label: quoteCopy.step3.urgencyLegend,
      value: labelFor(URGENCIES, payload.urgency) ?? payload.urgency,
    },
    { label: quoteCopy.step3.town, value: payload.town },
  )

  if (payload.insurance) {
    fields.push({ label: quoteCopy.step3.insurer, value: payload.insurance.insurer })
    fields.push({
      label: quoteCopy.step3.claimNumber,
      value: payload.insurance.claimNumber ?? 'Not supplied',
    })
  }

  fields.push(
    { label: quoteCopy.step4.name, value: payload.name },
    { label: quoteCopy.step4.phone, value: payload.phone },
    { label: quoteCopy.step4.email, value: payload.email },
  )

  if (payload.notes) fields.push({ label: quoteCopy.step4.notes, value: payload.notes })
  if (payload.productHandle) {
    fields.push({ label: 'Product enquired about', value: payload.productHandle })
  }

  return fields
}

const asText = (fields: readonly LabelledField[]) =>
  fields.map((field) => `${field.label}: ${field.value}`).join('\n')

const asHtml = (fields: readonly LabelledField[]) =>
  `<table cellpadding="6" style="border-collapse:collapse;font-family:system-ui,sans-serif">${fields
    .map(
      (field) =>
        `<tr><th align="left" style="vertical-align:top;color:#5D6B6E;font-weight:600">${escapeHtml(
          field.label,
        )}</th><td style="vertical-align:top">${escapeHtml(field.value)}</td></tr>`,
    )
    .join('')}</table>`

export type BuiltEmail = {
  readonly subject: string
  readonly text: string
  readonly html: string
}

/** To the shop. Carries every field, and a reply-to of the customer. */
export function buildShopEmail(payload: QuotePayload): BuiltEmail {
  const fields = describeQuote(payload)
  const job = labelFor(JOB_TYPES, payload.jobType) ?? payload.jobType

  return {
    subject: `Quote request: ${job} — ${payload.name}`,
    text: `New quote request from the website.\n\n${asText(fields)}\n`,
    html: `<p>New quote request from the website.</p>${asHtml(fields)}`,
  }
}

/** To the customer. A copy of what they sent, and how to reach the shop. */
export function buildCustomerEmail(payload: QuotePayload): BuiltEmail {
  const fields = describeQuote(payload)
  const intro = `Thanks for getting in touch. We have your request and will come back to you with a price during opening hours (Monday to Friday, 8:00am to 5:00pm). If it is urgent, call ${business.phone}.`

  return {
    subject: `We received your quote request — ${business.name}`,
    text: `${intro}\n\nHere is what you sent us:\n\n${asText(fields)}\n\n${business.name}\n${business.address.street}, ${business.address.city}\n${business.phone}\n`,
    html: `<p>${escapeHtml(intro)}</p><p>Here is what you sent us:</p>${asHtml(fields)}<p>${escapeHtml(business.name)}<br>${escapeHtml(business.address.street)}, ${escapeHtml(business.address.city)}<br>${escapeHtml(business.phone)}</p>`,
  }
}
