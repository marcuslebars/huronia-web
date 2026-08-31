import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { MegaMenu } from '@/components/layout/MegaMenu'
import { MobileNav } from '@/components/layout/MobileNav'
import { business, telHref } from '@/content/business'
import { megaMenu, primaryNav } from '@/content/navigation'
import { ui } from '@/content/ui'

/**
 * Server Component. Only the mega menu and the drawer are client islands.
 *
 * The wordmark is text, not the client's low-resolution PNG (§13.4): it can be
 * swapped for an SVG later without changing the header's layout or height.
 */
export function Header() {
  return (
    <header
      data-surface="paper"
      className="sticky top-0 z-40 border-b border-[var(--surface-line)]"
    >
      <a
        href="#main"
        className="sr-only rounded-md bg-[var(--color-accent)] px-4 py-2 text-[var(--color-paper)] focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        {ui.skipToContent}
      </a>

      <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-lg leading-tight font-bold tracking-tight"
        >
          {business.name}
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden lg:block">
          <div className="flex items-center gap-1">
            <MegaMenu sections={megaMenu} />
            <ul className="flex items-center gap-1">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-[var(--btn-subtle-hover)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            href={telHref}
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            {business.phone}
          </Button>
          <Button href="/quote" size="sm" className="hidden sm:inline-flex">
            {ui.quoteCta}
          </Button>
          <MobileNav sections={megaMenu} primary={primaryNav} />
        </div>
      </div>
    </header>
  )
}
