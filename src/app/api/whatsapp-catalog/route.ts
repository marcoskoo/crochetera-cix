import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// GET /api/whatsapp-catalog - genera un CSV con el catálogo para WhatsApp Business
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const products = await db.product.findMany({
    where: { status: 'active' },
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' },
  })

  // Formato CSV para WhatsApp Business Catalog
  // Headers requeridos por WhatsApp: name, description, price, image_url, retailer_id, availability
  const headers = [
    'name',
    'description',
    'price',
    'currency',
    'image_url',
    'retailer_id',
    'availability',
    'category',
  ]

  const rows = products.map((p) => {
    const mainImage = p.images.find((i) => i.isMain) || p.images[0]
    return [
      p.name,
      p.description.replace(/\n/g, ' ').slice(0, 255),
      p.price.toFixed(2),
      'PEN',
      mainImage?.url || '',
      p.id,
      p.stock > 0 || p.unlimited ? 'In Stock' : 'Out of Stock',
      p.category?.name || '',
    ]
  })

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => {
        const str = String(cell)
        if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
        return str
      }).join(','),
    )
    .join('\r\n')

  return new NextResponse('\ufeff' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="whatsapp-catalog-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
