// Procesar imágenes de peluches y copiarlas a public/uploads
import sharp from 'sharp'
import { mkdir, copyFile } from 'fs/promises'
import path from 'path'

const SRC_DIR = '/home/z/my-project/upload'
const OUT_DIR = '/home/z/my-project/public/uploads'

interface ImgJob {
  src: string
  out: string
  size: number
}

const jobs: ImgJob[] = [
  // Imágenes de productos - redimensionar a 800x800 (cuadrado para cards)
  { src: 'WhatsApp Image 2026-08-02 at 12.10.46 PM (1).jpeg', out: 'peluche-1.jpg', size: 800 },
  { src: 'WhatsApp Image 2026-08-02 at 12.10.45 PM (4).jpeg', out: 'peluche-2.jpg', size: 800 },
  { src: 'WhatsApp Image 2026-08-02 at 12.10.45 PM.jpeg', out: 'peluche-3.jpg', size: 800 },
  { src: 'WhatsApp Image 2026-08-02 at 12.10.45 PM (3).jpeg', out: 'peluche-4.jpg', size: 800 },
  // Hero image - más grande
  { src: 'pasted_image_1786297633076.png', out: 'hero-peluche.jpg', size: 1200 },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  console.log('🧶 Procesando imágenes de peluches...')

  for (const job of jobs) {
    const srcPath = path.join(SRC_DIR, job.src)
    const outPath = path.join(OUT_DIR, job.out)
    try {
      await sharp(srcPath)
        .resize(job.size, job.size, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: false,
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(outPath)
      console.log(`✓ ${job.out} (${job.size}x${job.size})`)
    } catch (e) {
      console.error(`✗ Error procesando ${job.src}:`, e)
    }
  }

  // Copiar también las originales a uploads para tenerlas disponibles
  const allImgs = [
    'WhatsApp Image 2026-08-02 at 12.10.46 PM (1).jpeg',
    'WhatsApp Image 2026-08-02 at 12.10.45 PM (4).jpeg',
    'WhatsApp Image 2026-08-02 at 12.10.45 PM.jpeg',
    'WhatsApp Image 2026-08-02 at 12.10.45 PM (3).jpeg',
  ]
  for (const img of allImgs) {
    const src = path.join(SRC_DIR, img)
    const out = path.join(OUT_DIR, img.replace(/\s+/g, '-').replace(/\(|\)/g, ''))
    try {
      await copyFile(src, out)
      console.log(`✓ copiada ${path.basename(out)}`)
    } catch (e) {
      console.error(`✗ Error copiando ${img}:`, e)
    }
  }

  console.log('✅ Proceso completo')
}

main()
