import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'
import { uniqueSlug } from '@/lib/site'

// GET /api/products/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      videos: { orderBy: { order: 'asc' } },
      reviews: { where: { approved: true } },
      category: true,
    },
  })
  if (!product) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }
  // Si es draft y no es admin, no mostrar
  if (product.status !== 'active' && !(await isAuthenticated())) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }
  return NextResponse.json(product)
}

// PUT /api/products/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()

  const existing = await db.product.findUnique({
    where: { id },
    include: { images: true, videos: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  // Actualizar slug solo si cambió el nombre
  let slug = existing.slug
  if (body.name && body.name !== existing.name) {
    slug = await uniqueSlug(body.name, 'product', id)
  }

  // Reemplazar imágenes y videos si vinieron en el body
  if (body.images !== undefined) {
    await db.productImage.deleteMany({ where: { productId: id } })
    if (Array.isArray(body.images) && body.images.length > 0) {
      await db.productImage.createMany({
        data: body.images.map(
          (img: { url: string; alt?: string; isMain?: boolean }, i: number) => ({
            productId: id,
            url: img.url,
            alt: img.alt || null,
            isMain: img.isMain ?? i === 0,
            order: i,
          }),
        ),
      })
    }
  }
  if (body.videos !== undefined) {
    await db.productVideo.deleteMany({ where: { productId: id } })
    if (Array.isArray(body.videos) && body.videos.length > 0) {
      await db.productVideo.createMany({
        data: body.videos.map(
          (v: { url: string; type?: string; title?: string }, i: number) => ({
            productId: id,
            url: v.url,
            type: v.type || 'youtube',
            title: v.title || null,
            order: i,
          }),
        ),
      })
    }
  }

  const updated = await db.product.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      slug,
      description: body.description ?? existing.description,
      price: body.price !== undefined ? parseFloat(body.price) : existing.price,
      oldPrice:
        body.oldPrice !== undefined
          ? body.oldPrice
            ? parseFloat(body.oldPrice)
            : null
          : existing.oldPrice,
      categoryId: body.categoryId !== undefined ? body.categoryId || null : existing.categoryId,
      stock: body.stock !== undefined ? parseInt(body.stock) || 0 : existing.stock,
      unlimited: body.unlimited ?? existing.unlimited,
      featured: body.featured ?? existing.featured,
      status: body.status ?? existing.status,
      size: body.size !== undefined ? body.size || null : existing.size,
      material: body.material !== undefined ? body.material || null : existing.material,
      height: body.height !== undefined ? body.height || null : existing.height,
      weight: body.weight !== undefined ? body.weight || null : existing.weight,
      productionDays:
        body.productionDays !== undefined
          ? body.productionDays
            ? parseInt(body.productionDays)
            : null
          : existing.productionDays,
      tags: body.tags !== undefined ? body.tags || null : existing.tags,
    },
    include: {
      images: { orderBy: { order: 'asc' } },
      videos: { orderBy: { order: 'asc' } },
      reviews: { where: { approved: true } },
      category: true,
    },
  })
  return NextResponse.json(updated)
}

// DELETE /api/products/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  await db.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
