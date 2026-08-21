'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'

const NOTIFICATION_DURATION = 5000
const NOTIFICATION_INTERVAL = 12000

// Datos de ejemplo para notificaciones de prueba social
const SAMPLE_NOTIFICATIONS = [
  { name: 'María', location: 'Lima', product: 'Osito de Amor Rosado', time: 'hace 5 min' },
  { name: 'Carlos', location: 'Arequipa', product: 'Stitch Tejido', time: 'hace 12 min' },
  { name: 'Lucía', location: 'Trujillo', product: 'Conejito Pastel', time: 'hace 18 min' },
  { name: 'Andrea', location: 'Piura', product: 'Pikachu Tejido', time: 'hace 25 min' },
  { name: 'Roberto', location: 'Cusco', product: 'Osito Panda Gigante', time: 'hace 32 min' },
  { name: 'Valeria', location: 'Chiclayo', product: 'Gatito Amigurumi', time: 'hace 45 min' },
  { name: 'Diego', location: 'Ica', product: 'Conejito Personalizado', time: 'hace 1 hora' },
  { name: 'Sofía', location: 'Lima', product: 'Perrito Salchicha', time: 'hace 1 hora' },
]

export function SocialProofNotifications() {
  const [current, setCurrent] = useState<typeof SAMPLE_NOTIFICATIONS[0] | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (dismissed) return

    // Mostrar primera notificación después de 8s
    const initialTimer = setTimeout(() => {
      setCurrent(SAMPLE_NOTIFICATIONS[0])
      setVisible(true)
    }, 8000)

    return () => clearTimeout(initialTimer)
  }, [dismissed])

  useEffect(() => {
    if (!visible || !current) return

    // Ocultar después de 5s
    const hideTimer = setTimeout(() => {
      setVisible(false)
    }, NOTIFICATION_DURATION)

    return () => clearTimeout(hideTimer)
  }, [visible, current])

  useEffect(() => {
    if (dismissed) return

    // Ciclar notificaciones cada 12s
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % SAMPLE_NOTIFICATIONS.length
        setCurrent(SAMPLE_NOTIFICATIONS[next])
        setVisible(true)
        return next
      })
    }, NOTIFICATION_INTERVAL)

    return () => clearInterval(interval)
  }, [dismissed])

  if (dismissed || !current) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed bottom-24 left-4 z-40 max-w-xs"
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl p-3 flex items-start gap-3 relative">
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-1 right-1 text-muted-foreground hover:text-foreground p-1"
              aria-label="Cerrar notificaciones"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{current.name}</span> de {current.location}
              </p>
              <p className="text-sm font-medium line-clamp-2 mt-0.5">
                compró <span className="text-primary">{current.product}</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                ✓ Compra verificada · {current.time}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
