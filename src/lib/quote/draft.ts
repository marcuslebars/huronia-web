import {
  glassDetailSchema,
  insuranceSchema,
  isGlassJob,
  quoteSchema,
  stepSchemas,
  toFieldErrors,
  type QuoteFieldErrors,
  type QuotePayload,
} from '@/lib/quote/schema'

/**
 * The form's working state: everything a string, because that is what inputs
 * produce. It is converted to a typed payload only at the boundary.
 */
export type QuoteDraft = {
  jobType: string
  productHandle: string
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
  vehicleTrim: string
  damage: string
  adas: string
  serviceLocation: string
  urgency: string
  town: string
  insuranceEnabled: boolean
  insurer: string
  claimNumber: string
  name: string
  phone: string
  email: string
  notes: string
}

export const STEPS = [1, 2, 3, 4] as const
export type Step = (typeof STEPS)[number]

export const isStep = (value: number): value is Step => STEPS.includes(value as Step)

export function emptyDraft(): QuoteDraft {
  return {
    jobType: '',
    productHandle: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleTrim: '',
    damage: '',
    adas: '',
    serviceLocation: '',
    urgency: '',
    town: '',
    insuranceEnabled: false,
    insurer: '',
    claimNumber: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  }
}

/** Empty optional strings are omitted rather than sent as ''. */
const optional = (value: string): string | undefined => {
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * Builds the request body.
 *
 * §8: "Conditional fields must not submit values when hidden." Damage and ADAS
 * are omitted unless the job is glass, and the insurance block is omitted
 * unless the customer opened it — even if those values are still sitting in
 * the draft because the customer changed their answer on an earlier step.
 */
export function buildQuotePayload(draft: QuoteDraft): Record<string, unknown> {
  const glass = isGlassJob(draft.jobType)

  return {
    jobType: draft.jobType,
    productHandle: optional(draft.productHandle),

    vehicleYear: draft.vehicleYear.trim(),
    vehicleMake: draft.vehicleMake.trim(),
    vehicleModel: draft.vehicleModel.trim(),
    vehicleTrim: optional(draft.vehicleTrim),

    ...(glass ? { damage: draft.damage, adas: draft.adas } : {}),

    serviceLocation: draft.serviceLocation,
    urgency: draft.urgency,
    town: draft.town.trim(),

    ...(draft.insuranceEnabled
      ? {
          insurance: {
            insurer: draft.insurer.trim(),
            claimNumber: optional(draft.claimNumber),
          },
        }
      : {}),

    name: draft.name.trim(),
    phone: draft.phone.trim(),
    email: draft.email.trim(),
    notes: optional(draft.notes),
  }
}

/** Validates one step in isolation, returning the errors that step should show. */
export function validateStep(step: Step, draft: QuoteDraft): QuoteFieldErrors {
  const errors: QuoteFieldErrors = {}

  const collect = (result: { success: boolean; error?: unknown }) => {
    if (!result.success && result.error) {
      Object.assign(
        errors,
        toFieldErrors(result.error as Parameters<typeof toFieldErrors>[0]),
      )
    }
  }

  if (step === 1) {
    collect(stepSchemas[1].safeParse({ jobType: draft.jobType }))
    return errors
  }

  if (step === 2) {
    collect(
      stepSchemas[2].safeParse({
        vehicleYear: draft.vehicleYear,
        vehicleMake: draft.vehicleMake,
        vehicleModel: draft.vehicleModel,
        vehicleTrim: optional(draft.vehicleTrim),
      }),
    )
    if (isGlassJob(draft.jobType)) {
      collect(
        glassDetailSchema.safeParse({
          damage: draft.damage === '' ? undefined : draft.damage,
          adas: draft.adas === '' ? undefined : draft.adas,
        }),
      )
    }
    return errors
  }

  if (step === 3) {
    collect(
      stepSchemas[3].safeParse({
        serviceLocation: draft.serviceLocation,
        urgency: draft.urgency,
        town: draft.town,
      }),
    )
    if (draft.insuranceEnabled) {
      const result = insuranceSchema.safeParse({
        insurer: draft.insurer,
        claimNumber: optional(draft.claimNumber),
      })
      if (!result.success) {
        for (const [key, message] of Object.entries(toFieldErrors(result.error))) {
          if (message) errors[key] = message
        }
      }
    }
    return errors
  }

  collect(
    stepSchemas[4].safeParse({
      name: draft.name,
      phone: draft.phone,
      email: draft.email,
      notes: optional(draft.notes),
    }),
  )
  return errors
}

/** Final check before POST, against the same schema the server uses. */
export function validateDraft(
  draft: QuoteDraft,
): { ok: true; payload: QuotePayload } | { ok: false; fieldErrors: QuoteFieldErrors } {
  const result = quoteSchema.safeParse(buildQuotePayload(draft))
  if (result.success) return { ok: true, payload: result.data }
  return { ok: false, fieldErrors: toFieldErrors(result.error) }
}
