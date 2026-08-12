import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET - lista cuentas (admin)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const accounts = await db.loyaltyAccount.findMany({
    include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(accounts)
}

// POST - registrar/lookup cuenta por email (público)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, name, phone } = body
  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

  let account = await db.loyaltyAccount.findUnique({ where: { email } })
  if (!account) {
    // Crear cuenta con 50 puntos de bienvenida
    account = await db.loyaltyAccount.create({
      data: {
        email,
        name: name || null,
        phone: phone || null,
        points: 50,
        totalEarned: 50,
        transactions: {
          create: { type: 'earn', points: 50, reason: 'signup' },
        },
      },
      include: { transactions: true },
    })
    return NextResponse.json(account, { status: 201 })
  }
  return NextResponse.json(account)
}
