'use client'

import { Button } from '@/components/ui/button'
import { Music, Share2 } from 'lucide-react'

interface TikTokShareProps {
  productName: string
  productUrl?: string
}

export function TikTokShareButton({ productName }: TikTokShareProps) {
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = `¡Mira este peluche tejido a mano! 🧶 ${productName}`

    // TikTok no tiene API de share directa, abrimos la página de crear video
    // con el texto copiado al portapapeles
    if (navigator.share) {
      try {
        await navigator.share({ title: productName, text, url })
        return
      } catch {}
    }

    // Fallback: copiar al portapapeles y abrir TikTok
    navigator.clipboard?.writeText(`${text}\n${url}`)
    window.open('https://www.tiktok.com/upload', '_blank')
  }

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault()
        handleShare()
      }}
      className="w-9 h-9 rounded-full bg-gray-900 hover:bg-black text-white flex items-center justify-center transition"
      title="Compartir en TikTok"
    >
      <Music className="h-4 w-4" />
    </a>
  )
}
