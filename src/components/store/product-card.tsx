'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/site'
import type { ProductWithRelations } from '@/lib/types'
import { toast } from 'sonner'

interface ProductCardProps {
  product: ProductWithRelations
  index?: number
  onQuickView?: (product: ProductWithRelations) => void
}

export function ProductCard({ product, index = 0, onQuickView }: ProductCardProps) {
  const openProduct = useStore((s) => s.openProduct)
  const addToCart = useStore((s) => s.addToCart)
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const isInWishlist = useStore((s) => s.isInWishlist)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  const mainImage = product.images.find((i) => i.isMain) || product.images[0]
  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const discount = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0
  const inStock = product.unlimited || product.stock > 0
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0
  const liked = isInWishlist(product.id)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!inStock) {
      toast.error('Producto agotado')
      return
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: mainImage?.url || null,
    })
    toast.success(`${product.name} agregado al carrito`)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleWishlist(product.id)
    toast.success(liked ? 'Quitado de favoritos' : 'Añadido a favoritos 💖')
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onQuickView) onQuickView(product)
    else openProduct(product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card
        className="group relative overflow-hidden cursor-pointer border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 p-0"
        onClick={() => openProduct(product.id)}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {mainImage ? (
             
            <img
              src={mainImage.url}
              alt={mainImage.alt || product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-accent/50 to-secondary">
              🧶
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{discount}%
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-primary text-primary-foreground">
                ★ Destacado
              </Badge>
            )}
            {!inStock && (
              <Badge variant="secondary">Agotado</Badge>
            )}
          </div>

          {/* Wishlist button (top-right) */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleWishlist}
            className={`absolute top-2 right-2 h-9 w-9 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur shadow-sm hover:bg-white dark:hover:bg-black/90 transition-all ${
              liked ? 'text-primary opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-primary' : ''}`} />
          </Button>

          {/* Quick actions (bottom) */}
          <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {onQuickView && (
              <Button
                size="icon"
                variant="secondary"
                onClick={handleQuickView}
                className="h-10 w-10 rounded-full shadow-lg bg-white dark:bg-card hover:bg-muted"
                title="Vista rápida"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              onClick={handleQuickAdd}
              disabled={!inStock}
              className="h-10 w-10 rounded-full shadow-lg btn-crochet"
              title="Agregar al carrito"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-1.5">
          {product.category && (
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {product.category.icon} {product.category.name}
            </p>
          )}
          <h3 className="font-semibold text-base line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {avgRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {avgRating.toFixed(1)} ({product.reviews.length})
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-display text-xl font-bold text-primary">
              {formatPrice(product.price, currency)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice!, currency)}
              </span>
            )}
          </div>

          {product.size && (
            <p className="text-xs text-muted-foreground">📏 {product.size}</p>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
