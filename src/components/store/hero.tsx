'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart, Sparkles, Star } from 'lucide-react'
import { useState } from 'react'

export function Hero() {
  const siteConfig = useStore((s) => s.siteConfig)
  const goToSection = useStore((s) => s.goToSection)
  const setCategory = useStore((s) => s.setCategory)

  const [floatingHearts] = useState<
    { id: number; x: number; delay: number; duration: number }[]
  >(() =>
    Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
    })),
  )

  return (
    <section className="relative overflow-hidden hero-gradient dark:hero-gradient-dark">
      {/* Floating hearts background */}
      {floatingHearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute text-primary/20 pointer-events-none"
          style={{ left: `${h.x}%`, bottom: -20 }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -800, opacity: [0, 0.5, 0] }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Heart className="h-6 w-6 fill-current" />
        </motion.div>
      ))}

      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-accent/40 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Hecho a mano · 100% artesanal
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              {siteConfig?.heroTitle || 'Peluches tejidos a mano'}
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              {siteConfig?.heroSubtitle ||
                'Cada pieza es única, hecha con amor y materiales premium.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Button
                size="lg"
                className="btn-crochet text-base h-12 px-8"
                onClick={() => {
                  setCategory(null)
                  goToSection('catalog')
                }}
              >
                {siteConfig?.heroButtonText || 'Ver catálogo'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                onClick={() => goToSection('about')}
              >
                Conócenos
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { value: '500+', label: 'Peluches creados' },
                { value: '5★', label: 'Calificación' },
                { value: '100%', label: 'Hecho a mano' },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <p className="font-display text-2xl md:text-3xl font-bold text-primary">
                    {s.value}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Big crochet ball */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary rounded-full opacity-90 shadow-2xl" />
              <div className="absolute inset-4 bg-gradient-to-tr from-accent to-primary rounded-full opacity-80" />
              <div className="absolute inset-8 bg-gradient-to-bl from-secondary to-accent rounded-full" />

              {/* Emoji center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[12rem] md:text-[16rem] yarn-float drop-shadow-2xl">🧸</span>
              </div>

              {/* Floating badges */}
              <motion.div
                className="absolute top-4 -left-4 bg-card rounded-2xl shadow-lg p-3 border border-border"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p className="text-xs font-bold">5.0 / 5</p>
                    <p className="text-[10px] text-muted-foreground">+200 reseñas</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-8 -right-4 bg-card rounded-2xl shadow-lg p-3 border border-border"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 fill-primary text-primary" />
                  <div>
                    <p className="text-xs font-bold">Hecho con amor</p>
                    <p className="text-[10px] text-muted-foreground">Cada puntada</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-1/2 -right-8 bg-card rounded-2xl shadow-lg p-3 border border-border"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              >
                <p className="text-xs font-bold">🧶 Hilo premium</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          className="w-full h-12 md:h-20 fill-background"
          preserveAspectRatio="none"
        >
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  )
}
