import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  const sections = await db.section.findMany({
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(sections)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const section = await db.section.create({
    data: {
      key: body.key,
      title: body.title,
      subtitle: body.subtitle || null,
      content: body.content || null,
      visible: body.visible ?? true,
      order: body.order || 0,
      config: body.config || null,
    },
  })
  return NextResponse.json(section, { status: 201 })
}
