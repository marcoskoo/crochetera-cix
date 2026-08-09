'use client'

import { useStore } from '@/lib/store'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export function WhatsAppFloating() {
  const siteConfig = useStore((s) => s.siteConfig)

  if (!siteConfig?.whatsapp) return null

  const phone = siteConfig.whatsapp.replace(/[^0-9]/g, '')
  const message = encodeURIComponent(
    `¡Hola ${siteConfig.storeName}! 👋 Me gustaría más información sobre sus peluches tejidos a crochet.`,
  )
  const href = `https://wa.me/${phone}?text=${message}`

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all hover:scale-105 group"
      style={{ padding: '0.75rem' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring' }}
      title="Escríbenos por WhatsApp"
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-6 w-6 fill-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-medium text-sm">
        ¿Necesitas ayuda?
      </span>
      {/* Pulsing dot */}
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
      </span>
    </motion.a>
  )
}
