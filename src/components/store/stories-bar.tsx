'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, X, ChevronLeft, ChevronRight, Clock, Eye } from 'lucide-react'
import type { Story } from '@prisma/client'

export function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/stories')
      .then((r) => r.json())
      .then((data: Story[]) => {
        setStories(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Navegación con teclado
  useEffect(() => {
    if (selectedIdx === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIdx(null)
      if (e.key === 'ArrowRight') setSelectedIdx((i) => (i === null ? i : Math.min(i + 1, stories.length - 1)))
      if (e.key === 'ArrowLeft') setSelectedIdx((i) => (i === null ? i : Math.max(i - 1, 0)))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIdx, stories.length])

  if (loading || stories.length === 0) return null

  const currentStory = selectedIdx !== null ? stories[selectedIdx] : null

  // Calcular tiempo restante
  const getTimeLeft = (expiresAt: Date | string) => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours > 0) return `${hours}h`
    const mins = Math.floor(diff / (60 * 1000))
    return `${mins}m`
  }

  return (
    <>
      <section className="py-6 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Historias del taller</h2>
            <span className="text-xs text-muted-foreground">· Desaparecen en 24h</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {stories.map((story, i) => (
              <button
                key={story.id}
                onClick={() => setSelectedIdx(i)}
                className="flex-shrink-0 flex flex-col items-center gap-1 group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-0.5 bg-gradient-to-tr from-primary to-accent">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-background bg-muted">
                    {story.imageUrl && (
                       
                      <img
                        src={story.imageUrl}
                        alt={story.title || 'Story'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-20">
                  {story.title || getTimeLeft(story.expiresAt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Story viewer fullscreen */}
      <AnimatePresence>
        {currentStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center"
            onClick={() => setSelectedIdx(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
              onClick={() => setSelectedIdx(null)}
            >
              <X className="h-8 w-8" />
            </button>

            {/* Nav buttons */}
            {selectedIdx! > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIdx(selectedIdx! - 1)
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {selectedIdx! < stories.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIdx(selectedIdx! + 1)
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
              <motion.div
                key={currentStory.id}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 8, ease: 'linear' }}
                onAnimationComplete={() => {
                  if (selectedIdx! < stories.length - 1) {
                    setSelectedIdx(selectedIdx! + 1)
                  } else {
                    setSelectedIdx(null)
                  }
                }}
                className="h-full bg-white"
              />
            </div>

            {/* Story content */}
            <motion.div
              key={currentStory.id}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative max-w-md w-full mx-4 aspect-[9/16] rounded-2xl overflow-hidden bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              {currentStory.imageUrl && (
                 
                <img
                  src={currentStory.imageUrl}
                  alt={currentStory.title || 'Story'}
                  className="w-full h-full object-cover"
                />
              )}
              {currentStory.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                  <p className="text-white font-medium">{currentStory.title}</p>
                  <p className="text-white/70 text-xs flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3" />
                    Expira en {getTimeLeft(currentStory.expiresAt)}
                    <Eye className="h-3 w-3 ml-2" />
                    {currentStory.views} vistas
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
