'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Sparkles, Send } from 'lucide-react'
import { toast } from 'sonner'

export function CustomRequestForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    budget: '',
    deadline: '',
    referenceImageUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.description) {
      toast.error('Completa los campos obligatorios')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/custom-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setSuccess(true)
      toast.success('¡Solicitud enviada! Te contactaremos pronto.')
    } catch {
      toast.error('Error al enviar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <section className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="h-10 w-10 text-green-600" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold mb-2">
            ¡Solicitud recibida!
          </h2>
          <p className="text-muted-foreground mb-6">
            Gracias por tu interés en un peluche personalizado. Nos pondremos en contacto contigo muy pronto para coordinar los detalles.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(false)
              setForm({
                name: '', email: '', phone: '', description: '',
                budget: '', deadline: '', referenceImageUrl: '',
              })
            }}
          >
            Enviar otra solicitud
          </Button>
        </Card>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-12 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          Pedido personalizado
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Crea tu peluche ideal
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">
          Cuéntanos qué peluche te imaginas y lo haremos realidad. Colores, tamaño, personajes, nombre bordado... ¡tú pones la imaginación!
        </p>
      </motion.div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Describe tu peluche ideal *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              placeholder="Ej: Quiero un osito de 30cm en color turquesa con una cinta rosa, con el nombre 'Sofía' bordado en el pecho..."
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto (opcional)</Label>
              <Input
                id="budget"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="Ej: S/ 80-120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Fecha deseada (opcional)</Label>
              <Input
                id="deadline"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                placeholder="Ej: 15 de diciembre"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referenceImageUrl">URL de imagen de referencia (opcional)</Label>
            <Input
              id="referenceImageUrl"
              type="url"
              value={form.referenceImageUrl}
              onChange={(e) => setForm({ ...form, referenceImageUrl: e.target.value })}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Si tienes una foto de inspiración, sube la URL para que veamos tu idea.
            </p>
          </div>
          <Button type="submit" className="w-full btn-crochet" disabled={submitting}>
            {submitting ? (
              'Enviando...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar solicitud
              </>
            )}
          </Button>
        </form>
      </Card>
    </section>
  )
}
