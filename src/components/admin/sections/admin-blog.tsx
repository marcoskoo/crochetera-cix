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
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'
import type { BlogPost } from '@prisma/client'

interface PostForm {
  title: string; excerpt: string; content: string; coverImage: string;
  tags: string; published: boolean; featured: boolean;
}
const empty: PostForm = { title: '', excerpt: '', content: '', coverImage: '', tags: '', published: false, featured: false }

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<PostForm>(empty)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/blog')
      setPosts(await data.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(empty); setEditing(null); setShowForm(true) }
  const openEdit = (p: BlogPost) => {
    setForm({
      title: p.title, excerpt: p.excerpt, content: p.content,
      coverImage: p.coverImage || '', tags: p.tags || '',
      published: p.published, featured: p.featured,
    })
    setEditing(p); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.excerpt) {
      toast.error('Título y extracto son obligatorios')
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/blog/${editing.id}` : '/api/blog'
      const method = editing ? 'PUT' : 'POST'
      const res = await adminFetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error')
      toast.success(editing ? 'Artículo actualizado' : 'Artículo creado')
      setShowForm(false); load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await adminFetch(`/api/blog/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('Artículo eliminado')
      setDeleteTarget(null); load()
    } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="btn-crochet">
          <Plus className="h-4 w-4 mr-1" /> Nuevo artículo
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay artículos</p>
          <p className="text-muted-foreground text-sm">
            Escribe tips de crochet, cuidados de peluches, historias, etc.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => (
            <Card key={p.id} className="overflow-hidden p-0">
              <div className="aspect-video bg-muted">
                {p.coverImage ? (
                   
                  <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-accent/30 to-secondary">📝</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {p.featured && <Badge className="bg-primary text-primary-foreground">★ Destacado</Badge>}
                  <Badge variant={p.published ? 'default' : 'secondary'}>
                    {p.published ? 'Publicado' : 'Borrador'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{p.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.excerpt}</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => openEdit(p)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => setDeleteTarget(p)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? 'Editar artículo' : 'Nuevo artículo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Extracto *</Label>
              <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Resumen corto" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea id="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Escribe el artículo. Usa # para títulos, - para viñetas." />
              <p className="text-xs text-muted-foreground">Tip: Usa "# Título" para encabezados y "- " para viñetas</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">URL de imagen de portada</Label>
              <Input id="cover" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://... o /uploads/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separados por coma)</Label>
              <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="cuidados, tips, crochet" />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch id="pub" checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label htmlFor="pub">Publicado</Label>
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
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteTarget?.title}" se eliminará permanentemente.</AlertDialogDescription>
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
