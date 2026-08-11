'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Sonido ambiental suave (lo-fi / piano)
// Usamos un audio sintético generado con Web Audio API
// para evitar depender de archivos externos
const AMBIENT_NOTES = [261.63, 329.63, 392.0, 523.25] // C4, E4, G4, C5

export function AmbientMusic() {
  const [playing, setPlaying] = useState(false)
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('crochetera-music')
    if (stored === 'true') setPlaying(true)
  }, [])

  useEffect(() => {
    if (!playing) {
      if (audioCtx) {
        audioCtx.close()
        setAudioCtx(null)
      }
      return
    }

    // Crear contexto de audio
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    setAudioCtx(ctx)

    // Generar notas suaves en loop
    let noteIdx = 0
    const playNote = () => {
      if (!ctx || ctx.state === 'closed') return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = AMBIENT_NOTES[noteIdx % AMBIENT_NOTES.length]
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.5)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 2)
      noteIdx++
    }

    const interval = setInterval(playNote, 3000)
    playNote()

    return () => {
      clearInterval(interval)
      if (ctx.state !== 'closed') ctx.close()
    }
  }, [playing])

  const toggle = () => {
    const next = !playing
    setPlaying(next)
    localStorage.setItem('crochetera-music', String(next))
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="fixed bottom-20 right-4 z-30 h-10 w-10 rounded-full bg-card/80 backdrop-blur shadow-md hover:bg-card"
      aria-label={playing ? 'Silenciar música' : 'Reproducir música'}
      title={playing ? 'Silenciar música ambiental' : 'Música ambiental suave'}
    >
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.div
            key="playing"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
          >
            <Music className="h-4 w-4 text-primary animate-pulse" />
          </motion.div>
        ) : (
          <motion.div
            key="muted"
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -90 }}
          >
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}
