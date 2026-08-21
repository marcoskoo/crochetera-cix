'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Search, X, ArrowRight } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/site'
import type { ProductWithRelations } from '@/lib/types'

export function SearchAutocomplete() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const products = useStore((s) => s.products)
  const openProduct = useStore((s) => s.openProduct)
  const goToSection = useStore((s) => s.goToSection)
  const setCategory = useStore((s) => s.setCategory)
  const setSearch = useStore((s) => s.setSearch)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  const results = useMemo<ProductWithRelations[]>(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products
      .filter(
        (p) =>
          p.status === 'active' &&
          (p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.tags || '').toLowerCase().includes(q) ||
            (p.category?.name || '').toLowerCase().includes(q)),
      )
      .slice(0, 6)
  }, [query, products])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (product: ProductWithRelations) => {
    setOpen(false)
    setQuery('')
    openProduct(product.id)
  }

  const handleSeeAll = () => {
    setSearch(query)
    setCategory(null)
    goToSection('catalog')
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar peluches..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              handleSeeAll()
            }
            if (e.key === 'Escape') {
              setOpen(false)
              setQuery('')
            }
          }}
          className="pl-10 pr-10 max-w-xs"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 min-w-80"
          >
            {results.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No encontramos peluches para "{query}"
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto">
                  {results.map((product) => {
                    const mainImage = product.images.find((i) => i.isMain) || product.images[0]
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleSelect(product)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition text-left border-b border-border last:border-0"
                      >
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {mainImage ? (
                             
                            <img
                              src={mainImage.url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🧶</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.category?.icon} {product.category?.name}
                          </p>
                        </div>
                        <span className="font-bold text-primary text-sm">
                          {formatPrice(product.price, currency)}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={handleSeeAll}
                  className="w-full p-3 text-sm text-primary font-medium hover:bg-primary/5 transition flex items-center justify-center gap-1 bg-muted/30"
                >
                  Ver todos los resultados
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
