'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Instagram, ExternalLink } from 'lucide-react'

export function InstagramFeed() {
  const siteConfig = useStore((s) => s.siteConfig)

  if (!siteConfig?.instagram) return null

  // Galeria simulada con placeholders de productos
  // En producción se conectaría a la API de Instagram
  const sampleImages = [
    '/uploads/bt21-tata.jpg',
    '/uploads/bt21-koya.jpg',
    '/uploads/bt21-chimmy.jpg',
    '/uploads/bt21-rj.jpg',
    '/uploads/hero-bt21-tata.jpg',
    '/uploads/peluche-1.jpg',
  ]

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Instagram className="h-4 w-4" />
            Síguenos en Instagram
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            @{siteConfig.instagram.replace(/.*instagram\.com\//, '').replace('/', '')}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Mira nuestros peluches en la vida real, behind the scenes del taller y novedades que subimos cada semana.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {sampleImages.map((img, i) => (
            <motion.a
              key={i}
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="aspect-square rounded-lg overflow-hidden bg-muted group relative"
            >
              { }
              <img
                src={img}
                alt={`Instagram post ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-white" />
              </div>
            </motion.a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform"
          >
            <Instagram className="h-5 w-5" />
            Ver más en Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
