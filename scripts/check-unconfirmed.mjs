#!/usr/bin/env node
/**
 * Fails a production build if any <Unconfirmed> marker survives — PROJECT_BRIEF.md §4.
 *
 * The brief asks for "reachable" markers to fail the build. Reachability is a
 * runtime property and is not statically decidable, so this check is stricter:
 * the marker must not appear in src/ at all.
 *
 * Strict (exit 1) when VERCEL_ENV=production or CHECK_UNCONFIRMED=strict.
 * Otherwise it reports and exits 0, so Phases 2-6 can build with open items
 * still flagged. Phase 7's gate runs it strict.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

/** Files that define the marker rather than using it for real. */
const ALLOWLIST = [join('src', 'components', 'ui', 'Unconfirmed.tsx')]

/**
 * Directory segments that demonstrate the marker. Matched by segment so route
 * groups like (marketing) do not change the answer.
 *
 * TODO (Phase 7): /kitchen-sink is an audit surface, not part of the public
 * site. Exclude the route from production builds, then drop this exemption.
 */
const ALLOWED_SEGMENTS = ['kitchen-sink']

const MARKER = /<Unconfirmed[\s/>]/g

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(tsx?|mdx?)$/.test(entry)) out.push(full)
  }
  return out
}

const strict =
  process.env.VERCEL_ENV === 'production' || process.env.CHECK_UNCONFIRMED === 'strict'

const findings = []
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file)
  if (ALLOWLIST.some((allowed) => rel === allowed)) continue
  if (rel.split(sep).some((segment) => ALLOWED_SEGMENTS.includes(segment))) continue

  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, index) => {
    // Skip comment bodies so prose *about* the marker is not mistaken for a
    // use of it. Not a parser: a marker sharing a line with trailing code is
    // still caught, which is the direction to err in.
    const trimmed = line.trim()
    if (trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*'))
      return

    MARKER.lastIndex = 0
    if (MARKER.test(line)) findings.push(`${rel}:${index + 1}  ${line.trim()}`)
  })
}

if (findings.length === 0) {
  console.log('check-unconfirmed: no <Unconfirmed> markers in src/.')
  process.exit(0)
}

const heading = `check-unconfirmed: ${findings.length} unconfirmed fact(s) still in the source:`
console[strict ? 'error' : 'warn'](heading)
for (const finding of findings) console[strict ? 'error' : 'warn'](`  ${finding}`)

if (strict) {
  console.error(
    '\nProduction builds must not ship unconfirmed facts (PROJECT_BRIEF.md §4).',
  )
  process.exit(1)
}
console.warn('\nNot strict (set CHECK_UNCONFIRMED=strict to fail). Continuing.')
process.exit(0)
