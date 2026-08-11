import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'
import { slugify } from '@/lib/site'

// GET /api/blog - lista pública (solo publicados) o completa (admin)
export async function GET(req: NextRequest) {
  const authed = await isAuthenticated()
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured')
  const limit = searchParams.get('limit')

  const where: Record<string, unknown> = {}
  if (!authed) where.published = true
  if (featured === 'true') where.featured = true

  const posts = await db.blogPost.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    ...(limit ? { take: parseInt(limit, 10) } : {}),
  })
  return NextResponse.json(posts)
}

// POST /api/blog - crear artículo (admin)
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const title = (body.title || '').trim()
  if (!title) {
    return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
  }

  let slug = slugify(title) || 'articulo'
  let counter = 1
  while (await db.blogPost.findUnique({ where: { slug } })) {
    slug = `${slugify(title)}-${counter}`
    counter++
  }

  const post = await db.blogPost.create({
    data: {
      title,
      slug,
      excerpt: body.excerpt || '',
      content: body.content || '',
      coverImage: body.coverImage || null,
      tags: body.tags || null,
      published: body.published || false,
      featured: body.featured || false,
      author: body.author || 'CROCHETERA.CIX',
      publishedAt: body.published ? new Date() : null,
    },
  })
  return NextResponse.json(post, { status: 201 })
}
