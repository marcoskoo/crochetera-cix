import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET - lista suscriptores (solo admin)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const subs = await db.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(subs)
}

// POST - suscripción pública
export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  const existing = await db.newsletterSubscriber.findUnique({ where: { email } })
  if (existing) {
    if (!existing.active) {
      await db.newsletterSubscriber.update({
        where: { email },
        data: { active: true, name: name || existing.name },
      })
      return NextResponse.json({ ok: true, reactivated: true })
    }
    return NextResponse.json({ ok: true, already: true })
  }
  await db.newsletterSubscriber.create({ data: { email, name: name || null } })
  return NextResponse.json({ ok: true }, { status: 201 })
}
