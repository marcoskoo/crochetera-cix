/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useStore } from '@/lib/store'
import { Storefront } from '@/components/store/storefront'
import { AdminPanel } from '@/components/admin/admin-panel'
import { AdminLoginModal } from '@/components/admin/admin-login-modal'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles } from 'lucide-react'

export default function Home() {
  const view = useStore((s) => s.view)
  const adminAuthed = useStore((s) => s.adminAuthed)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Evitar hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // Si está authed y en vista admin, mostrar panel
  if (view === 'admin' && adminAuthed) {
    return <AdminPanel />
  }

  // Si pidió admin pero no está authed, mostrar login
  if (view === 'admin' && !adminAuthed) {
    return (
      <>
        <Storefront />
        <AdminLoginModal />
        <FloatingAdminButton onClick={() => setLoginOpen(true)} />
      </>
    )
  }

  return (
    <>
      <Storefront />
      <FloatingAdminButton onClick={() => setLoginOpen(true)} />
    </>
  )
}

// Botón flotante discreto para acceder al panel admin
function FloatingAdminButton({ onClick }: { onClick: () => void }) {
  const adminAuthed = useStore((s) => s.adminAuthed)
  const setView = useStore((s) => s.setView)

  if (adminAuthed) {
    return (
      <Button
        onClick={() => setView('admin')}
        className="fixed bottom-4 right-4 z-30 h-12 w-12 rounded-full shadow-lg btn-crochet p-0"
        size="icon"
        title="Panel admin"
      >
        <Sparkles className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="fixed bottom-4 right-4 z-30 h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur p-0"
      size="icon"
      title="Acceso admin (Ctrl+Shift+A)"
    >
      <Lock className="h-4 w-4" />
    </Button>
  )
}
