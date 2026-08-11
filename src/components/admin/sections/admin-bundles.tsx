'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Pencil, Trash2, Package, X } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/site'
import type { Bundle, Product } from '@prisma/client'

interface BundleForm {
  name: string
  description: string
  price: string
  originalTotal: string
  imageUrl: string
  active: boolean
  featured: boolean
  items: { productId: string; quantity: number }[]
}

const empty: BundleForm = {
  name: '', description: '', price: '', originalTotal: '', imageUrl: '',
  active: true, featured: false, items: [],
}

export function AdminBundles() {
  const [bundles, setBundles] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Bundle | null>(null)
  const [form, setForm] = useState<BundleForm>(empty)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Bundle | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bRes, pRes] = await Promise.all([
        adminFetch('/api/bundles'),
        adminFetch('/api/products'),
      ])
      setBundles(await bRes.json())
      setProducts(await pRes.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(empty); setEditing(null); setShowForm(true) }
  const openEdit = (b: any) => {
    setForm({
      name: b.name, description: b.description,
      price: String(b.price), originalTotal: String(b.originalTotal),
      imageUrl: b.imageUrl || '', active: b.active, featured: b.featured,
      items: b.items.map((it: any) => ({ productId: it.productId, quantity: it.quantity })),
    })
    setEditing(b); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Nombre y precio son obligatorios')
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/bundles/${editing.id}` : '/api/bundles'
      const method = editing ? 'PUT' : 'POST'
      const res = await adminFetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error')
      toast.success(editing ? 'Bundle actualizado' : 'Bundle creado')
      setShowForm(false); load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await adminFetch(`/api/bundles/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('Bundle eliminado')
      setDeleteTarget(null); load()
    } catch { toast.error('Error') }
  }

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1 }] })
  const removeItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })
  const updateItem = (i: number, field: 'productId' | 'quantity', value: string | number) =>
    setForm({ ...form, items: form.items.map((it, idx) => idx === i ? { ...it, [field]: value } : it) })

  const calcOriginalTotal = () => {
    return form.items.reduce((sum, it) => {
      const p = products.find((x) => x.id === it.productId)
      return sum + (p ? p.price * it.quantity : 0)
    }, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="btn-crochet">
          <Plus className="h-4 w-4 mr-1" /> Nuevo bundle
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : bundles.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay bundles</p>
          <p className="text-muted-foreground text-sm">
            Crea packs de productos con descuento para incentivar compras múltiples.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.map((b: any) => {
            const discount = b.originalTotal > b.price
              ? Math.round(((b.originalTotal - b.price) / b.originalTotal) * 100)
              : 0
            return (
              <Card key={b.id} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold">{b.name}</h3>
                  {b.featured && <Badge className="bg-primary text-primary-foreground">★</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{b.description}</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-bold text-primary text-lg">{formatPrice(b.price)}</span>
                  {b.originalTotal > b.price && (
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(b.originalTotal)}</span>
                  )}
                  {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{b.items.length} producto(s)</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => openEdit(b)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => setDeleteTarget(b)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? 'Editar bundle' : 'Nuevo bundle'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Pack BT21 Completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descripción</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio del bundle *</Label>
                <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Suma original: {formatPrice(calcOriginalTotal())}</Label>
                <Input
                  type="number" step="0.01"
                  value={form.originalTotal || String(calcOriginalTotal())}
                  onChange={(e) => setForm({ ...form, originalTotal: e.target.value })}
                  placeholder={String(calcOriginalTotal())}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="img">URL de imagen (opcional)</Label>
              <Input id="img" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/uploads/..." />
            </div>

            {/* Items del bundle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Productos del bundle</Label>
                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-3 w-3 mr-1" /> Agregar producto
                </Button>
              </div>
              {form.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay productos. Agrega al menos uno.</p>
              ) : (
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Select value={item.productId} onValueChange={(v) => updateItem(i, 'productId', v)}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Selecciona producto" /></SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number" min="1" value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={() => removeItem(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {form.items.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Suma individual: {formatPrice(calcOriginalTotal())} · Bundle: {form.price ? formatPrice(parseFloat(form.price)) : '-'} · Ahorro: {form.price ? formatPrice(calcOriginalTotal() - parseFloat(form.price)) : '-'}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch id="active" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label htmlFor="active">Activo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="feat" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label htmlFor="feat">Destacado</Label>
              </div>
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
            <AlertDialogTitle>¿Eliminar bundle?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteTarget?.name}" se eliminará.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
