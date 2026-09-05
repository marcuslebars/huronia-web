#!/usr/bin/env node
/**
 * Phase 7 gate — PROJECT_BRIEF.md §10.
 *
 * Lighthouse >= 95 performance, >= 100 accessibility, >= 100 SEO, on the mobile
 * profile, for the home page, a collection and a product page.
 *
 * The brief also names a service page. Those eight routes do not exist yet:
 * they are blocked on the draft copy in content/*.html (§12), which has not
 * been supplied. That is reported below rather than quietly skipped.
 *
 * Run against a production server:
 *   npm run build && npm run start   (in one shell)
 *   npm run lighthouse               (in another)
 *
 * Scores here are a local-network best case. The deployed site should be
 * re-measured once it is on a real domain.
 */
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'
import { chromium } from '@playwright/test'

const BASE = process.env.LIGHTHOUSE_URL ?? 'http://localhost:3000'

const TARGETS = [
  { label: 'home', path: '/' },
  { label: 'collection', path: '/shop/wheels-tires' },
  { label: 'product', path: '/shop/wheels-tires/wheels-tires-sample-2' },
  { label: 'quote form', path: '/quote' },
]

/** The brief's thresholds. Performance is the only one below 100. */
const THRESHOLDS = { performance: 95, accessibility: 100, seo: 100 }

const MISSING = [
  'a service page — /services/[slug] does not exist yet (blocked on content/*.html, §12)',
]

function pct(score) {
  return Math.round((score ?? 0) * 100)
}

async function main() {
  // Reuse the Chromium Playwright already installed rather than requiring a
  // system Chrome, so this runs the same way locally and in CI.
  const chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  })

  const results = []

  try {
    for (const target of TARGETS) {
      const url = `${BASE}${target.path}`
      const run = await lighthouse(
        url,
        { port: chrome.port, output: 'json', logLevel: 'error' },
        // Default config is the mobile profile: slow 4G throttling, 375px.
        undefined,
      )

      if (!run?.lhr) throw new Error(`Lighthouse returned nothing for ${url}`)

      // Proven, not assumed: report the emulation Lighthouse actually used.
      if (results.length === 0) {
        const settings = run.lhr.configSettings
        console.log(
          `profile: formFactor=${settings.formFactor} ` +
            `screen=${settings.screenEmulation?.width}x${settings.screenEmulation?.height} ` +
            `mobile=${settings.screenEmulation?.mobile} ` +
            `throttling=${settings.throttlingMethod}`,
        )
      }

      const categories = run.lhr.categories
      results.push({
        label: target.label,
        path: target.path,
        performance: pct(categories.performance?.score),
        accessibility: pct(categories.accessibility?.score),
        seo: pct(categories.seo?.score),
        // Surfaced so a near-miss is diagnosable without opening a report.
        // Only audits that actually failed, with the offending elements, since
        // "opportunities" alone never says which element to fix.
        failedAudits: Object.values(run.lhr.audits)
          .filter(
            (audit) =>
              audit.score !== null &&
              audit.score < 1 &&
              audit.scoreDisplayMode === 'binary',
          )
          .map((audit) => {
            const items = audit.details?.items ?? []
            const nodes = items
              .map((item) => item.node?.snippet ?? item.node?.selector ?? null)
              .filter(Boolean)
              .slice(0, 4)
            const detail = nodes.map((node) => '\n        ' + node).join('')
            return audit.title + detail
          })
          .slice(0, 6),
      })
    }
  } finally {
    // chrome-launcher removes its temp profile on kill, which intermittently
    // throws EPERM on Windows. That is teardown noise, not a result: swallowing
    // it keeps a completed run from being reported as a failure.
    try {
      await chrome.kill()
    } catch {
      // ignore
    }
  }

  const failures = []
  const pad = (value, width) => String(value).padEnd(width)

  console.log('')
  console.log(`${pad('page', 14)}${pad('perf', 8)}${pad('a11y', 8)}${pad('seo', 8)}`)
  console.log('-'.repeat(38))

  for (const result of results) {
    console.log(
      `${pad(result.label, 14)}${pad(result.performance, 8)}${pad(result.accessibility, 8)}${pad(result.seo, 8)}`,
    )

    for (const [category, minimum] of Object.entries(THRESHOLDS)) {
      if (result[category] < minimum) {
        failures.push(
          `${result.path}: ${category} ${result[category]} (needs ${minimum})` +
            (result.failedAudits.length > 0
              ? `\n      ${result.failedAudits.join('\n      ')}`
              : ''),
        )
      }
    }
  }

  console.log('')
  for (const note of MISSING) console.log(`NOT MEASURED: ${note}`)

  if (failures.length > 0) {
    console.error('\nlighthouse: below the Phase 7 thresholds:\n')
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }

  console.log('\nlighthouse: all measured pages meet the Phase 7 thresholds.')
}

await main()
