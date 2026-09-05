import { expect, test, type Page } from '@playwright/test'
import { indexableRoutes, noindexRoutes } from '../src/lib/routes'

/**
 * Phase 7 gates — PROJECT_BRIEF.md §10.
 *
 * Covers the two that are behavioural: no horizontal scroll at the five listed
 * widths, and a keyboard-only pass of every interactive element. Lighthouse is
 * scripts/lighthouse.mjs; axe is tests/a11y.spec.ts.
 */

/** Every route a visitor can reach, including the ones kept out of the index. */
const ALL_ROUTES = [
  ...indexableRoutes.map((route) => route.path),
  ...noindexRoutes,
  '/shop/wheels-tires/wheels-tires-sample-2',
  '/cart',
]

const WIDTHS = [320, 375, 768, 1024, 1440] as const

test.describe('No horizontal scroll', () => {
  for (const width of WIDTHS) {
    test(`at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })

      for (const route of ALL_ROUTES) {
        await page.goto(route)

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            // The widest element that breaches the viewport, to make a failure
            // actionable rather than just "something is too wide".
            culprit: [...document.querySelectorAll('*')]
              .filter(
                (element) => element.getBoundingClientRect().right > doc.clientWidth + 1,
              )
              .map((element) => {
                const rect = element.getBoundingClientRect()
                return `${element.tagName.toLowerCase()}.${String(element.className).slice(0, 60)} right=${Math.round(rect.right)}`
              })
              .slice(0, 3),
          }
        })

        expect(
          overflow.scrollWidth,
          `${route} at ${width}px overflows by ${overflow.scrollWidth - overflow.clientWidth}px. Widest: ${overflow.culprit.join(' | ')}`,
        ).toBeLessThanOrEqual(overflow.clientWidth + 1)
      }
    })
  }
})

/**
 * Focus indicator check.
 *
 * :focus-visible only applies to keyboard focus, so this tabs rather than
 * calling .focus() — a programmatic focus would not prove what a keyboard user
 * actually sees.
 */
async function focusReport(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement
    if (!(element instanceof HTMLElement) || element === document.body) return null

    const style = getComputedStyle(element)
    const outlineWidth = Number.parseFloat(style.outlineWidth || '0')
    // Deliberately outline-only. Accepting any box-shadow would pass trivially:
    // Tailwind puts shadows on cards and panels regardless of focus, so the
    // check would assert nothing. The design system draws focus with outline.
    const hasOutline = style.outlineStyle !== 'none' && outlineWidth > 0

    const rect = element.getBoundingClientRect()

    return {
      tag: element.tagName.toLowerCase(),
      label: (element.getAttribute('aria-label') ?? element.textContent ?? '')
        .trim()
        .slice(0, 40),
      visibleIndicator: hasOutline,
      // An off-screen element is fine only if it is the skip link, which is
      // meant to reveal itself on focus.
      onScreen: rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.bottom > 0,
    }
  })
}

test.describe('Keyboard-only pass', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  for (const route of ALL_ROUTES) {
    test(`every interactive element on ${route} shows focus`, async ({ page }) => {
      await page.goto(route)

      const focusableCount = await page.evaluate(
        () =>
          document.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
          ).length,
      )
      expect(focusableCount, `${route} has no focusable elements`).toBeGreaterThan(0)

      const seen: string[] = []
      const missing: string[] = []

      // One extra tab so the wrap-around is observed rather than assumed.
      for (let i = 0; i < focusableCount + 1; i += 1) {
        await page.keyboard.press('Tab')
        const report = await focusReport(page)
        if (report === null) continue

        seen.push(`${report.tag}:${report.label}`)
        if (!report.visibleIndicator) missing.push(`${report.tag} "${report.label}"`)
      }

      expect(
        missing,
        `${route}: focused with no visible indicator — ${missing.join(', ')}`,
      ).toEqual([])
      expect(seen.length, `${route}: tabbing reached nothing`).toBeGreaterThan(0)
    })
  }
})
