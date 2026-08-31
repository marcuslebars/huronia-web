#!/usr/bin/env node
/**
 * Phase 3 gate — PROJECT_BRIEF.md §10: "Grep the built output for $0.00 — must
 * return nothing."
 *
 * Every product in the catalogue is $0.00 in Shopify (§13.1). That means "we
 * have not priced this", not "this is free", so transforms.ts maps zero to null
 * at the API boundary and the UI renders the quote-only label instead. This
 * greps the actual build artefacts to prove none of it leaked through.
 *
 * Run after `npm run build`. Scans the prerendered HTML and the RSC payloads,
 * which is where a rendered price would appear.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const BUILD = join(ROOT, '.next', 'server', 'app')

/**
 * A rendered zero price, not any occurrence of "$0".
 *
 * The decimals are required. React's RSC payload — embedded in the HTML as well
 * as the .rsc files — uses "$0", "$1" and so on as internal reference tokens,
 * so a looser pattern reports every page on the site, including /about and the
 * 404. Intl.NumberFormat with a currency always emits two decimals, so
 * requiring them keeps this specific to real prices.
 */
const PATTERNS = [
  { label: 'zero price', regex: /(?:CA)?\$\s?0\.00(?![0-9])/ },
  { label: 'zero price (currency suffix)', regex: /\b0\.00\s?(?:CAD|USD)\b/ },
  { label: 'the word "Free" as a price', regex: />\s*Free\s*</i },
]

function walk(dir) {
  const out = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }

  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(html|rsc|body)$/.test(entry)) out.push(full)
  }
  return out
}

const files = walk(BUILD)

if (files.length === 0) {
  console.error(
    'check-no-zero-price: no build output found at .next/server/app. Run `npm run build` first.',
  )
  process.exit(1)
}

const findings = []

for (const file of files) {
  const contents = readFileSync(file, 'utf8')
  for (const { label, regex } of PATTERNS) {
    const match = regex.exec(contents)
    if (match) {
      findings.push(`${relative(ROOT, file)}  ${label}: ${JSON.stringify(match[0])}`)
    }
  }
}

if (findings.length > 0) {
  console.error(`check-no-zero-price: found a rendered zero price in the build output:\n`)
  for (const finding of findings) console.error(`  ${finding}`)
  console.error(
    '\nA $0.00 product is quote-only, not free (PROJECT_BRIEF.md §3 rule 3, §13.1).',
  )
  process.exit(1)
}

console.log(
  `check-no-zero-price: scanned ${files.length} build artefacts, no zero price rendered.`,
)
