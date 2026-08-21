'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Ruler } from 'lucide-react'

const SIZES = [
  { name: 'Pequeño', height: '12-18 cm', weight: '60-120 g', use: 'Llaveros, decoración escritorio, regalos pequeños', price: 'S/ 35-55' },
  { name: 'Mediano', height: '20-28 cm', weight: '150-220 g', use: 'Regalos, abrazar, decoración', price: 'S/ 60-90' },
  { name: 'Grande', height: '30-45 cm', weight: '300-500 g', use: 'Peluche principal, regalos especiales', price: 'S/ 100-150' },
  { name: 'Extra Grande', height: '50+ cm', weight: '600+ g', use: 'Pieza de colección, decoración', price: 'S/ 180+' },
]

export function SizeGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-primary hover:no-underline">
          <Ruler className="h-4 w-4 mr-1" />
          Guía de tallas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Ruler className="h-6 w-6 text-primary" />
            Guía de tallas
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Cada peluche es tejido a mano por encargo. Las medidas son aproximadas y pueden variar ligeramente según el diseño.
          </p>
          <div className="grid gap-3">
            {SIZES.map((size) => (
              <div
                key={size.name}
                className="border border-border rounded-lg p-4 hover:border-primary/50 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-bold text-lg">{size.name}</h3>
                  <span className="text-sm font-bold text-primary">{size.price}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Altura</p>
                    <p className="font-medium">{size.height}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Peso aproximado</p>
                    <p className="font-medium">{size.weight}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2"> Ideal: {size.use}</p>
              </div>
            ))}
          </div>
          <div className="bg-primary/5 rounded-lg p-3 text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Si necesitas un tamaño específico o personalizado, contáctanos por WhatsApp. Hacemos peluches a medida desde 8 cm hasta 60 cm.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
