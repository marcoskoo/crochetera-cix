'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { HelpCircle, Trash2, MessageCircle, Send } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'

export function AdminQuestions() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [answer, setAnswer] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const productsRes = await adminFetch('/api/products')
      const products = await productsRes.json()
      const allQs: any[] = []
      for (const p of products) {
        const qRes = await fetch(`/api/questions?productId=${p.id}`)
        if (qRes.ok) {
          const qs = await qRes.json()
          qs.forEach((q: any) => allQs.push({ ...q, productName: p.name }))
        }
      }
      allQs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setQuestions(allQs)
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAnswer = async () => {
    if (!selected || !answer.trim()) return
    try {
      const res = await adminFetch(`/api/questions/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answer.trim(), answeredBy: 'Ashley' }),
      })
      if (!res.ok) throw new Error('Error')
      toast.success('Respuesta enviada')
      setSelected(null); setAnswer(''); load()
    } catch {
      toast.error('Error al responder')
    }
  }

  const handleDelete = async (q: any) => {
    if (!confirm('¿Eliminar pregunta?')) return
    try {
      await adminFetch(`/api/questions/${q.id}`, { method: 'DELETE' })
      toast.success('Pregunta eliminada')
      load()
    } catch { toast.error('Error') }
  }

  const pending = questions.filter((q) => !q.answer)
  const answered = questions.filter((q) => q.answer)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Badge variant="secondary">{pending.length} pendientes</Badge>
        <Badge>{answered.length} respondidas</Badge>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando preguntas...</p>
      ) : questions.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay preguntas</p>
          <p className="text-muted-foreground text-sm">
            Cuando los clientes pregunten sobre productos, aparecerán aquí.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {[...pending, ...answered].map((q) => (
            <Card key={q.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{q.productName}</p>
                  <p className="font-medium text-sm mt-1">
                    <span className="text-primary font-bold">Q:</span> {q.question}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por {q.author} · {new Date(q.createdAt).toLocaleDateString('es-PE')}
                  </p>
                </div>
                <Badge variant={q.answer ? 'default' : 'secondary'}>
                  {q.answer ? 'Respondida' : 'Pendiente'}
                </Badge>
              </div>
              {q.answer && (
                <div className="bg-muted/30 rounded-lg p-3 mt-2">
                  <p className="text-sm">
                    <span className="text-primary font-bold">A:</span> {q.answer}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Por {q.answeredBy}</p>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                {!q.answer && (
                  <Button size="sm" onClick={() => { setSelected(q); setAnswer('') }}>
                    <Send className="h-3.5 w-3.5 mr-1" /> Responder
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(q)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Responder pregunta</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{selected.productName}</p>
                <p className="text-sm font-medium mt-1">{selected.question}</p>
                <p className="text-xs text-muted-foreground mt-1">Por {selected.author}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Tu respuesta</Label>
                <Textarea
                  id="answer" value={answer}
                  onChange={(e) => setAnswer(e.target.value)} rows={4}
                  placeholder="Escribe una respuesta útil y amable..."
                  autoFocus
                />
              </div>
              <Button onClick={handleAnswer} disabled={!answer.trim()} className="w-full btn-crochet">
                <Send className="h-4 w-4 mr-1" /> Enviar respuesta
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
