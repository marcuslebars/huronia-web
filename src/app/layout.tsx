import type { Metadata } from 'next'
import { Archivo, Inter } from 'next/font/google'
import { clientEnv } from '@/lib/env'
import { business } from '@/content/business'
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

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: business.name,
  description: 'Auto glass and truck accessories in Midland, Ontario.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body data-surface="paper" className="antialiased">
        {children}
      </body>
    </html>
  )
}
