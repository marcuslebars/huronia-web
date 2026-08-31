import type { MetadataRoute } from 'next'
import { noindexRoutes } from '@/lib/routes'
import { absoluteUrl } from '@/lib/schema'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The API is not content, and the kitchen sink is an audit surface.
      disallow: ['/api/', ...noindexRoutes],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    // No `host`: it is a Yandex-only directive that Google ignores, and it
    // expects a bare hostname rather than the absolute URL Next emits.
  }
}
