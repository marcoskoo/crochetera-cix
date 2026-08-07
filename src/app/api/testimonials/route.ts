import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  const t = await db.testimonial.findMany({
    where: { visible: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(t)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const t = await db.testimonial.create({
    data: {
      name: body.name,
      message: body.message,
      rating: body.rating || 5,
      avatarUrl: body.avatarUrl || null,
      location: body.location || null,
      visible: body.visible ?? true,
      order: body.order || 0,
    },
  })
  return NextResponse.json(t, { status: 201 })
}
