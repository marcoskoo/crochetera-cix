'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { HelpCircle, MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { ProductQuestion } from '@prisma/client'

interface ProductQuestionsProps {
  productId: string
}

export function ProductQuestions({ productId }: ProductQuestionsProps) {
  const [questions, setQuestions] = useState<ProductQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ author: '', question: '' })

  const load = () => {
    fetch(`/api/questions?productId=${productId}`)
      .then((r) => r.json())
      .then(setQuestions)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
     
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.author || !form.question) {
      toast.error('Completa todos los campos')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, productId }),
      })
      if (!res.ok) throw new Error('Error')
      toast.success('¡Pregunta enviada! Te responderemos pronto.')
      setForm({ author: '', question: '' })
      setShowForm(false)
    } catch {
      toast.error('Error al enviar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          Preguntas y respuestas
        </h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Hacer una pregunta'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="p-5">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="q-author">Tu nombre</Label>
                  <Input
                    id="q-author"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q-text">Tu pregunta</Label>
                  <Textarea
                    id="q-text"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    rows={3}
                    placeholder="Ej: ¿Puedo personalizar el color de este peluche?"
                    required
                  />
                </div>
                <Button type="submit" disabled={submitting} className="btn-crochet">
                  {submitting ? 'Enviando...' : (
                    <>
                      <Send className="h-4 w-4 mr-1" /> Enviar pregunta
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <p className="text-muted-foreground">Cargando preguntas...</p>
      ) : questions.length === 0 ? (
        <Card className="p-8 text-center">
          <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-medium mb-1">Aún no hay preguntas</p>
          <p className="text-sm text-muted-foreground mb-4">
            ¿Tienes una duda sobre este peluche? ¡Sé la primera persona en preguntar!
          </p>
          <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
            Hacer la primera pregunta
          </Button>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {questions.map((q) => (
            <Card key={q.id} className="overflow-hidden p-0">
              <AccordionItem value={q.id} className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline text-left font-medium text-sm">
                  <span className="flex items-start gap-2">
                    <span className="text-primary font-bold">Q:</span>
                    <span>{q.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 text-muted-foreground">
                  <div className="flex items-start gap-2 pl-4 border-l-2 border-primary/30">
                    <span className="text-primary font-bold">A:</span>
                    <div>
                      <p>{q.answer}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Respondido por {q.answeredBy || 'CROCHETERA.CIX'} ·{' '}
                        {new Date(q.createdAt).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
          ))}
        </Accordion>
      )}
    </div>
  )
}
