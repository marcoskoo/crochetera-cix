// Migrar imágenes locales a Vercel Blob Storage
// Uso: BLOB_READ_WRITE_TOKEN=xxx bun run scripts/migrate-to-blob.ts
import { put } from '@vercel/blob'
import { readFile } from 'fs/promises'
import path from 'path'
import { db } from '../src/lib/db'

async function migrateToBlob() {
  console.log('📦 Migrando imágenes locales a Vercel Blob...')

  const localDir = path.join(process.cwd(), 'public', 'uploads')
  const filesToMigrate = [
    'bt21-tata-real.jpg', 'bt21-rj-real.jpg', 'bt21-shooky-real.jpg',
    'bt21-chimmy-real.jpg', 'bt21-koya-real.jpg', 'bt21-mang-real.jpg',
    'bt21-cooky-real.jpg', 'yoshi-real.jpg', 'snoopy-real.jpg',
    'crochet-plush-video.mp4', 'yoshi-video.mp4',
    'hero-bt21-tata.jpg', 'bt21-tata.jpg', 'bt21-koya.jpg',
    'bt21-chimmy.jpg', 'bt21-rj.jpg',
  ]

  const urlMap: Record<string, string> = {}

  for (const filename of filesToMigrate) {
    try {
      const filePath = path.join(localDir, filename)
      const buffer = await readFile(filePath)
      const isVideo = filename.endsWith('.mp4')
      const blob = await put(`migrated/${filename}`, buffer, {
        access: 'public',
        contentType: isVideo ? 'video/mp4' : 'image/jpeg',
        addRandomSuffix: false,
      })
      urlMap[`/uploads/${filename}`] = blob.url
      console.log(`✓ ${filename} → ${blob.url}`)
    } catch (e) {
      console.error(`✗ ${filename}:`, e)
    }
  }

  // Actualizar DB con nuevas URLs
  console.log('\n📊 Actualizando base de datos...')

  // Imágenes de productos
  const images = await db.productImage.findMany()
  for (const img of images) {
    if (urlMap[img.url]) {
      await db.productImage.update({ where: { id: img.id }, data: { url: urlMap[img.url] } })
    }
  }

  // Videos de productos
  const videos = await db.productVideo.findMany()
  for (const vid of videos) {
    if (urlMap[vid.url]) {
      await db.productVideo.update({ where: { id: vid.id }, data: { url: urlMap[vid.url] } })
    }
  }

  // SiteConfig (heroImage, aboutImage)
  const config = await db.siteConfig.findFirst()
  if (config) {
    await db.siteConfig.update({
      where: { id: 'singleton' },
      data: {
        heroImage: config.heroImage && urlMap[config.heroImage] ? urlMap[config.heroImage] : config.heroImage,
        aboutImage: config.aboutImage && urlMap[config.aboutImage] ? urlMap[config.aboutImage] : config.aboutImage,
      },
    })
  }

  console.log('✅ Migración completa!')
  console.log(`📊 ${Object.keys(urlMap).length} archivos migrados`)
}

migrateToBlob().catch(console.error).finally(() => process.exit(0))
