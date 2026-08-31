import { collections } from '@/content/collections'
import { services } from '@/content/services'
import { towns } from '@/content/areas'
import type { NavLink, NavSection } from '@/types/content'

/** Site navigation. Structure and labels live here, never in a component. */

export const megaMenu: readonly NavSection[] = [
  {
    heading: 'Services',
    href: '/services',
    links: services.map((service) => ({
      href: `/services/${service.slug}`,
      label: service.title,
    })),
  },
  {
    heading: 'Shop',
    href: '/shop',
    links: collections.map((collection) => ({
      href: `/shop/${collection.slug}`,
      label: collection.title,
    })),
  },
  {
    heading: 'Areas we serve',
    href: '/areas',
    links: towns.map((town) => ({ href: `/areas/${town.slug}`, label: town.name })),
  },
] as const

/** Top-level links that sit alongside the mega menu. */
export const primaryNav: readonly NavLink[] = [
  { href: '/about', label: 'About' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
] as const

export const footerNav: readonly NavSection[] = [
  ...megaMenu,
  {
    heading: 'Company',
    href: '/about',
    links: [...primaryNav, { href: '/quote', label: 'Request a quote' }],
  },
] as const
