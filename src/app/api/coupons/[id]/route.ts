import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const existing = await db.coupon.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  const updated = await db.coupon.update({
    where: { id },
    data: {
      code: body.code ? body.code.toUpperCase().trim() : existing.code,
      type: body.type ?? existing.type,
      value: body.value !== undefined ? parseFloat(body.value) : existing.value,
      minOrder: body.minOrder !== undefined ? (body.minOrder ? parseFloat(body.minOrder) : null) : existing.minOrder,
      maxUses: body.maxUses !== undefined ? (body.maxUses ? parseInt(body.maxUses) : null) : existing.maxUses,
      validFrom: body.validFrom !== undefined ? (body.validFrom ? new Date(body.validFrom) : null) : existing.validFrom,
      validUntil: body.validUntil !== undefined ? (body.validUntil ? new Date(body.validUntil) : null) : existing.validUntil,
      active: body.active ?? existing.active,
      description: body.description !== undefined ? body.description : existing.description,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  await db.coupon.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
