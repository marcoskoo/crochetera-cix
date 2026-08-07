'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/site'
import { toast } from 'sonner'

export function Checkout() {
  const cart = useStore((s) => s.cart)
  const cartTotal = useStore((s) => s.cartTotal())
  const siteConfig = useStore((s) => s.siteConfig)
  const goToSection = useStore((s) => s.goToSection)
  const clearCart = useStore((s) => s.clearCart)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })

  const currency = siteConfig?.currency || 'S/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error('Completa nombre y teléfono')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email || null,
          customerPhone: form.phone,
          customerAddress: form.address || null,
          notes: form.notes || null,
          items: cart.map((c) => ({
            productId: c.productId,
            name: c.name,
            price: c.price,
            quantity: c.quantity,
            imageUrl: c.imageUrl || null,
          })),
        }),
      })
      if (!res.ok) throw new Error('Error al procesar pedido')
      const order = await res.json()
      setSuccess(true)
      clearCart()
      toast.success(`Pedido #${order.id.slice(-6).toUpperCase()} creado`)
    } catch {
      toast.error('Hubo un problema al procesar tu pedido')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">
            ¡Pedido recibido!
          </h1>
          <p className="text-muted-foreground mb-6">
            Gracias por tu compra. Te contactaremos muy pronto por WhatsApp o
            teléfono para coordinar el pago y la entrega.
          </p>
          <Button onClick={() => goToSection('home')} className="btn-crochet">
            Volver al inicio
          </Button>
        </motion.div>
      </section>
    )
  }

  if (cart.length === 0) {
    return (
      <section className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">
          Tu carrito está vacío
        </h1>
        <p className="text-muted-foreground mb-6">
          Explora nuestro catálogo y agrega peluches a tu carrito.
        </p>
        <Button onClick={() => goToSection('catalog')} className="btn-crochet">
          Ver catálogo
        </Button>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => goToSection('catalog')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Seguir comprando
      </Button>

      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
        Finalizar pedido
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg">Tus datos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección de entrega</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Ciudad, dirección, referencia..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas o personalizaciones</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ej: bordar el nombre 'María', color rosado pastel..."
              rows={3}
            />
          </div>

          <div className="bg-accent/20 rounded-lg p-3 text-sm space-y-1">
            <p className="font-medium">💳 Pagos</p>
            <p className="text-muted-foreground">
              {siteConfig?.paymentInfo ||
                'Aceptamos transferencia, Yape, Plin y MercadoPago.'}
            </p>
          </div>
        </Card>

        {/* Resumen */}
        <div className="space-y-4">
          <Card className="p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Resumen del pedido</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-14 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.imageUrl ? (
                       
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        🧶
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(item.price, currency)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity, currency)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cartTotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-muted-foreground">A coordinar</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(cartTotal, currency)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full btn-crochet mt-4"
              size="lg"
            >
              {submitting ? 'Procesando...' : 'Confirmar pedido'}
            </Button>
          </Card>
        </div>
      </div>
    </section>
  )
}
