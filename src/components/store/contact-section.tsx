'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { GalleryImage } from '@/lib/types'

export function ContactSection() {
  const siteConfig = useStore((s) => s.siteConfig)
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then(setGallery)
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.message) {
      toast.error('Completa los campos obligatorios')
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
          notes: form.message,
          items: [
            {
              name: 'Consulta personalizada',
              price: 0,
              quantity: 1,
            },
          ],
        }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      toast.success('¡Mensaje enviado! Te contactaremos pronto.')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      toast.error('Hubo un problema. Intenta por WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  const socials = [
    siteConfig?.instagram && { icon: Instagram, label: 'Instagram', href: siteConfig.instagram },
    siteConfig?.facebook && { icon: Facebook, label: 'Facebook', href: siteConfig.facebook },
    siteConfig?.whatsapp && {
      icon: MessageCircle,
      label: 'WhatsApp',
      href: `https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}`,
    },
  ].filter(Boolean) as { icon: typeof Instagram; label: string; href: string }[]

  return (
    <section id="contact" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Gallery preview */}
        {gallery.length > 0 && (
          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-5xl font-bold tracking-tight text-center mb-8"
            >
              Galería de nuestros trabajos
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gallery.slice(0, 8).map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  { }
                  <img
                    src={img.url}
                    alt={img.title || ''}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Contáctanos
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            ¿Tienes una idea para tu peluche ideal? Cuéntanos y lo haremos realidad.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Info side */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="font-display text-2xl font-bold">Información de contacto</h3>
              <div className="space-y-3">
                {siteConfig?.phone && (
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="flex items-center gap-3 hover:text-primary transition-colors"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    <span>{siteConfig.phone}</span>
                  </a>
                )}
                {siteConfig?.email && (
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="flex items-center gap-3 hover:text-primary transition-colors"
                  >
                    <Mail className="h-5 w-5 text-primary" />
                    <span>{siteConfig.email}</span>
                  </a>
                )}
                {siteConfig?.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{siteConfig.address}</span>
                  </div>
                )}
              </div>

              {socials.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Síguenos en redes</p>
                  <div className="flex gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                      >
                        <s.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/20">
              <h3 className="font-semibold mb-2">🚚 Envíos</h3>
              <p className="text-sm text-muted-foreground">
                {siteConfig?.shippingInfo ||
                  'Envíos a todo el país. Producto hecho a pedido, demora 5-7 días hábiles.'}
              </p>
              <h3 className="font-semibold mb-2 mt-4">💳 Pagos</h3>
              <p className="text-sm text-muted-foreground">
                {siteConfig?.paymentInfo ||
                  'Aceptamos transferencia bancaria, Yape, Plin y MercadoPago.'}
              </p>
            </Card>
          </div>

          {/* Form side */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display text-2xl font-bold">Envíanos un mensaje</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Tu nombre"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    placeholder="+51 999 888 777"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Tu mensaje *</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  placeholder="Cuéntanos qué peluche te gustaría..."
                  rows={5}
                />
              </div>
              <Button
                type="submit"
                className="w-full btn-crochet"
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Enviar mensaje'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}
