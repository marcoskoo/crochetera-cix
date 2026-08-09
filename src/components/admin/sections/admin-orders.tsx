'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ShoppingBag, Phone, Mail, MapPin, Trash2, Eye, Download } from 'lucide-react'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/admin-fetch'
import { formatPrice } from '@/lib/site'
import { useStore } from '@/lib/store'
import type { Order } from '@prisma/client'

type OrderWithItems = Order & {
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    imageUrl: string | null
    product: { id: string; name: string } | null
  }>
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  production: 'En producción',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  production: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<OrderWithItems | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const siteConfig = useStore((s) => s.siteConfig)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/orders')
      const data = await res.json()
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await adminFetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      toast.success('Estado actualizado')
      load()
      if (selected?.id === id) setSelected({ ...selected, status })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await adminFetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast.success('Pedido eliminado')
      setSelected(null)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    }
  }

  const filtered = orders.filter(
    (o) => filterStatus === 'all' || o.status === filterStatus,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} pedido(s)
        </span>
        <Button variant="outline" size="sm" className="ml-auto" asChild>
          <a
            href={`/api/orders/export${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="h-4 w-4 mr-1" /> Exportar CSV
          </a>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-24 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay pedidos</p>
          <p className="text-muted-foreground text-sm">
            Los pedidos que hagan tus clientes aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <Card key={o.id} className="p-4 hover:shadow-md transition cursor-pointer" onClick={() => setSelected(o)}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold">
                      #{o.id.slice(-6).toUpperCase()}
                    </span>
                    <Badge className={STATUS_COLORS[o.status]}>
                      {STATUS_LABELS[o.status]}
                    </Badge>
                  </div>
                  <p className="font-medium">{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString('es-PE')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {formatPrice(o.total, siteConfig?.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Pedido #{selected?.id.slice(-6).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Realizado el{' '}
              {selected && new Date(selected.createdAt).toLocaleString('es-PE')}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Customer info */}
              <Card className="p-4 space-y-2">
                <h3 className="font-semibold text-sm">Datos del cliente</h3>
                <p className="font-medium">{selected.customerName}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href={`tel:${selected.customerPhone}`} className="hover:underline">
                    {selected.customerPhone}
                  </a>
                </div>
                {selected.customerEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${selected.customerEmail}`} className="hover:underline">
                      {selected.customerEmail}
                    </a>
                  </div>
                )}
                {selected.customerAddress && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                    <span>{selected.customerAddress}</span>
                  </div>
                )}
                {selected.notes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notas:</p>
                    <p className="text-sm">{selected.notes}</p>
                  </div>
                )}
              </Card>

              {/* Items */}
              <Card className="p-4">
                <h3 className="font-semibold text-sm mb-3">Productos</h3>
                <div className="space-y-2">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
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
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {formatPrice(item.price, siteConfig?.currency)}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">
                        {formatPrice(item.price * item.quantity, siteConfig?.currency)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(selected.total, siteConfig?.currency)}
                  </span>
                </div>
              </Card>

              {/* Status update */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cambiar estado</label>
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

              <div className="flex gap-2 pt-2">
                <a href={`https://wa.me/${selected.customerPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-1" /> Contactar por WhatsApp
                  </Button>
                </a>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selected.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
