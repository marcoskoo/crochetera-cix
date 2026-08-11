import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/loyalty/lookup - buscar cuenta por email y devolver puntos
export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  const account = await db.loyaltyAccount.findUnique({
    where: { email },
    select: { points: true, totalEarned: true, totalSpent: true, name: true },
  })
  if (!account) return NextResponse.json({ found: false })
  return NextResponse.json({ found: true, ...account })
}
