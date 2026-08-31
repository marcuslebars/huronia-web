import { z } from 'zod'
import { serverEnv } from '@/lib/env'
import { fixtureFor, hasFixture } from '@/lib/shopify/fixtures'

/**
 * Storefront API fetch wrapper.
 *
 * No credentials exist yet, so the client falls back to local fixtures when the
 * access token is still the placeholder. That is what lets Phase 3 be built and
 * its gates run before the store is set up: the moment a real token is set, the
 * same code paths hit the real API with no change here.
 *
 * The fallback refuses to run in production. Shipping invented products to
 * customers is a far worse failure than a page that errors, so a production
 * deploy with a placeholder token fails loudly instead.
 *
 * The fixtures are written against Shopify's documented Storefront schema, not
 * recorded from the real store. Field-level surprises are still possible; the
 * zod validation in transforms.ts is what will catch them.
 */

const API_VERSION = '2025-07'

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly detail?: unknown,
  ) {
    super(message)
    this.name = 'ShopifyError'
  }
}

const graphqlErrorSchema = z.object({
  errors: z.array(z.object({ message: z.string() })).optional(),
  data: z.unknown(),
})

const usingPlaceholderToken = (): boolean =>
  serverEnv.SHOPIFY_STOREFRONT_ACCESS_TOKEN.startsWith('placeholder')

export function usingFixtures(): boolean {
  if (!usingPlaceholderToken()) return false

  if (process.env.NODE_ENV === 'production' && process.env.SITE_ENV === 'production') {
    throw new ShopifyError(
      'Refusing to serve catalogue fixtures in production. Set a real ' +
        'SHOPIFY_STOREFRONT_ACCESS_TOKEN before deploying.',
    )
  }
  return true
}

export type StorefrontOptions = {
  /** Cache tags so the Shopify webhook can revalidate precisely (§7). */
  readonly tags?: readonly string[]
  readonly revalidate?: number
}

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: StorefrontOptions = {},
): Promise<T> {
  if (usingFixtures()) {
    if (!hasFixture(query, variables)) {
      throw new ShopifyError(
        'No catalogue fixture for this query. Add one in lib/shopify/fixtures, ' +
          'or set a real SHOPIFY_STOREFRONT_ACCESS_TOKEN.',
        { variables },
      )
    }
    return fixtureFor(query, variables) as T
  }

  const endpoint = `https://${serverEnv.SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': serverEnv.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      next: {
        revalidate: options.revalidate ?? 3600,
        tags: options.tags ? [...options.tags] : undefined,
      },
    })
  } catch (cause) {
    throw new ShopifyError('Could not reach the Shopify Storefront API', cause)
  }

  if (!response.ok) {
    throw new ShopifyError(
      `Shopify Storefront API returned ${response.status}`,
      await response.text().catch(() => undefined),
    )
  }

  const body = graphqlErrorSchema.safeParse(await response.json())
  if (!body.success) {
    throw new ShopifyError('Unexpected Storefront API envelope', body.error.issues)
  }

  // GraphQL reports failures in a 200 body, so this has to be checked explicitly.
  if (body.data.errors && body.data.errors.length > 0) {
    throw new ShopifyError(
      body.data.errors.map((error) => error.message).join('; '),
      body.data.errors,
    )
  }

  return body.data.data as T
}
