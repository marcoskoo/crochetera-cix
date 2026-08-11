'use client'

import { useEffect, useState } from 'react'

// Cursor personalizado con temática crochet
// Muestra un hilo/círculo que sigue al cursor
export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    // Solo en desktop con mouse
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return

    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    const handleLeave = () => setVisible(false)
    const handleDown = () => setClicking(true)
    const handleUp = () => setClicking(false)

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleLeave)
    document.addEventListener('mousedown', handleDown)
    document.addEventListener('mouseup', handleUp)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [])

  if (!visible) return null

  return (
    <>
      {/* Punto central */}
      <div
        className="pointer-events-none fixed z-[9999] transition-transform duration-75"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${clicking ? 0.5 : 1})`,
        }}
      >
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>
      {/* Círculo exterior */}
      <div
        className="pointer-events-none fixed z-[9998] transition-all duration-200 ease-out"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${clicking ? 1.5 : 1})`,
        }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-primary/40" />
      </div>
    </>
  )
}
