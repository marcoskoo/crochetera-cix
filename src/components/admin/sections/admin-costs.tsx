'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Save, AlertTriangle } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/site'

export function AdminCosts() {
  const [products, setProducts] = useState<any[]>([])
  const [costs, setCosts] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const siteConfig = useStoreSiteConfig()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([
        adminFetch('/api/products'),
        adminFetch('/api/costs'),
      ])
      const prods = await pRes.json()
      const costList = await cRes.json()
      const costMap: Record<string, any> = {}
      costList.forEach((c: any) => {
        costMap[c.productId] = c
      })
      setProducts(prods)
      setCosts(costMap)
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (productId: string) => {
    setSaving(productId)
    try {
      const cost = costs[productId] || {}
      const res = await adminFetch('/api/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          materialCost: cost.materialCost || 0,
          laborCost: cost.laborCost || 0,
          shippingCost: cost.shippingCost || 0,
          otherCost: cost.otherCost || 0,
        }),
      })
      if (!res.ok) throw new Error('Error')
      toast.success('Costo guardado')
      load()
    } catch {
      toast.error('Error al guardar')
    } finally { setSaving(null) }
  }

  const updateCost = (productId: string, field: string, value: string) => {
    setCosts((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [field]: value,
      },
    }))
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-300">
        <p className="text-sm text-blue-800 dark:text-blue-400 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Calcula el costo real de cada peluche (materiales + mano de obra + envío + otros) para conocer tu margen de ganancia.
        </p>
      </Card>

      <div className="grid gap-3">
        {products.map((p) => {
          const cost = costs[p.id] || {}
          const totalCost =
            (parseFloat(cost.materialCost) || 0) +
            (parseFloat(cost.laborCost) || 0) +
            (parseFloat(cost.shippingCost) || 0) +
            (parseFloat(cost.otherCost) || 0)
          const margin = p.price - totalCost
          const marginPct = p.price > 0 ? (margin / p.price) * 100 : 0
          const isLowMargin = marginPct < 30

          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {p.images[0] && (
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                      { }
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Precio: {formatPrice(p.price)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${isLowMargin ? 'text-destructive' : 'text-green-600'}`}>
                    {formatPrice(margin)}
                  </p>
                  <Badge variant={isLowMargin ? 'destructive' : 'default'} className="text-xs">
                    {marginPct.toFixed(0)}% margen
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <div className="space-y-1">
                  <Label className="text-xs">Materiales</Label>
                  <Input
                    type="number" step="0.01" placeholder="0.00"
                    value={cost.materialCost || ''}
                    onChange={(e) => updateCost(p.id, 'materialCost', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mano de obra</Label>
                  <Input
                    type="number" step="0.01" placeholder="0.00"
                    value={cost.laborCost || ''}
                    onChange={(e) => updateCost(p.id, 'laborCost', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Envío</Label>
                  <Input
                    type="number" step="0.01" placeholder="0.00"
                    value={cost.shippingCost || ''}
                    onChange={(e) => updateCost(p.id, 'shippingCost', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Otros</Label>
                  <Input
                    type="number" step="0.01" placeholder="0.00"
                    value={cost.otherCost || ''}
                    onChange={(e) => updateCost(p.id, 'otherCost', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Costo total: <strong>{formatPrice(totalCost)}</strong>
                  {isLowMargin && (
                    <span className="text-destructive ml-2 flex items-center gap-1 inline-flex">
                      <AlertTriangle className="h-3 w-3" /> Margen bajo
                    </span>
                  )}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleSave(p.id)}
                  disabled={saving === p.id}
                >
                  <Save className="h-3 w-3 mr-1" />
                  {saving === p.id ? '...' : 'Guardar'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Hook auxiliar
import { useStore } from '@/lib/store'
function useStoreSiteConfig() {
  return useStore((s) => s.siteConfig)
}
