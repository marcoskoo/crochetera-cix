'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, User } from 'lucide-react'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'

export function AdminLoginModal() {
  const loginOpen = useStore((s) => s.loginOpen)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const setAdminAuthed = useStore((s) => s.setAdminAuthed)
  const setView = useStore((s) => s.setView)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Atajo: Ctrl+Shift+A para abrir login
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault()
        setLoginOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setLoginOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al iniciar sesión')
      }
      setAdminAuthed(true)
      setLoginOpen(false)
      toast.success('¡Bienvenida al panel admin!')
      setView('admin')
      setUsername('')
      setPassword('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-2">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">
            Panel de Administración
          </DialogTitle>
          <DialogDescription className="text-center">
            Acceso exclusivo para la administración de CROCHETERA.CIX
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="pl-10"
                placeholder="Tu usuario"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
                placeholder="Tu contraseña"
              />
            </div>
          </div>
          <Button type="submit" className="w-full btn-crochet" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Tip: presiona <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">Ctrl + Shift + A</kbd> en cualquier momento para abrir este panel
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
