import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET /api/reviews?productId=xxx - lista reseñas aprobadas de un producto
// GET /api/reviews?all=true - lista todas (solo admin)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const all = searchParams.get('all') === 'true'
  const authed = await isAuthenticated()

  if (all && authed) {
    const reviews = await db.review.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reviews)
  }

  if (productId) {
    const reviews = await db.review.findMany({
      where: { productId, approved: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reviews)
  }

  return NextResponse.json([])
}

// POST /api/reviews - cualquier usuario puede crear (pendiente de aprobación)
export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.productId || !body.author || !body.comment) {
    return NextResponse.json(
      { error: 'Faltan campos obligatorios' },
      { status: 400 },
    )
  }
  const review = await db.review.create({
    data: {
      productId: body.productId,
      author: body.author,
      rating: Math.min(5, Math.max(1, parseInt(body.rating) || 5)),
      comment: body.comment,
      approved: false,
    },
  })
  return NextResponse.json(review, { status: 201 })
}
