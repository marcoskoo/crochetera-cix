// Cambiar imagen del hero por BT21 (Tata) y reasignar productos
import sharp from 'sharp'
import { db } from '../src/lib/db'
import path from 'path'

const SRC_DIR = '/home/z/my-project/upload'
const OUT_DIR = '/home/z/my-project/public/uploads'

async function main() {
  console.log('🎨 Procesando nueva imagen del hero (BT21 Tata)...')

  // Procesar imagen de Tata para el hero (1200x1200)
  await sharp(path.join(SRC_DIR, 'WhatsApp Image 2026-08-02 at 12.10.46 PM (1).jpeg'))
    .resize(1200, 1200, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(OUT_DIR, 'hero-peluche.jpg'))
  console.log('✓ Hero actualizado con BT21 Tata')

  // Reasignar imágenes de productos con los 4 BT21
  const bt21Images = [
    '/uploads/peluche-1.jpg', // Tata
    '/uploads/peluche-2.jpg', // Koya
    '/uploads/peluche-3.jpg', // Chimmy
    '/uploads/peluche-4.jpg', // RJ
  ]

  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { images: true },
  })

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const imageUrl = bt21Images[i % bt21Images.length]

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

  // Actualizar también la imagen del about
  await db.siteConfig.update({
    where: { id: 'singleton' },
    data: { aboutImage: '/uploads/peluche-2.jpg' },
  })
  console.log('✓ Imagen del About actualizada')

  console.log('✅ ¡Hero cambiado a BT21 Tata!')
}

main().catch((e) => {
  console.error('❌ Error:', e)
  process.exit(1)
})
