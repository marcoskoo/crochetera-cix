'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Flame } from 'lucide-react'

interface CountdownTimerProps {
  hours?: number
  title?: string
}

export function CountdownTimer({ hours = 24, title = 'Oferta termina en' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(hours * 60 * 60)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const h = Math.floor(timeLeft / 3600)
  const m = Math.floor((timeLeft % 3600) / 60)
  const s = timeLeft % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-destructive/10 via-primary/10 to-accent/20 border border-destructive/30 rounded-2xl p-6 text-center"
    >
      <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-bold mb-3">
        <Flame className="h-3.5 w-3.5" />
        OFERTA LIMITADA
      </div>
      <h3 className="font-display text-xl font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Usa el cupón <span className="font-mono font-bold text-primary">BIENVENIDA10</span> y obtén 10% off
      </p>
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="bg-card rounded-lg p-3 min-w-16 shadow-sm border border-border">
          <p className="font-display text-2xl font-bold text-destructive">{pad(h)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Horas</p>
        </div>
        <span className="font-display text-2xl font-bold text-destructive">:</span>
        <div className="bg-card rounded-lg p-3 min-w-16 shadow-sm border border-border">
          <p className="font-display text-2xl font-bold text-destructive">{pad(m)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Min</p>
        </div>
        <span className="font-display text-2xl font-bold text-destructive">:</span>
        <div className="bg-card rounded-lg p-3 min-w-16 shadow-sm border border-border">
          <p className="font-display text-2xl font-bold text-destructive">{pad(s)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Seg</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
        <Clock className="h-3 w-3" />
        ¡No dejes pasar esta oportunidad!
      </p>
    </motion.div>
  )
}
