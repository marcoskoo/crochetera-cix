'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Ticket, Copy } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'
import type { Coupon } from '@prisma/client'

interface CouponForm {
  code: string
  type: 'percent' | 'fixed'
  value: string
  minOrder: string
  maxUses: string
  validFrom: string
  validUntil: string
  active: boolean
  description: string
}

const empty: CouponForm = {
  code: '', type: 'percent', value: '', minOrder: '', maxUses: '',
  validFrom: '', validUntil: '', active: true, description: '',
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState<CouponForm>(empty)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/coupons')
      setCoupons(await data.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(empty); setEditing(null); setShowForm(true) }
  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code, type: c.type as 'percent' | 'fixed', value: String(c.value),
      minOrder: c.minOrder ? String(c.minOrder) : '',
      maxUses: c.maxUses ? String(c.maxUses) : '',
      validFrom: c.validFrom ? c.validFrom.toISOString().slice(0, 10) : '',
      validUntil: c.validUntil ? c.validUntil.toISOString().slice(0, 10) : '',
      active: c.active, description: c.description || '',
    })
    setEditing(c); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.code || !form.value) {
      toast.error('Código y valor son obligatorios')
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/coupons/${editing.id}` : '/api/coupons'
      const method = editing ? 'PUT' : 'POST'
      const res = await adminFetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al guardar')
      toast.success(editing ? 'Cupón actualizado' : 'Cupón creado')
      setShowForm(false); load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await adminFetch(`/api/coupons/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('Cupón eliminado')
      setDeleteTarget(null); load()
    } catch { toast.error('Error') }
  }

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code)
    toast.success(`Código "${code}" copiado`)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="btn-crochet">
          <Plus className="h-4 w-4 mr-1" /> Nuevo cupón
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : coupons.length === 0 ? (
        <Card className="p-8 text-center">
          <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay cupones</p>
          <p className="text-muted-foreground text-sm">
            Crea tu primer cupón de descuento para incentivar compras.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <button
                    onClick={() => copyCode(c.code)}
                    className="font-mono font-bold text-lg text-primary hover:underline flex items-center gap-1"
                    title="Copiar código"
                  >
                    {c.code}
                    <Copy className="h-3 w-3" />
                  </button>
                  <p className="text-sm text-muted-foreground">
                    {c.type === 'percent' ? `${c.value}% de descuento` : `S/ ${c.value} de descuento`}
                  </p>
                </div>
                <Badge variant={c.active ? 'default' : 'secondary'}>
                  {c.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              {c.description && (
                <p className="text-xs text-muted-foreground mb-2 italic">{c.description}</p>
              )}
              <div className="text-xs space-y-1 text-muted-foreground">
                {c.minOrder && <p>Compra mínima: S/ {c.minOrder}</p>}
                {c.maxUses && <p>Usos: {c.usedCount}/{c.maxUses}</p>}
                {!c.maxUses && <p>Usos: {c.usedCount} (ilimitado)</p>}
                {c.validUntil && <p>Expira: {new Date(c.validUntil).toLocaleDateString('es-PE')}</p>}
              </div>
              <div className="flex gap-1 mt-3 pt-3 border-t border-border">
                <Button size="sm" variant="ghost" className="h-7" onClick={() => openEdit(c)}>
                  <Pencil className="h-3 w-3 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => setDeleteTarget(c)}>
                  <Trash2 className="h-3 w-3 mr-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? 'Editar cupón' : 'Nuevo cupón'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().trim() })}
                placeholder="Ej: BIENVENIDA10"
                className="font-mono uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'percent' | 'fixed' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed">Monto fijo (S/)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valor *</Label>
                <Input
                  id="value" type="number" step="0.01" value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={form.type === 'percent' ? '10' : '20'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrder">Compra mínima</Label>
                <Input id="minOrder" type="number" step="0.01" value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="Opcional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Usos máximos</Label>
                <Input id="maxUses" type="number" value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Ilimitado" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Válido desde</Label>
                <Input id="validFrom" type="date" value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Válido hasta</Label>
                <Input id="validUntil" type="date" value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descripción (opcional)</Label>
              <Input id="desc" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ej: 10% off para nuevos clientes" />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="active" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label htmlFor="active">Activo</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 btn-crochet">
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cupón?</AlertDialogTitle>
            <AlertDialogDescription>
              El cupón "{deleteTarget?.code}" ya no será válido para futuras compras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
