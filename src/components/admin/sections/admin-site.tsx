'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { MediaUploader } from '../media-uploader'
import { Save, Loader2, Palette, Store, Phone, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { SiteConfig } from '@/lib/types'

export function AdminSite() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/site')
      .then((r) => r.json())
      .then(setConfig)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      const res = await fetch('/api/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error('Error al guardar')
      toast.success('Configuración guardada')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !config) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  const update = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) =>
    setConfig({ ...config, [key]: value })

  return (
    <div className="space-y-6">
      {/* Identidad */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Store className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Identidad de la tienda</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Nombre de la tienda</Label>
            <Input
              id="storeName"
              value={config.storeName}
              onChange={(e) => update('storeName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Eslogan</Label>
            <Input
              id="tagline"
              value={config.tagline}
              onChange={(e) => update('tagline', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Símbolo de moneda</Label>
            <Input
              id="currency"
              value={config.currency}
              onChange={(e) => update('currency', e.target.value)}
              placeholder="S/, $, €..."
            />
          </div>
        </div>

        <MediaUploader
          label="Logo"
          value={config.logoUrl ? [{ url: config.logoUrl, type: 'image' }] : []}
          onChange={(items) => update('logoUrl', items[0]?.url || null)}
          accept="image"
          multiple={false}
        />
      </Card>

      {/* Sección Hero */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Sección principal (Hero)</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroTitle">Título</Label>
          <Input
            id="heroTitle"
            value={config.heroTitle}
            onChange={(e) => update('heroTitle', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroSubtitle">Subtítulo</Label>
          <Textarea
            id="heroSubtitle"
            value={config.heroSubtitle}
            onChange={(e) => update('heroSubtitle', e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroButtonText">Texto del botón</Label>
          <Input
            id="heroButtonText"
            value={config.heroButtonText}
            onChange={(e) => update('heroButtonText', e.target.value)}
          />
        </div>
        <MediaUploader
          label="Imagen del hero (opcional)"
          value={config.heroImage ? [{ url: config.heroImage, type: 'image' }] : []}
          onChange={(items) => update('heroImage', items[0]?.url || null)}
          accept="image"
          multiple={false}
        />
      </Card>

      {/* Sección About */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg mb-2">Sección "Sobre nosotras"</h3>
        <div className="space-y-2">
          <Label htmlFor="aboutTitle">Título</Label>
          <Input
            id="aboutTitle"
            value={config.aboutTitle}
            onChange={(e) => update('aboutTitle', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aboutText">Texto</Label>
          <Textarea
            id="aboutText"
            value={config.aboutText}
            onChange={(e) => update('aboutText', e.target.value)}
            rows={6}
          />
        </div>
        <MediaUploader
          label="Imagen de la sección about"
          value={config.aboutImage ? [{ url: config.aboutImage, type: 'image' }] : []}
          onChange={(items) => update('aboutImage', items[0]?.url || null)}
          accept="image"
          multiple={false}
        />
      </Card>

      {/* Contacto */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Información de contacto</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={config.phone || ''}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={config.whatsapp || ''}
              onChange={(e) => update('whatsapp', e.target.value)}
              placeholder="+51 999 888 777"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={config.email || ''}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={config.address || ''}
              onChange={(e) => update('address', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              value={config.instagram || ''}
              onChange={(e) => update('instagram', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook URL</Label>
            <Input
              id="facebook"
              value={config.facebook || ''}
              onChange={(e) => update('facebook', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktok">TikTok URL</Label>
            <Input
              id="tiktok"
              value={config.tiktok || ''}
              onChange={(e) => update('tiktok', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Información de envíos y pagos */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg mb-2">Envíos y pagos</h3>
        <div className="space-y-2">
          <Label htmlFor="shippingInfo">Información de envíos</Label>
          <Textarea
            id="shippingInfo"
            value={config.shippingInfo}
            onChange={(e) => update('shippingInfo', e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentInfo">Información de pagos</Label>
          <Textarea
            id="paymentInfo"
            value={config.paymentInfo}
            onChange={(e) => update('paymentInfo', e.target.value)}
            rows={3}
          />
        </div>
      </Card>

      {/* Colores */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Colores del tema</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Próximamente se aplicarán dinámicamente. Por ahora se usan los colores del tema crochet.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Color primario</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={config.primaryColor}
                onChange={(e) => update('primaryColor', e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={config.primaryColor}
                onChange={(e) => update('primaryColor', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Color secundario</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={config.secondaryColor}
                onChange={(e) => update('secondaryColor', e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={config.secondaryColor}
                onChange={(e) => update('secondaryColor', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accentColor">Color de acento</Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={config.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={config.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 bg-card border border-border rounded-lg p-3 shadow-lg flex justify-end gap-2">
        <Button onClick={handleSave} disabled={saving} className="btn-crochet min-w-40">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
