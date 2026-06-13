const LANGS = ['fr', 'en', 'de', 'es', 'it', 'zh']

const LABELS = { fr: 'FR', en: 'EN', de: 'DE', es: 'ES', it: 'IT', zh: '中文' }

export function LanguageSelector({ lang, setLang }) {
  return (
    <div style={{
      display: 'flex', gap: '3px',
      background: 'rgba(255,255,255,0.97)',
      borderRadius: '20px',
      padding: '4px 6px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
    }}>
      {LANGS.map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: '3px 8px',
            borderRadius: '14px',
            border: 'none',
            fontSize: '11px',
            fontWeight: lang === l ? 700 : 400,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            background: lang === l ? '#8B1A1A' : 'transparent',
            color: lang === l ? 'white' : '#666',
            transition: 'all 0.12s',
            letterSpacing: l === 'zh' ? 0 : '0.3px',
          }}
          onMouseEnter={e => { if (lang !== l) e.currentTarget.style.background = '#FFF5F5'; if (lang !== l) e.currentTarget.style.color = '#8B1A1A' }}
          onMouseLeave={e => { if (lang !== l) e.currentTarget.style.background = 'transparent'; if (lang !== l) e.currentTarget.style.color = '#666' }}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  )
}
