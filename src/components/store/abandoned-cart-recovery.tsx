'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingBag, X, MessageCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/site'

const IDLE_TIME = 60000 // 60s de inactividad = carrito abandonado
const STORAGE_KEY = 'crochetera-abandoned-shown'

export function AbandonedCartRecovery() {
  const cart = useStore((s) => s.cart)
  const cartTotal = useStore((s) => s.cartTotal())
  const siteConfig = useStore((s) => s.siteConfig)
  const goToSection = useStore((s) => s.goToSection)
  const setView = useStore((s) => s.setView)
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const currency = siteConfig?.currency || 'S/'

  // Mostrar popup si hay carrito con items y pasó 1 min sin actividad
  useEffect(() => {
    if (cart.length === 0) {
      return
    }
    const shown = sessionStorage.getItem(STORAGE_KEY)
    if (shown) return

    let timer: NodeJS.Timeout
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (cart.length > 0 && !submitted) {
          setShow(true)
          sessionStorage.setItem(STORAGE_KEY, '1')
        }
      }, IDLE_TIME)
    }

    // Eventos que reinician el contador
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => document.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      clearTimeout(timer)
      events.forEach((e) => document.removeEventListener(e, resetTimer))
    }
  }, [cart.length, submitted])

  const handleSave = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Ingresa un email válido')
      return
    }
    try {
      await fetch('/api/abandoned-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: cart,
          total: cartTotal,
        }),
      })
      setSubmitted(true)
      toast.success('¡Guardamos tu carrito! Te contactaremos pronto.')
    } catch {
      toast.error('Error al guardar')
    }
  }

  const handleWhatsApp = () => {
    if (!siteConfig?.whatsapp) return
    const phone = siteConfig.whatsapp.replace(/[^0-9]/g, '')
    const items = cart.map((i) => `• ${i.quantity}x ${i.name} - ${formatPrice(i.price * i.quantity, currency)}`).join('\n')
    const message = encodeURIComponent(
      `¡Hola CROCHETERA.CIX! 🧶\n\nVine de tu web y me interesan estos peluches:\n\n${items}\n\nTotal: ${formatPrice(cartTotal, currency)}\n\n¿Podrían ayudarme a completar mi compra?`,
    )
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-3xl shadow-2xl p-6 max-w-md w-full relative"
          >
            <button
              onClick={() => setShow(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {!submitted ? (
              <>
                <div className="text-center mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3"
                  >
                    <ShoppingBag className="h-8 w-8 text-amber-600" />
                  </motion.div>
                  <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium mb-2">
                    <Clock className="h-3 w-3" /> Espera tu carrito
                  </div>
                  <h3 className="font-display text-2xl font-bold">
                    ¡No pierdas tus peluches!
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tienes <strong className="text-foreground">{cart.length}</strong> peluche(s) por <strong className="text-primary">{formatPrice(cartTotal, currency)}</strong> esperándote.
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between text-xs py-1">
                      <span className="line-clamp-1 flex-1">{item.quantity}× {item.name}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity, currency)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Button onClick={() => { setShow(false); goToSection('checkout') }} className="w-full btn-crochet">
                    Finalizar compra ahora
                  </Button>
                  <Button onClick={handleWhatsApp} variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Completar por WhatsApp
                  </Button>
                  <div className="space-y-1">
                    <Label htmlFor="ab-email" className="text-xs">O guárdalo para después:</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ab-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button size="sm" onClick={handleSave} variant="secondary">
                        Guardar
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                >
                  <ShoppingBag className="h-10 w-10 text-green-600" />
                </motion.div>
                <h3 className="font-display text-2xl font-bold mb-2">¡Carrito guardado! 🎉</h3>
                <p className="text-muted-foreground mb-4">
                  Te enviaremos un recordatorio para que no pierdas tus peluches.
                </p>
                <Button onClick={() => setShow(false)} variant="outline" className="w-full">
                  Seguir navegando
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
