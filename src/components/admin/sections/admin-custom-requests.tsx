'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sparkles, Trash2, Eye, MessageCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'
import type { CustomRequest } from '@prisma/client'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  quoted: 'Cotizado',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  completed: 'Completado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_review: 'bg-blue-100 text-blue-700',
  quoted: 'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

export function AdminCustomRequests() {
  const [items, setItems] = useState<CustomRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CustomRequest | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/custom-request')
      const json = await data.json()
      setItems(json)
    } catch {
      // 401 handled
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminFetch(`/api/custom-request/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      toast.success('Estado actualizado')
      load()
      if (selected?.id === id) setSelected({ ...selected, status })
    } catch {
      toast.error('Error')
    }
  }

  const handleDelete = async (item: CustomRequest) => {
    if (!confirm(`¿Eliminar solicitud de ${item.name}?`)) return
    try {
      await adminFetch(`/api/custom-request/${item.id}`, { method: 'DELETE' })
      toast.success('Solicitud eliminada')
      if (selected?.id === item.id) setSelected(null)
      load()
    } catch {
      toast.error('Error')
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay solicitudes personalizadas</p>
          <p className="text-muted-foreground text-sm">
            Cuando los clientes envíen solicitudes de peluches personalizados, aparecerán aquí.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition cursor-pointer" onClick={() => setSelected(item)}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{item.name}</span>
                    <Badge className={STATUS_COLORS[item.status]}>
                      {STATUS_LABELS[item.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.createdAt).toLocaleString('es-PE')}
                    {item.budget && ` · 💰 ${item.budget}`}
                    {item.deadline && ` · 📅 ${item.deadline}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(item)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Solicitud de {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selected.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{selected.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Presupuesto</p>
                  <p className="font-medium">{selected.budget || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha deseada</p>
                  <p className="font-medium">{selected.deadline || 'No especificada'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                <p className="bg-muted/30 rounded-lg p-3 text-sm">{selected.description}</p>
              </div>

              {selected.referenceImageUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Imagen de referencia</p>
                  { }
                  <img
                    src={selected.referenceImageUrl}
                    alt="Referencia"
                    className="max-h-60 rounded-lg border border-border"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={selected.status}
                  onValueChange={(v) => updateStatus(selected.id, v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <a href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full border-green-500 text-green-600">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar por WhatsApp
                </Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
