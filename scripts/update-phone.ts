// Actualizar número de contacto en la configuración del sitio
import { db } from '../src/lib/db'

async function main() {
  await db.siteConfig.update({
    where: { id: 'singleton' },
    data: {
      phone: '+51 950 886 496',
      whatsapp: '+51950886496',
    },
  })
  const config = await db.siteConfig.findUnique({ where: { id: 'singleton' } })
  console.log('✓ phone:', config?.phone)
  console.log('✓ whatsapp:', config?.whatsapp)
}

main().catch(console.error).finally(() => process.exit(0))
