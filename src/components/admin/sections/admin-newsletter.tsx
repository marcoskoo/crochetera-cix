'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Trash2, Search, Download } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'
import type { NewsletterSubscriber } from '@prisma/client'

export function AdminNewsletter() {
  const [subs, setSubs] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/newsletter')
      const json = await data.json()
      setSubs(json)
    } catch {
      // 401 handled
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (s: NewsletterSubscriber) => {
    if (!confirm(`¿Eliminar a ${s.email}?`)) return
    try {
      await adminFetch(`/api/newsletter/${s.id}`, { method: 'DELETE' })
      toast.success('Suscriptor eliminado')
      load()
    } catch {
      toast.error('Error')
    }
  }

  const exportCsv = () => {
    const csv = ['email,name,subscribed_at']
      .concat(
        subs.map((s) =>
          [s.email, s.name || '', new Date(s.createdAt).toISOString()]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(','),
        ),
      )
      .join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Lista exportada')
  }

  const filtered = subs.filter((s) =>
    !search ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar suscriptor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={subs.length === 0}>
          <Download className="h-4 w-4 mr-1" /> Exportar CSV
        </Button>
      </div>

      <Card className="p-4 bg-primary/5">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <span className="font-semibold">{subs.filter((s) => s.active).length} suscriptores activos</span>
        </div>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay suscriptores</p>
          <p className="text-muted-foreground text-sm">
            Cuando los clientes se suscriban al newsletter desde tu tienda, aparecerán aquí.
          </p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Nombre</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Fecha</th>
                <th className="text-right p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-medium">{s.email}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{s.name || '-'}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString('es-PE')}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(s)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
