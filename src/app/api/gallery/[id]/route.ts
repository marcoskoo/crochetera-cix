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
  const existing = await db.galleryImage.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  }
  const updated = await db.galleryImage.update({
    where: { id },
    data: {
      url: body.url ?? existing.url,
      title: body.title !== undefined ? body.title || null : existing.title,
      caption: body.caption !== undefined ? body.caption || null : existing.caption,
      category: body.category !== undefined ? body.category || null : existing.category,
      order: body.order ?? existing.order,
      visible: body.visible ?? existing.visible,
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
  await db.galleryImage.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
