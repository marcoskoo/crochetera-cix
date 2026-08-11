// Seed de bundles y stories de ejemplo
import { db } from '../src/lib/db'

async function main() {
  console.log('🎁 Creando bundles y stories...')

  // Obtener productos existentes
  const products = await db.product.findMany({ orderBy: { createdAt: 'asc' } })
  if (products.length < 3) {
    console.log('No hay suficientes productos para crear bundles')
    return
  }

  // Bundles de ejemplo
  const bundles = [
    {
      name: 'Pack BT21 Completo',
      description: 'Los 4 personajes BT21: Tata, Koya, Chimmy y RJ. ¡Colección completa!',
      price: 220,
      originalTotal: 280,
      featured: true,
      productIndexes: [0, 1, 2, 3],
    },
    {
      name: 'Duo Romántico',
      description: 'Dos peluches para regalar en pareja. Perfecto para San Valentín o aniversarios.',
      price: 100,
      originalTotal: 130,
      featured: false,
      productIndexes: [0, 1],
    },
    {
      name: 'Pack Amigurumis',
      description: '3 amigurumis pequeños para coleccionar o regalar.',
      price: 80,
      originalTotal: 105,
      featured: false,
      productIndexes: [4, 5, 6],
    },
  ]

  for (const b of bundles) {
    const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const existing = await db.bundle.findUnique({ where: { slug } })
    if (existing) continue

    const items = b.productIndexes
      .filter((i) => products[i])
      .map((i) => ({ productId: products[i].id, quantity: 1 }))

    if (items.length === 0) continue

    await db.bundle.create({
      data: {
        name: b.name,
        slug,
        description: b.description,
        price: b.price,
        originalTotal: b.originalTotal,
        featured: b.featured,
        active: true,
        items: { create: items },
      },
    })
    console.log(`✓ Bundle creado: ${b.name}`)
  }

  // Stories de ejemplo (vencen en 24h)
  const stories = [
    { title: 'Detrás del telar 🧶', imageUrl: '/uploads/bt21-tata.jpg', hours: 24 },
    { title: 'Proceso de creación ✨', imageUrl: '/uploads/bt21-koya.jpg', hours: 24 },
    { title: 'Nuevo peluche en proceso 💕', imageUrl: '/uploads/bt21-chimmy.jpg', hours: 12 },
    { title: 'Pedido listo para envío 📦', imageUrl: '/uploads/bt21-rj.jpg', hours: 24 },
  ]

  for (const s of stories) {
    const expiresAt = new Date(Date.now() + s.hours * 60 * 60 * 1000)
    await db.story.create({
      data: {
        title: s.title,
        imageUrl: s.imageUrl,
        expiresAt,
        active: true,
      },
    })
    console.log(`✓ Story creada: ${s.title}`)
  }

  console.log('✅ Seed completado')
}

main().catch(console.error).finally(() => process.exit(0))
