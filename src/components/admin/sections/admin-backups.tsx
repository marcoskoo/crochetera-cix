'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DatabaseBackup, Download, HardDrive, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'

export function AdminBackups() {
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch('/api/backups')
      setBackups(await data.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await adminFetch('/api/backups/create', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Backup creado: ${data.filename}`)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al crear backup')
    } finally { setCreating(false) }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <DatabaseBackup className="h-5 w-5 text-primary" />
              Backup de la base de datos
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Crea copias de seguridad de todos tus productos, pedidos, clientes y configuración.
            </p>
          </div>
          <Button onClick={handleCreate} disabled={creating} className="btn-crochet">
            {creating ? (
              <>
                <Clock className="h-4 w-4 mr-1 animate-spin" /> Creando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" /> Crear backup
              </>
            )}
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : backups.length === 0 ? (
        <Card className="p-8 text-center">
          <DatabaseBackup className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium">No hay backups aún</p>
          <p className="text-muted-foreground text-sm">
            Crea tu primer backup para proteger tus datos.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {backups.map((b) => (
            <Card key={b.id} className="p-4 flex items-center gap-3">
              {b.status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-medium truncate">{b.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(b.createdAt).toLocaleString('es-PE')}
                </p>
              </div>
              {b.size > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {formatSize(b.size)}
                </Badge>
              )}
              <Badge variant={b.type === 'automatic' ? 'default' : 'secondary'}>
                {b.type === 'automatic' ? 'Auto' : 'Manual'}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-300">
        <p className="text-sm text-amber-800 dark:text-amber-400">
          💡 <strong>Consejo:</strong> Crea un backup semanal para mantener tus datos seguros.
          Los backups se guardan en la carpeta <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">/backups</code> del servidor.
        </p>
      </Card>
    </div>
  )
}
