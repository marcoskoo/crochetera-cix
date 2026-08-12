// Reasignar imágenes BT21 a todos los productos
import { db } from '../src/lib/db'

const BT21_IMAGES = [
  '/uploads/bt21-tata.jpg',
  '/uploads/bt21-koya.jpg',
  '/uploads/bt21-chimmy.jpg',
  '/uploads/bt21-rj.jpg',
]

async function main() {
  console.log('🖼️ Reasignando imágenes a productos...')

  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { images: true },
  })

  console.log(`Encontrados ${products.length} productos`)

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const imageUrl = BT21_IMAGES[i % BT21_IMAGES.length]

    if (product.images.length > 0) {
      await db.productImage.deleteMany({ where: { productId: product.id } })
    }
    await db.productImage.create({
      data: {
        productId: product.id,
        url: imageUrl,
        alt: product.name,
        isMain: true,
        order: 0,
      },
    })
    console.log(`✓ ${product.name} → ${imageUrl}`)
  }

  // Asegurar que heroImage esté vacío para que el slideshow use productos
  await db.siteConfig.update({
    where: { id: 'singleton' },
    data: { heroImage: null },
  })
  console.log('✓ heroImage reseteado (slideshow usará productos del catálogo)')

  console.log('✅ Proceso completo')
}

main().catch(console.error).finally(() => process.exit(0))
