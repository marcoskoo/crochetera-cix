import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

// POST /api/backups/create - exportar DB como JSON (serverless-compatible)
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    // En serverless no podemos copiar el archivo SQLite
    // En su lugar, exportamos los datos como JSON
    const [
      siteConfig, products, categories, orders, coupons, blogPosts,
      testimonials, faqs, stories, bundles, galleryImages, customRequests,
      newsletterSubscribers, loyaltyAccounts,
    ] = await Promise.all([
      db.siteConfig.findFirst(),
      db.product.findMany({ include: { images: true, videos: true } }),
      db.category.findMany(),
      db.order.findMany({ include: { items: true } }),
      db.coupon.findMany(),
      db.blogPost.findMany(),
      db.testimonial.findMany(),
      db.fAQ.findMany(),
      db.story.findMany(),
      db.bundle.findMany({ include: { items: true } }),
      db.galleryImage.findMany(),
      db.customRequest.findMany(),
      db.newsletterSubscriber.findMany(),
      db.loyaltyAccount.findMany(),
    ])

    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        siteConfig, products, categories, orders, coupons, blogPosts,
        testimonials, faqs, stories, bundles, galleryImages, customRequests,
        newsletterSubscribers, loyaltyAccounts,
      },
    }

    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    const size = JSON.stringify(backup).length

    await db.backupLog.create({
      data: { filename, size, type: 'manual', status: 'success' },
    })

    // Devolver como archivo descargable
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
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
