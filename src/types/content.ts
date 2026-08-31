/** Shared content types. Copy itself lives in src/content/ (CLAUDE.md). */

export type ServiceSummary = {
  readonly slug: string
  readonly title: string
}

export type CollectionSummary = {
  readonly slug: string
  readonly title: string
}

export type Town = {
  readonly slug: string
  readonly name: string
}

export type NavLink = {
  readonly href: string
  readonly label: string
}

export type NavSection = {
  readonly heading: string
  /** Where the heading itself points, when the group has an index page. */
  readonly href: string
  readonly links: readonly NavLink[]
}
