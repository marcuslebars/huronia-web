import type { Metadata } from 'next'
import { Archivo, Inter } from 'next/font/google'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { CartProvider } from '@/components/shop/CartProvider'
import { JsonLd } from '@/components/ui/JsonLd'
import { business } from '@/content/business'
import { services } from '@/content/services'
import { clientEnv } from '@/lib/env'
import { localBusinessSchema } from '@/lib/schema'
import './globals.css'

/** Sturdy sans for headings, readable sans for body (§5). Self-hosted by next/font. */
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const description = `Auto glass and truck accessories in ${business.address.city}, ${business.address.region}. Family-run since ${business.founded.year}.`

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: business.name,
    // Pages set their own title; this appends the business name to it.
    template: `%s — ${business.name}`,
  },
  description,
  applicationName: business.name,
  openGraph: {
    type: 'website',
    siteName: business.name,
    locale: 'en_CA',
    title: business.name,
    description,
    url: '/',
  },
  twitter: {
    // summary_large_image, but no Twitter account is claimed: the business does
    // not have one, and the old site's bare twitter.com link was not theirs (§4).
    card: 'summary_large_image',
    title: business.name,
    description,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-CA" className={`${archivo.variable} ${inter.variable}`}>
      <body data-surface="paper" className="antialiased">
        {/* Sitewide so the header cart control and drawer work on every page,
            not only under /shop. The cart hydrates from /api/cart on mount, so
            no page has to become dynamic to read the cookie. */}
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
        {/* Sitewide business node. Other schema references it by @id. */}
        <JsonLd schema={localBusinessSchema(services)} />
      </body>
    </html>
  )
}
