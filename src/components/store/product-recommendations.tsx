'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { ProductCard } from './product-card'
import { Sparkles } from 'lucide-react'
import type { ProductWithRelations } from '@/lib/types'

interface ProductRecommendationsProps {
  currentProductId: string
  categorySlug?: string
  onQuickView?: (product: ProductWithRelations) => void
}

export function ProductRecommendations({
  currentProductId,
  categorySlug,
  onQuickView,
}: ProductRecommendationsProps) {
  const products = useStore((s) => s.products)
  const goToSection = useStore((s) => s.goToSection)

  // Recomendar productos de la misma categoría primero, luego destacados
  const recommendations = products
    .filter((p) => p.id !== currentProductId && p.status === 'active')
    .sort((a, b) => {
      const aSameCat = a.category?.slug === categorySlug ? 1 : 0
      const bSameCat = b.category?.slug === categorySlug ? 1 : 0
      if (aSameCat !== bSameCat) return bSameCat - aSameCat
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    })
    .slice(0, 4)

  if (recommendations.length === 0) return null

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          <Sparkles className="h-4 w-4" />
          Recomendado para ti
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          También te puede gustar
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Peluches que combinan con tu selección
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            index={i}
            onQuickView={onQuickView}
          />
        ))}
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => goToSection('catalog')}
          className="text-sm text-primary hover:underline font-medium"
        >
          Ver todos los peluches →
        </button>
      </div>
    </section>
  )
}
