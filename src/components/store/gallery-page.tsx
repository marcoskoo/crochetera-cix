'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { X } from 'lucide-react'
import type { GalleryImage } from '@/lib/types'

export function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<GalleryImage | null>(null)

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then(setImages)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Galería
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
          Una colección de nuestros trabajos más especiales. Cada pieza única,
          tejida con dedicación.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-xl font-medium">Galería en preparación</p>
          <p className="text-muted-foreground mt-2">
            Pronto mostraremos aquí nuestros trabajos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 p-0"
                onClick={() => setSelected(img)}
              >
                <div className="aspect-square bg-muted">
                  { }
                  <img
                    src={img.url}
                    alt={img.title || ''}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {(img.title || img.caption) && (
                  <div className="p-3">
                    {img.title && (
                      <p className="font-medium text-sm line-clamp-1">{img.title}</p>
                    )}
                    {img.caption && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {img.caption}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de imagen grande */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setSelected(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="max-w-3xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            { }
            <img
              src={selected.url}
              alt={selected.title || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            {(selected.title || selected.caption) && (
              <div className="text-white text-center mt-4">
                {selected.title && (
                  <p className="font-display text-xl font-bold">{selected.title}</p>
                )}
                {selected.caption && (
                  <p className="text-white/70 text-sm">{selected.caption}</p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
