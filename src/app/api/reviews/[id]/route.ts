import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// PUT /api/reviews/[id] - aprobar/desaprobar o editar (admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const existing = await db.review.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  const updated = await db.review.update({
    where: { id },
    data: {
      author: body.author ?? existing.author,
      rating: body.rating ?? existing.rating,
      comment: body.comment ?? existing.comment,
      approved: body.approved ?? existing.approved,
    },
  })
  return NextResponse.json(updated)
}

// DELETE /api/reviews/[id] - eliminar (admin)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  await db.review.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
