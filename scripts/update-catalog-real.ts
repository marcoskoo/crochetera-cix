// Actualizar catálogo con imágenes reales y crear productos nuevos
import { db } from '../src/lib/db'
import { uniqueSlug } from '../src/lib/site'

// Mapeo: nombre del producto → imagen real
const IMAGE_MAP: Record<string, string> = {
  'Tata': '/uploads/bt21-tata-real.jpg',
  'RJ': '/uploads/bt21-rj-real.jpg',
  'Shooky': '/uploads/bt21-shooky-real.jpg',
  'Chimmy': '/uploads/bt21-chimmy-real.jpg',
  'Koya': '/uploads/bt21-koya-real.jpg',
  'Mang': '/uploads/bt21-mang-real.jpg',
  'Cooky': '/uploads/bt21-cooky-real.jpg',
  'Yoshi': '/uploads/yoshi-real.jpg',
  'Snoopy': '/uploads/snoopy-real.jpg',
}

// Productos nuevos a crear
const NEW_PRODUCTS = [
  {
    name: 'Tata BT21 Tejido',
    description: 'Tata, el personaje de BT21 con forma de corazón, tejido a mano. Cabeza roja con cuerpo azul y detalles amarillos. Perfecto para fans de BTS. Tamaño pequeño ideal para coleccionar o regalar.',
    price: 45,
    category: 'personajes',
    character: 'Tata',
    size: 'Pequeño (12cm)',
    tags: 'bt21,tata,bts,corazón,rojo',
    featured: true,
  },
  {
    name: 'RJ BT21 Tejido',
    description: 'RJ, el koala blanco de BT21, tejido a crochet con bufanda roja y detalles en marrón. Peluche suave y adorable, perfecto para coleccionistas de BT21.',
    price: 45,
    category: 'personajes',
    character: 'RJ',
    size: 'Pequeño (12cm)',
    tags: 'bt21,rj,bts,koala,blanco',
    featured: false,
  },
  {
    name: 'Shooky BT21 Tejido',
    description: 'Shooky, la galleta de chocolate de BT21, tejido a mano en color marrón. El personaje más travieso de la colección BT21. Tamaño mini perfecto para llavero o decoración.',
    price: 38,
    category: 'personajes',
    character: 'Shooky',
    size: 'Pequeño (10cm)',
    tags: 'bt21,shooky,bts,galleta,marrón',
    featured: false,
  },
  {
    name: 'Chimmy BT21 Tejido',
    description: 'Chimmy, el perrito amarillo de BT21 con capucha y orejas negras. Tejido a crochet con detalles precisos. Un favorito de los fans de BTS.',
    price: 45,
    category: 'personajes',
    character: 'Chimmy',
    size: 'Pequeño (12cm)',
    tags: 'bt21,chimmy,bts,perro,amarillo',
    featured: true,
  },
  {
    name: 'Koya BT21 Tejido',
    description: 'Koya, el koala turquesa de BT21 con detalles en blanco y morado. Tejido a mano con hilo premium. Ideal para coleccionistas y fans de BTS.',
    price: 45,
    category: 'personajes',
    character: 'Koya',
    size: 'Pequeño (12cm)',
    tags: 'bt21,koya,bts,koala,turquesa',
    featured: true,
  },
  {
    name: 'Mang BT21 Tejido',
    description: 'Mang, el conejito alien de BT21 con cabeza turquesa y cuerpo rosa. Tejido a crochet con colores vibrantes. Un peluche único para coleccionistas.',
    price: 42,
    category: 'personajes',
    character: 'Mang',
    size: 'Pequeño (10cm)',
    tags: 'bt21,mang,bts,conejo,rosa',
    featured: false,
  },
  {
    name: 'Cooky BT21 Tejido',
    description: 'Cooky, el conejo rosa de BT21 con detalles amarillos en orejas y manos. Tejido a mano con mucho cariño. Perfecto para regalar a fans de BTS.',
    price: 45,
    category: 'personajes',
    character: 'Cooky',
    size: 'Pequeño (12cm)',
    tags: 'bt21,cooky,bts,conejo,rosa',
    featured: true,
  },
  {
    name: 'Yoshi Tejido a Crochet',
    description: 'El famoso dinosaurio Yoshi de Nintendo, tejido a mano en verde con vientre blanco y botas naranjas. Pieza de colección para fans de videojuegos. Tamaño mediano ideal para decorar.',
    price: 75,
    category: 'personajes',
    character: 'Yoshi',
    size: 'Mediano (22cm)',
    tags: 'yoshi,nintendo,mario,dinosaurio,verde',
    featured: true,
  },
  {
    name: 'Snoopy Tejido con Corazón',
    description: 'Snoopy, el icónico perrito de Charlie Brown, tejido a crochet en blanco con orejas negras y un corazón rosa en el pecho. Tamaño mini ideal como llavero o regalo romántico.',
    price: 38,
    category: 'personajes',
    character: 'Snoopy',
    size: 'Pequeño (10cm)',
    tags: 'snoopy,peanuts,perro,corazón,blanco',
    featured: false,
  },
]

async function main() {
  console.log('🎨 Actualizando catálogo con imágenes reales...')

  // 1. Obtener categoría "personajes"
  const catPersonajes = await db.category.findUnique({ where: { slug: 'personajes' } })
  if (!catPersonajes) {
    console.error('No existe la categoría "personajes"')
    return
  }

  // 2. Crear productos nuevos
  for (const p of NEW_PRODUCTS) {
    const existing = await db.product.findFirst({ where: { name: p.name } })
    if (existing) {
      // Actualizar imagen del producto existente
      await db.productImage.deleteMany({ where: { productId: existing.id } })
      await db.productImage.create({
        data: {
          productId: existing.id,
          url: IMAGE_MAP[p.character],
          alt: p.name,
          isMain: true,
          order: 0,
        },
      })
      // Actualizar datos del producto
      await db.product.update({
        where: { id: existing.id },
        data: {
          description: p.description,
          price: p.price,
          categoryId: catPersonajes.id,
          size: p.size,
          tags: p.tags,
          featured: p.featured,
          status: 'active',
        },
      })
      console.log(`✓ Actualizado: ${p.name} → ${IMAGE_MAP[p.character]}`)
    } else {
      // Crear producto nuevo
      const slug = await uniqueSlug(p.name, 'product')
      const product = await db.product.create({
        data: {
          name: p.name,
          slug,
          description: p.description,
          price: p.price,
          categoryId: catPersonajes.id,
          stock: 5,
          featured: p.featured,
          status: 'active',
          size: p.size,
          material: 'Hilo acrílico premium, relleno de fibra siliconada',
          height: p.size.match(/(\d+)/)?.[1] + ' cm' || '12 cm',
          productionDays: 5,
          tags: p.tags,
          images: {
            create: [{
              url: IMAGE_MAP[p.character],
              alt: p.name,
              isMain: true,
              order: 0,
            }],
          },
        },
      })
      console.log(`✓ Creado: ${p.name} → ${IMAGE_MAP[p.character]}`)
    }
  }

  // 3. Actualizar about image
  await db.siteConfig.update({
    where: { id: 'singleton' },
    data: { aboutImage: '/uploads/bt21-koya-real.jpg' },
  })
  console.log('✓ About image actualizada')

  // 4. Contar productos totales
  const total = await db.product.count()
  console.log(`\n📊 Total de productos en catálogo: ${total}`)
  console.log('✅ Proceso completo')
}

main().catch(console.error).finally(() => process.exit(0))
