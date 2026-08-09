import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/orders/track?id=xxx&phone=xxx - seguimiento público por ID + teléfono
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const phone = searchParams.get('phone')?.replace(/\s/g, '')

  if (!id || !phone) {
    return NextResponse.json(
      { error: 'ID de pedido y teléfono son obligatorios' },
      { status: 400 },
    )
  }

  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  })

  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  // Validar teléfono (últimos 6 dígitos)
  const orderPhoneDigits = order.customerPhone.replace(/\D/g, '').slice(-6)
  const inputPhoneDigits = phone.replace(/\D/g, '').slice(-6)
  if (orderPhoneDigits !== inputPhoneDigits) {
    return NextResponse.json({ error: 'Datos no coinciden' }, { status: 403 })
  }

  // Devolver solo info pública
  return NextResponse.json({
    id: order.id,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    customerName: order.customerName,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      imageUrl: i.imageUrl,
    })),
  })
}
