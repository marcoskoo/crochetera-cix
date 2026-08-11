import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET /api/bundles - lista bundles activos (público) o todos (admin)
export async function GET() {
  const authed = await isAuthenticated()
  const bundles = await db.bundle.findMany({
    where: authed ? {} : { active: true },
    include: {
      items: {
        include: { product: { include: { images: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(bundles)
}

// POST - crear (admin)
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const bundle = await db.bundle.create({
    data: {
      name: body.name,
      slug,
      description: body.description || '',
      price: parseFloat(body.price),
      originalTotal: parseFloat(body.originalTotal),
      imageUrl: body.imageUrl || null,
      active: body.active ?? true,
      featured: body.featured ?? false,
      items: body.items?.length
        ? {
            create: body.items.map((it: { productId: string; quantity?: number }) => ({
              productId: it.productId,
              quantity: it.quantity || 1,
            })),
          }
        : undefined,
    },
    include: { items: { include: { product: true } } },
  })
  return NextResponse.json(bundle, { status: 201 })
}
