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
  const existing = await db.section.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  }
  const updated = await db.section.update({
    where: { id },
    data: {
      key: body.key ?? existing.key,
      title: body.title ?? existing.title,
      subtitle: body.subtitle !== undefined ? body.subtitle || null : existing.subtitle,
      content: body.content !== undefined ? body.content || null : existing.content,
      visible: body.visible ?? existing.visible,
      order: body.order ?? existing.order,
      config: body.config !== undefined ? body.config || null : existing.config,
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
  await db.section.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
