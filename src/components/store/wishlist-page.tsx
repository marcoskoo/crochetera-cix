'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { Heart, ArrowRight } from 'lucide-react'

export function WishlistPage() {
  const wishlist = useStore((s) => s.wishlist)
  const products = useStore((s) => s.products)
  const goToSection = useStore((s) => s.goToSection)

  const wishlistProducts = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products

  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3">
          <Heart className="h-10 w-10 text-primary fill-primary" />
          Mi lista de deseos
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">
          {wishlistProducts.length === 0
            ? 'Aún no tienes peluches en favoritos.'
            : `${wishlistProducts.length} peluche(s) que te encantan.`}
        </p>
      </motion.div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <Heart className="h-12 w-12 text-primary/60" />
          </div>
          <p className="text-lg font-medium mb-2">Tu lista está vacía</p>
          <p className="text-muted-foreground text-sm mb-6">
            Toca el corazón en cualquier peluche para guardarlo aquí y no perderlo de vista.
          </p>
          <Button onClick={() => goToSection('catalog')} className="btn-crochet">
            Explorar catálogo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
