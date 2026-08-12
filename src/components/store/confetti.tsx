'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  delay: number
  duration: number
}

const COLORS = ['#E91E63', '#F8BBD0', '#FFC107', '#8D6E63', '#4CAF50', '#2196F3', '#9C27B0']

export function Confetti({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (!trigger) {
      return
    }
    // Generar 80 piezas de confeti
    const newPieces: ConfettiPiece[] = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 8 + Math.random() * 8,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }))
    /* eslint-disable react-hooks/set-state-in-effect */
    setPieces(newPieces)
    /* eslint-enable react-hooks/set-state-in-effect */

    // Limpiar después de 5s
    const timer = setTimeout(() => {
       
      setPieces([])
       
    }, 5000)
    return () => clearTimeout(timer)
  }, [trigger])

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: `-10vh`,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: piece.rotation * 3,
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                width: piece.size,
                height: piece.size * 0.4,
                backgroundColor: piece.color,
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
