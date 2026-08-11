'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/site'
import { GitCompare, X, Eye, ArrowRight, Trash2, ShoppingBag } from 'lucide-react'
import type { ProductWithRelations } from '@/lib/types'

export function ComparePage() {
  const compareList = useStore((s) => s.compareList)
  const products = useStore((s) => s.products)
  const toggleCompare = useStore((s) => s.toggleCompare)
  const clearCompare = useStore((s) => s.clearCompare)
  const openProduct = useStore((s) => s.openProduct)
  const goToSection = useStore((s) => s.goToSection)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  const items = compareList
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as ProductWithRelations[]

  // Filas de comparación
  const rows: {
    label: string
    render: (p: ProductWithRelations) => ReactNode
  }[] = [
    {
      label: 'Imagen',
      render: (p) => {
        const img = p.images.find((i) => i.isMain) || p.images[0]
        return (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted mx-auto">
            {img ? (
              <img
                src={img.url}
                alt={img.alt || p.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-accent/40 to-secondary">
                🧶
              </div>
            )}
          </div>
        )
      },
    },
    {
      label: 'Precio',
      render: (p) => (
        <span className="font-display text-lg font-bold text-primary">
          {formatPrice(p.price, currency)}
        </span>
      ),
    },
    {
      label: 'Categoría',
      render: (p) =>
        p.category ? (
          <span className="text-sm">
            {p.category.icon ? `${p.category.icon} ` : ''}
            {p.category.name}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      label: 'Tamaño',
      render: (p) =>
        p.size ? <span className="text-sm">{p.size}</span> : <span className="text-muted-foreground text-sm">—</span>,
    },
    {
      label: 'Alto',
      render: (p) =>
        p.height ? <span className="text-sm">{p.height}</span> : <span className="text-muted-foreground text-sm">—</span>,
    },
    {
      label: 'Peso',
      render: (p) =>
        p.weight ? <span className="text-sm">{p.weight}</span> : <span className="text-muted-foreground text-sm">—</span>,
    },
    {
      label: 'Material',
      render: (p) =>
        p.material ? <span className="text-sm">{p.material}</span> : <span className="text-muted-foreground text-sm">—</span>,
    },
    {
      label: 'Disponibilidad',
      render: (p) => {
        const inStock = p.unlimited || p.stock > 0
        return inStock ? (
          <Badge className="bg-green-600 text-white hover:bg-green-600">En stock</Badge>
        ) : (
          <Badge variant="secondary">Agotado</Badge>
        )
      },
    },
  ]

  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3">
          <GitCompare className="h-10 w-10 text-primary" />
          Comparar productos
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">
          {items.length === 0
            ? 'Compara hasta 4 peluches lado a lado para decidir cuál te llevas.'
            : `Comparando ${items.length} de 4 productos.`}
        </p>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 max-w-md mx-auto"
        >
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <GitCompare className="h-12 w-12 text-primary/60" />
          </div>
          <p className="text-lg font-medium mb-2">No hay productos para comparar</p>
          <p className="text-muted-foreground text-sm mb-6">
            Agrega peluches a la comparación desde el catálogo usando el botón de comparar.
          </p>
          <Button onClick={() => goToSection('catalog')} className="btn-crochet">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Explorar catálogo
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Vaciar comparación
            </Button>
          </div>

          {/* Tabla con scroll horizontal en móvil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider min-w-[120px]">
                        Característica
                      </th>
                      {items.map((p) => (
                        <th key={p.id} className="p-4 min-w-[200px] align-top">
                          <div className="relative group">
                            <button
                              onClick={() => toggleCompare(p.id)}
                              className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center shadow-sm z-10"
                              aria-label={`Quitar ${p.name} de la comparación`}
                              title="Quitar de la comparación"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <h3 className="font-display font-bold text-base pr-6 leading-tight">
                              {p.name}
                            </h3>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr
                        key={row.label}
                        className={ri % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                      >
                        <td className="p-4 font-medium text-sm text-muted-foreground border-r border-border">
                          {row.label}
                        </td>
                        {items.map((p) => (
                          <td key={p.id} className="p-4 text-center">
                            {row.render(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Fila de acción */}
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium text-sm text-muted-foreground border-r border-border">
                        Acción
                      </td>
                      {items.map((p) => (
                        <td key={p.id} className="p-4 text-center">
                          <Button
                            size="sm"
                            onClick={() => openProduct(p.id)}
                            className="btn-crochet"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalle
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => goToSection('catalog')}
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Seguir explorando
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
