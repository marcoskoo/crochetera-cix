import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const events = await db.productionEvent.findMany({
    orderBy: { startDate: 'asc' },
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const event = await db.productionEvent.create({
    data: {
      title: body.title,
      description: body.description || null,
      orderId: body.orderId || null,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      color: body.color || '#E91E63',
      status: body.status || 'scheduled',
    },
  })
  return NextResponse.json(event, { status: 201 })
}
