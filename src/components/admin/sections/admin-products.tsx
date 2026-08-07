'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Search, Pencil, Trash2, Package, Star } from 'lucide-react'
import { MediaUploader } from '../media-uploader'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/site'
import type { ProductWithRelations, Category } from '@/lib/types'
import { useStore } from '@/lib/store'

type ProductForm = {
  name: string
  description: string
  price: string
  oldPrice: string
  categoryId: string
  stock: string
  unlimited: boolean
  featured: boolean
  status: string
  size: string
  material: string
  height: string
  weight: string
  productionDays: string
  tags: string
  images: { url: string; alt?: string; isMain?: boolean }[]
  videos: { url: string; type?: string; title?: string }[]
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  oldPrice: '',
  categoryId: '',
  stock: '0',
  unlimited: false,
  featured: false,
  status: 'active',
  size: '',
  material: '',
  height: '',
  weight: '',
  productionDays: '5',
  tags: '',
  images: [],
  videos: [],
}

export function AdminProducts() {
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [editing, setEditing] = useState<ProductWithRelations | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProductWithRelations | null>(null)
  const siteConfig = useStore((s) => s.siteConfig)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ])
      const prods = pRes.ok ? await pRes.json() : []
      const cats = cRes.ok ? await cRes.json() : []
      setProducts(prods)
      setCategories(cats)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm(emptyForm)
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (p: ProductWithRelations) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : '',
      categoryId: p.categoryId || '',
      stock: String(p.stock),
      unlimited: p.unlimited,
      featured: p.featured,
      status: p.status,
      size: p.size || '',
      material: p.material || '',
      height: p.height || '',
      weight: p.weight || '',
      productionDays: p.productionDays ? String(p.productionDays) : '',
      tags: p.tags || '',
      images: p.images.map((i) => ({ url: i.url, alt: i.alt || undefined, isMain: i.isMain })),
      videos: p.videos.map((v) => ({ url: v.url, type: v.type, title: v.title || undefined })),
    })
    setEditing(p)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Nombre y precio son obligatorios')
      return
    }
    setSaving(true)
    try {
      const body = { ...form, price: parseFloat(form.price), oldPrice: form.oldPrice || null, stock: parseInt(form.stock) || 0, productionDays: form.productionDays ? parseInt(form.productionDays) : null }
      const url = editing ? `/api/products/${editing.id}` : '/api/products'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Error al guardar')
      toast.success(editing ? 'Producto actualizado' : 'Producto creado')
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast.success('Producto eliminado')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  const filtered = products
    .filter((p) => filterCategory === 'all' || p.category?.slug === filterCategory)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 max-w-xs"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.icon} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="btn-crochet">
          <Plus className="h-4 w-4 mr-1" /> Nuevo producto
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-32 bg-muted rounded animate-pulse mb-3" />
              <div className="h-4 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay productos</p>
          <p className="text-muted-foreground text-sm mb-4">
            Crea tu primer peluche para empezar a vender.
          </p>
          <Button onClick={openCreate} className="btn-crochet">
            <Plus className="h-4 w-4 mr-1" /> Crear producto
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Card className="p-0 overflow-hidden hover:shadow-md transition group">
                <div className="aspect-video bg-muted relative">
                  {p.images[0] ? (
                     
                    <img
                      src={p.images.find((im) => im.isMain)?.url || p.images[0].url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🧶
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {p.featured && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1 fill-current" /> Destacado
                      </Badge>
                    )}
                    {p.status !== 'active' && (
                      <Badge variant="secondary">{p.status}</Badge>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm line-clamp-1">{p.name}</h3>
                    <span className="font-bold text-primary text-sm whitespace-nowrap">
                      {formatPrice(p.price, siteConfig?.currency)}
                    </span>
                  </div>
                  {p.category && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {p.category.icon} {p.category.name}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      Stock: {p.unlimited ? '∞' : p.stock}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(p)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? 'Editar producto' : 'Nuevo producto'}
            </DialogTitle>
            <DialogDescription>
              Completa la información del peluche. Las imágenes se pueden subir o pegar URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Osito de Amor Rosado"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Describe el peluche, materiales, detalles especiales..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oldPrice">Precio anterior (opcional)</Label>
                <Input
                  id="oldPrice"
                  type="number"
                  step="0.01"
                  value={form.oldPrice}
                  onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={form.categoryId || 'none'}
                  onValueChange={(v) => setForm({ ...form, categoryId: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo (visible)</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  disabled={form.unlimited}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productionDays">Días de elaboración</Label>
                <Input
                  id="productionDays"
                  type="number"
                  value={form.productionDays}
                  onChange={(e) => setForm({ ...form, productionDays: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Tamaño</Label>
                <Input
                  id="size"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  placeholder="Ej: Mediano (25cm)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura</Label>
                <Input
                  id="height"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  placeholder="Ej: 25 cm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                  placeholder="Ej: Hilo acrílico, relleno siliconado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso</Label>
                <Input
                  id="weight"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="Ej: 180 g"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tags">Tags (separados por coma)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Ej: oso, rosado, regalo"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Switch
                  id="unlimited"
                  checked={form.unlimited}
                  onCheckedChange={(v) => setForm({ ...form, unlimited: v })}
                />
                <Label htmlFor="unlimited">Stock ilimitado (hecho a pedido)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
                <Label htmlFor="featured">Producto destacado</Label>
              </div>
            </div>

            {/* Media */}
            <MediaUploader
              label="Imágenes del producto"
              value={form.images}
              onChange={(items) => setForm({ ...form, images: items })}
              accept="image"
            />

            <MediaUploader
              label="Videos del producto (YouTube/Vimeo o archivo)"
              value={form.videos}
              onChange={(items) => setForm({ ...form, videos: items })}
              accept="video"
            />

            <div className="flex gap-2 pt-2 sticky bottom-0 bg-background py-3 -mx-2 px-2 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-crochet"
              >
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto "{deleteTarget?.name}" se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
