import { t, translateCategorie } from '../i18n/translations'

const WINE_ICONS = {
  'vin rouge':        '🍷',
  'vin blanc':        '🥂',
  'vin rosé':         '🌸',
  'vin de liqueur':   '🍯',
  'vin doux naturel': '🍯',
  'vin de paille':    '🍯',
  'vin jaune':        '🟡',
  'pétillant':        '🍾',
  'mousseux':         '🍾',
  'crémant':          '🍾',
  'eau-de-vie':       '🥃',
  'cidre':            '🍺',
  'poiré':            '🍺',
}

function wineIcon(frenchType) {
  const low = frenchType.toLowerCase()
  for (const [key, icon] of Object.entries(WINE_ICONS)) {
    if (low.includes(key)) return icon
  }
  return '🍷'
}

export function AppellationPanel({ data, onClose, navigate, lang = 'fr' }) {
  // Keep French originals for icon lookup; use translated labels for display
  const rawTypes = data.categorie
    ? data.categorie.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 2000,
        width: '320px',
        background: 'white',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.22s cubic-bezier(0.25,0.46,0.45,0.94)',
        fontFamily: 'Inter, sans-serif',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #8B1A1A 0%, #6B1010 100%)',
          padding: '20px 20px 18px',
          position: 'relative',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            style={{
              position: 'absolute', top: '14px', right: '14px',
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: '28px', height: '28px', cursor: 'pointer', color: 'white',
              fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >✕</button>

          <div style={{
            fontSize: '10px', color: 'rgba(255,255,255,0.55)',
            textTransform: 'uppercase', letterSpacing: '1.2px',
            marginBottom: '8px', fontWeight: 600,
          }}>
            {t(lang, 'aoc')}
          </div>
          <div style={{
            fontSize: '20px', fontWeight: 700, color: 'white',
            lineHeight: 1.25, paddingRight: '36px',
          }}>
            {data.nom}
          </div>
        </div>

        {/* Corps */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>

          {data.denom && data.denom !== data.nom && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px', fontWeight: 600 }}>
                {t(lang, 'denomination')}
              </div>
              <div style={{ fontSize: '14px', color: '#333', fontWeight: 500 }}>
                {data.denom}
              </div>
            </div>
          )}

          {rawTypes.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px', fontWeight: 600 }}>
                {t(lang, 'wineTypes')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {rawTypes.map((frType, i) => {
                  const label = translateCategorie(frType, lang)
                  return (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '5px 12px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: 500,
                      background: '#FFF5F5', color: '#8B1A1A',
                      border: '1px solid #f5d5d5',
                    }}>
                      {wineIcon(frType)} {label}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{
            padding: '13px 14px', borderRadius: '10px',
            background: '#FAFAFA', border: '1px solid #F0F0F0',
          }}>
            <div style={{ fontSize: '11px', color: '#999', lineHeight: 1.65 }}>
              {t(lang, 'inao')}
            </div>
          </div>
        </div>

        {/* Pied */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #F2F2F2', flexShrink: 0 }}>
          <button
            onClick={() => navigate(`/appellation/${encodeURIComponent(data.nom)}`)}
            onMouseEnter={e => e.currentTarget.style.background = '#6B1010'}
            onMouseLeave={e => e.currentTarget.style.background = '#8B1A1A'}
            style={{
              width: '100%', padding: '12px',
              background: '#8B1A1A', color: 'white',
              border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >
            {t(lang, 'viewFull')}
          </button>
        </div>

      </div>
    </>
  )
}
