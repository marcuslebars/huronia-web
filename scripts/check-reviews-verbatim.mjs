#!/usr/bin/env node
/**
 * Asserts src/content/reviews.ts matches PROJECT_BRIEF.md §6 exactly.
 *
 * These are real customers' words. Fabricating or paraphrasing a testimonial is
 * a trust problem and a legal one, and the count must not drift either — the
 * brief supplies seven and forbids inventing more. This runs in CI so an edit
 * that rewords a review fails the build.
 */
import { readFileSync } from 'node:fs'

const brief = readFileSync('PROJECT_BRIEF.md', 'utf8')
const module_ = readFileSync('src/content/reviews.ts', 'utf8')

const briefQuotes = [...brief.matchAll(/^- \*\*(.+?)\*\* — "(.+?)"\s*$/gm)].map((m) => ({
  attribution: m[1],
  body: m[2],
}))

const moduleBodies = [...module_.matchAll(/^ {4}body:\s*(['"])(.*)\1,\s*$/gm)].map(
  (m) => m[2],
)

/** Undo only the JS string escaping we introduced. */
const norm = (s) => s.replaceAll("\'", "'").replaceAll('\\"', '"').trim()

const problems = []

if (briefQuotes.length === 0) problems.push('No reviews parsed from PROJECT_BRIEF.md §6.')
if (briefQuotes.length !== moduleBodies.length) {
  problems.push(
    `Count mismatch: brief has ${briefQuotes.length}, reviews.ts has ${moduleBodies.length}. ` +
      'Reviews must not be added or removed without the client’s records.',
  )
}

briefQuotes.forEach((quote, index) => {
  const got = moduleBodies[index]
  const who = quote.attribution.split(',')[0]
  if (got === undefined) {
    problems.push(`Missing review: ${who}`)
  } else if (norm(quote.body) !== norm(got)) {
    problems.push(
      `Review text differs from the brief: ${who}\n    brief:  ${norm(quote.body)}\n    module: ${norm(got)}`,
    )
  }
})

if (problems.length > 0) {
  console.error('check-reviews-verbatim: reviews do not match the brief:\n')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(
  `check-reviews-verbatim: all ${briefQuotes.length} reviews match the brief verbatim.`,
)
