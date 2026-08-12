import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET - lista backups
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const backups = await db.backupLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30 })
  return NextResponse.json(backups)
}
