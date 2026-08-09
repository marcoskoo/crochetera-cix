import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET /api/faq - lista FAQs visibles (público) o todas (admin)
export async function GET() {
  const authed = await isAuthenticated()
  const faqs = await db.fAQ.findMany({
    where: authed ? {} : { visible: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(faqs)
}

// POST - crear (admin)
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const faq = await db.fAQ.create({
    data: {
      question: body.question,
      answer: body.answer,
      category: body.category || 'General',
      order: body.order || 0,
      visible: body.visible ?? true,
    },
  })
  return NextResponse.json(faq, { status: 201 })
}
