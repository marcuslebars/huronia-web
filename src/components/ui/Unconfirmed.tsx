import type { ReactNode } from 'react'

export type UnconfirmedProps = {
  /** What is unknown, e.g. "Chip repair price". */
  children: ReactNode
}

/**
 * A fact nobody has confirmed yet — PROJECT_BRIEF.md §4.
 *
 * Development renders an obvious amber block. Production renders nothing, but
 * production is not supposed to be reachable with any of these left: the real
 * enforcement is scripts/check-unconfirmed.mjs, which fails the build.
 *
 * Whether a given element is *reachable* is a runtime property and cannot be
 * decided statically, so the check is deliberately stricter than the brief's
 * wording — it fails if the marker appears in the source at all.
 */
export function Unconfirmed({ children }: UnconfirmedProps) {
  if (process.env.NODE_ENV === 'production') return null

  return (
    <mark
      data-unconfirmed=""
      className="text-ink my-2 block border-l-4 border-[var(--color-signal)] bg-[var(--color-signal)]/12 px-3 py-2 text-sm"
    >
      <strong className="font-semibold">Unconfirmed:</strong> {children}
      <span className="text-muted mt-1 block text-xs">
        Confirm with the client. This must not reach production.
      </span>
    </mark>
  )
}
