'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Palette, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface ColorOption {
  name: string
  hex: string
  emoji: string
}

const COLORS: ColorOption[] = [
  { name: 'Rosado', hex: '#F8BBD0', emoji: '🌸' },
  { name: 'Azul cielo', hex: '#81D4FA', emoji: '💙' },
  { name: 'Amarillo', hex: '#FFF176', emoji: '💛' },
  { name: 'Verde menta', hex: '#A5D6A7', emoji: '💚' },
  { name: 'Lila', hex: '#CE93D8', emoji: '🟣' },
  { name: 'Naranja', hex: '#FFAB91', emoji: '🧡' },
  { name: 'Beige', hex: '#D7CCC8', emoji: '🤎' },
  { name: 'Blanco', hex: '#FAFAFA', emoji: '⚪' },
  { name: 'Negro', hex: '#424242', emoji: '🖤' },
  { name: 'Turquesa', hex: '#80CBC4', emoji: '💎' },
]

const ACCESSORIES = ['Cinta rosa', 'Moño azul', 'Bufanda', 'Gorro', 'Corazón bordado', 'Sin accesorios']

interface ProductCustomizerProps {
  productName: string
  basePrice: number
  onApply?: (customization: { color: string; accessory: string; name: string; price: number }) => void
}

export function ProductCustomizer({ productName, basePrice, onApply }: ProductCustomizerProps) {
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [selectedAccessory, setSelectedAccessory] = useState(ACCESSORIES[5])
  const [customName, setCustomName] = useState('')

  const accessoryPrice = selectedAccessory !== 'Sin accesorios' ? 10 : 0
  const namePrice = customName.trim() ? 15 : 0
  const totalPrice = basePrice + accessoryPrice + namePrice

  const handleApply = () => {
    onApply?.({
      color: selectedColor.name,
      accessory: selectedAccessory,
      name: customName,
      price: totalPrice,
    })
    toast.success('Personalización aplicada 💖')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl p-5 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">¡Personaliza tu peluche!</h3>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-4 mb-5 p-4 bg-card rounded-lg">
        <div
          className="w-20 h-20 rounded-full shadow-inner flex items-center justify-center text-4xl transition-colors"
          style={{ backgroundColor: selectedColor.hex }}
        >
          🧸
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{productName}</p>
          <p className="text-xs text-muted-foreground">
            Color: <span style={{ color: selectedColor.hex === '#424242' ? '#888' : selectedColor.hex }}>
              {selectedColor.emoji} {selectedColor.name}
            </span>
          </p>
          {selectedAccessory !== 'Sin accesorios' && (
            <p className="text-xs text-muted-foreground">Accesorio: {selectedAccessory}</p>
          )}
          {customName && (
            <p className="text-xs text-muted-foreground">Nombre: "{customName}"</p>
          )}
          <p className="font-bold text-primary text-lg mt-1">
            S/ {totalPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Color picker */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center gap-1">
          <Palette className="h-4 w-4" /> Color del peluche
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color)}
              className={`relative h-10 rounded-lg border-2 transition-all ${
                selectedColor.name === color.name
                  ? 'border-primary scale-110 shadow-md'
                  : 'border-transparent hover:border-border'
              }`}
              style={{ backgroundColor: color.hex }}
              title={`${color.emoji} ${color.name}`}
              aria-label={color.name}
            >
              {selectedColor.name === color.name && (
                <Check className="absolute inset-0 m-auto h-4 w-4 text-black/70" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Seleccionado: {selectedColor.emoji} {selectedColor.name}
        </p>
      </div>

      {/* Accessories */}
      <div className="space-y-2 mb-4">
        <Label>Accesorio (+S/10)</Label>
        <div className="flex flex-wrap gap-2">
          {ACCESSORIES.map((acc) => (
            <button
              key={acc}
              onClick={() => setSelectedAccessory(acc)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedAccessory === acc
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              {acc}
            </button>
          ))}
        </div>
      </div>

      {/* Custom name */}
      <div className="space-y-2 mb-4">
        <Label>Nombre bordado (+S/15)</Label>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value.slice(0, 20))}
          placeholder="Ej: María (máx 20 caracteres)"
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {customName.length}/20 caracteres
        </p>
      </div>

      <Button onClick={handleApply} className="w-full btn-crochet">
        <Sparkles className="h-4 w-4 mr-1" />
        Aplicar personalización
      </Button>
    </motion.div>
  )
}
