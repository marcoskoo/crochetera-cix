'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ShoppingCart, Menu, Heart, Search, X } from 'lucide-react'
import { formatPrice } from '@/lib/site'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState('')

  const cart = useStore((s) => s.cart)
  const cartCount = useStore((s) => s.cartCount())
  const cartTotal = useStore((s) => s.cartTotal())
  const setCartOpen = useStore((s) => s.setCartOpen)
  const cartOpen = useStore((s) => s.cartOpen)
  const goToSection = useStore((s) => s.goToSection)
  const setCategory = useStore((s) => s.setCategory)
  const setSearch = useStore((s) => s.setSearch)
  const updateQuantity = useStore((s) => s.updateQuantity)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const clearCart = useStore((s) => s.clearCart)
  const setView = useStore((s) => s.setView)
  const adminAuthed = useStore((s) => s.adminAuthed)
  const siteConfig = useStore((s) => s.siteConfig)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(localSearch)
    setCategory(null)
    goToSection('catalog')
    setSearchOpen(false)
    setMobileOpen(false)
  }

  const navLinks = [
    { label: 'Inicio', action: () => goToSection('home') },
    { label: 'Catálogo', action: () => { setCategory(null); goToSection('catalog') } },
    { label: 'Galería', action: () => goToSection('gallery') },
    { label: 'Nosotros', action: () => goToSection('about') },
    { label: 'Contacto', action: () => goToSection('contact') },
  ]

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-md border-b border-border'
            : 'bg-background/80 backdrop-blur'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Logo */}
            <button
              onClick={() => goToSection('home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                C
              </div>
              <div className="text-left">
                <h1 className="font-display font-bold text-lg md:text-xl tracking-tight leading-none">
                  CROCHETERA<span className="text-primary">.CIX</span>
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
                  {siteConfig?.tagline || 'Peluches tejidos a mano'}
                </p>
              </div>
            </button>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  variant="ghost"
                  size="sm"
                  onClick={link.action}
                  className="font-medium hover:text-primary hover:bg-accent/50"
                >
                  {link.label}
                </Button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="h-10 w-10"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                className="relative h-10 w-10"
                aria-label="Carrito"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* Admin button */}
              {adminAuthed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('admin')}
                  className="hidden md:flex"
                >
                  Panel Admin
                </Button>
              )}

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetHeader>
                    <SheetTitle className="font-display text-2xl">
                      CROCHETERA<span className="text-primary">.CIX</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-2 mt-6">
                    {navLinks.map((link) => (
                      <Button
                        key={link.label}
                        variant="ghost"
                        size="lg"
                        onClick={() => {
                          link.action()
                          setMobileOpen(false)
                        }}
                        className="justify-start text-base"
                      >
                        {link.label}
                      </Button>
                    ))}
                    {adminAuthed && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setView('admin')
                          setMobileOpen(false)
                        }}
                        className="mt-4"
                      >
                        Panel Admin
                      </Button>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search bar expandable */}
          {searchOpen && (
            <form onSubmit={handleSearch} className="pb-4 animate-in slide-in-from-top-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Buscar peluches..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </header>

      {/* Cart Drawer */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 font-display text-2xl">
              <ShoppingCart className="h-5 w-5" /> Tu carrito
            </SheetTitle>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
                <Heart className="h-10 w-10 text-primary/60" />
              </div>
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm text-muted-foreground">
                Agrega algunos peluches tejidos a mano para continuar.
              </p>
              <Button
                onClick={() => {
                  setCartOpen(false)
                  setCategory(null)
                  goToSection('catalog')
                }}
                className="btn-crochet"
              >
                Ver catálogo
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 px-1 py-4 -mr-1 pr-1">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.imageUrl ? (
                         
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🧶
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      <p className="text-sm text-primary font-semibold">
                        {formatPrice(item.price, siteConfig?.currency)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded border border-border hover:bg-muted flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded border border-border hover:bg-muted flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-auto text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border p-4 space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary text-lg">
                    {formatPrice(cartTotal, siteConfig?.currency)}
                  </span>
                </div>
                <Button
                  className="w-full btn-crochet"
                  onClick={() => {
                    setCartOpen(false)
                    goToSection('checkout')
                  }}
                >
                  Finalizar pedido
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive"
                  onClick={() => {
                    clearCart()
                    toast.success('Carrito vaciado')
                  }}
                >
                  Vaciar carrito
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
