'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Snowflake, Heart, Flower, Sun, Ghost, Gift } from 'lucide-react'
import { useStore } from '@/lib/store'

type Season = 'none' | 'navidad' | 'valentin' | 'madre' | 'verano' | 'halloween'

const SEASONS: { id: Season; label: string; icon: typeof Snowflake; color: string; bg: string }[] = [
  { id: 'none', label: 'Normal', icon: Sun, color: '', bg: '' },
  { id: 'navidad', label: 'Navidad', icon: Snowflake, color: '#dc2626', bg: 'radial-gradient(circle at 30% 20%, rgba(220,38,38,0.08), transparent 50%), radial-gradient(circle at 70% 80%, rgba(34,197,94,0.08), transparent 50%)' },
  { id: 'valentin', label: 'San Valentín', icon: Heart, color: '#ec4899', bg: 'radial-gradient(circle at 20% 30%, rgba(236,72,153,0.1), transparent 50%), radial-gradient(circle at 80% 70%, rgba(244,114,182,0.08), transparent 50%)' },
  { id: 'madre', label: 'Día de la Madre', icon: Flower, color: '#d946ef', bg: 'radial-gradient(circle at 50% 20%, rgba(217,70,239,0.08), transparent 50%)' },
  { id: 'verano', label: 'Verano', icon: Sun, color: '#f59e0b', bg: 'radial-gradient(circle at 30% 30%, rgba(245,158,11,0.1), transparent 50%)' },
  { id: 'halloween', label: 'Halloween', icon: Ghost, color: '#7c3aed', bg: 'radial-gradient(circle at 30% 20%, rgba(124,58,237,0.1), transparent 50%), radial-gradient(circle at 70% 80%, rgba(234,88,12,0.06), transparent 50%)' },
]

const STORAGE_KEY = 'crochetera-season'

export function SeasonalTheme() {
  const [season, setSeason] = useState<Season>('none')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Season || 'none'
    /* eslint-disable react-hooks/set-state-in-effect */
    setSeason(stored)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const current = SEASONS.find((s) => s.id === season) || SEASONS[0]

  useEffect(() => {
    if (season === 'none') {
      document.body.style.background = ''
    } else {
      document.body.style.background = current.bg
    }
    // Cambiar color de acento según temporada
    if (season !== 'none' && current.color) {
      document.documentElement.style.setProperty('--ring', current.color)
    } else {
      document.documentElement.style.removeProperty('--ring')
    }
  }, [season, current])

  const changeSeason = (s: Season) => {
    setSeason(s)
    localStorage.setItem(STORAGE_KEY, s)
  }

  return (
    <div className="fixed bottom-32 right-4 z-30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 bg-card/80 backdrop-blur rounded-full shadow-md p-1"
      >
        {SEASONS.map((s) => (
          <button
            key={s.id}
            onClick={() => changeSeason(s.id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              season === s.id ? 'bg-primary text-primary-foreground scale-110' : 'hover:bg-muted'
            }`}
            title={s.label}
            aria-label={s.label}
          >
            <s.icon className="h-4 w-4" style={season === s.id && s.color ? { color: 'white' } : s.color ? { color: s.color } : {}} />
          </button>
        ))}
      </motion.div>
    </div>
  )
}
