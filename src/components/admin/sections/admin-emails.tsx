'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Mail, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'

const EMAIL_TEMPLATES = {
  welcome: {
    subject: '¡Bienvenida a CROCHETERA.CIX! 🧶',
    body: '¡Hola!\n\nGracias por unirte a nuestra comunidad de peluches tejidos a mano.\n\nComo regalo de bienvenida, usa el cupón BIENVENIDA10 para obtener 10% de descuento en tu primera compra.\n\n¡Esperamos que encuentres el peluche perfecto!\n\nCon cariño,\nCROCHETERA.CIX',
  },
  abandoned_cart: {
    subject: '¡Tus peluches te están esperando! 🧸',
    body: '¡Hola!\n\nNotamos que dejaste algunos peluches en tu carrito. ¡No dejes que alguien más se los lleve!\n\nCompleta tu compra ahora y recibe tu pedido pronto.\n\nSi tienes dudas, escríbenos por WhatsApp.\n\nCROCHETERA.CIX',
  },
  post_purchase: {
    subject: '¡Gracias por tu compra! 💖',
    body: '¡Hola!\n\nGracias por confiar en CROCHETERA.CIX. Tu pedido está en proceso de elaboración.\n\nTe mantendremos informada sobre el estado de tu pedido.\n\n¿Quieres compartir una foto cuando lo recibas? ¡Nos encantaría verlo!\n\nCon cariño,\nCROCHETERA.CIX',
  },
  birthday: {
    subject: '¡Feliz cumpleaños! 🎉 Tenemos un regalo para ti',
    body: '¡Feliz cumpleaños!\n\nPara celebrar tu día especial, te regalamos un 15% de descuento en tu próxima compra.\n\nUsa el cupón CUMPLE15 en el checkout.\n\n¡Que tengas un día maravilloso!\n\nCROCHETERA.CIX',
  },
}

export function AdminEmails() {
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ to: '', subject: '', body: '', type: 'manual' })
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/emails')
      setEmails(await data.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSend = async () => {
    if (!form.to || !form.subject) {
      toast.error('Email y asunto son obligatorios')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error')
      toast.success('Email registrado')
      setForm({ to: '', subject: '', body: '', type: 'manual' })
      load()
    } catch { toast.error('Error al enviar') }
    finally { setSending(false) }
  }

  const applyTemplate = (type: keyof typeof EMAIL_TEMPLATES) => {
    const template = EMAIL_TEMPLATES[type]
    setForm({ ...form, subject: template.subject, body: template.body, type })
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Send className="h-5 w-5 text-primary" />
          Enviar email
        </h3>

        {/* Templates rápidos */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(EMAIL_TEMPLATES).map(([key, t]) => (
            <Button
              key={key}
              size="sm"
              variant="outline"
              onClick={() => applyTemplate(key as keyof typeof EMAIL_TEMPLATES)}
            >
              {t.subject.slice(0, 30)}...
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="to" className="text-xs">Para *</Label>
            <Input id="to" type="email" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="cliente@email.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="subject" className="text-xs">Asunto *</Label>
            <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="body" className="text-xs">Mensaje</Label>
            <Textarea id="body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} />
          </div>
          <Button onClick={handleSend} disabled={sending} className="w-full btn-crochet">
            {sending ? 'Enviando...' : (
              <>
                <Send className="h-4 w-4 mr-1" /> Enviar email
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-300">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          📧 <strong>Nota:</strong> Los emails se registran en el sistema. Para envío real por SMTP, conectar con Resend, SendGrid o Mailgun en <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">/api/emails/send</code>.
        </p>
      </Card>

      {/* Historial de emails */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Emails enviados ({emails.length})
        </h3>
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : emails.length === 0 ? (
          <Card className="p-6 text-center">
            <Mail className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No hay emails enviados aún</p>
          </Card>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {emails.map((e) => (
              <Card key={e.id} className="p-3 flex items-start gap-3">
                {e.status === 'sent' ? (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{e.subject}</p>
                  <p className="text-xs text-muted-foreground">Para: {e.to}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{e.type}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(e.createdAt).toLocaleString('es-PE')}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
