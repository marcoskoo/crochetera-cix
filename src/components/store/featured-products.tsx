'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'

export function FeaturedProducts() {
  const products = useStore((s) => s.products)
  const goToSection = useStore((s) => s.goToSection)
  const featured = products.filter((p) => p.featured).slice(0, 8)

  if (featured.length === 0) return null

  return (
    <section id="featured" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Los más queridos
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Productos destacados
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            Descubre nuestras piezas más populares, elegidas con cariño por nuestros clientes
            para regalos especiales y momentos únicos.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            onClick={() => goToSection('catalog')}
            className="h-12 px-8"
          >
            Ver todos los peluches
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
