'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ticket, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/site'

export function CouponInput() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const cart = useStore((s) => s.cart)
  const appliedCoupon = useStore((s) => s.appliedCoupon)
  const setAppliedCoupon = useStore((s) => s.setAppliedCoupon)
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Ingresa un código de cupón')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), total: subtotal }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Cupón no válido')
      }
      setAppliedCoupon({ code: data.coupon.code, discount: data.discount })
      toast.success(`Cupón "${data.coupon.code}" aplicado! Ahorro: ${formatPrice(data.discount, currency)}`)
      setCode('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al validar cupón')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setAppliedCoupon(null)
    toast.info('Cupón removido')
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-300 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Cupón aplicado: {appliedCoupon.code}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">
              Ahorro: {formatPrice(appliedCoupon.discount, currency)}
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={handleRemove} className="text-green-700 dark:text-green-400">
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Ticket className="h-4 w-4 text-primary" />
        ¿Tienes un cupón de descuento?
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Ej: BIENVENIDA10"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApply())}
          className="uppercase"
        />
        <Button onClick={handleApply} disabled={loading} variant="outline">
          {loading ? '...' : 'Aplicar'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Prueba con <Badge variant="secondary" className="font-mono">BIENVENIDA10</Badge> para 10% off
      </p>
    </div>
  )
}
