import Link from 'next/link'
import { business, mailtoHref, telHref } from '@/content/business'
import { footerNav } from '@/content/navigation'
import { ui } from '@/content/ui'

const { address } = business

/**
 * Only the two real social accounts are linked (§4). The old site's bare
 * twitter/youtube/linkedin/pinterest/tripadvisor/houzz links were not the
 * business's accounts and are deliberately not recreated.
 */
const socialLinks = [
  { href: business.social.facebook, label: 'Facebook' },
  { href: business.social.instagram, label: 'Instagram' },
] as const

export function Footer() {
  return (
    <footer data-surface="ink" className="mt-24">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <p className="font-heading text-lg font-bold">{business.name}</p>
            <address className="mt-4 space-y-1 text-sm text-[var(--surface-muted)] not-italic">
              <p>{address.street}</p>
              <p>
                {address.city}, {address.regionCode} {address.postalCode}
              </p>
              <p className="pt-2">
                <a href={telHref} className="text-[var(--surface-link)] hover:underline">
                  {business.phone}
                </a>
                <span className="px-2" aria-hidden="true">
                  &middot;
                </span>
                <span>{ui.footer.faxLabel}</span>
              </p>
              <p>
                <a
                  href={mailtoHref}
                  className="text-[var(--surface-link)] hover:underline"
                >
                  {business.email}
                </a>
              </p>
            </address>

            <div className="mt-5 text-sm text-[var(--surface-muted)]">
              <p className="font-medium text-[var(--surface-fg)]">
                {ui.footer.hoursHeading}
              </p>
              <p className="mt-1">{ui.footer.weekdays}</p>
              <p>{ui.footer.weekend}</p>
            </div>
          </div>

          {footerNav.map((section) => (
            <nav key={section.heading} aria-labelledby={`footer-${section.heading}`}>
              <p
                id={`footer-${section.heading}`}
                className="font-heading text-sm font-semibold tracking-wide uppercase"
              >
                {section.heading}
              </p>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--surface-muted)] hover:text-[var(--surface-fg)] hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--surface-line)] pt-6 text-sm text-[var(--surface-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {ui.footer.established} {ui.footer.paymentLabel}
          </p>
          <ul className="flex gap-4">
            {socialLinks.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  rel="noreferrer"
                  className="hover:text-[var(--surface-fg)] hover:underline"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
