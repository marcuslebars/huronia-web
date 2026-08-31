export type ClassValue = string | false | null | undefined

/** Joins class names. Deliberately tiny — no component library (CLAUDE.md). */
export function cn(...values: readonly ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
