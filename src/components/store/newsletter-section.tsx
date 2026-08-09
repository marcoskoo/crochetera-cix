'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Mail, Send, CheckCircle2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const siteConfig = useStore((s) => s.siteConfig)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Ingresa tu email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al suscribirse')
      }
      setSuccess(true)
      toast.success('¡Te suscribiste! Pronto recibirás novedades.')
      setEmail('')
      setName('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al suscribirse')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <section className="py-12 bg-gradient-to-br from-primary/10 to-accent/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold mb-2">
              ¡Gracias por suscribirte!
            </h3>
            <p className="text-muted-foreground mb-4">
              Te mantendremos al tanto de nuevos peluches, ofertas y novedades de {siteConfig?.storeName || 'nuestra tienda'}.
            </p>
            <Button variant="outline" onClick={() => setSuccess(false)}>
              Suscribir otro email
            </Button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-br from-primary/10 to-accent/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Novedades en tu email
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Únete a nuestra comunidad
          </h2>
          <p className="text-muted-foreground mb-6 text-lg">
            Suscríbete y recibe noticias sobre nuevos peluches, descuentos especiales y tips de cuidado. 🧶✨
          </p>

          <Card className="p-6 max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Tu nombre (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
              <Button
                type="submit"
                className="w-full btn-crochet"
                disabled={loading}
              >
                {loading ? (
                  'Suscribiendo...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Suscribirme
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                No spam. Solo te escribiremos cuando haya novedades reales.
              </p>
            </form>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
