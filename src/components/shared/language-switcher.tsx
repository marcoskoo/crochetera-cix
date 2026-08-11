'use client'

import { useI18n } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as 'es' | 'en')}>
      <SelectTrigger className="h-9 w-20 text-xs border-0 bg-muted/50 hover:bg-muted" aria-label="Idioma">
        <Languages className="h-3.5 w-3.5 mr-1" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="es">🇪🇸 ES</SelectItem>
        <SelectItem value="en">🇺🇸 EN</SelectItem>
      </SelectContent>
    </Select>
  )
}
