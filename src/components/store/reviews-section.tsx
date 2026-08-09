'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Star, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import type { Review } from '@prisma/client'

interface ReviewsSectionProps {
  productId: string
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ author: '', rating: 5, comment: '' })

  const load = () => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then(setReviews)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
     
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.author || !form.comment) {
      toast.error('Completa todos los campos')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, productId }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      toast.success('¡Gracias por tu reseña! Se publicará pronto.')
      setForm({ author: '', rating: 5, comment: '' })
      setShowForm(false)
    } catch {
      toast.error('Error al enviar la reseña')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Reseñas de clientes
        </h2>
        <div className="flex items-center gap-3">
          {reviews.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} · {reviews.length} reseña(s)
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : 'Escribir reseña'}
          </Button>
        </div>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <Card className="p-5">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="author">Tu nombre *</Label>
                  <Input
                    id="author"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Calificación</Label>
                  <div className="flex gap-1 pt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, rating: n })}
                      >
                        <Star
                          className={`h-7 w-7 ${
                            n <= form.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Tu reseña *</Label>
                <Textarea
                  id="comment"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={3}
                  placeholder="¿Qué te pareció este peluche? ¿Cómo llegó? ¿Lo recomendarías?"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tu reseña se publicará después de ser aprobada por el equipo.
              </p>
              <Button type="submit" disabled={submitting} className="btn-crochet">
                {submitting ? 'Enviando...' : 'Enviar reseña'}
              </Button>
            </form>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Cargando reseñas...</p>
      ) : reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-medium mb-1">Aún no hay reseñas</p>
          <p className="text-sm text-muted-foreground mb-4">
            ¡Sé la primera persona en compartir su experiencia con este peluche!
          </p>
          <Button onClick={() => setShowForm(true)} variant="outline">
            Escribir la primera reseña
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                      {r.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{r.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-3.5 w-3.5 ${
                          idx < r.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
