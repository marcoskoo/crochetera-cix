import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const existing = await db.productionEvent.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const updated = await db.productionEvent.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      description: body.description !== undefined ? body.description : existing.description,
      startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
      endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
      status: body.status ?? existing.status,
      color: body.color ?? existing.color,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  await db.productionEvent.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
