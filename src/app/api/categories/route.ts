import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'
import { uniqueSlug } from '@/lib/site'

// GET /api/categories
export async function GET() {
  const cats = await db.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  return NextResponse.json(cats)
}

// POST /api/categories
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const slug = await uniqueSlug(body.name || 'categoria', 'category')
  const cat = await db.category.create({
    data: {
      name: body.name,
      slug,
      description: body.description || null,
      icon: body.icon || null,
      order: body.order || 0,
      visible: body.visible ?? true,
    },
  })
  return NextResponse.json(cat, { status: 201 })
}
