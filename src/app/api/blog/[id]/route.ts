import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET /api/blog/[id] - detalle de artículo. Incrementa vistas.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const post = await db.blogPost.findUnique({ where: { id } })
  if (!post || !post.published) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }
  // Incrementar vistas sin bloquear la respuesta
  db.blogPost.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {})
  return NextResponse.json(post)
}

// PUT /api/blog/[id] - actualizar artículo (admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()

  const existing = await db.blogPost.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  // Si se está publicando por primera vez, asignar publishedAt
  const publishNow = body.published && !existing.published && !existing.publishedAt

  const updated = await db.blogPost.update({
    where: { id },
    data: {
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage || null,
      tags: body.tags || null,
      published: body.published,
      featured: body.featured,
      author: body.author || existing.author,
      ...(publishNow ? { publishedAt: new Date() } : {}),
    },
  })
  return NextResponse.json(updated)
}

// DELETE /api/blog/[id] - eliminar artículo (admin)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  await db.blogPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
