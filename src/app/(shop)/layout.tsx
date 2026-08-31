import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

/**
 * Same shell as the marketing group. Kept as its own group because the cart
 * drawer (Phase 4) belongs here and nowhere else.
 */
export default function ShopLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}
