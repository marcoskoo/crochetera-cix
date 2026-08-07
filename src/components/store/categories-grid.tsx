'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'

const CATEGORIES_FALLBACK = [
  { slug: 'ositos', name: 'Ositos', icon: '🧸', description: 'Ositos tejidos en diferentes tamaños' },
  { slug: 'conejitos', name: 'Conejitos', icon: '🐰', description: 'Tiernos conejitos a mano' },
  { slug: 'personajes', name: 'Personajes', icon: '⭐', description: 'Tus personajes favoritos' },
  { slug: 'amigurumis', name: 'Amigurumis', icon: '🎀', description: 'Estilo japonés kawaii' },
  { slug: 'personalizados', name: 'Personalizados', icon: '✨', description: 'Crea el tuyo propio' },
]

export function CategoriesGrid() {
  const products = useStore((s) => s.products)
  const setCategory = useStore((s) => s.setCategory)

  // Agrupar productos por categoría
  const categoryCounts = products.reduce((acc, p) => {
    if (p.category) {
      acc[p.category.slug] = (acc[p.category.slug] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const uniqueCategories = Array.from(
    new Map(products.map((p) => [p.category?.slug, p.category]).filter(([s]) => s)).values(),
  ).filter(Boolean)

  const categoriesToShow =
    uniqueCategories.length > 0
      ? uniqueCategories.map((c) => ({
          slug: c!.slug,
          name: c!.name,
          icon: c!.icon || '🧶',
          description: c!.description || '',
          count: categoryCounts[c!.slug] || 0,
        }))
      : CATEGORIES_FALLBACK.map((c) => ({ ...c, count: 0 }))

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Explora por categorías
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Cada categoría es un mundo de ternura. Encuentra el tipo de peluche que
            más te enamore.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoriesToShow.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="p-6 text-center cursor-pointer hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-accent/30 to-card"
                onClick={() => setCategory(cat.slug)}
              >
                <div className="text-5xl mb-3 yarn-float inline-block">{cat.icon}</div>
                <h3 className="font-display font-bold text-lg mb-1">{cat.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {cat.description}
                </p>
                {cat.count > 0 && (
                  <span className="inline-block text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {cat.count} producto{cat.count !== 1 ? 's' : ''}
                  </span>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
