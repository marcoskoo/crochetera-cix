'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, ArrowRight, Sparkles, Check } from 'lucide-react'
import { formatPrice } from '@/lib/site'
import { toast } from 'sonner'
import type { Bundle, BundleItem, Product } from '@prisma/client'

type BundleWithItems = Bundle & {
  items: (BundleItem & { product: Product & { images: { url: string; isMain: boolean }[] } })[]
}

export function BundlesSection() {
  const [bundles, setBundles] = useState<BundleWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const addToCart = useStore((s) => s.addToCart)
  const setCartOpen = useStore((s) => s.setCartOpen)
  const goToSection = useStore((s) => s.goToSection)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  useEffect(() => {
    fetch('/api/bundles')
      .then((r) => r.json())
      .then(setBundles)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || bundles.length === 0) return null

  const handleAddBundle = (bundle: BundleWithItems) => {
    bundle.items.forEach((item) => {
      const mainImage = item.product.images.find((i) => i.isMain) || item.product.images[0]
      addToCart({
        productId: item.product.id,
        name: `${item.product.name} (pack: ${bundle.name})`,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: mainImage?.url || null,
      })
    })
    // Aplicar descuento del bundle como cupón automático
    toast.success(`Pack "${bundle.name}" agregado al carrito. ¡Ahorro de ${formatPrice(bundle.originalTotal - bundle.price, currency)}!`)
    setCartOpen(true)
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Package className="h-4 w-4" />
            Packs especiales
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Combos con descuento
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Lleva más de un peluche y ahorra. Packs ideales para regalar o coleccionar.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle, i) => {
            const discount = Math.round(
              ((bundle.originalTotal - bundle.price) / bundle.originalTotal) * 100,
            )
            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 ${bundle.featured ? 'border-primary border-2' : ''}`}>
                  {bundle.featured && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-bold flex items-center justify-center gap-1">
                      <Sparkles className="h-3 w-3" /> MÁS POPULAR
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-display font-bold text-xl mb-1">{bundle.name}</h3>
                        <p className="text-sm text-muted-foreground">{bundle.description}</p>
                      </div>
                      {discount > 0 && (
                        <Badge className="bg-destructive text-destructive-foreground">
                          -{discount}%
                        </Badge>
                      )}
                    </div>

                    {/* Productos del bundle */}
                    <div className="space-y-2 mb-4 bg-muted/50 rounded-lg p-3">
                      {bundle.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-background flex-shrink-0">
                            {item.product.images[0] && (
                               
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="flex-1 line-clamp-1">{item.product.name}</span>
                          <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Precios */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-display text-3xl font-bold text-primary">
                        {formatPrice(bundle.price, currency)}
                      </span>
                      {bundle.originalTotal > bundle.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(bundle.originalTotal, currency)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-600" />
                        Ahorras {formatPrice(bundle.originalTotal - bundle.price, currency)}
                      </span>
                      <span>{bundle.items.length} productos</span>
                    </div>

                    <Button
                      onClick={() => handleAddBundle(bundle)}
                      className="w-full btn-crochet"
                    >
                      Agregar pack al carrito
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => goToSection('catalog')}>
            Ver catálogo individual
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
