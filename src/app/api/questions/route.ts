import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  if (!productId) return NextResponse.json([])
  const questions = await db.productQuestion.findMany({
    where: { productId, approved: true, answer: { not: null } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(questions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.productId || !body.author || !body.question) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }
  const q = await db.productQuestion.create({
    data: { productId: body.productId, author: body.author, question: body.question },
  })
  return NextResponse.json(q, { status: 201 })
}
