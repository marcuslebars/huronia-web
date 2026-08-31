import { z } from 'zod'

/**
 * Validated environment — PROJECT_BRIEF.md §7.
 *
 * The app must refuse to boot on a missing or malformed variable rather than
 * failing later at request time. Both schemas below are parsed eagerly at module
 * load, so an import of this module is the point of failure.
 */

const serverSchema = z.object({
  SHOPIFY_STORE_DOMAIN: z
    .string()
    .regex(
      /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/,
      'must be the myshopify.com domain, e.g. huronia-auto-glass.myshopify.com',
    ),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z
    .string()
    .min(1, 'is required — the Storefront API public access token'),
  SHOPIFY_WEBHOOK_SECRET: z
    .string()
    .min(1, 'is required — used to HMAC-verify POST /api/revalidate'),
  RESEND_API_KEY: z
    .string()
    .startsWith('re_', 'must be a Resend API key starting with re_'),
})

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .url('must be an absolute URL, e.g. https://huroniaautoglass.com')
    .refine((value) => !value.endsWith('/'), 'must not have a trailing slash'),
})

export type ServerEnv = z.infer<typeof serverSchema>
export type ClientEnv = z.infer<typeof clientSchema>

function report(scope: string, error: z.ZodError): never {
  const lines = error.issues.map(
    (issue) => `  - ${issue.path.join('.')} ${issue.message}`,
  )
  throw new Error(
    `Invalid ${scope} environment:\n${lines.join('\n')}\n\n` +
      'See .env.example and PROJECT_BRIEF.md §7.',
  )
}

/**
 * Referenced as literal property accesses so Next.js can statically inline them
 * into the client bundle. Destructuring or dynamic keys would break that.
 */
const clientResult = clientSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})
if (!clientResult.success) report('client', clientResult.error)

export const clientEnv: ClientEnv = clientResult.data

const isServer = typeof window === 'undefined'

function parseServerEnv(): ServerEnv {
  const result = serverSchema.safeParse(process.env)
  if (!result.success) report('server', result.error)
  return result.data
}

/**
 * Server-only secrets. Reading any key in the browser throws rather than
 * silently yielding undefined — the mistake should be loud and immediate.
 */
export const serverEnv: ServerEnv = isServer
  ? parseServerEnv()
  : new Proxy({} as ServerEnv, {
      get(_target, key) {
        throw new Error(
          `serverEnv.${String(key)} was read in the browser. Server secrets must never ` +
            'reach the client bundle — move this read into a Server Component or route handler.',
        )
      },
    })
