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
  const existing = await db.fAQ.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  const updated = await db.fAQ.update({
    where: { id },
    data: {
      question: body.question ?? existing.question,
      answer: body.answer ?? existing.answer,
      category: body.category ?? existing.category,
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
  await db.fAQ.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
