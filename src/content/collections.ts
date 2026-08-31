import type { CollectionSummary } from '@/types/content'

/**
 * The eight shop collections — PROJECT_BRIEF.md §6.
 *
 * Slugs are verbatim from the brief. Titles are readable renderings of those
 * slugs, not facts about the catalogue; the 31->8 mapping in collections.md
 * (not yet supplied) governs which products land in each.
 */
export const collections: readonly CollectionSummary[] = [
  { slug: 'wheels-tires', title: 'Wheels & Tires' },
  { slug: 'truck-caps-tonneau', title: 'Truck Caps & Tonneau Covers' },
  { slug: 'suspension-lift-kits', title: 'Suspension & Lift Kits' },
  { slug: 'steps-bars-protection', title: 'Steps, Bars & Protection' },
  { slug: 'towing-hitches', title: 'Towing & Hitches' },
  { slug: 'snow-plows-spreaders', title: 'Snow Plows & Spreaders' },
  { slug: 'batteries', title: 'Batteries' },
  { slug: 'interior-cargo', title: 'Interior & Cargo' },
] as const
