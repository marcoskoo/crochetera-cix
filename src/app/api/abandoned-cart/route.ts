import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/abandoned-cart - guardar carrito abandonado
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, phone, items, total } = body
  if (!items?.length || (!email && !phone)) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }
  const cart = await db.abandonedCart.create({
    data: {
      email: email || null,
      phone: phone || null,
      items: JSON.stringify(items),
      total: parseFloat(total) || 0,
    },
  })
  return NextResponse.json({ ok: true, id: cart.id }, { status: 201 })
}
