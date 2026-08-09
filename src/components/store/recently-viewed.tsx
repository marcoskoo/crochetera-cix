'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { Heart, ArrowRight } from 'lucide-react'

export function RecentlyViewed() {
  const recentlyViewed = useStore((s) => s.recentlyViewed)
  const products = useStore((s) => s.products)
  const goToSection = useStore((s) => s.goToSection)

  if (recentlyViewed.length === 0) return null

  const recentProducts = recentlyViewed
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4) as typeof products

  if (recentProducts.length === 0) return null

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Vistos recientemente
          </h2>
          <Button variant="ghost" size="sm" onClick={() => goToSection('catalog')}>
            Ver todo <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
