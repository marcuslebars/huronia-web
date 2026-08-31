import type { Review } from '@/types/content'

/**
 * The seven reviews on record — PROJECT_BRIEF.md §6, verbatim.
 *
 * DO NOT add to this list. Fabricated testimonials are a trust problem and a
 * legal one. The brief notes fifteen reviews exist in the client's records;
 * the remaining eight can be added once supplied.
 *
 * Note also that no aggregate rating is published anywhere on the site: an
 * AggregateRating asserting fifteen while seven are visible would breach
 * Google's structured-data policy and overstate what we can evidence.
 */
export const reviews: readonly Review[] = [
  {
    id: 'rob-karnis',
    author: 'Rob Karnis',
    location: 'Orangeville',
    date: '2026-07',
    displayDate: 'July 2026',
    rating: 5,
    body: "U Haul wasted 2 weeks of my time and didn't accomplish anything. The Toyota dealership wanted twice the price and over a week's notice. These guys did it right, affordable and in one afternoon. These are now MY 'Go-To' Guys. It's Worth the Drive to Midland!",
  },
  {
    id: 'terry-doyle',
    author: 'Terry Doyle',
    location: 'Brooklin',
    date: '2025-06',
    displayDate: 'June 2025',
    rating: 5,
    body: 'Adam and his team did a great job on a boat side window that was shattered after a tree fell on it. We initially had the boat at a marina for over a year with little attention. They turned the window around in less than a week and I am exceptionally happy with the results.',
  },
  {
    id: 'kenan-mandy',
    author: 'Kenan & Mandy',
    location: 'Port McNicoll',
    date: '2025-07',
    displayDate: 'July 2025',
    rating: 5,
    body: 'Amazing service! We were able to drop our vehicle off overnight, pay over the phone and pick up after hours. The vehicle tint looks like it came from the factory.',
  },
  {
    id: 'marilyn',
    author: 'Marilyn',
    location: 'Penetanguishene',
    date: '2025-12',
    displayDate: 'December 2025',
    rating: 5,
    body: 'Service was fast and friendly. They were true to the estimate and never tried to oversell me on anything.',
  },
  {
    id: 'carol-jeannotte',
    author: 'Carol Jeannotte',
    location: 'Waubaushene',
    date: null,
    displayDate: null,
    rating: 5,
    body: 'Recently had my remote starter installed in my CRV. Fast, friendly and very neat and tidy installation.',
  },
  {
    id: 'cathy',
    author: 'Cathy',
    location: 'Penetanguishene',
    date: '2026-06',
    displayDate: 'June 2026',
    rating: 5,
    body: 'Amazing service! We are always treated with respect and our concerns are dealt with professionally. Adam always makes time to assist, and often fix, our issues.',
  },
  {
    id: 'kurt',
    author: 'Kurt',
    location: 'Parry Sound',
    date: '2026-07',
    displayDate: 'July 2026',
    rating: 5,
    body: 'Had my windshield replaced, they did a great job under the time that they told me and best of all was the price.',
  },
] as const
