import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

/**
 * Same shell as the marketing group, kept as its own group so shop routes can
 * diverge later. The cart drawer lives in the root layout instead: the header
 * cart control appears on every page, not only under /shop.
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
