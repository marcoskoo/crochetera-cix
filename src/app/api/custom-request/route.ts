import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET - lista pedidos personalizados (admin)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const list = await db.customRequest.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(list)
}

// POST - crear solicitud pública
export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.name || !body.email || !body.phone || !body.description) {
    return NextResponse.json(
      { error: 'Faltan campos obligatorios' },
      { status: 400 },
    )
  }
  const item = await db.customRequest.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      description: body.description,
      budget: body.budget || null,
      deadline: body.deadline || null,
      referenceImageUrl: body.referenceImageUrl || null,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
