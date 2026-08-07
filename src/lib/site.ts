import { db } from './db'

// Obtiene o crea la configuración única del sitio
export async function getSiteConfig() {
  let config = await db.siteConfig.findUnique({
    where: { id: 'singleton' },
  })
  if (!config) {
    config = await db.siteConfig.create({
      data: { id: 'singleton' },
    })
  }
  return config
}

// Genera un slug único a partir de un texto
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

export async function uniqueSlug(
  text: string,
  model: 'category' | 'product',
  excludeId?: string,
): Promise<string> {
  let base = slugify(text) || 'item'
  let slug = base
  let counter = 1
   
  while (true) {
    const existing =
      model === 'category'
        ? await db.category.findUnique({ where: { slug } })
        : await db.product.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) return slug
    counter++
    slug = `${base}-${counter}`
  }
}

// Formatea precio con moneda
export function formatPrice(amount: number, currency: string = 'S/'): string {
  return `${currency} ${amount.toFixed(2)}`
}

// Asegura que las carpetas de uploads existan (en runtime)
export const UPLOAD_DIR = 'public/uploads'

// Detecta el tipo de video por URL
export function detectVideoType(url: string): string {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/vimeo\.com/.test(url)) return 'vimeo'
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return 'mp4'
  return 'youtube'
}

// Extrae ID de YouTube para embed
export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getEmbedUrl(url: string): string {
  const type = detectVideoType(url)
  if (type === 'youtube') {
    const id = getYouTubeId(url)
    return id ? `https://www.youtube.com/embed/${id}` : url
  }
  if (type === 'vimeo') {
    const match = url.match(/vimeo\.com\/(\d+)/)
    return match ? `https://player.vimeo.com/video/${match[1]}` : url
  }
  return url
}
