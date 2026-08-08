'use client'

import { useStore } from '@/lib/store'
import { toast } from 'sonner'

// Wrapper de fetch para llamadas admin. Si retorna 401:
// 1. Reintenta una vez (race condition con cookie)
// 2. Si sigue fallando, verifica con /api/auth/check si la sesión sigue activa
// 3. Solo cierra sesión si la verificación confirma que ya no hay sesión
let logoutNotified = false

export async function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  let res = await fetch(input, {
    ...init,
    credentials: 'same-origin',
  })

  if (res.status !== 401) {
    return res
  }

  // Reintentar una vez tras breve espera
  await new Promise((r) => setTimeout(r, 200))
  res = await fetch(input, {
    ...init,
    credentials: 'same-origin',
  })

  if (res.status !== 401) {
    return res
  }

  // Sigue dando 401. Verificar si la sesión realmente expiró o si es un error temporal.
  try {
    const checkRes = await fetch('/api/auth/check', { credentials: 'same-origin' })
    if (checkRes.ok) {
      const data = await checkRes.json()
      if (data.authed) {
        // La sesión sigue activa, pero la ruta específica dio 401.
        // Probablemente un glitch temporal. Devolver la response 401 sin cerrar sesión.
        return res
      }
    }
  } catch {
    // No se pudo verificar, asumir lo peor
  }

  // Realmente no autorizado: cerrar sesión
  if (!logoutNotified) {
    logoutNotified = true
    const setAdminAuthed = useStore.getState().setAdminAuthed
    const setView = useStore.getState().setView
    setAdminAuthed(false)
    setView('store')
    toast.error('Tu sesión expiró. Inicia sesión nuevamente.')
    setTimeout(() => {
      logoutNotified = false
    }, 3000)
  }
  throw new Error('No autorizado')
}
