// Remover video de todos los productos excepto KOYA
import { db } from '../src/lib/db'

async function main() {
  console.log('🎬 Removiendo video de todos los productos excepto KOYA...')

  // Buscar el producto KOYA
  const koya = await db.product.findFirst({
    where: { name: { contains: 'Koya' } },
    include: { videos: true },
  })

  if (!koya) {
    console.error('No se encontró el producto Koya')
    return
  }

  console.log(`✓ Producto Koya encontrado: ${koya.name} (mantendrá su video)`)

  // Eliminar videos de todos los demás productos
  const result = await db.productVideo.deleteMany({
    where: {
      NOT: { productId: koya.id },
    },
  })

  console.log(`✓ Videos removidos de ${result.count} producto(s)`)
  console.log(`✓ Koya conserva ${koya.videos.length} video(s)`)
  console.log('✅ Proceso completo')
}

main().catch(console.error).finally(() => process.exit(0))
