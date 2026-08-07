import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSiteConfig } from '@/lib/site'
import { isAuthenticated } from '@/lib/auth'

// GET /api/site - configuración pública del sitio
export async function GET() {
  const config = await getSiteConfig()
  return NextResponse.json(config)
}

// PUT /api/site - actualizar configuración (admin)
export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const updated = await db.siteConfig.update({
    where: { id: 'singleton' },
    data: {
      storeName: body.storeName,
      tagline: body.tagline,
      logoUrl: body.logoUrl,
      heroTitle: body.heroTitle,
      heroSubtitle: body.heroSubtitle,
      heroButtonText: body.heroButtonText,
      heroImage: body.heroImage,
      aboutTitle: body.aboutTitle,
      aboutText: body.aboutText,
      aboutImage: body.aboutImage,
      phone: body.phone,
      email: body.email,
      whatsapp: body.whatsapp,
      instagram: body.instagram,
      facebook: body.facebook,
      tiktok: body.tiktok,
      address: body.address,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      shippingInfo: body.shippingInfo,
      paymentInfo: body.paymentInfo,
      currency: body.currency,
    },
  })
  return NextResponse.json(updated)
}
