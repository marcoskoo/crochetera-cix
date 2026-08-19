import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  const authed = await isAuthenticated()
  if (authed) {
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(coupons)
  }
  const now = new Date()
  const coupons = await db.coupon.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
        { OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
      ],
    },
    select: { code: true, type: true, value: true, minOrder: true, description: true },
  })
  return NextResponse.json(coupons)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const coupon = await db.coupon.create({
    data: {
      code: body.code.toUpperCase().trim(),
      type: body.type || 'percent',
      value: parseFloat(body.value),
      minOrder: body.minOrder ? parseFloat(body.minOrder) : null,
      maxUses: body.maxUses ? parseInt(body.maxUses) : null,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      active: body.active ?? true,
      description: body.description || null,
    },
  })
  return NextResponse.json(coupon, { status: 201 })
}
