#!/usr/bin/env node
/**
 * Phase 2 gate — PROJECT_BRIEF.md §3 rule 1 and §10.
 *
 * No marketing copy inside a component. Copy lives in src/content/ so a
 * non-developer can review it and it can be translated later.
 *
 * Uses the TypeScript parser rather than regex: `useState<Foo | null>(null)`
 * looks exactly like JSX text to a regex, and a gate that reports phantom
 * violations gets ignored or drowned in allowlist entries.
 *
 * Flags rendered text — JSX text nodes, and string literals inside JSX
 * expressions. The allowlist is deliberately tiny: generic control chrome
 * belongs with the primitive that renders it, anything a client would want to
 * reword does not. Adding to it should feel like a decision.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'

const ROOT = process.cwd()
const COMPONENTS = join(ROOT, 'src', 'components')

const ALLOWED = new Set([
  'Close dialog',
  'Close menu',
  'Unconfirmed:',
  '(required)',
  'out of 5',
  // Dev-only warning inside the Unconfirmed marker itself. Never reaches
  // production: the component returns null there and the build gate fails.
  'Confirm with the client. This must not reach production.',
])

/** Punctuation and entity separators are not copy. */
const isGlyph = (text) => !/[A-Za-z]{2}/.test(text) || /^&[a-z]+;$/.test(text)

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (entry.endsWith('.tsx')) out.push(full)
  }
  return out
}

const findings = []

for (const file of walk(COMPONENTS)) {
  const rel = relative(ROOT, file)
  const source = readFileSync(file, 'utf8')
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  const record = (node, text, kind) => {
    const clean = text.replace(/\s+/g, ' ').trim()
    if (clean === '' || isGlyph(clean) || ALLOWED.has(clean)) return
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    findings.push({ rel, line: line + 1, kind, text: clean })
  }

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      record(node, node.text, 'JSX text')
    } else if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isStringLiteral(node.expression)
    ) {
      record(node, node.expression.text, 'string in JSX')
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

if (findings.length > 0) {
  console.error('check-component-copy: copy found inside components/:\n')
  for (const f of findings)
    console.error(`  ${f.rel}:${f.line}\n    ${f.kind}: "${f.text}"\n`)
  console.error('Move it to src/content/ (PROJECT_BRIEF.md §3 rule 1).')
  process.exit(1)
}

console.log('check-component-copy: no marketing copy in src/components/.')
