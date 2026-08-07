import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  const images = await db.galleryImage.findMany({
    where: { visible: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(images)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const img = await db.galleryImage.create({
    data: {
      url: body.url,
      title: body.title || null,
      caption: body.caption || null,
      category: body.category || null,
      order: body.order || 0,
      visible: body.visible ?? true,
    },
  })
  return NextResponse.json(img, { status: 201 })
}
