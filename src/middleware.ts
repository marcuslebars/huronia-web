import { NextResponse, type NextRequest } from 'next/server'

/**
 * Legacy URL redirects — PROJECT_BRIEF.md §9.
 *
 * Done here rather than in next.config.ts for two reasons.
 *
 * 1. `redirects()` matches `source` case-INSENSITIVELY, so a rule sending
 *    /Services to /services also matches /services and sends it to itself. That
 *    is an infinite redirect on a real page. Comparing the path here lets the
 *    rule fire only when the destination actually differs.
 * 2. The brief asks for 301. `permanent: true` emits 308. Both are permanent
 *    and Google treats them alike, but 301 is what was specified and this can
 *    emit it exactly.
 *
 * These only fire for requests that reach this deployment. The old pages live
 * on shopmidland.com, a domain the business does not own; unless that hostname
 * points here, none of this runs and the link equity is lost. That is a DNS
 * question, not a code one.
 */
const LEGACY_REDIRECTS = new Map<string, string>([
  ['/home', '/'],
  ['/products', '/shop'],
  ['/services', '/services'],
  ['/latestnews', '/'], // the blog is retired
  ['/testimonials', '/reviews'],
  ['/contact', '/contact'],
])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const target = LEGACY_REDIRECTS.get(pathname.toLowerCase())

  // Identical path means this is already the canonical URL, not a legacy one.
  if (target === undefined || target === pathname) return NextResponse.next()

  return NextResponse.redirect(new URL(target, request.url), 301)
}

export const config = {
  // Only the legacy paths, in any casing. Everything else skips the middleware
  // entirely rather than paying for a lookup on every request.
  matcher: [
    '/((?i:home))',
    '/((?i:products))',
    '/((?i:services))',
    '/((?i:latestnews))',
    '/((?i:testimonials))',
    '/((?i:contact))',
  ],
}
