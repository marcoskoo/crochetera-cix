'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { MediaUploader } from '../media-uploader'
import { Plus, Trash2, Camera, Clock, Eye } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'
import type { Story } from '@prisma/client'

const HOURS_OPTIONS = [
  { value: '6', label: '6 horas' },
  { value: '12', label: '12 horas' },
  { value: '24', label: '24 horas (default)' },
  { value: '48', label: '48 horas' },
  { value: '72', label: '3 días' },
]

export function AdminStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', imageUrl: '', videoUrl: '', link: '', hours: '24' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Story | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/stories')
      setStories(await data.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.imageUrl) {
      toast.error('La imagen es obligatoria')
      return
    }
    setSaving(true)
    try {
      const res = await adminFetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error')
      toast.success('Story creado')
      setShowForm(false)
      setForm({ title: '', imageUrl: '', videoUrl: '', link: '', hours: '24' })
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await adminFetch(`/api/stories/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('Story eliminado')
      setDeleteTarget(null); load()
    } catch { toast.error('Error') }
  }

  const getTimeLeft = (expiresAt: Date | string) => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Expirado'
    const hours = Math.floor(diff / (60 * 60 * 1000))
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} className="btn-crochet">
          <Plus className="h-4 w-4 mr-1" /> Nueva story
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : stories.length === 0 ? (
        <Card className="p-8 text-center">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay stories</p>
          <p className="text-muted-foreground text-sm">
            Sube fotos efímeras del taller, proceso de creación, behind the scenes, etc. Desaparecen automáticamente.
          </p>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stories.map((story) => (
            <Card key={story.id} className="flex-shrink-0 w-48 p-3">
              <div className="aspect-[9/16] rounded-lg overflow-hidden bg-muted mb-2 relative">
                { }
                <img src={story.imageUrl} alt={story.title || ''} className="w-full h-full object-cover" />
                <div className="absolute top-1 right-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7 bg-black/50 text-white hover:bg-black/70" onClick={() => setDeleteTarget(story)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {story.title && <p className="text-xs font-medium line-clamp-2 mb-1">{story.title}</p>}
              <div className="flex items-center justify-between text-xs">
                <Badge variant={new Date(story.expiresAt) > new Date() ? 'default' : 'secondary'}>
                  <Clock className="h-3 w-3 mr-1" />
                  {getTimeLeft(story.expiresAt)}
                </Badge>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />{story.views}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Nueva story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MediaUploader
              label="Imagen *"
              value={form.imageUrl ? [{ url: form.imageUrl }] : []}
              onChange={(items) => setForm({ ...form, imageUrl: items[0]?.url || '' })}
              accept="image"
              multiple={false}
            />
            <div className="space-y-2">
              <Label htmlFor="title">Título (opcional)</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Detrás del telar 🧶" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link al hacer clic (opcional)</Label>
              <Input id="link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/catalog o https://..." />
            </div>
            <div className="space-y-2">
              <Label>Duración</Label>
              <Select value={form.hours} onValueChange={(v) => setForm({ ...form, hours: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HOURS_OPTIONS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 btn-crochet">
                {saving ? 'Guardando...' : 'Publicar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar story?</AlertDialogTitle>
            <AlertDialogDescription>La story se eliminará inmediatamente.</AlertDialogDescription>
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
