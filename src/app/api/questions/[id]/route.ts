import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const existing = await db.productQuestion.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  const updated = await db.productQuestion.update({
    where: { id },
    data: {
      answer: body.answer ?? existing.answer,
      answeredBy: body.answer ? (body.answeredBy || 'Admin') : existing.answeredBy,
      approved: body.approved ?? existing.approved,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  await db.productQuestion.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
