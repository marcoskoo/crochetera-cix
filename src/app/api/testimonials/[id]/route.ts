import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const existing = await db.testimonial.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }
  const updated = await db.testimonial.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      message: body.message ?? existing.message,
      rating: body.rating ?? existing.rating,
      avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl || null : existing.avatarUrl,
      location: body.location !== undefined ? body.location || null : existing.location,
      visible: body.visible ?? existing.visible,
      order: body.order ?? existing.order,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  await db.testimonial.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
