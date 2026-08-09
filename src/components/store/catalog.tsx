'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { Category, ProductWithRelations } from '@/lib/types'

interface CatalogProps {
  onQuickView?: (product: ProductWithRelations) => void
}

export function Catalog({ onQuickView }: CatalogProps) {
  const products = useStore((s) => s.products)
  const selectedCategory = useStore((s) => s.selectedCategory)
  const searchQuery = useStore((s) => s.searchQuery)
  const setCategory = useStore((s) => s.setCategory)
  const setSearch = useStore((s) => s.setSearch)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'recent' | 'price-asc' | 'price-desc'>('recent')

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false))
  }, [])

  const filtered = products
    .filter((p) => !selectedCategory || selectedCategory === 'all' || p.category?.slug === selectedCategory)
    .filter((p) =>
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <section id="catalog" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Catálogo completo
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Explora todos nuestros peluches tejidos a mano. Filtra por categoría para
            encontrar justo lo que buscas.
          </p>
        </motion.div>

        {/* Filtros */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar peluches..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="recent">Más recientes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>

          {/* Pills de categorías */}
          {loading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!selectedCategory || selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory(null)}
                className="rounded-full"
              >
                Todos
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat.slug)}
                  className="rounded-full"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Grid de productos */}
        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🧶</div>
            <p className="text-xl font-medium">No encontramos peluches</p>
            <p className="text-muted-foreground mt-2">
              Prueba con otra búsqueda o categoría.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch('')
                setCategory(null)
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sorted.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onQuickView={onQuickView} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
