// Actualizar SiteConfig con nuevo nombre de archivo de hero (cache busting)
import { db } from '../src/lib/db'

async function main() {
  await db.siteConfig.update({
    where: { id: 'singleton' },
    data: {
      heroImage: '/uploads/hero-bt21-tata.jpg',
    },
  })
  console.log('✓ heroImage actualizado a /uploads/hero-bt21-tata.jpg')

  const config = await db.siteConfig.findUnique({ where: { id: 'singleton' } })
  console.log('heroImage actual:', config?.heroImage)
}

main().catch(console.error).finally(() => process.exit(0))
