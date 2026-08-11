import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/qr/[productId] - genera un QR code SVG que enlaza al producto
export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  // Construir URL del producto
  const host = req.headers.get('host') || 'localhost:3000'
  const proto = req.headers.get('x-forwarded-proto') || 'http'
  const productUrl = `${proto}://${host}/?product=${productId}`

  // Generar QR code SVG usando el algoritmo simple (data URL)
  // Usamos la API pública de goqr.me como fallback visual
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productUrl)}&color=E91E63&bgcolor=FFFFFF&margin=10`

  // Redirigir a la imagen QR generada
  return NextResponse.redirect(qrApiUrl)
}
