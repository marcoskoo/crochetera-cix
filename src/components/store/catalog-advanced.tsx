'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Search, SlidersHorizontal, X, Filter, LayoutGrid, List } from 'lucide-react'
import type { Category, ProductWithRelations } from '@/lib/types'

const SIZES = ['Pequeño', 'Mediano', 'Grande', 'Extra Grande']

export function CatalogAdvanced() {
  const products = useStore((s) => s.products)
  const selectedCategory = useStore((s) => s.selectedCategory)
  const searchQuery = useStore((s) => s.searchQuery)
  const setCategory = useStore((s) => s.setCategory)
  const setSearch = useStore((s) => s.setSearch)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [onlyDiscount, setOnlyDiscount] = useState(false)
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sort, setSort] = useState<'recent' | 'price-asc' | 'price-desc' | 'featured'>('recent')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useMemo(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false))
  }, [])

  const maxPrice = useMemo(() => {
    return Math.max(...products.map((p) => p.price), 200)
  }, [products])

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (p.status !== 'active') return false
        if (selectedCategory && selectedCategory !== 'all' && p.category?.slug !== selectedCategory) return false
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          if (!p.name.toLowerCase().includes(q) &&
              !p.description.toLowerCase().includes(q) &&
              !(p.tags || '').toLowerCase().includes(q)) return false
        }
        if (p.price < priceRange[0] || p.price > priceRange[1]) return false
        if (selectedSizes.length > 0) {
          const matches = selectedSizes.some((s) => p.size?.toLowerCase().includes(s.toLowerCase()))
          if (!matches) return false
        }
        if (onlyDiscount && !(p.oldPrice && p.oldPrice > p.price)) return false
        if (onlyInStock && !(p.unlimited || p.stock > 0)) return false
        return true
      })
      .sort((a, b) => {
        switch (sort) {
          case 'price-asc': return a.price - b.price
          case 'price-desc': return b.price - a.price
          case 'featured': return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
          default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })
  }, [products, selectedCategory, searchQuery, priceRange, selectedSizes, onlyDiscount, onlyInStock, sort])

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    )
  }

  const clearFilters = () => {
    setPriceRange([0, maxPrice])
    setSelectedSizes([])
    setOnlyDiscount(false)
    setOnlyInStock(false)
    setSearch('')
    setCategory(null)
  }

  const activeFiltersCount =
    (selectedSizes.length > 0 ? 1 : 0) +
    (onlyDiscount ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)

  const renderFilters = () => (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-3 block">Categoría</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory || selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(null)}
            className="rounded-full"
          >
            Todas
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
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">
          Precio: {currency} {priceRange[0]} - {currency} {priceRange[1]}
        </Label>
        <Slider
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          min={0}
          max={maxPrice}
          step={5}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Tamaño</Label>
        <div className="grid grid-cols-2 gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                selectedSizes.includes(size)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="discount" className="text-sm">Solo con descuento</Label>
          <Switch id="discount" checked={onlyDiscount} onCheckedChange={setOnlyDiscount} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="stock" className="text-sm">Solo disponibles</Label>
          <Switch id="stock" checked={onlyInStock} onCheckedChange={setOnlyInStock} />
        </div>
      </div>

      <Button onClick={clearFilters} variant="outline" className="w-full">
        <X className="h-4 w-4 mr-1" /> Limpiar filtros
      </Button>
    </div>
  )

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
            Encuentra el peluche perfecto. Usa los filtros para refinar tu búsqueda.
          </p>
        </motion.div>

        {/* Barra de búsqueda + filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
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

          {/* Filtros desktop */}
          <div className="hidden md:flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="recent">Más recientes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="featured">Destacados primero</option>
            </select>

            <div className="flex border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                aria-label="Vista cuadrícula"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                aria-label="Vista lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="h-4 w-4 mr-1" /> Filtros
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros avanzados</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {renderFilters()}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Filtros móvil */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden relative">
                <SlidersHorizontal className="h-4 w-4 mr-1" /> Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                {renderFilters()}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Categorías pills (siempre visibles) */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} peluche(s) encontrado(s)
        </p>

        {/* Grid de productos */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-medium">No encontramos peluches</p>
            <p className="text-muted-foreground mt-2 mb-4">
              Prueba ajustando los filtros.
            </p>
            <Button onClick={clearFilters} variant="outline">
              <X className="h-4 w-4 mr-1" /> Limpiar filtros
            </Button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p, i) => (
              <ProductListRow key={p.id} product={p} currency={currency} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ProductListRow({ product, currency }: { product: ProductWithRelations; currency: string }) {
  const openProduct = useStore((s) => s.openProduct)
  const addToCart = useStore((s) => s.addToCart)
  const mainImage = product.images.find((i) => i.isMain) || product.images[0]
  const inStock = product.unlimited || product.stock > 0

  return (
    <div
      className="flex gap-4 p-3 bg-card border border-border rounded-lg hover:shadow-md transition cursor-pointer"
      onClick={() => openProduct(product.id)}
    >
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {mainImage ? (
           
          <img src={mainImage.url} alt={mainImage.alt || product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🧶</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm md:text-base line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-primary">{currency} {product.price.toFixed(2)}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">{currency} {product.oldPrice.toFixed(2)}</span>
          )}
          {!inStock && <span className="text-xs text-destructive">· Agotado</span>}
        </div>
      </div>
      <Button
        size="sm"
        className="btn-crochet flex-shrink-0"
        disabled={!inStock}
        onClick={(e) => {
          e.stopPropagation()
          addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: mainImage?.url || null,
          })
        }}
      >
        Agregar
      </Button>
    </div>
  )
}
