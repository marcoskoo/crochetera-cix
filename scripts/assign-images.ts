// Actualizar productos con imágenes reales de peluches
import { db } from '../src/lib/db'

const IMAGE_URLS = [
  '/uploads/peluche-1.jpg',
  '/uploads/peluche-2.jpg',
  '/uploads/peluche-3.jpg',
  '/uploads/peluche-4.jpg',
]

async function main() {
  console.log('🖼️ Asignando imágenes reales a los productos...')

  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { images: true },
  })

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const imageUrl = IMAGE_URLS[i % IMAGE_URLS.length]

    // Eliminar imágenes existentes
    if (product.images.length > 0) {
      await db.productImage.deleteMany({ where: { productId: product.id } })
    }

    // Crear nueva imagen principal
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

  // Asignar imagen del about también
  await db.siteConfig.update({
    where: { id: 'singleton' },
    data: {
      aboutImage: '/uploads/peluche-3.jpg',
      heroImage: '/uploads/hero-peluche.jpg',
    },
  })
  console.log('✓ Imagen del Hero actualizada')
  console.log('✓ Imagen del About actualizada')

  console.log('✅ Proceso completo')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
