import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { put } from '@vercel/blob'
import sharp from 'sharp'

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

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const ext = isImage ? '.jpg' : (file.name.match(/\.\w+$/)?.[0] || '.mp4')
  const fileName = isImage ? `products/${baseName}.jpg` : `videos/${baseName}${ext}`

  let finalBuffer: Buffer = buffer
  let contentType: string = file.type

  if (isImage) {
    try {
      finalBuffer = await sharp(buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()
      contentType = 'image/jpeg'
    } catch {
      // usar original si sharp falla
    }
  }

  try {
    const blob = await put(fileName, finalBuffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      type: isVideo ? 'video' : 'image',
    })
  } catch (e) {
    console.error('Error subiendo a Vercel Blob:', e)
    return NextResponse.json(
      { error: 'Error al subir archivo a Blob Storage' },
      { status: 500 },
    )
  }
}
