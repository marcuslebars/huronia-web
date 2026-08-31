import type { Town } from '@/types/content'

/**
 * The eight service areas — PROJECT_BRIEF.md §6.
 *
 * Phase 2 adds 250+ words of genuinely distinct copy per town. That work is
 * blocked on the mobile service radius and travel charge (open item §4.5):
 * without them there is nothing real to say, and the brief forbids padding.
 */
export const towns: readonly Town[] = [
  { slug: 'midland', name: 'Midland' },
  { slug: 'penetanguishene', name: 'Penetanguishene' },
  { slug: 'tiny', name: 'Tiny' },
  { slug: 'victoria-harbour', name: 'Victoria Harbour' },
  { slug: 'port-mcnicoll', name: 'Port McNicoll' },
  { slug: 'waubaushene', name: 'Waubaushene' },
  { slug: 'wyebridge', name: 'Wyebridge' },
  { slug: 'coldwater', name: 'Coldwater' },
] as const
