'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ShieldCheck, RefreshCw } from 'lucide-react'

// reCAPTCHA alternativo: no requiere API key de Google
// Usa honeypot + captcha matemático (efectivo contra bots simples)
// Para reCAPTCHA real de Google, configurar NEXT_PUBLIC_RECAPTCHA_SITE_KEY

interface CaptchaProps {
  onVerify: (verified: boolean) => void
}

export function SimpleCaptcha({ onVerify }: CaptchaProps) {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [answer, setAnswer] = useState('')
  const [honeypot, setHoneypot] = useState('') // trampa para bots
  const [verified, setVerified] = useState(false)

  const generateNew = () => {
    setA(Math.floor(Math.random() * 9) + 1)
    setB(Math.floor(Math.random() * 9) + 1)
    setAnswer('')
    setVerified(false)
    onVerify(false)
  }

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    generateNew()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const handleChange = (value: string) => {
    setAnswer(value)
    const isCorrect = parseInt(value) === a + b && honeypot === ''
    setVerified(isCorrect)
    onVerify(isCorrect)
  }

  if (verified) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
        <ShieldCheck className="h-4 w-4" />
        Verificado
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs flex items-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        Verificación anti-spam
      </Label>
      {/* Honeypot - oculto para humanos, visible para bots */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>No llenar este campo</label>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium bg-muted px-3 py-2 rounded-lg">
          {a} + {b} = ?
        </span>
        <Input
          type="number"
          value={answer}
          onChange={(e) => handleChange(e.target.value)}
          className="w-20"
          placeholder="?"
          required
        />
        <button
          type="button"
          onClick={generateNew}
          className="p-2 rounded-lg hover:bg-muted transition"
          title="Nuevo captcha"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
