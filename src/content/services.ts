import type { ServiceSummary } from '@/types/content'

/**
 * The eight services — PROJECT_BRIEF.md §6, slugs and titles verbatim.
 *
 * The one-line summaries below describe what each service *is*. They make no
 * claim about price, turnaround, coverage or capability, because every one of
 * those is an open item (§4). They are provisional: the draft copy in
 * content/*.html (§12, not yet supplied) is the source for the detail pages and
 * should replace these when it arrives.
 */
export const services: readonly ServiceSummary[] = [
  {
    slug: 'windshield-repair',
    title: 'Windshield Chip & Crack Repair',
    summary: 'Stone chips and short cracks filled with resin before they spread.',
  },
  {
    slug: 'windshield-replacement',
    title: 'Windshield Replacement',
    summary: 'A new windshield when the damage is past repairing.',
  },
  {
    slug: 'insurance-claims',
    title: 'Insurance Glass Claims',
    summary: 'Help with the paperwork when your glass goes through insurance.',
  },
  {
    slug: 'mobile-service',
    title: 'Mobile Auto Glass Service',
    summary: 'Glass work done at your home, workplace or job site.',
  },
  {
    slug: 'marine-glass',
    title: 'Boat, RV & Motorhome Glass',
    summary: 'Windows and windshields for boats, RVs and motorhomes.',
  },
  {
    slug: 'heavy-equipment-glass',
    title: 'Heavy Equipment & Fleet Glass',
    summary: 'Glass for heavy equipment, farm machinery and commercial fleets.',
  },
  {
    slug: 'window-tint',
    title: 'Window, Headlight & Emblem Tint',
    summary: 'Film for windows, headlights and emblems.',
  },
  {
    slug: 'remote-starters',
    title: 'Remote Car Starters',
    summary: 'Remote starters supplied and installed.',
  },
] as const
