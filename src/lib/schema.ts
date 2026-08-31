import { towns } from '@/content/areas'
import { business } from '@/content/business'
import { clientEnv } from '@/lib/env'
import type { Faq, ServiceSummary } from '@/types/content'

/**
 * JSON-LD builders — PROJECT_BRIEF.md §9. Never inline this in a page.
 *
 * A note on the business type. The brief specifies `AutoGlassShop`. That type
 * does not exist: schema.org/AutoGlassShop returns 404, and AutomotiveBusiness
 * has exactly nine subtypes — AutoBodyShop, AutoDealer, AutoPartsStore,
 * AutoRental, AutoRepair, AutoWash, GasStation, MotorcycleDealer and
 * MotorcycleRepair. An unrecognised @type costs the local-business rich result
 * outright, which is the one thing §1 says everything defers to, so this uses
 * `AutoRepair` and expresses the auto-glass specificity through hasOfferCatalog
 * instead.
 */

export type JsonLdObject = Record<string, unknown>

const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL

export const absoluteUrl = (path: string): string =>
  path === '/' ? siteUrl : `${siteUrl}${path}`

/** Stable @id so other nodes can reference the business rather than repeat it. */
export const BUSINESS_ID = `${siteUrl}/#business`

const postalAddress: JsonLdObject = {
  '@type': 'PostalAddress',
  streetAddress: business.address.street,
  addressLocality: business.address.city,
  addressRegion: business.address.regionCode,
  postalCode: business.address.postalCode,
  addressCountry: business.address.countryCode,
}

/** Sitewide. Emitted once, from the root layout. */
export function localBusinessSchema(services: readonly ServiceSummary[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': BUSINESS_ID,
    name: business.name,
    url: siteUrl,
    telephone: business.phone,
    faxNumber: business.fax,
    email: business.email,
    foundingDate: String(business.founded.year),
    address: postalAddress,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    // The brief asks for the openingHours string. openingHoursSpecification is
    // what Google documents, so both are emitted and they say the same thing.
    openingHours: 'Mo-Fr 08:00-17:00',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: business.hours.weekdays.opens,
        closes: business.hours.weekdays.closes,
      },
    ],
    areaServed: towns.map((town) => ({
      '@type': 'City',
      name: town.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: town.name,
        addressRegion: business.address.regionCode,
        addressCountry: business.address.countryCode,
      },
    })),
    paymentAccepted: business.payment.join(', '),
    // Only the two accounts that are actually theirs (§4).
    sameAs: [business.social.facebook, business.social.instagram],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        // No price: the catalogue and the service list are quote-only, and a
        // zero or invented price is worse than none (§3 rule 3, §13.1).
        itemOffered: {
          '@type': 'Service',
          name: service.title,
          url: absoluteUrl(`/services/${service.slug}`),
        },
      })),
    },
  }
}

/** One per service page. Wired up when those pages exist. */
export function serviceSchema(service: ServiceSummary): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    url: absoluteUrl(`/services/${service.slug}`),
    serviceType: service.title,
    provider: { '@id': BUSINESS_ID },
    areaServed: towns.map((town) => ({ '@type': 'City', name: town.name })),
  }
}

/** Homepage FAQ (§9). Answers must match what the page renders. */
export function faqPageSchema(faqs: readonly Faq[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export type Crumb = { readonly name: string; readonly path: string }

/** Nested routes (§9). Position is 1-based and must be contiguous. */
export function breadcrumbSchema(crumbs: readonly Crumb[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}
