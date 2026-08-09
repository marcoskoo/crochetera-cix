'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart, MessageCircle, Star, ArrowRight, Ruler, Clock } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/site'
import { toast } from 'sonner'
import type { ProductWithRelations } from '@/lib/types'
import { motion } from 'framer-motion'

interface QuickViewModalProps {
  product: ProductWithRelations | null
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const addToCart = useStore((s) => s.addToCart)
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const isInWishlist = useStore((s) => s.isInWishlist)
  const openProduct = useStore((s) => s.openProduct)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  if (!product) return null

  const mainImage = product.images.find((i) => i.isMain) || product.images[0]
  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const inStock = product.unlimited || product.stock > 0
  const liked = isInWishlist(product.id)
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  const handleAdd = () => {
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
    onOpenChange(false)
  }

  const handleSeeMore = () => {
    onOpenChange(false)
    openProduct(product.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-muted">
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
                -{Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)}%
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col">
            {product.category && (
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                {product.category.icon} {product.category.name}
              </p>
            )}
            <h2 className="font-display text-2xl font-bold mb-2">{product.name}</h2>

            {avgRating > 0 && (
              <div className="flex items-center gap-1 mb-3">
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
                  {avgRating.toFixed(1)} ({product.reviews.length})
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-display text-3xl font-bold text-primary">
                {formatPrice(product.price, currency)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.oldPrice!, currency)}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-4 mb-4 flex-1">
              {product.description}
            </p>

            <div className="space-y-1.5 text-sm mb-4">
              {product.size && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="h-4 w-4 text-primary" /> {product.size}
                </p>
              )}
              {product.productionDays && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" /> Elaboración: {product.productionDays} días
                </p>
              )}
              <p className="flex items-center gap-2">
                {inStock ? (
                  <span className="text-green-600 font-medium">✓ Disponible</span>
                ) : (
                  <span className="text-destructive font-medium">Agotado</span>
                )}
              </p>
            </div>

            <div className="flex gap-2 mb-2">
              <Button onClick={handleAdd} disabled={!inStock} className="flex-1 btn-crochet">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agregar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toggleWishlist(product.id)
                  toast.success(liked ? 'Quitado de favoritos' : 'Añadido a favoritos 💖')
                }}
                className={liked ? 'border-primary text-primary' : ''}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-primary' : ''}`} />
              </Button>
            </div>

            {siteConfig?.whatsapp && (
              <a
                href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `¡Hola! 🧶 Me interesa: *${product.name}* (${formatPrice(product.price, currency)})`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50 mb-2">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Pedir por WhatsApp
                </Button>
              </a>
            )}

            <Button variant="ghost" onClick={handleSeeMore} className="w-full">
              Ver detalles completos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
