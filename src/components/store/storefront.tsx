'use client'

import { useStore } from '@/lib/store'
import { usePublicData } from '@/components/shared/use-public-data'
import { Navbar } from './navbar'
import { Hero } from './hero'
import { StoriesBar } from './stories-bar'
import { FeaturedProducts } from './featured-products'
import { CategoriesGrid } from './categories-grid'
import { BundlesSection } from './bundles-section'
import { CatalogAdvanced } from './catalog-advanced'
import { AboutSection } from './about-section'
import { Testimonials } from './testimonials'
import { ContactSection } from './contact-section'
import { Footer } from './footer'
import { ProductDetail } from './product-detail'
import { Checkout } from './checkout'
import { GalleryPage } from './gallery-page'
import { FAQSection } from './faq-section'
import { NewsletterSection } from './newsletter-section'
import { RecentlyViewed } from './recently-viewed'
import { WhatsAppFloating } from './whatsapp-floating'
import { CookieConsent } from './cookie-consent'
import { OrderTracking } from './order-tracking'
import { CustomRequestForm } from './custom-request-form'
import { WishlistPage } from './wishlist-page'
import { ComparePage } from './compare-page'
import { BlogSection } from './blog-section'
import { BlogPage } from './blog-page'
import { BlogPostView } from './blog-post-view'
import { LinktreePage } from './linktree-page'
import { AbandonedCartRecovery } from './abandoned-cart-recovery'
import { AdminLoginModal } from '@/components/admin/admin-login-modal'
import { AmbientMusic } from '@/components/shared/ambient-music'
import { CustomCursor } from '@/components/shared/custom-cursor'
import { SeasonalTheme } from '@/components/shared/seasonal-theme'
import { useEffect, useState } from 'react'
import { QuickViewModal } from './quick-view-modal'
import type { ProductWithRelations } from '@/lib/types'

export function Storefront() {
  usePublicData()
  const storeSection = useStore((s) => s.storeSection)
  const adminAuthed = useStore((s) => s.adminAuthed)
  const setAdminAuthed = useStore((s) => s.setAdminAuthed)
  const [quickViewProduct, setQuickViewProduct] = useState<ProductWithRelations | null>(null)

  useEffect(() => {
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((data) => {
        if (data.authed) setAdminAuthed(true)
      })
      .catch(() => {})
  }, [setAdminAuthed])

  return (
    <div className="min-h-screen flex flex-col crochet-pattern">
      <Navbar />
      <main className="flex-1">
        {storeSection === 'home' && (
          <>
            <Hero />
            <StoriesBar />
            <FeaturedProducts onQuickView={setQuickViewProduct} />
            <CategoriesGrid />
            <BundlesSection />
            <AboutSection />
            <Testimonials />
            <BlogSection />
            <FAQSection />
            <NewsletterSection />
            <RecentlyViewed />
            <ContactSection />
          </>
        )}
        {storeSection === 'catalog' && <CatalogAdvanced />}
        {storeSection === 'product' && <ProductDetail />}
        {storeSection === 'cart' && <Checkout />}
        {storeSection === 'checkout' && <Checkout />}
        {storeSection === 'about' && (
          <>
            <AboutSection />
            <Testimonials />
          </>
        )}
        {storeSection === 'contact' && <ContactSection />}
        {storeSection === 'gallery' && <GalleryPage />}
        {storeSection === 'wishlist' && <WishlistPage />}
        {storeSection === 'track' && <OrderTracking />}
        {storeSection === 'custom' && <CustomRequestForm />}
        {storeSection === 'blog' && <BlogPage />}
        {storeSection === 'blogPost' && <BlogPostView />}
        {storeSection === 'compare' && <ComparePage />}
        {storeSection === 'linktree' && <LinktreePage />}
      </main>
      <Footer />
      <WhatsAppFloating />
      <CookieConsent />
      <AbandonedCartRecovery />
      <AmbientMusic />
      <SeasonalTheme />
      <CustomCursor />
      <AdminLoginModal />
      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(v) => !v && setQuickViewProduct(null)}
      />
    </div>
  )
}
