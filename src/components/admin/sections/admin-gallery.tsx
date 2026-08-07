'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { MediaUploader } from '../media-uploader'
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { GalleryImage } from '@/lib/types'

interface GalleryForm {
  url: string
  title: string
  caption: string
  category: string
  order: number
  visible: boolean
}

const empty: GalleryForm = {
  url: '',
  title: '',
  caption: '',
  category: '',
  order: 0,
  visible: true,
}

export function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<GalleryImage | null>(null)
  const [form, setForm] = useState<GalleryForm>(empty)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/gallery')
      const data = await res.json()
      setImages(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm({ ...empty, order: images.length + 1 })
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (img: GalleryImage) => {
    setForm({
      url: img.url,
      title: img.title || '',
      caption: img.caption || '',
      category: img.category || '',
      order: img.order,
      visible: img.visible,
    })
    setEditing(img)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.url) {
      toast.error('La imagen es obligatoria')
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/gallery/${editing.id}` : '/api/gallery'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al guardar')
      toast.success(editing ? 'Imagen actualizada' : 'Imagen agregada')
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/gallery/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('Imagen eliminada')
      setDeleteTarget(null)
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="btn-crochet">
          <Plus className="h-4 w-4 mr-1" /> Agregar imagen
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="aspect-square animate-pulse bg-muted" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">Galería vacía</p>
          <p className="text-muted-foreground text-sm mb-4">
            Sube fotos de tus trabajos para mostrarlos en la galería.
          </p>
          <Button onClick={openCreate} className="btn-crochet">
            Subir primera foto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="overflow-hidden group p-0">
                <div className="aspect-square bg-muted relative">
                  { }
                  <img
                    src={img.url}
                    alt={img.title || ''}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => openEdit(img)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => setDeleteTarget(img)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {!img.visible && (
                    <span className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                      Oculta
                    </span>
                  )}
                </div>
                {img.title && (
                  <div className="p-2">
                    <p className="text-sm font-medium line-clamp-1">{img.title}</p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? 'Editar imagen' : 'Nueva imagen'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MediaUploader
              label="Imagen *"
              value={form.url ? [{ url: form.url, type: 'image' }] : []}
              onChange={(items) => setForm({ ...form, url: items[0]?.url || '' })}
              accept="image"
              multiple={false}
            />
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Descripción / Caption</Label>
              <Input
                id="caption"
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría (etiqueta)</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Ej: Osos, Navidad, Personalizados"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="visible"
                  checked={form.visible}
                  onCheckedChange={(v) => setForm({ ...form, visible: v })}
                />
                <Label htmlFor="visible">Visible</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
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
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              La imagen se quitará de la galería.
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
