'use client'

import { useStore } from '@/lib/store'
import { toast } from 'sonner'

// Wrapper de fetch para llamadas admin. Si retorna 401, cierra sesión
// y muestra error. Útil para detectar sesiones expiradas sin tener
// que verificar la cookie en cada momento.
export async function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init)
  if (res.status === 401) {
    const setAdminAuthed = useStore.getState().setAdminAuthed
    const setView = useStore.getState().setView
    setAdminAuthed(false)
    setView('store')
    toast.error('Tu sesión expiró. Inicia sesión nuevamente.')
    throw new Error('No autorizado')
  }
  return res
}
