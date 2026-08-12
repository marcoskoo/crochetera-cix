import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET /api/analytics/dashboard - métricas para dashboard
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [products, orders, coupons, subscribers, customRequests, reviews, bundles, stories] = await Promise.all([
    db.product.findMany({ include: { images: true, category: true } }),
    db.order.findMany({ include: { items: true } }),
    db.coupon.findMany(),
    db.newsletterSubscriber.findMany(),
    db.customRequest.findMany(),
    db.review.findMany(),
    db.bundle.findMany(),
    db.story.findMany(),
  ])

  // Ventas por día (últimos 30 días)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentOrders = orders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo)
  const salesByDay: Record<string, number> = {}
  recentOrders.forEach((o) => {
    const day = new Date(o.createdAt).toISOString().slice(0, 10)
    salesByDay[day] = (salesByDay[day] || 0) + o.total
  })

  // Top productos más vendidos
  const productSales: Record<string, { name: string; count: number; revenue: number; image?: string }> = {}
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (item.productId) {
        const product = products.find((p) => p.id === item.productId)
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.name,
            count: 0,
            revenue: 0,
            image: product?.images[0]?.url,
          }
        }
        productSales[item.productId].count += item.quantity
        productSales[item.productId].revenue += item.price * item.quantity
      }
    })
  })
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Ventas por categoría
  const categorySales: Record<string, number> = {}
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      const cat = product?.category?.name || 'Sin categoría'
      categorySales[cat] = (categorySales[cat] || 0) + item.price * item.quantity
    })
  })

  // Estado de pedidos
  const orderStatusCount: Record<string, number> = {}
  orders.forEach((o) => {
    orderStatusCount[o.status] = (orderStatusCount[o.status] || 0) + 1
  })

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0

  return NextResponse.json({
    totals: {
      products: products.length,
      orders: orders.length,
      revenue: totalRevenue,
      avgTicket,
      subscribers: subscribers.length,
      customRequests: customRequests.length,
      pendingReviews: reviews.filter((r) => !r.approved).length,
      coupons: coupons.filter((c) => c.active).length,
      bundles: bundles.length,
      stories: stories.filter((s) => new Date(s.expiresAt) > new Date()).length,
    },
    salesByDay: Object.entries(salesByDay)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topProducts,
    categorySales: Object.entries(categorySales).map(([category, total]) => ({ category, total })),
    orderStatusCount,
    recentOrders: recentOrders.slice(0, 5).map((o) => ({
      id: o.id,
      customer: o.customerName,
      total: o.total,
      status: o.status,
      date: o.createdAt,
    })),
  })
}
