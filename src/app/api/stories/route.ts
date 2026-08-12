import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET /api/stories - lista stories activos no expirados
export async function GET() {
  const now = new Date()
  const authed = await isAuthenticated()
  const stories = await db.story.findMany({
    where: authed
      ? {}
      : {
          active: true,
          expiresAt: { gte: now },
        },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(stories)
}

// POST - crear (admin)
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const hours = body.hours || 24
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000)
  const story = await db.story.create({
    data: {
      title: body.title || null,
      imageUrl: body.imageUrl,
      videoUrl: body.videoUrl || null,
      link: body.link || null,
      expiresAt,
      active: body.active ?? true,
    },
  })
  return NextResponse.json(story, { status: 201 })
}
