import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  const authed = await isAuthenticated()
  const posts = await db.blogPost.findMany({
    where: authed ? {} : { published: true },
    orderBy: { publishedAt: 'desc' },
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const post = await db.blogPost.create({
    data: {
      title: body.title,
      slug,
      excerpt: body.excerpt || '',
      content: body.content || '',
      coverImage: body.coverImage || null,
      author: body.author || 'CROCHETERA.CIX',
      tags: body.tags || null,
      published: body.published ?? false,
      featured: body.featured ?? false,
      publishedAt: body.published ? new Date() : null,
    },
  })
  return NextResponse.json(post, { status: 201 })
}
