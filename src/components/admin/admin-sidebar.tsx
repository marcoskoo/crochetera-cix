'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Settings,
  LayoutList,
  Image,
  MessageSquareQuote,
  Star,
  HelpCircle,
  Mail,
  Sparkles,
  Bell,
  Ticket,
  BookOpen,
  MessageCircle,
  Box,
  Camera,
  Gift,
  BarChart3,
  DollarSign,
  CalendarDays,
  DatabaseBackup,
  MailCheck,
} from 'lucide-react'
import type { AdminSection } from '@/lib/admin-types'

type NavItem = {
  key: AdminSection
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'analytics', label: 'Analíticas', icon: BarChart3 },
  { key: 'products', label: 'Productos', icon: Package },
  { key: 'categories', label: 'Categorías', icon: FolderTree },
  { key: 'bundles', label: 'Bundles', icon: Box },
  { key: 'costs', label: 'Costos/Márgenes', icon: DollarSign },
  { key: 'orders', label: 'Pedidos', icon: ShoppingBag },
  { key: 'agenda', label: 'Agenda', icon: CalendarDays },
  { key: 'reviews', label: 'Reseñas', icon: Star },
  { key: 'questions', label: 'Preguntas', icon: MessageCircle },
  { key: 'customRequests', label: 'Pedidos custom', icon: Sparkles },
  { key: 'coupons', label: 'Cupones', icon: Ticket },
  { key: 'loyalty', label: 'Puntos', icon: Gift },
  { key: 'blog', label: 'Blog', icon: BookOpen },
  { key: 'stories', label: 'Stories', icon: Camera },
  { key: 'gallery', label: 'Galería', icon: Image },
  { key: 'testimonials', label: 'Testimonios', icon: MessageSquareQuote },
  { key: 'faq', label: 'FAQ', icon: HelpCircle },
  { key: 'newsletter', label: 'Newsletter', icon: Mail },
  { key: 'emails', label: 'Emails', icon: MailCheck },
  { key: 'stockNotifications', label: 'Alertas stock', icon: Bell },
  { key: 'backups', label: 'Backups', icon: DatabaseBackup },
  { key: 'sections', label: 'Secciones', icon: LayoutList },
  { key: 'site', label: 'Configuración', icon: Settings },
]

interface AdminSidebarProps {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const adminSection = useStore((s) => s.adminSection)
  const setAdminSection = useStore((s) => s.setAdminSection)

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
            C
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-none">
              CROCHETERA<span className="text-primary">.CIX</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Panel admin</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = adminSection === item.key
          return (
            <Button
              key={item.key}
              variant={active ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setAdminSection(item.key)
                onNavigate?.()
              }}
              className={`w-full justify-start ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-sidebar-accent'
              }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
