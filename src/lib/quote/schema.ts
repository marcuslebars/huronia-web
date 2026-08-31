import { z } from 'zod'
import {
  ADAS_ANSWERS,
  DAMAGE_EXTENTS,
  JOB_TYPES,
  SERVICE_LOCATIONS,
  URGENCIES,
} from '@/content/quote'

type JobType = (typeof JOB_TYPES)[number]['value']
type Damage = (typeof DAMAGE_EXTENTS)[number]['value']
type Adas = (typeof ADAS_ANSWERS)[number]['value']
type ServiceLocation = (typeof SERVICE_LOCATIONS)[number]['value']
type Urgency = (typeof URGENCIES)[number]['value']

const tuple = <T extends string>(list: readonly { value: T }[]) =>
  list.map((option) => option.value) as [T, ...T[]]

/** Job types that involve glass, and so ask about damage extent and ADAS (§8 step 2). */
export const GLASS_JOB_TYPES: ReadonlySet<JobType> = new Set(
  JOB_TYPES.filter((job) => job.glass).map((job) => job.value),
)

export const isGlassJob = (jobType: string): boolean =>
  GLASS_JOB_TYPES.has(jobType as JobType)

export const insuranceSchema = z.object({
  insurer: z.string().trim().min(1, 'Tell us who you are insured with').max(80),
  claimNumber: z.string().trim().max(60).optional(),
})

const baseSchema = z.object({
  jobType: z.enum(tuple<JobType>(JOB_TYPES), { message: 'Choose what you need' }),
  /** Set when the form was reached from a product page via ?product=handle. */
  productHandle: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9-]*$/, 'Invalid product reference')
    .optional(),

  vehicleYear: z
    .string()
    .trim()
    .regex(/^(19|20)\d{2}$/, 'Enter the year as four digits, for example 2018'),
  vehicleMake: z.string().trim().min(1, 'Tell us the make').max(60),
  vehicleModel: z.string().trim().min(1, 'Tell us the model').max(60),
  vehicleTrim: z.string().trim().max(60).optional(),

  damage: z.enum(tuple<Damage>(DAMAGE_EXTENTS)).optional(),
  adas: z.enum(tuple<Adas>(ADAS_ANSWERS)).optional(),

  serviceLocation: z.enum(tuple<ServiceLocation>(SERVICE_LOCATIONS), {
    message: 'Choose where you would like the work done',
  }),
  urgency: z.enum(tuple<Urgency>(URGENCIES), { message: 'Choose how soon you need it' }),
  town: z.string().trim().min(1, 'Tell us which town you are in').max(80),

  insurance: insuranceSchema.optional(),

  name: z.string().trim().min(1, 'Tell us your name').max(120),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a phone number we can reach you on')
    .max(30)
    .regex(/^[0-9+()\-.\s]+$/, 'Enter a phone number we can reach you on'),
  email: z.email('Enter an email address we can reply to'),
  notes: z.string().trim().max(2000).optional(),
})

/** Per-step schemas, so a step validates only what it asked (§8). */
export const stepSchemas = {
  1: baseSchema.pick({ jobType: true }),
  2: baseSchema.pick({
    vehicleYear: true,
    vehicleMake: true,
    vehicleModel: true,
    vehicleTrim: true,
  }),
  3: baseSchema.pick({ serviceLocation: true, urgency: true, town: true }),
  4: baseSchema.pick({ name: true, phone: true, email: true, notes: true }),
} as const

/** The extra step-2 questions asked only for glass work. */
export const glassDetailSchema = baseSchema
  .pick({ damage: true, adas: true })
  .required({ damage: true, adas: true })

/**
 * §8: "Conditional fields must not submit values when hidden."
 *
 * Enforced as absence, not just as optionality — a payload carrying damage or
 * ADAS for a non-glass job is rejected rather than quietly ignored. Silently
 * dropping them would let the client and server disagree about what was asked.
 */
export const quoteSchema = baseSchema.superRefine((data, ctx) => {
  const glass = isGlassJob(data.jobType)

  if (glass) {
    if (data.damage === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['damage'],
        message: 'Tell us how bad the damage is',
      })
    }
    if (data.adas === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['adas'],
        message: 'Let us know about driver assistance systems, or choose Not sure',
      })
    }
    return
  }

  if (data.damage !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['damage'],
      message: 'Damage extent is only asked for glass work and must not be submitted',
    })
  }
  if (data.adas !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['adas'],
      message: 'Driver assistance is only asked for glass work and must not be submitted',
    })
  }
})

export type QuotePayload = z.infer<typeof quoteSchema>

/** Field-keyed errors the form renders inline (§8). */
export type QuoteFieldErrors = Partial<Record<string, string>>

export function toFieldErrors(error: z.ZodError): QuoteFieldErrors {
  const errors: QuoteFieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (key !== '' && errors[key] === undefined) errors[key] = issue.message
  }
  return errors
}
