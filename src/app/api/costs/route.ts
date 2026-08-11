import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET - lista todos los costos (admin)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const costs = await db.productCost.findMany({
    include: { product: { select: { id: true, name: true, price: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(costs)
}

// POST - crear o actualizar costo (admin)
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const { productId, materialCost, laborCost, shippingCost, otherCost } = body
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })

  const cost = await db.productCost.upsert({
    where: { productId },
    create: {
      productId,
      materialCost: parseFloat(materialCost) || 0,
      laborCost: parseFloat(laborCost) || 0,
      shippingCost: parseFloat(shippingCost) || 0,
      otherCost: parseFloat(otherCost) || 0,
    },
    update: {
      materialCost: parseFloat(materialCost) || 0,
      laborCost: parseFloat(laborCost) || 0,
      shippingCost: parseFloat(shippingCost) || 0,
      otherCost: parseFloat(otherCost) || 0,
    },
  })
  return NextResponse.json(cost)
}
