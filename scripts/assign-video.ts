// Asignar video a productos BT21
import { db } from '../src/lib/db'

const VIDEO_URL = '/uploads/crochet-plush-video.mp4'

async function main() {
  console.log('🎬 Asignando video a productos...')

  // Buscar productos BT21 y Yoshi/Snoopy (los de imágenes reales)
  const products = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'BT21' } },
        { name: { contains: 'Yoshi' } },
        { name: { contains: 'Snoopy' } },
      ],
    },
    include: { videos: true },
  })

  console.log(`Encontrados ${products.length} productos para asignar video`)

  for (const product of products) {
    // Eliminar videos existentes
    if (product.videos.length > 0) {
      await db.productVideo.deleteMany({ where: { productId: product.id } })
    }
    // Crear video
    await db.productVideo.create({
      data: {
        productId: product.id,
        url: VIDEO_URL,
        type: 'mp4',
        title: `${product.name} - Video demostración`,
        order: 0,
      },
    })
    console.log(`✓ ${product.name} → video asignado`)
  }

  console.log(`\n✅ Video asignado a ${products.length} productos`)
  console.log('✅ Proceso completo')
}

main().catch(console.error).finally(() => process.exit(0))
