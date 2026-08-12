'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Copy, Check, Smartphone, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/site'

export function YapePlinPayment() {
  const cartTotal = useStore((s) => s.cartTotal())
  const appliedCoupon = useStore((s) => s.appliedCoupon)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'
  const [method, setMethod] = useState<'yape' | 'plin' | null>(null)
  const [copied, setCopied] = useState(false)

  const total = cartTotal
  const phone = siteConfig?.whatsapp?.replace(/[^0-9]/g, '') || '51950886496'

  // Generar QR usando API pública (goqr.me)
  const qrData = method
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        `PAY:${method.toUpperCase()}:${phone}:${total.toFixed(2)}:PEN`,
      )}`
    : ''

  const copyPhone = () => {
    navigator.clipboard?.writeText(phone)
    setCopied(true)
    toast.success('Número copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-5 border-2 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Pago rápido con Yape / Plin</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Escanea el QR o copia el número para pagar. El monto exacto es{' '}
        <strong className="text-primary">{formatPrice(total, currency)}</strong>
      </p>

      {!method ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setMethod('yape')}
            className="bg-purple-600 hover:bg-purple-700 text-white h-20 flex flex-col"
          >
            <span className="font-bold text-lg">Yape</span>
            <span className="text-xs opacity-90">Escanea y paga</span>
          </Button>
          <Button
            onClick={() => setMethod('plin')}
            className="bg-blue-600 hover:bg-blue-700 text-white h-20 flex flex-col"
          >
            <span className="font-bold text-lg">Plin</span>
            <span className="text-xs opacity-90">Escanea y paga</span>
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-3 rounded-xl shadow-md">
              {qrData && (
                 
                <img src={qrData} alt={`QR ${method}`} className="w-48 h-48" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Número {method === 'yape' ? 'Yape' : 'Plin'}:</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-mono font-bold text-lg">{phone}</span>
                <button
                  onClick={copyPhone}
                  className="p-1.5 rounded-md hover:bg-muted transition"
                  aria-label="Copiar número"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="font-bold text-2xl text-primary mt-2">
                {formatPrice(total, currency)}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-400">
            <p className="font-medium mb-1">📱 Instrucciones:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-xs">
              <li>Abre {method === 'yape' ? 'Yape' : 'Plin'} en tu celular</li>
              <li>Escanea el QR o ingresa el número</li>
              <li>Envía exactamente {formatPrice(total, currency)}</li>
              <li>Toma captura del comprobante</li>
              <li>Envíalo por WhatsApp para confirmar</li>
            </ol>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMethod(null)}
            className="w-full"
          >
            Cambiar método de pago
          </Button>
        </motion.div>
      )}

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <QrCode className="h-3 w-3" />
          Pago seguro
        </span>
        <span>Verificación manual</span>
      </div>
    </Card>
  )
}
