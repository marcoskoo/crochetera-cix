'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import type { SiteConfig, ProductWithRelations, Category, Testimonial, GalleryImage } from '@/lib/types'

// Hook para cargar datos públicos iniciales
export function usePublicData() {
  const setSiteConfig = useStore((s) => s.setSiteConfig)
  const setProducts = useStore((s) => s.setProducts)
  const siteConfig = useStore((s) => s.siteConfig)
  const products = useStore((s) => s.products)

  // Cargar datos públicos solo una vez al montar
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [siteRes, prodRes] = await Promise.all([
          fetch('/api/site'),
          fetch('/api/products'),
        ])
        const site = siteRes.ok ? await siteRes.json() : null
        const prods = prodRes.ok ? await prodRes.json() : []
        if (cancelled) return
        if (site) setSiteConfig(site)
        if (prods.length) setProducts(prods)
      } catch {
        // silent
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { siteConfig, products }
}

// Helper para aplicar colores del site config en runtime
export function applySiteColors(config: SiteConfig | null) {
  if (typeof window === 'undefined' || !config) return
  const root = document.documentElement
  // No sobrescribimos el sistema de tema, solo podríamos usar variables CSS adicionales
  root.style.setProperty('--site-primary', config.primaryColor)
  root.style.setProperty('--site-secondary', config.secondaryColor)
  root.style.setProperty('--site-accent', config.accentColor)
}

export type { SiteConfig, ProductWithRelations, Category, Testimonial, GalleryImage }
