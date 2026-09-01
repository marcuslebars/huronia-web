import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { indexableRoutes, noindexRoutes } from '../src/lib/routes'

/** Every indexable route, the audit surface, and one product page. */
const ROUTES = [
  ...indexableRoutes.map((route) => route.path),
  ...noindexRoutes,
  '/shop/wheels-tires/wheels-tires-sample-2',
  '/cart',
]

for (const route of ROUTES) {
  test(`${route} has zero axe violations`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Print the detail before asserting, so a failure is actionable from CI logs.
    if (results.violations.length > 0) {
      console.error(JSON.stringify(results.violations, null, 2))
    }
    expect(results.violations).toEqual([])
  })
}

test('/kitchen-sink open overlays have zero axe violations', async ({ page }) => {
  await page.goto('/kitchen-sink')
  await page.getByRole('button', { name: 'Open dialog' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  if (results.violations.length > 0) {
    console.error(JSON.stringify(results.violations, null, 2))
  }
  expect(results.violations).toEqual([])
})
