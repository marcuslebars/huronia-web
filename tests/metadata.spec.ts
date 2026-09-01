import { expect, test } from '@playwright/test'

/**
 * Phase 2 gate — every page has a unique title and meta description,
 * written for humans (§9).
 */
import { indexableRoutes, noindexRoutes } from '../src/lib/routes'

const ROUTES = [
  ...indexableRoutes.map((route) => route.path),
  ...noindexRoutes,
  '/shop/wheels-tires/wheels-tires-sample-2',
  '/cart',
]

test('every route has a unique, non-empty title and description', async ({ request }) => {
  const seen: { route: string; title: string; description: string }[] = []

  for (const route of ROUTES) {
    const response = await request.get(route)
    expect(response.status(), `${route} did not return 200`).toBe(200)
    const html = await response.text()

    const title = html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1]?.trim() ?? ''
    const description =
      html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim() ?? ''

    expect(title, `${route} has no <title>`).not.toBe('')
    expect(description, `${route} has no meta description`).not.toBe('')

    // Descriptions written for humans, not truncated in search results.
    expect(description.length, `${route} description is too short`).toBeGreaterThan(50)
    expect(description.length, `${route} description is too long`).toBeLessThan(165)

    seen.push({ route, title, description })
  }

  const duplicateTitles = seen.filter(
    (entry, index) => seen.findIndex((other) => other.title === entry.title) !== index,
  )
  expect(duplicateTitles.map((d) => `${d.route}: ${d.title}`)).toEqual([])

  const duplicateDescriptions = seen.filter(
    (entry, index) =>
      seen.findIndex((other) => other.description === entry.description) !== index,
  )
  expect(duplicateDescriptions.map((d) => `${d.route}: ${d.description}`)).toEqual([])
})

test('no page renders a zero price', async ({ request }) => {
  // §3 rule 3 / §10 Phase 3. Asserted from Phase 2 so it can never regress in.
  for (const route of ROUTES) {
    const html = await (await request.get(route)).text()
    expect(html, `${route} rendered a zero price`).not.toMatch(/\$0\.00|\bFree\b/)
  }
})
