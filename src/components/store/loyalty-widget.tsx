'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gift, Star, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/site'

const POINTS_PER_SOL = 1 // 1 punto por cada S/1
const REDEMPTION_RATE = 0.05 // 1 punto = S/0.05 (100 puntos = S/5)

export function LoyaltyWidget() {
  const [email, setEmail] = useState('')
  const [lookup, setLookup] = useState<{ found: boolean; points?: number; name?: string | null } | null>(null)
  const [loading, setLoading] = useState(false)
  const [redeemPoints, setRedeemPoints] = useState(false)
  const cartTotal = useStore((s) => s.cartTotal())
  const appliedCoupon = useStore((s) => s.appliedCoupon)
  const setAppliedCoupon = useStore((s) => s.setAppliedCoupon)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  const handleLookup = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Ingresa un email válido')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/loyalty/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.found) {
        setLookup({ found: true, points: data.points, name: data.name })
        toast.success(`Tienes ${data.points} puntos disponibles`)
      } else {
        // Auto-registrar nueva cuenta
        const regRes = await fetch('/api/loyalty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (regRes.ok) {
          const newAcc = await regRes.json()
          setLookup({ found: true, points: newAcc.points, name: newAcc.name })
          toast.success(`¡Cuenta creada! +${newAcc.points} puntos de bienvenida 🎁`)
        }
      }
    } catch {
      toast.error('Error al buscar cuenta')
    } finally {
      setLoading(false)
    }
  }

  const pointsToEarn = Math.floor(cartTotal * POINTS_PER_SOL)
  const possibleDiscount = lookup?.found && lookup.points
    ? Math.min(lookup.points * REDEMPTION_RATE, cartTotal)
    : 0

  const handleRedeem = () => {
    if (!lookup?.found || !lookup.points) return
    const discount = possibleDiscount
    const pointsUsed = Math.floor(discount / REDEMPTION_RATE)
    setAppliedCoupon({
      code: `PUNTOS-${pointsUsed}`,
      discount,
    })
    setRedeemPoints(true)
    toast.success(`Canjeaste ${pointsUsed} puntos por ${formatPrice(discount, currency)} de descuento`)
  }

  const handleCancelRedemption = () => {
    setAppliedCoupon(null)
    setRedeemPoints(false)
    toast.info('Canje cancelado')
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-300">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="h-5 w-5 text-orange-600" />
        <h3 className="font-semibold text-lg">Programa de puntos</h3>
        <Badge className="bg-orange-500 text-white">Fidelidad</Badge>
      </div>

      {!lookup?.found ? (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            ¿Tienes cuenta? Acumula puntos y canjéalos por descuentos. Cada S/1 = 1 punto.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLookup())}
            />
            <Button onClick={handleLookup} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
              {loading ? '...' : 'Consultar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Nueva cuenta recibe 50 puntos de bienvenida
          </p>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between p-3 bg-white dark:bg-card rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">
                Hola{lookup.name ? `, ${lookup.name}` : ''}! 👋
              </p>
              <p className="text-xs text-muted-foreground">Tus puntos:</p>
              <p className="font-display text-3xl font-bold text-orange-600 flex items-center gap-1">
                <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
                {lookup.points}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Equivalente a:</p>
              <p className="font-bold text-green-600">
                {formatPrice(lookup.points * REDEMPTION_RATE, currency)}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-sm">
            <p className="flex items-center gap-1 text-blue-700 dark:text-blue-400 font-medium">
              <Sparkles className="h-4 w-4" />
              Esta compra te dará +{pointsToEarn} puntos
            </p>
          </div>

          {!redeemPoints && lookup.points >= 20 ? (
            <Button onClick={handleRedeem} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              <Gift className="h-4 w-4 mr-1" />
              Canjear puntos ({formatPrice(possibleDiscount, currency)} off)
            </Button>
          ) : redeemPoints ? (
            <div className="space-y-2">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-300 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Puntos canjeados
                </span>
                <Button size="sm" variant="ghost" onClick={handleCancelRedemption} className="text-green-700 dark:text-green-400">
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Necesitas al menos 20 puntos para canjear
            </p>
          )}
        </motion.div>
      )}
    </Card>
  )
}
