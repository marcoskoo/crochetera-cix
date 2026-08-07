import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'El archivo supera el máximo permitido (10MB)' },
      { status: 413 },
    )
  }

  await mkdir(UPLOAD_DIR, { recursive: true })

  const isImage = /^image\//.test(file.type)
  const ext = path.extname(file.name) || (isImage ? '.jpg' : '.mp4')
  const baseName = `${randomUUID()}`
  const fileName = `${baseName}${ext}`
  const filePath = path.join(UPLOAD_DIR, fileName)

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (isImage) {
    // Optimizar imágenes con sharp
    try {
      await sharp(buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(path.join(UPLOAD_DIR, `${baseName}.jpg`))
      return NextResponse.json({
        url: `/uploads/${baseName}.jpg`,
        type: 'image',
      })
    } catch {
      // si falla sharp, guardamos original
      await writeFile(filePath, buffer)
      return NextResponse.json({ url: `/uploads/${fileName}`, type: 'image' })
    }
  }

  // Video u otro archivo - guardar directo
  await writeFile(filePath, buffer)
  return NextResponse.json({
    url: `/uploads/${fileName}`,
    type: file.type.startsWith('video/') ? 'video' : 'file',
  })
}
