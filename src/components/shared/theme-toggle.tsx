'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Theme = 'light' | 'dark'

export function ThemeToggle() {
  // Initialize from localStorage if available (client-side)
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('crochetera-theme') as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return stored || (prefersDark ? 'dark' : 'light')
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('crochetera-theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-10 w-10"
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  )
}
