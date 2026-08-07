import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET - lista pedidos (admin) o solo info pública
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const orders = await db.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

// POST - crea un pedido público
export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.items?.length || !body.customerName || !body.customerPhone) {
    return NextResponse.json(
      { error: 'Faltan datos obligatorios' },
      { status: 400 },
    )
  }
  const total = body.items.reduce(
    (sum: number, i: { price: number; quantity: number }) =>
      sum + i.price * i.quantity,
    0,
  )
  const order = await db.order.create({
    data: {
      customerName: body.customerName,
      customerEmail: body.customerEmail || null,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress || null,
      notes: body.notes || null,
      total,
      status: 'pending',
      items: {
        create: body.items.map(
          (i: {
            productId?: string
            name: string
            price: number
            quantity: number
            imageUrl?: string
          }) => ({
            productId: i.productId || null,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            imageUrl: i.imageUrl || null,
          }),
        ),
      },
    },
    include: { items: true },
  })
  return NextResponse.json(order, { status: 201 })
}
