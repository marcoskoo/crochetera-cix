import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/stock-notify - suscripción pública a notificación de stock
export async function POST(req: NextRequest) {
  const { productId, email, phone } = await req.json()
  if (!productId || !email) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }
  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }
  // Evitar duplicados
  const existing = await db.stockNotification.findFirst({
    where: { productId, email, notified: false },
  })
  if (existing) {
    return NextResponse.json({ ok: true, already: true })
  }
  await db.stockNotification.create({
    data: { productId, email, phone: phone || null },
  })
  return NextResponse.json({ ok: true }, { status: 201 })
}

// GET - lista suscriptores (admin)
export async function GET() {
  const { isAuthenticated } = await import('@/lib/auth')
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const list = await db.stockNotification.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(list)
}
