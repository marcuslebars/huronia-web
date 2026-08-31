import type { MetadataRoute } from 'next'
import { indexableRoutes } from '@/lib/routes'
import { absoluteUrl } from '@/lib/schema'

/**
 * §9. Built from lib/routes.ts so the sitemap and its test cannot drift apart.
 * lastModified is the build time: the content is static, so a deploy is the
 * only thing that changes it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return indexableRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
