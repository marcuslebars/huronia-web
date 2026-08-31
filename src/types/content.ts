/** Shared content types. Copy itself lives in src/content/ (CLAUDE.md). */

export type ServiceSummary = {
  readonly slug: string
  readonly title: string
  /**
   * One line for index cards and the mega menu. Describes what the service is,
   * never what the shop charges or promises — those are open items (§4).
   */
  readonly summary: string
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

export type Review = {
  readonly id: string
  readonly author: string
  readonly location: string | null
  /** ISO year-month, for sorting and datetime attributes. Null when unknown. */
  readonly date: string | null
  readonly displayDate: string | null
  readonly rating: 5
  readonly body: string
}

export type Faq = {
  readonly id: string
  readonly question: string
  /** Plain text so the same answer can feed both the page and FAQPage JSON-LD. */
  readonly answer: string
}
