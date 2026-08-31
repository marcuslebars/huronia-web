import type { ServiceSummary } from '@/types/content'

/**
 * The eight services — PROJECT_BRIEF.md §6, slugs and titles verbatim.
 * Phase 2 adds the 400-600 word body copy for each.
 */
export const services: readonly ServiceSummary[] = [
  { slug: 'windshield-repair', title: 'Windshield Chip & Crack Repair' },
  { slug: 'windshield-replacement', title: 'Windshield Replacement' },
  { slug: 'insurance-claims', title: 'Insurance Glass Claims' },
  { slug: 'mobile-service', title: 'Mobile Auto Glass Service' },
  { slug: 'marine-glass', title: 'Boat, RV & Motorhome Glass' },
  { slug: 'heavy-equipment-glass', title: 'Heavy Equipment & Fleet Glass' },
  { slug: 'window-tint', title: 'Window, Headlight & Emblem Tint' },
  { slug: 'remote-starters', title: 'Remote Car Starters' },
] as const
