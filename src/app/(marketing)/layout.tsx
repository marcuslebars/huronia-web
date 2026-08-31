import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

export default function MarketingLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}
