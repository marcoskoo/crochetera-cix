'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'crochetera-cookie-consent'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY)
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-4 md:right-auto md:max-w-md z-50"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 relative">
            <button
              onClick={decline}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Cookies 🍪</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Usamos cookies para mejorar tu experiencia: carrito persistente, preferencias y análisis anónimo. ¿Nos das permiso?
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={accept} className="btn-crochet flex-1">
                    Aceptar todo
                  </Button>
                  <Button size="sm" variant="outline" onClick={decline} className="flex-1">
                    Solo esenciales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
