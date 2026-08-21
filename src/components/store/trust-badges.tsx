'use client'

import { motion } from 'framer-motion'
import { Shield, Heart, Truck, Award } from 'lucide-react'

export function TrustBadges() {
  const badges = [
    { icon: Shield, title: 'Pago seguro', desc: 'Transacciones protegidas' },
    { icon: Heart, title: 'Hecho a mano', desc: 'Cada puntada con amor' },
    { icon: Truck, title: 'Envíos nacionales', desc: 'A todo el Perú' },
    { icon: Award, title: 'Calidad premium', desc: 'Materiales seleccionados' },
  ]

  return (
    <section className="py-8 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <badge.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{badge.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
