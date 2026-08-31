import { expect, test, type APIRequestContext } from '@playwright/test'
import { indexableRoutes, noindexRoutes } from '../src/lib/routes'

/**
 * Phase 6 gates — PROJECT_BRIEF.md §10.
 *
 * "Every JSON-LD block validates against Google's Rich Results Test" cannot be
 * automated: the Rich Results Test is a hosted tool that needs a public URL.
 * What is automated here is everything that would make it fail — well-formed
 * JSON, a recognised @type, the properties Google documents as required, and
 * FAQ answers that actually appear on the page. The RRT pass itself stays a
 * manual step once there is a deployed URL.
 */

type JsonLdNode = Record<string, unknown>

async function jsonLdOn(
  request: APIRequestContext,
  route: string,
): Promise<JsonLdNode[]> {
  const html = await (await request.get(route)).text()
  const blocks = [
    ...html.matchAll(
      /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ]

  return blocks.map((match) => {
    const raw = (match[1] ?? '').replaceAll('\\u003c', '<')
    return JSON.parse(raw) as JsonLdNode
  })
}

const typeOf = (node: JsonLdNode): string => String(node['@type'])

test.describe('Structured data', () => {
  test('every JSON-LD block is well-formed and typed', async ({ request }) => {
    for (const route of indexableRoutes) {
      const nodes = await jsonLdOn(request, route.path)
      expect(nodes.length, `${route.path} has no JSON-LD`).toBeGreaterThan(0)

      for (const node of nodes) {
        expect(node['@context'], `${route.path}: missing @context`).toBe(
          'https://schema.org',
        )
        expect(node['@type'], `${route.path}: missing @type`).toBeTruthy()
      }
    }
  })

  test('the business node uses a real schema.org type with the required fields', async ({
    request,
  }) => {
    const nodes = await jsonLdOn(request, '/')
    const local = nodes.find((node) => typeOf(node) === 'AutoRepair')

    // AutoGlassShop, which the brief specifies, is not a schema.org type:
    // schema.org/AutoGlassShop is a 404 and AutomotiveBusiness has nine
    // subtypes, none of them that. An unknown @type loses the rich result.
    expect(local, 'no AutoRepair node found').toBeTruthy()
    expect(nodes.some((node) => typeOf(node) === 'AutoGlassShop')).toBe(false)

    const address = local?.address as Record<string, unknown> | undefined
    expect(local?.name).toBe('Huronia Auto Glass')
    expect(local?.telephone).toBe('705-526-7631')
    expect(address?.['@type']).toBe('PostalAddress')
    expect(address?.streetAddress).toBe('821 Vinden Street')
    expect(address?.postalCode).toBe('L4R 1A1')

    const geo = local?.geo as Record<string, unknown> | undefined
    expect(geo?.latitude).toBe(44.752189)
    expect(geo?.longitude).toBe(-79.904466)

    // Only the two accounts that are actually theirs (§4).
    expect(local?.sameAs).toEqual([
      'https://facebook.com/huroniaautoglass',
      'https://instagram.com/huroniaautoglass',
    ])

    expect(local?.openingHours).toBe('Mo-Fr 08:00-17:00')
    const areaServed = local?.areaServed as { name: string }[]
    expect(areaServed).toHaveLength(8)
    expect(areaServed.map((area) => area.name)).toContain('Penetanguishene')
  })

  test('the business node never advertises a price', async ({ request }) => {
    // The whole catalogue is quote-only (§13.1). A zero price in structured
    // data is worse than none: it is a claim Google will show.
    const raw = JSON.stringify(await jsonLdOn(request, '/'))
    expect(raw).not.toMatch(/"price"/)
    expect(raw).not.toMatch(/\$0\.00/)
  })

  test('FAQPage answers appear on the page itself', async ({ request }) => {
    const html = await (await request.get('/')).text()
    const nodes = await jsonLdOn(request, '/')
    const faq = nodes.find((node) => typeOf(node) === 'FAQPage')
    expect(faq, 'no FAQPage node').toBeTruthy()

    const questions = faq?.mainEntity as {
      '@type': string
      name: string
      acceptedAnswer: { '@type': string; text: string }
    }[]
    expect(questions.length).toBeGreaterThan(0)

    for (const question of questions) {
      expect(question['@type']).toBe('Question')
      expect(question.acceptedAnswer['@type']).toBe('Answer')
      // Google requires the answer to be visible content, not schema-only.
      const answer = question.acceptedAnswer.text.split('.')[0] ?? ''
      expect(html, `answer not on the page: ${question.name}`).toContain(
        answer.slice(0, 40),
      )
    }
  })

  test('breadcrumbs are contiguous and start at home', async ({ request }) => {
    for (const route of indexableRoutes.filter((entry) => entry.path !== '/')) {
      const nodes = await jsonLdOn(request, route.path)
      const crumbs = nodes.find((node) => typeOf(node) === 'BreadcrumbList')
      expect(crumbs, `${route.path} has no BreadcrumbList`).toBeTruthy()

      const items = crumbs?.itemListElement as { position: number; item: string }[]
      expect(items.map((item) => item.position)).toEqual(
        items.map((_item, index) => index + 1),
      )
      expect(items[0]?.item).toMatch(/^https?:\/\/[^/]+\/?$/)
    }
  })
})

test.describe('Sitemap and robots', () => {
  test('the sitemap contains every indexable route and nothing else', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const xml = await response.text()

    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '')
    const paths = locs.map((loc) => new URL(loc).pathname.replace(/(.)\/$/, '$1'))

    for (const route of indexableRoutes) {
      expect(paths, `sitemap is missing ${route.path}`).toContain(route.path)
    }
    expect(paths).toHaveLength(indexableRoutes.length)

    for (const route of noindexRoutes) {
      expect(paths, `sitemap must not list ${route}`).not.toContain(route)
    }
  })

  test('robots.txt points at the sitemap and excludes the audit surface', async ({
    request,
  }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const body = await response.text()

    expect(body).toContain('Sitemap:')
    expect(body).toContain('/sitemap.xml')
    expect(body).toContain('/api/')
    for (const route of noindexRoutes) expect(body).toContain(route)
  })

  test('noindex routes say so in their own markup too', async ({ request }) => {
    for (const route of noindexRoutes) {
      const html = await (await request.get(route)).text()
      expect(html, `${route} is missing a noindex directive`).toMatch(
        /<meta name="robots"[^>]+noindex/,
      )
    }
  })
})

