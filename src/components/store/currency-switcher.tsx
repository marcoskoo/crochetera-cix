'use client'

import { useStore } from '@/lib/store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CURRENCIES = [
  { code: 'PEN', label: 'S/ PEN', symbol: 'S/' },
  { code: 'USD', label: '$ USD', symbol: '$' },
  { code: 'EUR', label: '€ EUR', symbol: '€' },
]

export function CurrencySwitcher() {
  const currency = useStore((s) => s.currency)
  const setCurrency = useStore((s) => s.setCurrency)

  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as 'PEN' | 'USD' | 'EUR')}>
      <SelectTrigger className="h-9 w-24 text-xs border-0 bg-muted/50 hover:bg-muted" aria-label="Moneda">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
