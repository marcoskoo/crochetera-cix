import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'
import { uniqueSlug } from '@/lib/site'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const existing = await db.category.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  }
  let slug = existing.slug
  if (body.name && body.name !== existing.name) {
    slug = await uniqueSlug(body.name, 'category', id)
  }
  const updated = await db.category.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      slug,
      description: body.description !== undefined ? body.description || null : existing.description,
      icon: body.icon !== undefined ? body.icon || null : existing.icon,
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
  await db.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
