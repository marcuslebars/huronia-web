import { business } from '@/content/business'

/**
 * Copy used by the layout shell.
 *
 * The boundary this file draws: any string a non-developer might want to review
 * or reword lives in src/content/. Generic control labels inside ui/ primitives
 * ("Close dialog") are chrome, not copy, and stay with the primitive.
 *
 * Nothing here asserts a fact that is not in §4.
 */
export const ui = {
  skipToContent: 'Skip to content',
  quoteCta: 'Request a quote',
  callCta: `Call ${business.phone}`,
  openMenu: 'Open menu',
  menuTitle: 'Menu',
  /** Prefix for a mega-menu link to a section's own index page. */
  allInSection: (heading: string) => `All ${heading.toLowerCase()}`,

  footer: {
    hoursHeading: 'Hours',
    weekdays: `Monday–Friday ${business.hours.weekdays.opens}–${business.hours.weekdays.closes}`,
    weekend: 'Saturday and Sunday closed',
    faxLabel: `Fax ${business.fax}`,
    /** Facts only: family-run (§1), Midland and 1983 (§4). */
    established: `Family-run in ${business.address.city} since ${business.founded.year}.`,
    paymentLabel: `Payment: ${business.payment.join(', ')}.`,
  },
} as const