test.describe('Legacy redirects', () => {
  // §9. The old ShopCity site's six URLs.
  const LEGACY: readonly [string, string][] = [
    ['/Home', '/'],
    ['/Products', '/shop'],
    ['/Services', '/services'],
    ['/LatestNews', '/'],
    ['/Testimonials', '/reviews'],
    ['/Contact', '/contact'],
  ]

  for (const [from, to] of LEGACY) {
    test(`${from} redirects permanently to ${to}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 })
      expect(response.status(), `${from} did not 301`).toBe(301)
      expect(new URL(response.headers().location ?? '', 'http://x').pathname).toBe(to)
    })
  }

  test('canonical paths are never redirected to themselves', async ({ request }) => {
    // The config-based version of this looped: redirects() matches source
    // case-insensitively, so /Services -> /services also caught /services.
    for (const path of ['/services', '/contact']) {
      const response = await request.get(path, { maxRedirects: 0 })
      expect(response.status(), `${path} redirects to itself`).toBe(200)
    }
  })

  test('lowercase legacy paths redirect too', async ({ request }) => {
    // Next matches `source` case-sensitively, so these need their own rules.
    for (const [from, to] of LEGACY) {
      const lower = from.toLowerCase()
      if (lower === to) continue
      const response = await request.get(lower, { maxRedirects: 0 })
      expect(response.status(), `${lower} did not redirect`).toBe(301)
      expect(new URL(response.headers().location ?? '', 'http://x').pathname).toBe(to)
    }
  })
})
