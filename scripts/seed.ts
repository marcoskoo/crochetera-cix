// Seed inicial para CROCHETERA.CIX
import { db } from '../src/lib/db'
import { uniqueSlug } from '../src/lib/site'

async function main() {
  console.log('🌱 Inicializando datos de CROCHETERA.CIX...')

  // SiteConfig
  await db.siteConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      storeName: 'CROCHETERA.CIX',
      tagline: 'Peluches tejidos a mano con amor',
      heroTitle: 'Peluches tejidos a mano',
      heroSubtitle:
        'Cada pieza es única, elaborada con hilo premium y mucho cariño. Lleva a casa un compañero para toda la vida.',
      heroButtonText: 'Ver catálogo',
      aboutTitle: 'Sobre CROCHETERA.CIX',
      aboutText:
        'Somos un taller artesanal dedicado a crear peluches tejidos a crochet de la más alta calidad. Cada pieza es elaborada a mano con materiales premium y mucho cariño. Trabajamos por pedido, lo que nos permite personalizar cada peluche según tus gustos: colores, tamaño, accesorios. ¡Hacemos realidad el peluche de tus sueños!',
      phone: '+51 999 888 777',
      email: 'hola@crochetera.cix',
      whatsapp: '+51999888777',
      instagram: 'https://instagram.com/crochetera.cix',
      facebook: 'https://facebook.com/crochetera.cix',
      tiktok: 'https://tiktok.com/@crochetera.cix',
      address: 'Lima, Perú',
      primaryColor: '#E91E63',
      secondaryColor: '#8D6E63',
      accentColor: '#F8BBD0',
      shippingInfo:
        'Envíos a todo el país. Producto hecho a pedido, demora 5-7 días hábiles.',
      paymentInfo:
        'Aceptamos transferencia bancaria, Yape, Plin y MercadoPago.',
      currency: 'S/',
    },
  })

  // Categorías
  const categories = [
    { name: 'Ositos', slug: 'ositos', description: 'Ositos tejidos a crochet en diferentes tamaños y colores', icon: '🧸', order: 1 },
    { name: 'Conejitos', slug: 'conejitos', description: 'Tiernos conejitos tejidos a mano', icon: '🐰', order: 2 },
    { name: 'Personajes', slug: 'personajes', description: 'Peluches de personajes populares y personalizados', icon: '⭐', order: 3 },
    { name: 'Amigurumis', slug: 'amigurumis', description: 'Figuras tejidas estilo japonés amigurumi', icon: '🎀', order: 4 },
    { name: 'Personalizados', slug: 'personalizados', description: 'Creamos el peluche que imagines, hecho a tu medida', icon: '✨', order: 5 },
  ]
  const catMap: Record<string, string> = {}
  for (const c of categories) {
    const cat = await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c })
    catMap[c.slug] = cat.id
  }

  // Productos
  const products = [
    { name: 'Osito de Amor Rosado', description: 'Hermoso osito tejido a crochet en color rosado, ideal para regalos especiales. Relleno de fibra siliconada suave y antialérgica. Su tamaño perfecto lo hace ideal para abrazar.', price: 65, oldPrice: 80, categoryId: catMap['ositos'], stock: 5, featured: true, size: 'Mediano (25cm)', material: 'Hilo acrílico premium, relleno de fibra siliconada', height: '25 cm', weight: '180 g', productionDays: 5, tags: 'oso,rosado,amor,regalo' },
    { name: 'Conejito Pastel', description: 'Adorable conejito en tonos pastel, perfecto para decoración infantil. Tejido con hilo suave y relleno hipoalergénico. Orejas largas y tiernas.', price: 55, categoryId: catMap['conejitos'], stock: 8, featured: true, size: 'Pequeño (18cm)', material: 'Hilo de algodón, relleno de fibra siliconada', height: '18 cm', weight: '120 g', productionDays: 4, tags: 'conejo,pastel,decoración,niños' },
    { name: 'Stitch Tejido', description: 'El adorable alien de Lilo & Stitch tejido a mano. Perfecto para fans del personaje. Color azul característico con detalles en azul claro.', price: 85, oldPrice: 100, categoryId: catMap['personajes'], stock: 3, featured: true, size: 'Mediano (30cm)', material: 'Hilo acrílico, relleno de fibra siliconada', height: '30 cm', weight: '220 g', productionDays: 7, tags: 'stitch,disney,personaje,azul' },
    { name: 'Gatito Amigurumi', description: 'Pequeño gatito estilo amigurumi japonés. Diseño minimalista y kawaii. Perfecto como llavero o decoración de escritorio.', price: 35, categoryId: catMap['amigurumis'], stock: 12, featured: false, size: 'Pequeño (12cm)', material: 'Hilo de algodón japonés', height: '12 cm', weight: '60 g', productionDays: 3, tags: 'gato,amigurumi,kawaii,llavero' },
    { name: 'Osito Panda Gigante', description: 'Gran osito panda tejido a crochet. Pieza imponente para decorar tu sala o cuarto. Tejido en blanco y negro con detalles en rosa.', price: 150, categoryId: catMap['ositos'], stock: 2, featured: true, size: 'Grande (45cm)', material: 'Hilo acrílico grueso, relleno de fibra siliconada', height: '45 cm', weight: '450 g', productionDays: 10, tags: 'panda,gigante,oso,blanco,negro' },
    { name: 'Conejito Personalizado', description: 'Conejito hecho a tu medida. Elige el color, el nombre bordado y los accesorios. Perfecto para regalos únicos y especiales.', price: 70, categoryId: catMap['personalizados'], stock: 0, unlimited: true, featured: true, size: 'Mediano (22cm)', material: 'Hilo a elección del cliente', height: '22 cm', weight: '150 g', productionDays: 7, tags: 'personalizado,conejo,regalo,nombre' },
    { name: 'Perrito Salchicha', description: 'Tierno perrito salchicha tejido a crochet. Con patitas largas y cuerpo alargado. Disponible en varios colores.', price: 60, categoryId: catMap['amigurumis'], stock: 6, featured: false, size: 'Mediano (28cm)', material: 'Hilo acrílico suave', height: '28 cm', weight: '160 g', productionDays: 5, tags: 'perro,salchicha,amigurumi,mascota' },
    { name: 'Pikachu Tejido', description: 'El famoso Pokémon amarillo tejido a mano. Con detalles en rojo y negro en las mejillas. Perfecto para fans de Pokémon.', price: 90, oldPrice: 110, categoryId: catMap['personajes'], stock: 4, featured: true, size: 'Mediano (28cm)', material: 'Hilo acrílico amarillo premium', height: '28 cm', weight: '200 g', productionDays: 7, tags: 'pikachu,pokemon,amarillo,personaje' },
  ]

  for (const p of products) {
    const slug = await uniqueSlug(p.name, 'product')
    const exists = await db.product.findUnique({ where: { slug } })
    if (exists) continue
    await db.product.create({ data: { ...p, slug, status: 'active' } })
  }

  // Secciones
  const sections = [
    { key: 'hero', title: 'Sección Principal', subtitle: 'Configuración de la portada', content: '', visible: true, order: 1 },
    { key: 'featured', title: 'Productos Destacados', subtitle: 'Los peluches más queridos', content: 'Descubre nuestras piezas más populares, elegidas por nuestros clientes.', visible: true, order: 2 },
    { key: 'categories', title: 'Explora por Categorías', subtitle: 'Encuentra el peluche perfecto', content: '', visible: true, order: 3 },
    { key: 'about', title: 'Nuestra Historia', subtitle: 'Sobre el taller', content: '', visible: true, order: 4 },
    { key: 'gallery', title: 'Galería', subtitle: 'Mira nuestro trabajo', content: '', visible: true, order: 5 },
    { key: 'testimonials', title: 'Lo que dicen nuestros clientes', subtitle: 'Testimonios reales', content: '', visible: true, order: 6 },
    { key: 'contact', title: 'Contáctanos', subtitle: 'Hagamos tu peluche ideal', content: '', visible: true, order: 7 },
  ]
  for (const s of sections) {
    const existing = await db.section.findUnique({ where: { key: s.key } })
    if (!existing) await db.section.create({ data: s })
  }

  // Testimonios
  const testimonials = [
    { name: 'María Fernanda', message: 'Compré un osito para mi hija y quedó hermoso. La calidad es increíble y se nota el amor puesto en cada detalle. ¡Volveré a comprar!', rating: 5, location: 'Lima', order: 1 },
    { name: 'Carlos Mendoza', message: 'Pedí un peluche personalizado para mi novia con su nombre. Salió perfecto y la entrega fue puntual. Recomendado 100%.', rating: 5, location: 'Arequipa', order: 2 },
    { name: 'Lucía Ramírez', message: 'Los amigurumis son una obra de arte. Tienen un detalle impresionante y son súper suaves. Ya tengo una colección de 5.', rating: 5, location: 'Trujillo', order: 3 },
  ]
  for (const t of testimonials) await db.testimonial.create({ data: t })

  console.log('✅ Datos iniciales cargados correctamente')
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
