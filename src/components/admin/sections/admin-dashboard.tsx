'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Package,
  ShoppingBag,
  FolderTree,
  MessageSquareQuote,
  TrendingUp,
  Euro,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/site'
import { adminFetch } from '@/lib/admin-fetch'
import Link from 'next/link'

interface DashboardStats {
  products: number
  categories: number
  orders: number
  testimonials: number
  totalRevenue: number
  pendingOrders: number
  lowStock: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const setAdminSection = useStore((s) => s.setAdminSection)
  const siteConfig = useStore((s) => s.siteConfig)

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes, ordRes, tRes] = await Promise.all([
          adminFetch('/api/products'),
          adminFetch('/api/categories'),
          adminFetch('/api/orders'),
          adminFetch('/api/testimonials'),
        ])
        const products = prodRes.ok ? await prodRes.json() : []
        const categories = catRes.ok ? await catRes.json() : []
        const orders = ordRes.ok ? await ordRes.json() : []
        const testimonials = tRes.ok ? await tRes.json() : []
        const totalRevenue = orders.reduce(
          (sum: number, o: any) => sum + (o.total || 0),
          0,
        )
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length
        const lowStock = products.filter(
          (p: any) => !p.unlimited && p.stock <= 2,
        ).length
        setStats({
          products: products.length,
          categories: categories.length,
          orders: orders.length,
          testimonials: testimonials.length,
          totalRevenue,
          pendingOrders,
          lowStock,
        })
        setRecentOrders(orders.slice(0, 5))
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    {
      label: 'Productos',
      value: stats?.products ?? 0,
      icon: Package,
      color: 'bg-pink-100 text-pink-600',
      action: () => setAdminSection('products'),
    },
    {
      label: 'Categorías',
      value: stats?.categories ?? 0,
      icon: FolderTree,
      color: 'bg-orange-100 text-orange-600',
      action: () => setAdminSection('categories'),
    },
    {
      label: 'Pedidos',
      value: stats?.orders ?? 0,
      icon: ShoppingBag,
      color: 'bg-purple-100 text-purple-600',
      action: () => setAdminSection('orders'),
    },
    {
      label: 'Testimonios',
      value: stats?.testimonials ?? 0,
      icon: MessageSquareQuote,
      color: 'bg-amber-100 text-amber-600',
      action: () => setAdminSection('testimonials'),
    },
    {
      label: 'Ingresos totales',
      value: formatPrice(stats?.totalRevenue ?? 0, siteConfig?.currency),
      icon: Euro,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Pedidos pendientes',
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      action: () => setAdminSection('orders'),
    },
    {
      label: 'Stock bajo',
      value: stats?.lowStock ?? 0,
      icon: TrendingUp,
      color: 'bg-red-100 text-red-600',
      action: () => setAdminSection('products'),
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/20">
        <h2 className="font-display text-2xl font-bold mb-1">
          ¡Bienvenida, Ashley! 🧶
        </h2>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu tienda. Gestiona productos, pedidos y más.
        </p>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`p-5 ${card.action ? 'cursor-pointer hover:shadow-md transition' : ''}`}
              onClick={card.action}
            >
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                <card.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pedidos recientes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Pedidos recientes</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAdminSection('orders')}
          >
            Ver todos →
          </Button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-50" />
            Aún no hay pedidos.
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition"
              >
                <div>
                  <p className="font-medium text-sm">#{o.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{o.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {formatPrice(o.total, siteConfig?.currency)}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString('es-PE')}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    o.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : o.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick links */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Acciones rápidas</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => setAdminSection('products')}
            className="justify-start h-auto py-3"
          >
            <Package className="h-5 w-5 mr-2 text-primary" />
            <div className="text-left">
              <p className="font-medium">Agregar producto</p>
              <p className="text-xs text-muted-foreground">Sube un nuevo peluche</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => setAdminSection('site')}
            className="justify-start h-auto py-3"
          >
            <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
            <div className="text-left">
              <p className="font-medium">Editar sitio</p>
              <p className="text-xs text-muted-foreground">Hero, about, contacto</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => setAdminSection('gallery')}
            className="justify-start h-auto py-3"
          >
            <MessageSquareQuote className="h-5 w-5 mr-2 text-primary" />
            <div className="text-left">
              <p className="font-medium">Subir fotos</p>
              <p className="text-xs text-muted-foreground">Galería de trabajos</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  )
}
