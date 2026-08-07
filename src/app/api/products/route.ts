import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'
import { uniqueSlug } from '@/lib/site'

// GET /api/products - lista pública (solo activos) o completa (admin)
export async function GET(req: NextRequest) {
  const authed = await isAuthenticated()
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = {}
  if (!authed) where.status = 'active'
  if (category && category !== 'all') where.category = { slug: category }
  if (featured === 'true') where.featured = true
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { tags: { contains: search } },
    ]
  }

  const products = await db.product.findMany({
    where,
    include: {
      images: { orderBy: { order: 'asc' } },
      videos: { orderBy: { order: 'asc' } },
      reviews: { where: { approved: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

// POST /api/products - crear (admin)
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const slug = await uniqueSlug(body.name || 'producto', 'product')

  const product = await db.product.create({
    data: {
      name: body.name,
      slug,
      description: body.description || '',
      price: parseFloat(body.price) || 0,
      oldPrice: body.oldPrice ? parseFloat(body.oldPrice) : null,
      categoryId: body.categoryId || null,
      stock: parseInt(body.stock) || 0,
      unlimited: body.unlimited || false,
      featured: body.featured || false,
      status: body.status || 'active',
      size: body.size || null,
      material: body.material || null,
      height: body.height || null,
      weight: body.weight || null,
      productionDays: body.productionDays ? parseInt(body.productionDays) : null,
      tags: body.tags || null,
      images: body.images?.length
        ? { create: body.images.map((img: { url: string; alt?: string; isMain?: boolean }, i: number) => ({
            url: img.url,
            alt: img.alt || null,
            isMain: img.isMain ?? i === 0,
            order: i,
          })) }
        : undefined,
      videos: body.videos?.length
        ? { create: body.videos.map((v: { url: string; type?: string; title?: string }, i: number) => ({
            url: v.url,
            type: v.type || 'youtube',
            title: v.title || null,
            order: i,
          })) }
        : undefined,
    },
    include: {
      images: { orderBy: { order: 'asc' } },
      videos: { orderBy: { order: 'asc' } },
      reviews: true,
      category: true,
    },
  })
  return NextResponse.json(product, { status: 201 })
}
