'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Pencil, Trash2, Eye, EyeOff, LayoutList } from 'lucide-react'
import { toast } from 'sonner'
import type { Section } from '@/lib/types'

export function AdminSections() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Section | null>(null)
  const [form, setForm] = useState({
    key: '',
    title: '',
    subtitle: '',
    content: '',
    visible: true,
    order: 0,
  })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sections')
      const data = await res.json()
      setSections(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm({ key: '', title: '', subtitle: '', content: '', visible: true, order: sections.length + 1 })
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (s: Section) => {
    setForm({
      key: s.key,
      title: s.title,
      subtitle: s.subtitle || '',
      content: s.content || '',
      visible: s.visible,
      order: s.order,
    })
    setEditing(s)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.key) {
      toast.error('Título y clave son obligatorios')
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/sections/${editing.id}` : '/api/sections'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al guardar')
      toast.success(editing ? 'Sección actualizada' : 'Sección creada')
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
      await fetch(`/api/sections/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('Sección eliminada')
      setDeleteTarget(null)
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const toggleVisible = async (s: Section) => {
    try {
      await fetch(`/api/sections/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...s, visible: !s.visible }),
      })
      load()
      toast.success(s.visible ? 'Sección oculta' : 'Sección visible')
    } catch {
      toast.error('Error al actualizar')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Gestiona las secciones que aparecen en tu tienda. Puedes ocultarlas, editarlas o crear nuevas.
        </p>
        <Button onClick={openCreate} className="btn-crochet">
          <Plus className="h-4 w-4 mr-1" /> Nueva sección
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-20 animate-pulse bg-muted" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20">
          <LayoutList className="h-16 w-16 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay secciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sections
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((s) => (
              <Card key={s.id} className="p-4 hover:shadow-md transition flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {s.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{s.title}</h3>
                    <Badge variant="outline" className="text-xs font-mono">
                      {s.key}
                    </Badge>
                  </div>
                  {s.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {s.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => toggleVisible(s)}
                    title={s.visible ? 'Ocultar' : 'Mostrar'}
                  >
                    {s.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEdit(s)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteTarget(s)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? 'Editar sección' : 'Nueva sección'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key">Clave única (identificador)</Label>
              <Input
                id="key"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="Ej: faq, promo, banner"
                disabled={!!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="visible"
                checked={form.visible}
                onCheckedChange={(v) => setForm({ ...form, visible: v })}
              />
              <Label htmlFor="visible">Visible</Label>
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
            <AlertDialogTitle>¿Eliminar sección?</AlertDialogTitle>
            <AlertDialogDescription>
              La sección "{deleteTarget?.title}" ya no aparecerá en tu tienda.
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
