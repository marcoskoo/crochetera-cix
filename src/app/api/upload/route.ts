import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 })
  }

  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: 'Solo se permiten imágenes o videos' }, { status: 400 })
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `El archivo supera el máximo permitido (${isVideo ? '50MB' : '10MB'})` },
      { status: 413 },
    )
  }

  await mkdir(UPLOAD_DIR, { recursive: true })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const baseName = randomUUID()

  if (isImage) {
    // Optimizar imágenes con sharp
    try {
      await sharp(buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(path.join(UPLOAD_DIR, `${baseName}.jpg`))
      return NextResponse.json({ url: `/uploads/${baseName}.jpg`, type: 'image' })
    } catch {
      await writeFile(path.join(UPLOAD_DIR, `${baseName}.jpg`), buffer)
      return NextResponse.json({ url: `/uploads/${baseName}.jpg`, type: 'image' })
    }
  }

  // Video - guardar directo sin procesar (para videos cortos)
  const ext = path.extname(file.name) || '.mp4'
  const fileName = `${baseName}${ext}`
  await writeFile(path.join(UPLOAD_DIR, fileName), buffer)
  return NextResponse.json({ url: `/uploads/${fileName}`, type: 'video' })
}
