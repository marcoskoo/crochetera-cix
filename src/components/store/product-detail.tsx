'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Ruler,
  Package,
  Clock,
  Tag,
  Check,
  Minus,
  Plus,
  Play,
} from 'lucide-react'
import { formatPrice, getEmbedUrl, detectVideoType } from '@/lib/site'
import { toast } from 'sonner'
import type { ProductWithRelations } from '@/lib/types'

export function ProductDetail() {
  const selectedProductId = useStore((s) => s.selectedProductId)
  const goToSection = useStore((s) => s.goToSection)
  const addToCart = useStore((s) => s.addToCart)
  const setCartOpen = useStore((s) => s.setCartOpen)
  const products = useStore((s) => s.products)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  const [product, setProduct] = useState<ProductWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    if (!selectedProductId) {
      return
    }
    let cancelled = false
    // Reset states when product changes
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true)
    setProduct(null)
    setActiveImageIdx(0)
    setQuantity(1)
    setShowVideo(false)
    /* eslint-enable react-hooks/set-state-in-effect */

    // Intentar del cache primero
    const cached = products.find((p) => p.id === selectedProductId)
    if (cached) {
      setProduct(cached)
      setLoading(false)
    }

    fetch(`/api/products/${selectedProductId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !cancelled) setProduct(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedProductId, products])

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl">Producto no encontrado</p>
        <Button onClick={() => goToSection('catalog')} className="mt-4">
          Volver al catálogo
        </Button>
      </section>
    )
  }

  const mainImage = product.images[activeImageIdx] || product.images[0]
  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const inStock = product.unlimited || product.stock > 0
  const discount = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error('Producto agotado')
      return
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: mainImage?.url || null,
    })
    toast.success(`${quantity} × ${product.name} agregado(s)`)
    setCartOpen(true)
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => goToSection('catalog')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver al catálogo
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Galería */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg">
            {product.videos.length > 0 && !showVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-7 w-7 text-primary fill-primary ml-1" />
                </div>
              </button>
            )}
            {mainImage ? (
               
              <img
                src={mainImage.url}
                alt={mainImage.alt || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl">
                🧶
              </div>
            )}
            {hasDiscount && (
              <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                -{discount}% OFF
              </Badge>
            )}
          </div>

          {/* Thumbs */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                    idx === activeImageIdx
                      ? 'border-primary'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  { }
                  <img
                    src={img.url}
                    alt={img.alt || ''}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Video player */}
          {product.videos.length > 0 && showVideo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="aspect-video rounded-2xl overflow-hidden bg-black"
            >
              {detectVideoType(product.videos[0].url) === 'mp4' ? (
                <video
                  src={product.videos[0].url}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  src={getEmbedUrl(product.videos[0].url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={product.name}
                />
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          {product.category && (
            <Badge variant="outline">
              {product.category.icon} {product.category.name}
            </Badge>
          )}

          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            {product.name}
          </h1>

          {avgRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} · {product.reviews.length} reseña(s)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-primary">
              {formatPrice(product.price, currency)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.oldPrice!, currency)}
              </span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          {/* Características */}
          <div className="grid sm:grid-cols-2 gap-3 py-4 border-t border-b border-border">
            {product.size && (
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Tamaño:</span>
                <span className="font-medium">{product.size}</span>
              </div>
            )}
            {product.height && (
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Altura:</span>
                <span className="font-medium">{product.height}</span>
              </div>
            )}
            {product.material && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Material:</span>
                <span className="font-medium">{product.material}</span>
              </div>
            )}
            {product.weight && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Peso:</span>
                <span className="font-medium">{product.weight}</span>
              </div>
            )}
            {product.productionDays && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Elaboración:</span>
                <span className="font-medium">{product.productionDays} días</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              {inStock ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    {product.unlimited
                      ? 'Disponible (hecho a pedido)'
                      : `${product.stock} en stock`}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-destructive">Agotado</span>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          {product.tags && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.split(',').map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs bg-accent/40 text-foreground px-2 py-1 rounded-full"
                >
                  <Tag className="h-3 w-3" />
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Cantidad y comprar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 font-semibold min-w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="btn-crochet flex-1 min-w-40"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {inStock ? 'Agregar al carrito' : 'Agotado'}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => toast.info('Añadido a favoritos (próximamente)')}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Info envíos */}
          <div className="bg-accent/20 rounded-xl p-4 text-sm">
            <p className="font-medium mb-1">🚚 Información de envío</p>
            <p className="text-muted-foreground">
              {siteConfig?.shippingInfo ||
                'Producto hecho a pedido. Demora 5-7 días hábiles en elaboración.'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Reseñas */}
      {product.reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-6">
            Reseñas de clientes
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {product.reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                      {r.author.charAt(0)}
                    </div>
                    <span className="font-medium text-sm">{r.author}</span>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < r.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
