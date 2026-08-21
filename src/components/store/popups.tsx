'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Gift, X, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const STORAGE_KEY_EXIT = 'crochetera-exit-popup-shown'
const STORAGE_KEY_WELCOME = 'crochetera-welcome-popup-shown'

export function Popups() {
  const [showExit, setShowExit] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  // Welcome popup - primera visita
  useEffect(() => {
    const welcomeShown = localStorage.getItem(STORAGE_KEY_WELCOME)
    if (!welcomeShown) {
      const timer = setTimeout(() => setShowWelcome(true), 4000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Exit intent popup
  useEffect(() => {
    const exitShown = localStorage.getItem(STORAGE_KEY_EXIT)
    if (exitShown) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showWelcome) {
        setShowExit(true)
        localStorage.setItem(STORAGE_KEY_EXIT, '1')
        document.removeEventListener('mouseleave', handleMouseLeave)
      }
    }

    // Solo activar después de 30s en la página
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave)
    }, 30000)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [showWelcome])

  const handleSubscribe = async (popup: 'exit' | 'welcome') => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Ingresa un email válido')
      return
    }
    setLoading(true)
    try {
      // Suscribir al newsletter
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: 'Popup' }),
      })
      if (res.ok) {
        setSubscribed(true)
        localStorage.setItem(popup === 'exit' ? STORAGE_KEY_EXIT : STORAGE_KEY_WELCOME, '1')
        toast.success('¡Cupón enviado a tu email! 🎉')
        // Copiar código al portapapeles
        navigator.clipboard?.writeText('BIENVENIDA10').catch(() => {})
        setTimeout(() => {
          setShowExit(false)
          setShowWelcome(false)
          setSubscribed(false)
          setEmail('')
        }, 3000)
      }
    } catch {
      toast.error('Error al suscribir')
    } finally {
      setLoading(false)
    }
  }

  const closeWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem(STORAGE_KEY_WELCOME, '1')
  }

  const closeExit = () => {
    setShowExit(false)
  }

  const PopupCard = ({ type }: { type: 'exit' | 'welcome' }) => (
    <div className="bg-card rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-accent/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/20 to-primary/10 rounded-full blur-2xl" />

      <button
        onClick={type === 'exit' ? closeExit : closeWelcome}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative">
        {subscribed ? (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
            >
              <Gift className="h-10 w-10 text-green-600" />
            </motion.div>
            <h3 className="font-display text-2xl font-bold mb-2">¡Listo! 🎉</h3>
            <p className="text-muted-foreground mb-3">
              Tu cupón <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">BIENVENIDA10</span> fue copiado al portapapeles.
            </p>
            <p className="text-xs text-muted-foreground">Úsalo en el checkout para 10% off</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3"
              >
                <Gift className="h-8 w-8 text-white" />
              </motion.div>
              <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-2">
                <Sparkles className="h-3 w-3" />
                {type === 'exit' ? '¡Espera! No te vayas' : 'Bienvenida'}
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                {type === 'exit'
                  ? '¡Detente! Tienes un regalo 🎁'
                  : '10% OFF en tu primer peluche'}
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Suscríbete y recibe <strong className="text-foreground">BIENVENIDA10</strong> — tu cupón de 10% de descuento en tu primera compra.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubscribe(type)
              }}
              className="space-y-3"
            >
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                className="text-center"
              />
              <Button type="submit" className="w-full btn-crochet" disabled={loading}>
                {loading ? 'Enviando...' : 'Quiero mi 10% de descuento 🎁'}
              </Button>
            </form>

            <button
              onClick={type === 'exit' ? closeExit : closeWelcome}
              className="block mx-auto mt-3 text-xs text-muted-foreground hover:text-foreground"
            >
              No gracias, pagaré precio completo
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeWelcome}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PopupCard type="welcome" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeExit}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PopupCard type="exit" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
