// Reasignar imágenes de productos con nombres nuevos (cache busting)
import { db } from '../src/lib/db'

const BT21_IMAGES = [
  '/uploads/bt21-tata.jpg',
  '/uploads/bt21-koya.jpg',
  '/uploads/bt21-chimmy.jpg',
  '/uploads/bt21-rj.jpg',
]

async function main() {
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { images: true },
  })

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

  // Actualizar about image también
  await db.siteConfig.update({
    where: { id: 'singleton' },
    data: { aboutImage: '/uploads/bt21-koya.jpg' },
  })
  console.log('✓ About image actualizada')
}

main().catch(console.error).finally(() => process.exit(0))
