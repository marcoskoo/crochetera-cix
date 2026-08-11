'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Star, Search, Gift, Download } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'

export function AdminLoyalty() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/loyalty')
      setAccounts(await data.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const totalPoints = accounts.reduce((s, a) => s + a.points, 0)
  const totalEarned = accounts.reduce((s, a) => s + a.totalEarned, 0)

  const exportCsv = () => {
    const csv = ['email,name,phone,points,total_earned,total_spent,created_at']
      .concat(
        accounts.map((a) =>
          [a.email, a.name || '', a.phone || '', a.points, a.totalEarned, a.totalSpent, new Date(a.createdAt).toISOString()]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(','),
        ),
      )
      .join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `loyalty-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Lista exportada')
  }

  const filtered = accounts.filter((a) =>
    !search ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.name || '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
          <p className="text-xs text-muted-foreground">Cuentas activas</p>
          <p className="font-display text-2xl font-bold text-orange-600">{accounts.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Puntos en circulación</p>
          <p className="font-display text-2xl font-bold text-primary">{totalPoints.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total otorgado</p>
          <p className="font-display text-2xl font-bold text-green-600">{totalEarned.toLocaleString()}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={accounts.length === 0}>
          <Download className="h-4 w-4 mr-1" /> Exportar CSV
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay cuentas de fidelidad</p>
          <p className="text-muted-foreground text-sm">
            Cuando los clientes se registren en el checkout, aparecerán aquí.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Cada nueva cuenta recibe 50 puntos de bienvenida.
          </p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Nombre</th>
                <th className="text-right p-3 font-medium">Puntos</th>
                <th className="text-right p-3 font-medium hidden md:table-cell">Ganados</th>
                <th className="text-right p-3 font-medium hidden md:table-cell">Gastados</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Registro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-medium">{a.email}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{a.name || '-'}</td>
                  <td className="p-3 text-right">
                    <span className="inline-flex items-center gap-1 font-bold text-orange-600">
                      <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                      {a.points}
                    </span>
                  </td>
                  <td className="p-3 text-right hidden md:table-cell text-muted-foreground">{a.totalEarned}</td>
                  <td className="p-3 text-right hidden md:table-cell text-muted-foreground">{a.totalSpent}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                    {new Date(a.createdAt).toLocaleDateString('es-PE')}
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
