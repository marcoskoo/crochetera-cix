'use client'

import { useStore } from '@/lib/store'
import { usePublicData } from '@/components/shared/use-public-data'
import { Navbar } from './navbar'
import { Hero } from './hero'
import { FeaturedProducts } from './featured-products'
import { CategoriesGrid } from './categories-grid'
import { Catalog } from './catalog'
import { AboutSection } from './about-section'
import { Testimonials } from './testimonials'
import { ContactSection } from './contact-section'
import { Footer } from './footer'
import { ProductDetail } from './product-detail'
import { Checkout } from './checkout'
import { GalleryPage } from './gallery-page'
import { AdminLoginModal } from '@/components/admin/admin-login-modal'
import { useEffect } from 'react'

export function Storefront() {
  usePublicData()
  const storeSection = useStore((s) => s.storeSection)
  const adminAuthed = useStore((s) => s.adminAuthed)
  const setAdminAuthed = useStore((s) => s.setAdminAuthed)

  // Verificar sesión admin al cargar
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
            <FeaturedProducts />
            <CategoriesGrid />
            <AboutSection />
            <Testimonials />
            <ContactSection />
          </>
        )}
        {storeSection === 'catalog' && <Catalog />}
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
      </main>
      <Footer />
      <AdminLoginModal />
    </div>
  )
}
