import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { code, total } = await req.json()
  if (!code || !total) {
    return NextResponse.json({ error: 'Código y total son requeridos' }, { status: 400 })
  }
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } })
  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, error: 'Cupón no válido' }, { status: 404 })
  }
  const now = new Date()
  if (coupon.validFrom && coupon.validFrom > now) {
    return NextResponse.json({ valid: false, error: 'El cupón aún no está vigente' }, { status: 400 })
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return NextResponse.json({ valid: false, error: 'El cupón ha expirado' }, { status: 400 })
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, error: 'El cupón alcanzó su límite de uso' }, { status: 400 })
  }
  if (coupon.minOrder && total < coupon.minOrder) {
    return NextResponse.json({ valid: false, error: `Compra mínimo de S/ ${coupon.minOrder.toFixed(2)} para usar este cupón` }, { status: 400 })
  }
  const discount = coupon.type === 'percent' ? (total * coupon.value) / 100 : Math.min(coupon.value, total)
  return NextResponse.json({ valid: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, description: coupon.description }, discount, newTotal: Math.max(0, total - discount) })
}
