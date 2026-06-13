import { useState, useCallback } from 'react'

const LS_KEY = 'terroirs_lang'

export function useLanguage() {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(LS_KEY) || 'fr' }
    catch { return 'fr' }
  })

  const setLang = useCallback((l) => {
    setLangState(l)
    try { localStorage.setItem(LS_KEY, l) } catch {}
  }, [])

  return { lang, setLang }
}
