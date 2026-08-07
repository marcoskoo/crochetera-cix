'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Heart, Sparkles, Award, Truck, Palette } from 'lucide-react'

export function AboutSection() {
  const siteConfig = useStore((s) => s.siteConfig)
  const goToSection = useStore((s) => s.goToSection)

  const features = [
    {
      icon: Heart,
      title: 'Hecho con amor',
      description: 'Cada puntada lleva dedicación y cariño. No hay dos peluches iguales.',
    },
    {
      icon: Award,
      title: 'Materiales premium',
      description: 'Usamos hilo de alta calidad y relleno de fibra siliconada antialérgica.',
    },
    {
      icon: Palette,
      title: '100% personalizable',
      description: 'Elige colores, tamaño, accesorios y bordados. Tu peluche, tu estilo.',
    },
    {
      icon: Truck,
      title: 'Envíos a todo el país',
      description: 'Llevamos tus peluches a cualquier rincón con cuidado y rapidez.',
    },
  ]

  return (
    <section id="about" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary rounded-3xl rotate-6" />
              <div className="absolute inset-0 bg-card rounded-3xl -rotate-3 shadow-xl flex items-center justify-center overflow-hidden">
                {siteConfig?.aboutImage ? (
                   
                  <img
                    src={siteConfig.aboutImage}
                    alt="Sobre nosotras"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[12rem]">🧶</div>
                )}
              </div>
              <motion.div
                className="absolute -top-6 -right-6 bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg"
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="h-8 w-8" />
              </motion.div>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Heart className="h-4 w-4" />
              Nuestra historia
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-6">
              {siteConfig?.aboutTitle || 'Sobre CROCHETERA.CIX'}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {siteConfig?.aboutText ||
                'Somos un taller artesanal dedicado a crear peluches tejidos a crochet.'}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              className="btn-crochet"
              onClick={() => goToSection('contact')}
            >
              Contáctanos para tu peluche
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
