'use client'

import { useStore } from '@/lib/store'
import { Heart, Instagram, Facebook, MessageCircle, Mail, Phone } from 'lucide-react'

export function Footer() {
  const siteConfig = useStore((s) => s.siteConfig)
  const goToSection = useStore((s) => s.goToSection)
  const setCategory = useStore((s) => s.setCategory)

  return (
    <footer className="mt-auto bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                C
              </div>
              <h3 className="font-display text-xl font-bold">
                CROCHETERA<span className="text-primary">.CIX</span>
              </h3>
            </div>
            <p className="text-background/70 text-sm max-w-sm mb-4">
              {siteConfig?.tagline || 'Peluches tejidos a mano con amor'}
            </p>
            <div className="flex gap-2">
              {siteConfig?.instagram && (
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {siteConfig?.facebook && (
                <a
                  href={siteConfig.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {siteConfig?.whatsapp && (
                <a
                  href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => goToSection('home')}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setCategory(null); goToSection('catalog') }}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Catálogo
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToSection('about')}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Nosotros
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToSection('contact')}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Contacto
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToSection('custom')}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Pedidos personalizados
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToSection('track')}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Rastrear pedido
                </button>
              </li>
              <li>
                <button
                  onClick={() => goToSection('wishlist')}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Lista de deseos
                </button>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-2 text-sm">
              {siteConfig?.phone && (
                <li className="flex items-center gap-2 text-background/70">
                  <Phone className="h-4 w-4 text-primary" />
                  {siteConfig.phone}
                </li>
              )}
              {siteConfig?.email && (
                <li className="flex items-center gap-2 text-background/70">
                  <Mail className="h-4 w-4 text-primary" />
                  {siteConfig.email}
                </li>
              )}
              {siteConfig?.address && (
                <li className="text-background/70">{siteConfig.address}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-background/60">
          <p>
            © {new Date().getFullYear()} CROCHETERA.CIX · Todos los derechos reservados
          </p>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="h-3 w-3 fill-primary text-primary" /> y mucho hilo
          </p>
        </div>
      </div>
    </footer>
  )
}
