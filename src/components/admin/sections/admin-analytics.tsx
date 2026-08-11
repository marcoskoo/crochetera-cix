'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, ShoppingBag, Euro, Package, Users, Star, Ticket, Box, Camera, MessageSquare,
  Download,
} from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/site'

const COLORS = ['#E91E63', '#FFC107', '#8D6E63', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800']

interface Analytics {
  totals: {
    products: number; orders: number; revenue: number; avgTicket: number;
    subscribers: number; customRequests: number; pendingReviews: number;
    coupons: number; bundles: number; stories: number;
  }
  salesByDay: { date: string; total: number }[]
  topProducts: { name: string; count: number; revenue: number; image?: string }[]
  categorySales: { category: string; total: number }[]
  orderStatusCount: Record<string, number>
  recentOrders: any[]
}

export function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const setAdminSection = useStore((s) => s.setAdminSection)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  useEffect(() => {
    adminFetch('/api/analytics/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!data) {
    return <Card className="p-8 text-center text-muted-foreground">Error al cargar métricas</Card>
  }

  const stats = [
    { label: 'Ingresos totales', value: formatPrice(data.totals.revenue, currency), icon: Euro, color: 'bg-green-100 text-green-600', action: () => setAdminSection('orders') },
    { label: 'Pedidos', value: data.totals.orders, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600', action: () => setAdminSection('orders') },
    { label: 'Ticket promedio', value: formatPrice(data.totals.avgTicket, currency), icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { label: 'Productos', value: data.totals.products, icon: Package, color: 'bg-pink-100 text-pink-600', action: () => setAdminSection('products') },
    { label: 'Suscriptores', value: data.totals.subscribers, icon: Users, color: 'bg-orange-100 text-orange-600', action: () => setAdminSection('newsletter') },
    { label: 'Pedidos custom', value: data.totals.customRequests, icon: Star, color: 'bg-yellow-100 text-yellow-600', action: () => setAdminSection('customRequests') },
    { label: 'Reseñas pend.', value: data.totals.pendingReviews, icon: MessageSquare, color: 'bg-red-100 text-red-600', action: () => setAdminSection('reviews') },
    { label: 'Cupones', value: data.totals.coupons, icon: Ticket, color: 'bg-indigo-100 text-indigo-600', action: () => setAdminSection('coupons') },
    { label: 'Bundles', value: data.totals.bundles, icon: Box, color: 'bg-teal-100 text-teal-600', action: () => setAdminSection('bundles') },
    { label: 'Stories activas', value: data.totals.stories, icon: Camera, color: 'bg-fuchsia-100 text-fuchsia-600', action: () => setAdminSection('stories') },
  ]

  const exportAnalytics = () => {
    const csv = [
      'Metrica,Valor',
      `Ingresos totales,${data.totals.revenue}`,
      `Pedidos,${data.totals.orders}`,
      `Ticket promedio,${data.totals.avgTicket}`,
      `Productos,${data.totals.products}`,
      `Suscriptores,${data.totals.subscribers}`,
      `Pedidos custom,${data.totals.customRequests}`,
      `Reseñas pendientes,${data.totals.pendingReviews}`,
      `Cupones activos,${data.totals.coupons}`,
      `Bundles,${data.totals.bundles}`,
      `Stories activas,${data.totals.stories}`,
      '',
      'Top productos',
      'Producto,Cantidad vendida,Ingresos',
      ...data.topProducts.map((p) => `"${p.name}",${p.count},${p.revenue}`),
    ].join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportAnalytics}>
          <Download className="h-4 w-4 mr-1" /> Exportar reporte
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={`p-4 ${stat.action ? 'cursor-pointer hover:shadow-md transition' : ''}`}
            onClick={stat.action}
          >
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Sales by day */}
      {data.salesByDay.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Ventas últimos 30 días</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.salesByDay}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E91E63" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E91E63" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) => formatPrice(value, currency)}
                labelStyle={{ fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#E91E63"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top productos */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Top 5 productos más vendidos</h3>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aún no hay ventas registradas
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  width={100}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#E91E63" radius={[0, 4, 4, 0]} name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Categorías */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Ventas por categoría</h3>
          {data.categorySales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aún no hay ventas registradas
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.categorySales}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => entry.category}
                  labelLine={false}
                >
                  {data.categorySales.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatPrice(value, currency)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Estado de pedidos */}
      {Object.keys(data.orderStatusCount).length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Estado de pedidos</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.orderStatusCount).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <span className="text-2xl font-bold text-primary">{count}</span>
                <span className="text-sm text-muted-foreground capitalize">{status}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pedidos recientes */}
      {data.recentOrders.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Pedidos recientes</h3>
          <div className="space-y-2">
            {data.recentOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded">
                <div>
                  <p className="font-mono text-xs">#{o.id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm font-medium">{o.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">{formatPrice(o.total, currency)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString('es-PE')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
