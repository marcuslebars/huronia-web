import type { Metadata } from 'next'
import { clientEnv } from '@/lib/env'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: 'Huronia Auto Glass',
  description: 'Auto glass and truck accessories in Midland, Ontario.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  )
}
