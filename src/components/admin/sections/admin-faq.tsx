'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Plus, Pencil, Trash2, HelpCircle, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'
import type { FAQ } from '@prisma/client'

interface FAQForm {
  question: string
  answer: string
  category: string
  order: number
  visible: boolean
}

const empty: FAQForm = { question: '', answer: '', category: 'General', order: 0, visible: true }

export function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<FAQ | null>(null)
  const [form, setForm] = useState<FAQForm>(empty)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/faq')
      const json = await data.json()
      setFaqs(json)
    } catch {
      // 401 handled
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm({ ...empty, order: faqs.length + 1 })
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (f: FAQ) => {
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category,
      order: f.order,
      visible: f.visible,
    })
    setEditing(f)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.question || !form.answer) {
      toast.error('Pregunta y respuesta son obligatorias')
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/faq/${editing.id}` : '/api/faq'
      const method = editing ? 'PUT' : 'POST'
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al guardar')
      toast.success(editing ? 'FAQ actualizada' : 'FAQ creada')
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
      await adminFetch(`/api/faq/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('FAQ eliminada')
      setDeleteTarget(null)
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const toggleVisible = async (f: FAQ) => {
    try {
      await adminFetch(`/api/faq/${f.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, visible: !f.visible }),
      })
      load()
    } catch {
      toast.error('Error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="btn-crochet">
          <Plus className="h-4 w-4 mr-1" /> Nueva FAQ
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : faqs.length === 0 ? (
        <Card className="p-8 text-center">
          <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay preguntas frecuentes</p>
          <p className="text-muted-foreground text-sm">
            Añade las preguntas más comunes de tus clientes para evitar dudas repetidas.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {faqs
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((f) => (
              <Card key={f.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {f.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{f.question}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{f.answer}</p>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full mt-1 inline-block">
                      {f.category}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleVisible(f)} title={f.visible ? 'Ocultar' : 'Mostrar'}>
                      {f.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(f)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(f)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? 'Editar FAQ' : 'Nueva FAQ'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Pregunta *</Label>
              <Input id="question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Respuesta *</Label>
              <Textarea id="answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ej: Envíos, Pagos, Productos" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Orden</Label>
                <Input id="order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch id="visible" checked={form.visible} onCheckedChange={(v) => setForm({ ...form, visible: v })} />
                <Label htmlFor="visible">Visible</Label>
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
            <AlertDialogTitle>¿Eliminar FAQ?</AlertDialogTitle>
            <AlertDialogDescription>La pregunta "{deleteTarget?.question}" ya no aparecerá en tu tienda.</AlertDialogDescription>
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
