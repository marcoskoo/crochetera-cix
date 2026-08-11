'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, type Locale, type TranslationKey } from '@/lib/i18n'

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'es',
  setLocale: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es')

  useEffect(() => {
    const stored = localStorage.getItem('crochetera-locale') as Locale
    /* eslint-disable react-hooks/set-state-in-effect */
    if (stored === 'en' || stored === 'es') setLocaleState(stored)
    else if (navigator.language.startsWith('en')) setLocaleState('en')
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('crochetera-locale', l)
    document.documentElement.lang = l
  }

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations.es[key] || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
