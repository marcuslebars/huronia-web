/**
 * The site's indexable routes — the one source of truth for the sitemap, the
 * metadata test and the sitemap test.
 *
 * Only routes that actually exist belong here. Listing a page before it is
 * built puts a 404 in the sitemap, which is worse than omitting it.
 *
 * PENDING, blocked on assets that have not been supplied:
 *   /services/[slug]  x8  — needs the draft copy in content/*.html (§12)
 *   /areas/[town]     x8  — needs the mobile service radius (§4 open item 5)
 *   /shop, /shop/[collection], /shop/[collection]/[product]
 *                         — needs Shopify credentials and collections.md
 * Add each one here as it lands; the sitemap test will then require it.
 */

export type SiteRoute = {
  readonly path: string
  /** Relative weight within this site, not a claim about the wider web. */
  readonly priority: number
  readonly changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export const indexableRoutes: readonly SiteRoute[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/quote', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/areas', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/reviews', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
] as const

/**
 * Reachable but deliberately kept out of the index: an audit surface, not part
 * of the public site. Phase 7 should drop it from production builds entirely.
 */
export const noindexRoutes: readonly string[] = ['/kitchen-sink'] as const
