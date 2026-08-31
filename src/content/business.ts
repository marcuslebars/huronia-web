/**
 * Business facts — PROJECT_BRIEF.md §4, verbatim.
 *
 * Nothing here may be invented, extended or "improved". If a fact is not in the
 * brief it does not belong in this file; use the Unconfirmed component at the call site.
 */

export const business = {
  name: 'Huronia Auto Glass',
  address: {
    street: '821 Vinden Street',
    city: 'Midland',
    region: 'Ontario',
    regionCode: 'ON',
    country: 'Canada',
    countryCode: 'CA',
    postalCode: 'L4R 1A1',
  },
  geo: { latitude: 44.752189, longitude: -79.904466 },
  phone: '705-526-7631',
  fax: '705-526-6559',
  email: 'info@huroniaautoglass.com',
  /** Monday–Friday 8:00am–5:00pm. Saturday and Sunday closed. */
  hours: {
    weekdays: { opens: '08:00', closes: '17:00' },
    saturday: null,
    sunday: null,
  },
  founded: {
    year: 1983,
    founder: 'Norm Rumney',
    currentOwner: 'Adam Rumney',
  },
  payment: ['Visa', 'MasterCard', 'Debit'],
  /**
   * These two ONLY. The old site linked bare twitter/youtube/linkedin/pinterest/
   * tripadvisor/houzz homepages; those are not their accounts (§4).
   */
  social: {
    facebook: 'https://facebook.com/huroniaautoglass',
    instagram: 'https://instagram.com/huroniaautoglass',
  },
} as const

/** Digits only, for tel: hrefs. */
export const telHref = `tel:+1${business.phone.replace(/\D/g, '')}`
export const mailtoHref = `mailto:${business.email}`
