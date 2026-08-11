// Asignar video de Yoshi al producto Yoshi
import { db } from '../src/lib/db'

async function main() {
  console.log('🦕 Asignando video a Yoshi...')

  const yoshi = await db.product.findFirst({
    where: { name: { contains: 'Yoshi' } },
    include: { videos: true },
  })

  if (!yoshi) {
    console.error('No se encontró el producto Yoshi')
    return
  }

  // Eliminar videos existentes de Yoshi
  if (yoshi.videos.length > 0) {
    await db.productVideo.deleteMany({ where: { productId: yoshi.id } })
  }

  // Asignar nuevo video
  await db.productVideo.create({
    data: {
      productId: yoshi.id,
      url: '/uploads/yoshi-video.mp4',
      type: 'mp4',
      title: 'Yoshi Tejido a Crochet - Video demostración',
      order: 0,
    },
  })

  console.log(`✓ ${yoshi.name} → video asignado: /uploads/yoshi-video.mp4`)
  console.log('✅ Proceso completo')
}

main().catch(console.error).finally(() => process.exit(0))
