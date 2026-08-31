import { business } from '@/content/business'

/**
 * Page copy — PROJECT_BRIEF.md §6.
 *
 * Voice: plain, specific, second-person, confident without hype. No exclamation
 * marks. Nothing here asserts a fact that is not in §4; where a customer would
 * expect a number that nobody has confirmed, the copy says how to get it rather
 * than inventing one.
 */

export const home = {
  title: 'Auto Glass in Midland, Ontario',
  metaDescription:
    'Windshield repair and replacement, mobile service, tint and truck accessories in Midland, Ontario. Family-run since 1983. Call 705-526-7631.',
  hero: {
    heading: 'Auto glass, done properly, in Midland',
    body:
      'Chips, cracks and full windshield replacements for cars, trucks, boats and heavy equipment. ' +
      'Family-run on Vinden Street since 1983.',
  },
  /** Every value traces to a confirmed fact in §4. No soft claims. */
  trust: [
    { label: 'Established', value: `${business.founded.year}` },
    { label: 'Ownership', value: 'Family-run, second generation' },
    { label: 'Shop', value: `${business.address.street}, ${business.address.city}` },
    { label: 'Open', value: 'Mon–Fri, 8:00–17:00' },
  ],
  servicesHeading: 'What we do',
  servicesBody: 'Glass and accessory work for whatever you drive, tow or launch.',
  reviewsHeading: 'What customers say',
  reviewsBody: 'A few of the reviews on record. Every one is a real customer.',
  areasHeading: 'Where we work',
  areasBody:
    'The shop is on Vinden Street in Midland. We serve the surrounding towns across Simcoe County.',
  faqHeading: 'Common questions',
  shopHeading: 'Truck and trailer accessories',
  shopBody:
    'Wheels, tires, caps, hitches, lift kits, plows and more. Most of the catalogue is quoted rather than priced online.',
} as const

export const about = {
  title: 'About Huronia Auto Glass',
  metaDescription:
    'Huronia Auto Glass has been family-run in Midland, Ontario since 1983 — started by Norm Rumney and run today by his son Adam.',
  heading: 'Two generations on Vinden Street',
  intro: `${business.founded.founder} started Huronia Auto Glass in ${business.founded.year}. His son ${business.founded.currentOwner} runs it today, from the same shop at ${business.address.street} in ${business.address.city}.`,
  body: [
    'The work has not changed much in that time, even as the glass has. A windshield used to be glass and a seal. On a lot of vehicles now it is also a mounting point for the cameras and sensors that drive lane-keep assist and automatic emergency braking, which changes what a replacement involves.',
    'What has stayed the same is how the shop runs. You are told what the job needs before it starts, and what it will cost before you agree to it.',
  ],
  // teamHeading: held back until staff names are confirmed (§4 open item 11).
} as const

export const contact = {
  title: 'Contact Huronia Auto Glass',
  metaDescription:
    'Call 705-526-7631 or visit 821 Vinden Street, Midland, Ontario. Open Monday to Friday, 8:00am to 5:00pm.',
  heading: 'Get in touch',
  intro:
    'Call during opening hours for the quickest answer, or send a quote request any time and we will come back to you.',
  visitHeading: 'Visit the shop',
  hoursHeading: 'Opening hours',
  paymentHeading: 'Payment',
  quoteHeading: 'Need a price?',
  quoteBody:
    'Tell us the vehicle and what has happened to the glass, and we will quote it.',
} as const

export const reviewsPage = {
  title: 'Customer Reviews',
  metaDescription:
    'Reviews from Huronia Auto Glass customers across Midland, Penetanguishene, Port McNicoll, Waubaushene and beyond.',
  heading: 'What customers say',
  intro:
    'These are real reviews, reproduced as they were written. We do not write our own.',
} as const

export const servicesIndex = {
  title: 'Auto Glass Services',
  metaDescription:
    'Windshield repair and replacement, insurance claims, mobile service, marine and heavy equipment glass, tint and remote starters in Midland, Ontario.',
  heading: 'Services',
  intro:
    'Glass and accessory work for cars, trucks, boats, RVs and heavy equipment, from the shop on Vinden Street or at your location.',
} as const

export const areasIndex = {
  title: 'Areas We Serve',
  metaDescription:
    'Huronia Auto Glass serves Midland, Penetanguishene, Tiny, Victoria Harbour, Port McNicoll, Waubaushene, Wyebridge and Coldwater.',
  heading: 'Areas we serve',
  intro: `The shop is at ${business.address.street} in ${business.address.city}. These are the towns we work in most often.`,
} as const
