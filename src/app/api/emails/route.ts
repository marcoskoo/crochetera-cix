import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET - lista emails enviados (admin)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const emails = await db.emailLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  return NextResponse.json(emails)
}
