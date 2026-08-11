import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET /api/costs/[productId] - obtener costo de un producto
export async function GET(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { productId } = await params
  const cost = await db.productCost.findUnique({ where: { productId } })
  return NextResponse.json(cost || { materialCost: 0, laborCost: 0, shippingCost: 0, otherCost: 0 })
}
