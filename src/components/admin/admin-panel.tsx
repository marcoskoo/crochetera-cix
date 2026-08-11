'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { AdminSidebar } from './admin-sidebar'
import { AdminDashboard } from './sections/admin-dashboard'
import { AdminProducts } from './sections/admin-products'
import { AdminCategories } from './sections/admin-categories'
import { AdminOrders } from './sections/admin-orders'
import { AdminSite } from './sections/admin-site'
import { AdminSections } from './sections/admin-sections'
import { AdminGallery } from './sections/admin-gallery'
import { AdminTestimonials } from './sections/admin-testimonials'
import { AdminReviews } from './sections/admin-reviews'
import { AdminFAQ } from './sections/admin-faq'
import { AdminNewsletter } from './sections/admin-newsletter'
import { AdminCustomRequests } from './sections/admin-custom-requests'
import { AdminStockNotifications } from './sections/admin-stock-notifications'
import { AdminCoupons } from './sections/admin-coupons'
import { AdminBlog } from './sections/admin-blog'
import { AdminQuestions } from './sections/admin-questions'
import { AdminBundles } from './sections/admin-bundles'
import { AdminStories } from './sections/admin-stories'
import { AdminLoyalty } from './sections/admin-loyalty'
import { AdminAnalytics } from './sections/admin-analytics'
import { AdminCosts } from './sections/admin-costs'
import { AdminAgenda } from './sections/admin-agenda'
import { AdminBackups } from './sections/admin-backups'
import { AdminEmails } from './sections/admin-emails'
import { Button } from '@/components/ui/button'
import { Menu, Store, LogOut } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from 'sonner'

export function AdminPanel() {
  const adminSection = useStore((s) => s.adminSection)
  const setView = useStore((s) => s.setView)
  const setAdminAuthed = useStore((s) => s.setAdminAuthed)
  const adminAuthed = useStore((s) => s.adminAuthed)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!adminAuthed) {
      setView('store')
    }
  }, [adminAuthed, setView])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAdminAuthed(false)
    setView('store')
    toast.success('Sesión cerrada')
  }

  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    analytics: 'Analíticas',
    products: 'Productos',
    categories: 'Categorías',
    bundles: 'Bundles / Combos',
    costs: 'Costos y márgenes',
    orders: 'Pedidos',
    agenda: 'Agenda de producción',
    reviews: 'Reseñas',
    questions: 'Preguntas y respuestas',
    customRequests: 'Pedidos personalizados',
    coupons: 'Cupones de descuento',
    loyalty: 'Programa de puntos',
    blog: 'Blog',
    stories: 'Stories del taller',
    gallery: 'Galería',
    testimonials: 'Testimonios',
    faq: 'Preguntas frecuentes',
    newsletter: 'Newsletter',
    emails: 'Emails',
    stockNotifications: 'Alertas de stock',
    backups: 'Backups',
    sections: 'Secciones',
    site: 'Configuración del sitio',
  }

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
        <AdminSidebar />
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('store')}
            className="w-full justify-start"
          >
            <Store className="h-4 w-4 mr-2" /> Ver tienda
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Sidebar móvil */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-30"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menú admin</SheetTitle>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setView('store')
                setMobileOpen(false)
              }}
              className="w-full justify-start"
            >
              <Store className="h-4 w-4 mr-2" /> Ver tienda
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleLogout()
                setMobileOpen(false)
              }}
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <header className="bg-background border-b border-border px-4 md:px-8 py-4 md:py-6 sticky top-0 z-20">
          <div className="ml-12 md:ml-0 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold capitalize">
                {titles[adminSection] || 'Admin'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Panel de administración · CROCHETERA.CIX
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {adminSection === 'dashboard' && <AdminDashboard />}
          {adminSection === 'analytics' && <AdminAnalytics />}
          {adminSection === 'products' && <AdminProducts />}
          {adminSection === 'categories' && <AdminCategories />}
          {adminSection === 'bundles' && <AdminBundles />}
          {adminSection === 'costs' && <AdminCosts />}
          {adminSection === 'orders' && <AdminOrders />}
          {adminSection === 'agenda' && <AdminAgenda />}
          {adminSection === 'reviews' && <AdminReviews />}
          {adminSection === 'questions' && <AdminQuestions />}
          {adminSection === 'customRequests' && <AdminCustomRequests />}
          {adminSection === 'coupons' && <AdminCoupons />}
          {adminSection === 'loyalty' && <AdminLoyalty />}
          {adminSection === 'blog' && <AdminBlog />}
          {adminSection === 'stories' && <AdminStories />}
          {adminSection === 'gallery' && <AdminGallery />}
          {adminSection === 'testimonials' && <AdminTestimonials />}
          {adminSection === 'faq' && <AdminFAQ />}
          {adminSection === 'newsletter' && <AdminNewsletter />}
          {adminSection === 'emails' && <AdminEmails />}
          {adminSection === 'stockNotifications' && <AdminStockNotifications />}
          {adminSection === 'backups' && <AdminBackups />}
          {adminSection === 'sections' && <AdminSections />}
          {adminSection === 'site' && <AdminSite />}
        </div>
      </main>
    </div>
  )
}
