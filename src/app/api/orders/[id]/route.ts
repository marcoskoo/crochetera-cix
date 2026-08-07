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
  const existing = await db.order.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }
  const updated = await db.order.update({
    where: { id },
    data: { status: body.status ?? existing.status },
    include: { items: { include: { product: true } } },
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
  await db.order.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
