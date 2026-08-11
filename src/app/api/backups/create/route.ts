import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { createReadStream, statSync } from 'fs'
import { randomUUID } from 'crypto'

// POST /api/backups/create - crear backup de la DB
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const backupDir = path.join(process.cwd(), 'backups')
    await mkdir(backupDir, { recursive: true })

    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.db`
    const backupPath = path.join(backupDir, filename)

    // Copiar la DB SQLite
    const dbPath = path.join(process.cwd(), 'db', 'custom.db')
    const { copyFile } = await import('fs/promises')
    await copyFile(dbPath, backupPath)

    const stats = statSync(backupPath)
    const size = stats.size

    await db.backupLog.create({
      data: { filename, size, type: 'manual', status: 'success' },
    })

    return NextResponse.json({ ok: true, filename, size })
  } catch (e) {
    await db.backupLog.create({
      data: {
        filename: `failed-${Date.now()}`,
        size: 0,
        type: 'manual',
        status: 'failed',
      },
    })
    return NextResponse.json({ error: 'Error al crear backup' }, { status: 500 })
  }
}
