'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Package, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react'
import { formatPrice } from '@/lib/site'
import { toast } from 'sonner'

const STATUS_INFO: Record<string, { label: string; icon: typeof Package; color: string }> = {
  pending: { label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmado', icon: Package, color: 'bg-blue-100 text-blue-700' },
  production: { label: 'En producción', icon: Package, color: 'bg-purple-100 text-purple-700' },
  shipped: { label: 'Enviado', icon: Truck, color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Entregado', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-700' },
}

const STATUS_ORDER = ['pending', 'confirmed', 'production', 'shipped', 'delivered']

export function OrderTracking() {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId || !phone) {
      toast.error('Completa ambos campos')
      return
    }
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await fetch(
        `/api/orders/track?id=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`,
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No encontrado')
      } else {
        setOrder(data)
      }
    } catch {
      setError('Error al buscar el pedido')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1

  return (
    <section className="container mx-auto px-4 py-12 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Seguimiento de pedido
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">
          Ingresa tu número de pedido y teléfono para ver el estado de tu compra.
        </p>
      </motion.div>

      <Card className="p-6 mb-6">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderId">Número de pedido</Label>
            <Input
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Ej: abc123"
              required
            />
            <p className="text-xs text-muted-foreground">
              Te lo enviamos por WhatsApp cuando confirmamos tu compra.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (últimos 6 dígitos)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 888777"
              required
            />
          </div>
          <Button type="submit" className="w-full btn-crochet" disabled={loading}>
            {loading ? (
              'Buscando...'
            ) : (
              <>
                <Search className="h-4 w-4 mr-1" /> Rastrear pedido
              </>
            )}
          </Button>
        </form>
      </Card>

      {error && (
        <Card className="p-6 text-center border-destructive">
          <p className="text-destructive font-medium">{error}</p>
        </Card>
      )}

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Pedido</p>
                <p className="font-mono font-bold text-lg">
                  #{order.id.slice(-6).toUpperCase()}
                </p>
              </div>
              <Badge className={STATUS_INFO[order.status]?.color}>
                {STATUS_INFO[order.status]?.label || order.status}
              </Badge>
            </div>

            {order.status !== 'cancelled' && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  {STATUS_ORDER.map((s, i) => {
                    const Icon = STATUS_INFO[s].icon
                    const done = i <= currentStep
                    return (
                      <div key={s} className="flex flex-col items-center flex-1 relative">
                        {i < STATUS_ORDER.length - 1 && (
                          <div
                            className={`absolute top-5 left-1/2 w-full h-0.5 ${
                              i < currentStep ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        )}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 z-10 ${
                            done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] text-center text-muted-foreground">
                          {STATUS_INFO[s].label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-2">Cliente</p>
              <p className="font-medium">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleString('es-PE')}
              </p>
            </div>

            <div className="border-t border-border mt-4 pt-4">
              <p className="text-sm text-muted-foreground mb-2">Productos</p>
              <div className="space-y-2">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total, currency)}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </section>
  )
}
