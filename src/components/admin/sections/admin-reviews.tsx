'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Trash2, Check, X, MessageSquare } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'
import type { Review, Product } from '@prisma/client'

type ReviewWithProduct = Review & { product: Product | null }

export function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/reviews?all=true')
      const json = await data.json()
      setReviews(json)
    } catch {
      // 401 handled
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleApprove = async (r: ReviewWithProduct) => {
    try {
      await adminFetch(`/api/reviews/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !r.approved }),
      })
      toast.success(r.approved ? 'Reseña oculta' : 'Reseña aprobada')
      load()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const handleDelete = async (r: ReviewWithProduct) => {
    if (!confirm(`¿Eliminar reseña de "${r.author}"?`)) return
    try {
      await adminFetch(`/api/reviews/${r.id}`, { method: 'DELETE' })
      toast.success('Reseña eliminada')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas ({reviews.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pendientes ({reviews.filter((r) => !r.approved).length})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('approved')}
        >
          Aprobadas ({reviews.filter((r) => r.approved).length})
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay reseñas</p>
          <p className="text-muted-foreground text-sm">
            Cuando los clientes escriban reseñas, aparecerán aquí para aprobación.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                    {r.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.product?.name || 'Producto eliminado'} ·{' '}
                      {new Date(r.createdAt).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant={r.approved ? 'default' : 'secondary'}>
                    {r.approved ? 'Aprobada' : 'Pendiente'}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic mb-3">"{r.comment}"</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={r.approved ? 'outline' : 'default'}
                  onClick={() => toggleApprove(r)}
                >
                  {r.approved ? (
                    <>
                      <X className="h-3.5 w-3.5 mr-1" /> Ocultar
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" /> Aprobar
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleDelete(r)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
