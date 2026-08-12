import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const existing = await db.bundle.findUnique({ where: { id }, include: { items: true } })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  // Reemplazar items si vienen
  if (body.items !== undefined) {
    await db.bundleItem.deleteMany({ where: { bundleId: id } })
    if (Array.isArray(body.items) && body.items.length > 0) {
      await db.bundleItem.createMany({
        data: body.items.map((it: { productId: string; quantity?: number }) => ({
          bundleId: id,
          productId: it.productId,
          quantity: it.quantity || 1,
        })),
      })
    }
  }

  const updated = await db.bundle.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      price: body.price !== undefined ? parseFloat(body.price) : existing.price,
      originalTotal: body.originalTotal !== undefined ? parseFloat(body.originalTotal) : existing.originalTotal,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
      active: body.active ?? existing.active,
      featured: body.featured ?? existing.featured,
    },
    include: { items: { include: { product: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  await db.bundle.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
