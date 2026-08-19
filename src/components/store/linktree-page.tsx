'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Instagram, Facebook, MessageCircle, Mail, Phone, Globe, ShoppingBag, ArrowLeft, ExternalLink } from 'lucide-react'

export function LinktreePage() {
  const siteConfig = useStore((s) => s.siteConfig)
  const goToSection = useStore((s) => s.goToSection)

  const links = [
    { icon: ShoppingBag, label: 'Ver catálogo', action: () => goToSection('catalog'), primary: true },
    { icon: MessageCircle, label: 'WhatsApp', href: siteConfig?.whatsapp ? `https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}` : '#', color: 'bg-green-500 hover:bg-green-600' },
    { icon: Instagram, label: 'Instagram', href: siteConfig?.instagram, color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90' },
    { icon: Facebook, label: 'Facebook', href: siteConfig?.facebook, color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: Phone, label: siteConfig?.phone || 'Llamar', href: siteConfig?.phone ? `tel:${siteConfig.phone}` : '#', color: 'bg-gray-700 hover:bg-gray-800' },
    { icon: Mail, label: 'Email', href: siteConfig?.email ? `mailto:${siteConfig.email}` : '#', color: 'bg-rose-500 hover:bg-rose-600' },
  ].filter((l) => l.href || l.action)

  return (
    <section className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Avatar */}
        <div className="text-center mb-8">
          {siteConfig?.logoUrl ? (
            <img
              src={siteConfig.logoUrl}
              alt="CROCHETERA.CIX"
              className="w-28 h-28 rounded-full object-cover shadow-xl mx-auto mb-4 yarn-float"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-bold text-5xl shadow-xl mx-auto mb-4 yarn-float">
              C
            </div>
          )}
          <h1 className="font-display text-3xl font-bold">
            CROCHETERA<span className="text-primary">.CIX</span>
          </h1>
          <p className="text-muted-foreground mt-2">{siteConfig?.tagline || 'Peluches tejidos a mano con amor'}</p>
        </div>

        {/* Links */}
        <div className="space-y-3">
          {links.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              {link.action ? (
                <Button
                  onClick={link.action}
                  className="w-full h-14 text-base font-medium btn-crochet"
                >
                  <link.icon className="h-5 w-5 mr-2" />
                  {link.label}
                </Button>
              ) : (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full h-14 rounded-xl text-white font-medium transition-all hover:scale-[1.02] ${link.color}`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                  <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button variant="ghost" size="sm" onClick={() => goToSection('home')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver a la tienda
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            🧶 Hecho con amor y mucho hilo
          </p>
        </div>
      </motion.div>
    </section>
  )
}
