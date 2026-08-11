'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, CalendarDays, Clock, CheckCircle, X } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'
import type { ProductionEvent } from '@prisma/client'

const STATUS_INFO: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  scheduled: { label: 'Programado', color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { label: 'En progreso', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: X },
}

export function AdminAgenda() {
  const [events, setEvents] = useState<ProductionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', color: '#E91E63' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/production-events')
      setEvents(await data.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.title || !form.startDate) {
      toast.error('Título y fecha de inicio son obligatorios')
      return
    }
    setSaving(true)
    try {
      const res = await adminFetch('/api/production-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error')
      toast.success('Evento creado')
      setShowForm(false)
      setForm({ title: '', description: '', startDate: '', endDate: '', color: '#E91E63' })
      load()
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminFetch(`/api/production-events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      load()
    } catch { toast.error('Error') }
  }

  const handleDelete = async (e: ProductionEvent) => {
    if (!confirm('¿Eliminar evento?')) return
    try {
      await adminFetch(`/api/production-events/${e.id}`, { method: 'DELETE' })
      toast.success('Evento eliminado')
      load()
    } catch { toast.error('Error') }
  }

  // Agrupar por día
  const eventsByDay: Record<string, ProductionEvent[]> = {}
  events.forEach((e) => {
    const day = new Date(e.startDate).toISOString().slice(0, 10)
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push(e)
  })

  const sortedDays = Object.keys(eventsByDay).sort()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} className="btn-crochet">
          <Plus className="h-4 w-4 mr-1" /> Nuevo evento
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : events.length === 0 ? (
        <Card className="p-8 text-center">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay eventos</p>
          <p className="text-muted-foreground text-sm">
            Agenda la producción de pedidos, envíos, o cualquier evento relevante.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDays.map((day) => (
            <div key={day}>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                {new Date(day).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <div className="space-y-2">
                {eventsByDay[day].map((e) => {
                  const status = STATUS_INFO[e.status] || STATUS_INFO.scheduled
                  return (
                    <Card key={e.id} className="p-3 flex items-center gap-3" style={{ borderLeft: `4px solid ${e.color}` }}>
                      <status.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{e.title}</p>
                        {e.description && <p className="text-xs text-muted-foreground line-clamp-1">{e.description}</p>}
                        <p className="text-xs text-muted-foreground">
                          {new Date(e.startDate).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                          {e.endDate && ` - ${new Date(e.endDate).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                      <Select value={e.status} onValueChange={(v) => handleStatusChange(e.id, v)}>
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <Badge className={status.color}>{status.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_INFO).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(e)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Nuevo evento de producción</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Tejido de Tata para María" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descripción</Label>
              <Input id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalles del evento" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Inicio *</Label>
                <Input id="start" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Fin (opcional)</Label>
                <Input id="end" type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-16 h-10 p-1" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full btn-crochet">
              {saving ? 'Guardando...' : 'Crear evento'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
