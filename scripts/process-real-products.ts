// Procesar las 9 imágenes nuevas de productos y copiarlas a public/uploads
import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import path from 'path'

const SRC_DIR = '/home/z/my-project/upload'
const OUT_DIR = '/home/z/my-project/public/uploads'

interface ImgJob {
  src: string
  out: string
}

const jobs: ImgJob[] = [
  { src: 'WhatsApp Image 2026-08-06 at 5.13.12 PM.jpeg', out: 'bt21-tata-real.jpg' },
  { src: 'WhatsApp Image 2026-08-06 at 5.13.12 PM (1).jpeg', out: 'bt21-rj-real.jpg' },
  { src: 'WhatsApp Image 2026-08-06 at 5.13.13 PM.jpeg', out: 'bt21-shooky-real.jpg' },
  { src: 'WhatsApp Image 2026-08-06 at 5.13.13 PM (1).jpeg', out: 'bt21-chimmy-real.jpg' },
  { src: 'WhatsApp Image 2026-08-06 at 5.13.13 PM (2).jpeg', out: 'bt21-koya-real.jpg' },
  { src: 'WhatsApp Image 2026-08-06 at 5.13.14 PM.jpeg', out: 'bt21-mang-real.jpg' },
  { src: 'WhatsApp Image 2026-08-06 at 5.13.14 PM (1).jpeg', out: 'bt21-cooky-real.jpg' },
  { src: 'WhatsApp Image 2026-08-06 at 5.13.15 PM.jpeg', out: 'yoshi-real.jpg' },
  { src: 'WhatsApp Image 2026-08-06 at 5.13.15 PM (1).jpeg', out: 'snoopy-real.jpg' },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  console.log('🧶 Procesando 9 imágenes de productos reales...')

  for (const job of jobs) {
    const srcPath = path.join(SRC_DIR, job.src)
    const outPath = path.join(OUT_DIR, job.out)
    try {
      // Procesar a 800x800 cuadrado para cards de producto
      await sharp(srcPath)
        .resize(800, 800, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: false,
        })
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(outPath)
      console.log(`✓ ${job.out}`)
    } catch (e) {
      console.error(`✗ Error procesando ${job.src}:`, e)
    }
  }

  // También crear una versión grande del Tata para el hero (1200x1200)
  try {
    await sharp(path.join(SRC_DIR, 'WhatsApp Image 2026-08-06 at 5.13.12 PM.jpeg'))
      .resize(1200, 1200, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(path.join(OUT_DIR, 'hero-bt21-tata.jpg'))
    console.log('✓ hero-bt21-tata.jpg (1200x1200)')
  } catch (e) {
    console.error('✗ Error en hero:', e)
  }

  console.log('✅ Proceso completo')
}

main()
