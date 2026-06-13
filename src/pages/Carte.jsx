import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/supabaseClient'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { useNavigate } from 'react-router-dom'
import { AppellationPanel } from '../components/AppellationPanel'
import { LanguageSelector } from '../components/LanguageSelector'
import { useAOCSearch } from '../hooks/useAOCSearch'
import { useLanguage } from '../hooks/useLanguage'
import { t, translateCategorie } from '../i18n/translations'
import { getRegion, getLevel } from '../utils/aocClassify'

// Register PMTiles protocol once at module level
const _protocol = new Protocol()
maplibregl.addProtocol('pmtiles', _protocol.tile.bind(_protocol))

// WFS typename from INAO GeoServer — verify against GetCapabilities if needed
const WFS_TYPENAME = 'sigig_gds:Delim_Parcellaire_AOC_AOP_IGP'
const WFS_MIN_ZOOM = 8

const TILE_LAYERS = {
  neutre: {
    label: '🗺 Neutre',
    tiles: [
      'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    ],
    attribution: '© OpenStreetMap © Carto',
  },
  administratif: {
    label: '🏛 Administratif',
    tiles: [
      'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    ],
    attribution: '© OpenStreetMap © Carto',
  },
  satellite: {
    label: '🛰 Satellite',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    attribution: '© Esri',
  },
  terrain: {
    label: '⛰ Terrain',
    tiles: [
      'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
      'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
    ],
    attribution: '© OpenTopoMap',
  },
}

const farmingColors = {
  biodynamie: '#16a34a',
  biologique: '#22c55e',
  nature: '#84cc16',
  'raisonné': '#f59e0b',
  conventionnel: '#6b7280',
}

const farmingLabels = {
  biodynamie: '🌿 Biodynamie',
  biologique: '🌱 Biologique',
  nature: '🍃 Nature',
  'raisonné': '⚖️ Raisonné',
  conventionnel: '🏭 Conventionnel',
}

const GEOLOGIE_LEGEND = [
  { color: '#f4d03f', label: 'Quaternaire — alluvions, dépôts récents' },
  { color: '#e8a87c', label: 'Tertiaire — argiles, sables, calcaires' },
  { color: '#85c1e9', label: 'Crétacé — craie, calcaires' },
  { color: '#82e0aa', label: 'Jurassique — calcaires, marnes' },
  { color: '#f1948a', label: 'Trias — grès, marnes' },
  { color: '#bb8fce', label: 'Permien — grès rouges' },
  { color: '#aab7b8', label: 'Socle cristallin — granite, schistes' },
]

const FILL_COLOR = ['match', ['get', 'region'],
  'Alsace',     '#27AE60',
  'Bordeaux',   '#C0392B',
  'Bourgogne',  '#8B4E9E',
  'Beaujolais', '#E74C3C',
  'RhoneNord',  '#E67E22',
  'RhoneSud',   '#F39C12',
  'Loire',      '#2980B9',
  'Provence',   '#E91E8C',
  'Languedoc',  '#795548',
  'Roussillon', '#D32F2F',
  'SudOuest',   '#FF7043',
  'JuraSavoie', '#00ACC1',
  'Corse',      '#558B2F',
  '#607D8B',
]

const STROKE_COLOR = ['match', ['get', 'region'],
  'Alsace',     '#1E8449',
  'Bordeaux',   '#922B21',
  'Bourgogne',  '#5D2E6E',
  'Beaujolais', '#C0392B',
  'RhoneNord',  '#CA6F1E',
  'RhoneSud',   '#D68910',
  'Loire',      '#1A6E9F',
  'Provence',   '#B5166C',
  'Languedoc',  '#5D4037',
  'Roussillon', '#B71C1C',
  'SudOuest',   '#E64A19',
  'JuraSavoie', '#00838F',
  'Corse',      '#33691E',
  '#455A64',
]

const FILL_OPACITY_NORMAL = [
  'case',
  ['boolean', ['feature-state', 'hovered'], false], 0.55,
  0.18,
]

// Zoom-adaptive filter: L1 toujours visible, L2 à partir de zoom 9, L3 à partir de zoom 11
const FILTER_AUTO = [
  'case',
  ['==', ['get', 'level'], 1], true,
  ['all', ['==', ['get', 'level'], 2], ['>=', ['zoom'], 9]], true,
  ['all', ['==', ['get', 'level'], 3], ['>=', ['zoom'], 11]], true,
  false,
]
const FILTER_L1 = ['==', ['get', 'level'], 1]
const FILTER_L2 = ['==', ['get', 'level'], 2]
const FILTER_L3 = ['==', ['get', 'level'], 3]

const s = (active) => ({
  padding: '6px 13px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  border: active ? 'none' : '1px solid #ddd',
  background: active ? '#8B1A1A' : 'white',
  color: active ? 'white' : '#555',
  boxShadow: active ? '0 1px 6px rgba(139,26,26,0.25)' : 'none',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
})

function normalize(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

// Returns [w, s, e, n] — MapLibre fitBounds format
function geojsonBbox(b) {
  if (!b) return null
  return b  // already [w, s, e, n] from search index
}

function tooltipHTML(nom, categorie, lang) {
  const cat = translateCategorie(categorie, lang)
  return (
    `<div style="font-family:Inter,sans-serif">` +
    `<strong style="font-size:12px">${nom}</strong>` +
    (cat ? `<div style="font-size:11px;color:#666">${cat}</div>` : '') +
    `</div>`
  )
}

function MapSearch({ mapRef, domains, onSelect, selectedApp, lang }) {
  const aocSearch = useAOCSearch()  // 31 KB index — no GeoJSON download
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const searchPopupRef = useRef(null)

  const items = useMemo(() => {
    const aocItems = aocSearch.map(item => {
      const bbox = item.b
      const lng = bbox ? (bbox[0] + bbox[2]) / 2 : null
      const lat = bbox ? (bbox[1] + bbox[3]) / 2 : null
      return { type: 'appellation', name: item.n, sub: item.c, lat, lng, bbox, id: item.n }
    }).filter(item => item.name)

    const domainItems = domains
      .filter(d => d.latitude && d.longitude)
      .map(d => ({
        type: 'domaine',
        name: d.name,
        sub: farmingLabels[d.farming_method] || '',
        lat: +d.latitude,
        lng: +d.longitude,
        id: d.id,
      }))

    return [...aocItems, ...domainItems]
  }, [aocSearch, domains])

  const results = useMemo(() => {
    const q = normalize(query.trim())
    if (q.length < 2) return []
    return items.filter(item => normalize(item.name || '').includes(q)).slice(0, 8)
  }, [query, items])

  useEffect(() => {
    const handler = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = item => {
    const map = mapRef.current
    if (!map) return

    searchPopupRef.current?.remove()

    if (item.type === 'appellation' && item.bbox) {
      map.fitBounds(item.bbox, { padding: 60, maxZoom: 13, duration: 800 })
      map.once('moveend', () => {
        if (item.lng == null) return
        searchPopupRef.current = new maplibregl.Popup({ maxWidth: '260px' })
          .setLngLat([item.lng, item.lat])
          .setHTML(
            `<div style="font-family:Inter,sans-serif;padding:2px 4px">` +
            `<strong style="font-size:13px;color:#1a1a1a">${item.name}</strong>` +
            (item.sub ? `<div style="font-size:11px;color:#666;margin-top:4px">${item.sub}</div>` : '') +
            `</div>`
          )
          .addTo(map)
      })
    } else if (item.type === 'domaine') {
      map.flyTo({ center: [item.lng, item.lat], zoom: 11, duration: 800 })
    }

    setQuery(item.name)
    setOpen(false)
    setActiveIdx(-1)
    onSelect?.(item.type === 'appellation' ? item.name : null)
  }

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); select(results[activeIdx]) }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
  }

  const focused = open && results.length > 0

  return (
    <div ref={wrapperRef} style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1000, width: '264px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.97)', borderRadius: '24px',
        padding: '7px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.13)',
        border: `1.5px solid ${focused ? '#8B1A1A' : 'transparent'}`,
        transition: 'border-color 0.15s',
      }}>
        <span style={{ fontSize: '13px', color: '#aaa', flexShrink: 0 }}>🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIdx(-1) }}
          onFocus={() => { if (results.length) setOpen(true) }}
          onKeyDown={onKeyDown}
          placeholder="Appellation, domaine…"
          style={{
            border: 'none', outline: 'none', fontSize: '13px', width: '100%',
            background: 'transparent', color: '#1a1a1a', fontFamily: 'Inter, sans-serif',
          }}
        />
        {query && (
          <button
            onMouseDown={e => { e.preventDefault(); setQuery(''); setOpen(false); onSelect?.(null); inputRef.current?.focus() }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#bbb', fontSize: '13px', flexShrink: 0, padding: 0, lineHeight: 1 }}
          >✕</button>
        )}
      </div>

      {selectedApp && !focused && (
        <div style={{
          marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#8B1A1A', borderRadius: '20px', padding: '5px 8px 5px 14px',
          boxShadow: '0 2px 10px rgba(139,26,26,0.25)',
        }}>
          <span style={{ fontSize: '12px', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedApp}
          </span>
          <button
            onMouseDown={e => { e.preventDefault(); onSelect?.(null); setQuery('') }}
            style={{ border: 'none', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', color: 'white', fontSize: '11px', flexShrink: 0, marginLeft: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
          >✕</button>
        </div>
      )}

      {focused && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'white', borderRadius: '14px', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}>
          {results.map((item, i) => (
            <button
              key={`${item.type}-${item.id}`}
              onMouseDown={() => select(item)}
              onMouseEnter={() => setActiveIdx(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '9px 14px', border: 'none', textAlign: 'left',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                background: i === activeIdx ? '#FFF5F5' : 'white',
                borderBottom: i < results.length - 1 ? '1px solid #f5f5f5' : 'none',
                transition: 'background 0.1s',
              }}
            >
              <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.type === 'appellation' ? '📍' : '🍷'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                {item.sub && (
                  <div style={{ fontSize: '10px', color: '#888', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.sub}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '10px', color: '#8B1A1A', fontWeight: 700, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {item.type === 'appellation' ? 'AOC' : 'Domaine'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Carte() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const hoveredIdRef = useRef(null)
  const hoverPopupRef = useRef(null)
  const langRef = useRef('fr')
  const navigateRef = useRef(navigate)

  const hoveredSourceRef = useRef(null)  // 'wfs' | 'fb' | null
  const wfsActiveRef = useRef(false)
  const wfsFailedRef = useRef(false)
  const showAppellationsRef = useRef(true)
  const updateVisibilityRef = useRef(null)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [baseMap, setBaseMap] = useState('neutre')
  const [showAppellations, setShowAppellations] = useState(true)
  const [showGeologie, setShowGeologie] = useState(false)
  const [showDomains, setShowDomains] = useState(true)
  const [activeFilter, setActiveFilter] = useState(null) // null=auto-zoom | 1 | 2 | 3
  const [showMapSelector, setShowMapSelector] = useState(false)
  const [showGeoLegend, setShowGeoLegend] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [panelData, setPanelData] = useState(null)
  const { lang, setLang } = useLanguage()

  langRef.current = lang
  navigateRef.current = navigate

  const { data: domains = [] } = useQuery({ queryKey: ['domains'], queryFn: () => base44.entities.Domain.list('-created_at', 300) })
  const { data: appellations = [] } = useQuery({ queryKey: ['appellations'], queryFn: () => base44.entities.Appellation.list() })

  const domainsWithCoords = useMemo(() => domains.filter(d => d.latitude && d.longitude), [domains])
  const appellationsWithCoords = useMemo(() => appellations.filter(a => a.latitude && a.longitude), [appellations])

  const domainsGeoJSON = useMemo(() => ({
    type: 'FeatureCollection',
    features: domainsWithCoords.map(d => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [parseFloat(d.longitude), parseFloat(d.latitude)] },
      properties: {
        id: d.id,
        name: d.name,
        color: farmingColors[d.farming_method] || '#8B1A1A',
        farming: farmingLabels[d.farming_method] || '',
        owner: d.owner || '',
        winemaker: d.winemaker && d.winemaker !== d.owner ? d.winemaker : '',
        area: d.area_hectares ? `${d.area_hectares} ha` : '',
        year: d.founded_year || '',
        grapes: d.grape_varieties?.join(', ') || '',
        terroir: d.terroir_description
          ? d.terroir_description.slice(0, 100) + (d.terroir_description.length > 100 ? '…' : '')
          : '',
        score: d.data_quality_score ? `${d.data_quality_score}%` : '',
      },
    })),
  }), [domainsWithCoords])

  // Initialize MapLibre map
  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sources: {},
        layers: [],
      },
      center: [2.5, 46.5],
      zoom: 6,
      attributionControl: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => {
      // Base tile layers — all pre-loaded, toggled via visibility
      Object.entries(TILE_LAYERS).forEach(([key, layer]) => {
        map.addSource(`bg-${key}`, {
          type: 'raster',
          tiles: layer.tiles,
          tileSize: 256,
          attribution: layer.attribution,
        })
        map.addLayer({
          id: `bg-${key}`,
          type: 'raster',
          source: `bg-${key}`,
          layout: { visibility: key === 'neutre' ? 'visible' : 'none' },
        })
      })

      // AOC PMTiles fallback — always present, shown when WFS unavailable
      map.addSource('aoc-fb', { type: 'vector', url: 'pmtiles:///data/aoc.pmtiles' })
      map.addLayer({
        id: 'aoc-fill-fb', type: 'fill', source: 'aoc-fb', 'source-layer': 'aoc',
        minzoom: 5, filter: FILTER_AUTO,
        paint: { 'fill-color': FILL_COLOR, 'fill-opacity': FILL_OPACITY_NORMAL },
      })
      map.addLayer({
        id: 'aoc-outline-fb', type: 'line', source: 'aoc-fb', 'source-layer': 'aoc',
        minzoom: 5, filter: FILTER_AUTO,
        paint: { 'line-color': STROKE_COLOR, 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.8, 12, 1.5], 'line-opacity': 0.7 },
      })

      // AOC WFS GeoJSON — primary source, loaded dynamically per viewport at zoom >= WFS_MIN_ZOOM
      map.addSource('aoc', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, generateId: true })
      map.addLayer({
        id: 'aoc-fill', type: 'fill', source: 'aoc',
        minzoom: WFS_MIN_ZOOM, filter: FILTER_AUTO,
        layout: { visibility: 'none' },
        paint: { 'fill-color': FILL_COLOR, 'fill-opacity': FILL_OPACITY_NORMAL },
      })
      map.addLayer({
        id: 'aoc-outline', type: 'line', source: 'aoc',
        minzoom: WFS_MIN_ZOOM, filter: FILTER_AUTO,
        layout: { visibility: 'none' },
        paint: { 'line-color': STROKE_COLOR, 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.8, 12, 1.5], 'line-opacity': 0.7 },
      })

      // Sync visibility: WFS layers XOR fallback layers, gated by showAppellations
      const updateSourceVisibility = () => {
        const show = showAppellationsRef.current
        const active = wfsActiveRef.current
        map.setLayoutProperty('aoc-fill',       'visibility', show && active  ? 'visible' : 'none')
        map.setLayoutProperty('aoc-outline',    'visibility', show && active  ? 'visible' : 'none')
        map.setLayoutProperty('aoc-fill-fb',    'visibility', show && !active ? 'visible' : 'none')
        map.setLayoutProperty('aoc-outline-fb', 'visibility', show && !active ? 'visible' : 'none')
      }
      updateVisibilityRef.current = updateSourceVisibility

      // WFS fetch — fires on every moveend at zoom >= WFS_MIN_ZOOM
      let fetchController = null
      map.on('moveend', async () => {
        if (wfsFailedRef.current) return
        if (map.getZoom() < WFS_MIN_ZOOM) {
          if (wfsActiveRef.current) { wfsActiveRef.current = false; updateSourceVisibility() }
          return
        }
        const b = map.getBounds()
        const bbox = `${b.getWest().toFixed(5)},${b.getSouth().toFixed(5)},${b.getEast().toFixed(5)},${b.getNorth().toFixed(5)},EPSG:4326`
        const url = `/api/inao-proxy?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature` +
          `&TYPENAMES=${encodeURIComponent(WFS_TYPENAME)}` +
          `&OUTPUTFORMAT=${encodeURIComponent('application/json')}` +
          `&SRSNAME=EPSG%3A4326&BBOX=${bbox}&COUNT=500`

        fetchController?.abort()
        fetchController = new AbortController()
        try {
          const res = await fetch(url, { signal: fetchController.signal })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          // Normalize field names and enrich with region/level
          data.features.forEach(f => {
            const p = f.properties || {}
            const app = p.app || p.APP || p.nom_produit || p.NOM_PRODUIT || p.appellation || p.APPELLATION || ''
            const denom = p.denom || p.DENOM || p.denomination || p.DENOMINATION || ''
            const categorie = p.categorie || p.CATEGORIE || p.type_produit || p.TYPE_PRODUIT || ''
            f.properties = { app, denom, categorie, region: getRegion(app || denom), level: getLevel(app || denom) }
          })
          map.getSource('aoc').setData(data)
          wfsActiveRef.current = true
          wfsFailedRef.current = false
          updateSourceVisibility()
        } catch (err) {
          if (err.name === 'AbortError') return
          console.warn('WFS fetch failed, falling back to PMTiles:', err.message)
          wfsFailedRef.current = true
          wfsActiveRef.current = false
          updateSourceVisibility()
        }
      })

      // Domains clustered GeoJSON source
      map.addSource('domains', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 50,
      })

      // Cluster circles (radius scales with count)
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'domains',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#8B1A1A',
          'circle-radius': ['step', ['get', 'point_count'], 16, 5, 22, 20, 28],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': 'white',
        },
      })

      // Cluster count label
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'domains',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 12,
        },
        paint: { 'text-color': 'white' },
      })

      // Individual domain points
      map.addLayer({
        id: 'domain-point',
        type: 'circle',
        source: 'domains',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 9,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': 'white',
          'circle-opacity': 0.92,
        },
      })

      // ── AOC interactions (shared helpers for WFS + fallback layers) ──────────
      const clearAocHover = () => {
        if (hoveredIdRef.current !== null) {
          if (hoveredSourceRef.current === 'wfs') {
            map.setFeatureState({ source: 'aoc', id: hoveredIdRef.current }, { hovered: false })
          } else {
            map.setFeatureState({ source: 'aoc-fb', sourceLayer: 'aoc', id: hoveredIdRef.current }, { hovered: false })
          }
          hoveredIdRef.current = null
          hoveredSourceRef.current = null
        }
        hoverPopupRef.current?.remove()
        hoverPopupRef.current = null
        map.getCanvas().style.cursor = ''
      }

      const handleAocMove = (e, sourceKey, stateRef) => {
        if (!e.features.length) return
        const f = e.features[0]
        if (hoveredIdRef.current !== null && hoveredIdRef.current !== f.id) clearAocHover()
        hoveredIdRef.current = f.id
        hoveredSourceRef.current = sourceKey
        map.setFeatureState({ ...stateRef, id: f.id }, { hovered: true })
        if (!hoverPopupRef.current) {
          hoverPopupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 }).addTo(map)
        }
        const nom = f.properties.app || f.properties.denom || 'AOC'
        hoverPopupRef.current.setLngLat(e.lngLat).setHTML(tooltipHTML(nom, f.properties.categorie || '', langRef.current))
        map.getCanvas().style.cursor = 'pointer'
      }

      const handleAocClick = e => {
        if (!e.features.length) return
        const f = e.features[0]
        const nom = f.properties.app || f.properties.denom || 'AOC'
        setPanelData({ nom, denom: f.properties.denom || nom, categorie: f.properties.categorie || '' })
        setSelectedApp(nom)
      }

      // WFS GeoJSON layer (no sourceLayer in feature-state)
      map.on('mousemove', 'aoc-fill',    e => handleAocMove(e, 'wfs', { source: 'aoc' }))
      map.on('mouseleave', 'aoc-fill',   () => clearAocHover())
      map.on('click', 'aoc-fill',        handleAocClick)

      // PMTiles fallback layer
      map.on('mousemove', 'aoc-fill-fb', e => handleAocMove(e, 'fb', { source: 'aoc-fb', sourceLayer: 'aoc' }))
      map.on('mouseleave', 'aoc-fill-fb',() => clearAocHover())
      map.on('click', 'aoc-fill-fb',     handleAocClick)

      // ── Domain interactions ─────────────────────────────────────
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })

      map.on('click', 'clusters', async e => {
        if (!e.features.length) return
        const clusterId = e.features[0].properties.cluster_id
        try {
          const zoom = await map.getSource('domains').getClusterExpansionZoom(clusterId)
          map.easeTo({ center: e.features[0].geometry.coordinates.slice(), zoom: zoom + 0.5 })
        } catch {}
      })

      map.on('mousemove', 'domain-point', e => {
        if (!e.features.length) return
        const p = e.features[0].properties
        if (!hoverPopupRef.current) {
          hoverPopupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 14 }).addTo(map)
        }
        hoverPopupRef.current.setLngLat(e.lngLat).setHTML(
          `<div style="font-family:Inter,sans-serif;font-size:11px;color:#555">` +
          `<strong style="font-size:12px;color:#1a1a1a">${p.name}</strong>` +
          (p.farming ? `<div style="color:${p.color};font-weight:600;margin-top:2px">${p.farming}</div>` : '') +
          `</div>`
        )
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', 'domain-point', () => {
        hoverPopupRef.current?.remove()
        hoverPopupRef.current = null
        map.getCanvas().style.cursor = ''
      })

      map.on('click', 'domain-point', e => {
        if (!e.features.length) return
        const p = e.features[0].properties
        const coords = e.features[0].geometry.coordinates.slice()

        const el = document.createElement('div')
        el.style.fontFamily = 'Inter, sans-serif'
        el.innerHTML = `
          <div style="font-weight:700;font-size:14px;color:#1a1a1a;margin-bottom:6px;padding-bottom:6px;border-bottom:2px solid #8B1A1A">${p.name}</div>
          ${p.owner ? `<div style="font-size:12px;color:#444;margin-bottom:3px">👤 ${p.owner}</div>` : ''}
          ${p.winemaker ? `<div style="font-size:12px;color:#444;margin-bottom:3px">🧑‍🍳 ${p.winemaker}</div>` : ''}
          ${p.farming ? `<div style="font-size:12px;color:${p.color};font-weight:600;margin-bottom:3px">${p.farming}</div>` : ''}
          <div style="display:flex;gap:12px;margin-bottom:4px">
            ${p.area ? `<span style="font-size:11px;color:#666">📐 ${p.area}</span>` : ''}
            ${p.year ? `<span style="font-size:11px;color:#666">📅 ${p.year}</span>` : ''}
          </div>
          ${p.grapes ? `<div style="font-size:11px;color:#666;margin-bottom:4px">🍇 ${p.grapes}</div>` : ''}
          ${p.terroir ? `<div style="font-size:11px;color:#777;font-style:italic;margin-bottom:6px">${p.terroir}</div>` : ''}
          ${p.score ? `<div style="font-size:10px;color:#aaa;margin-bottom:8px">Fiabilité : ${p.score}</div>` : ''}
          <button class="nav-btn" style="width:100%;padding:8px;background:#8B1A1A;color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">
            Voir la fiche complète →
          </button>
        `
        el.querySelector('.nav-btn')?.addEventListener('click', () => navigateRef.current(`/domaine/${p.id}`))

        new maplibregl.Popup({ maxWidth: '280px', offset: 14 })
          .setLngLat(coords)
          .setDOMContent(el)
          .addTo(map)
      })

      setMapLoaded(true)
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Feed domain data to clustered source
  useEffect(() => {
    if (!mapLoaded) return
    mapRef.current.getSource('domains').setData(domainsGeoJSON)
  }, [mapLoaded, domainsGeoJSON])

  // Base tile layer toggle
  useEffect(() => {
    if (!mapLoaded) return
    Object.keys(TILE_LAYERS).forEach(key =>
      mapRef.current.setLayoutProperty(`bg-${key}`, 'visibility', key === baseMap ? 'visible' : 'none')
    )
  }, [baseMap, mapLoaded])

  // AOC polygon visibility — delegates to updateSourceVisibility to respect WFS/fallback state
  useEffect(() => {
    if (!mapLoaded) return
    showAppellationsRef.current = showAppellations
    if (!showAppellations) setActiveFilter(null)
    updateVisibilityRef.current?.()
  }, [showAppellations, mapLoaded])

  // Hierarchical AOC filter — applied to all 4 layers (WFS + fallback)
  useEffect(() => {
    if (!mapLoaded) return
    const f = activeFilter === 1 ? FILTER_L1
            : activeFilter === 2 ? FILTER_L2
            : activeFilter === 3 ? FILTER_L3
            : FILTER_AUTO
    ;['aoc-fill', 'aoc-outline', 'aoc-fill-fb', 'aoc-outline-fb'].forEach(id =>
      mapRef.current.setFilter(id, f)
    )
  }, [activeFilter, mapLoaded])

  // Domain cluster visibility
  useEffect(() => {
    if (!mapLoaded) return
    const vis = showDomains ? 'visible' : 'none'
    mapRef.current.setLayoutProperty('clusters', 'visibility', vis)
    mapRef.current.setLayoutProperty('cluster-count', 'visibility', vis)
    mapRef.current.setLayoutProperty('domain-point', 'visibility', vis)
  }, [showDomains, mapLoaded])

  // Selection: highlight clicked appellation, dim others (applied to both WFS + fallback)
  useEffect(() => {
    if (!mapLoaded) return
    const map = mapRef.current
    if (selectedApp) {
      const isSelected = ['any',
        ['==', ['get', 'app'], selectedApp],
        ['==', ['get', 'denom'], selectedApp],
      ]
      const color   = ['case', isSelected, FILL_COLOR, '#888888']
      const opacity = ['case', isSelected, ['case', ['boolean', ['feature-state', 'hovered'], false], 0.7, 0.6], 0.05]
      ;['aoc-fill', 'aoc-fill-fb'].forEach(id => {
        map.setPaintProperty(id, 'fill-color', color)
        map.setPaintProperty(id, 'fill-opacity', opacity)
      })
    } else {
      ;['aoc-fill', 'aoc-fill-fb'].forEach(id => {
        map.setPaintProperty(id, 'fill-color', FILL_COLOR)
        map.setPaintProperty(id, 'fill-opacity', FILL_OPACITY_NORMAL)
      })
    }
  }, [selectedApp, mapLoaded])

  // Geology WMS layer
  useEffect(() => {
    if (!mapLoaded) return
    const map = mapRef.current
    if (showGeologie) {
      if (!map.getSource('geologie')) {
        map.addSource('geologie', {
          type: 'raster',
          tiles: [
            'https://geoservices.brgm.fr/geologie?SERVICE=WMS&REQUEST=GetMap' +
            '&LAYERS=GEOLOGIE&FORMAT=image/png&TRANSPARENT=true&VERSION=1.1.1' +
            '&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256',
          ],
          tileSize: 256,
          attribution: 'BRGM',
        })
        map.addLayer(
          { id: 'geologie', type: 'raster', source: 'geologie', paint: { 'raster-opacity': 0.5 } },
          'aoc-fill',
        )
      } else {
        map.setLayoutProperty('geologie', 'visibility', 'visible')
      }
    } else if (map.getLayer('geologie')) {
      map.setLayoutProperty('geologie', 'visibility', 'none')
    }
  }, [showGeologie, mapLoaded])

  return (
    <div style={{ position: 'absolute', top: '64px', left: 0, right: 0, bottom: 0 }}>

      {/* BARRE DE FILTRES */}
      <div style={{
        position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, display: 'flex', gap: '7px', alignItems: 'center',
        background: 'rgba(255,255,255,0.97)', padding: '8px 14px',
        borderRadius: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.13)',
      }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMapSelector(!showMapSelector)} style={{ ...s(false), borderColor: '#C9A84C', color: '#8B6914' }}>
            {TILE_LAYERS[baseMap].label} ▾
          </button>
          {showMapSelector && (
            <div style={{ position: 'absolute', top: '40px', left: 0, background: 'white', borderRadius: '12px', padding: '6px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 2000, minWidth: '160px' }}>
              {Object.entries(TILE_LAYERS).map(([key, layer]) => (
                <button key={key} onClick={() => { setBaseMap(key); setShowMapSelector(false) }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                  background: baseMap === key ? '#FFF5F5' : 'transparent',
                  color: baseMap === key ? '#8B1A1A' : '#333',
                  fontWeight: baseMap === key ? 700 : 400,
                }}>
                  {layer.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '22px', background: '#eee' }} />

        <button onClick={() => setShowAppellations(!showAppellations)} style={s(showAppellations)}>
          📍 {t(lang, 'appellations')} <span style={{ fontSize: '10px', opacity: 0.7 }}>{appellationsWithCoords.length}</span>
        </button>

        {showAppellations && (<>
          <div style={{ width: '1px', height: '22px', background: '#eee' }} />
          {[
            { level: 1, icon: '🌍', label: 'Régional' },
            { level: 2, icon: '🏘', label: 'Communal' },
            { level: 3, icon: '⭐', label: 'Cru' },
          ].map(({ level, icon, label }) => (
            <button
              key={level}
              onClick={() => setActiveFilter(activeFilter === level ? null : level)}
              style={{
                ...s(activeFilter === level),
                fontSize: '11px',
                padding: '5px 10px',
              }}
            >
              {icon} {label}
            </button>
          ))}
        </>)}

        <button
          onClick={() => { setShowGeologie(!showGeologie); if (!showGeologie) setShowGeoLegend(true) }}
          style={{ ...s(showGeologie), background: showGeologie ? '#5a4a2a' : 'white', color: showGeologie ? 'white' : '#555' }}
        >
          🪨 {t(lang, 'geology')}
        </button>

        <button onClick={() => setShowDomains(!showDomains)} style={s(showDomains)}>
          🍷 {t(lang, 'domains')} <span style={{ fontSize: '10px', opacity: 0.7 }}>{domainsWithCoords.length}</span>
        </button>
      </div>

      {/* COLONNE DROITE BAS */}
      <div style={{
        position: 'absolute', bottom: '40px', right: '12px', zIndex: 1000,
        display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end',
      }}>
        <LanguageSelector lang={lang} setLang={setLang} />

        <div style={{
          background: 'rgba(255,255,255,0.96)', borderRadius: '12px',
          padding: '12px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', fontSize: '11px',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', color: '#1a1a1a' }}>{t(lang, 'methodTitle')}</div>
          {Object.entries(farmingColors).map(([k, color]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
              <span style={{ color: '#555', textTransform: 'capitalize' }}>{k}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '18px', height: '3px', background: '#8B2252', borderRadius: '2px' }} />
              <span style={{ color: '#555' }}>{t(lang, 'region')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '18px', borderTop: '2px dashed #C9A84C' }} />
              <span style={{ color: '#555' }}>{t(lang, 'appellation')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* LÉGENDE GÉOLOGIE */}
      {showGeologie && showGeoLegend && (
        <div style={{
          position: 'absolute', bottom: '24px', left: '12px', zIndex: 1000,
          background: 'rgba(255,255,255,0.97)', borderRadius: '12px',
          padding: '12px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          fontSize: '11px', maxWidth: '280px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, color: '#1a1a1a' }}>🪨 Géologie — BRGM</div>
            <button onClick={() => setShowGeoLegend(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', fontSize: '14px' }}>✕</button>
          </div>
          <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>Carte géologique de France 1/1 000 000</div>
          {GEOLOGIE_LEGEND.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: item.color, flexShrink: 0, border: '1px solid #ddd' }} />
              <span style={{ color: '#555', fontSize: '10px', lineHeight: 1.3 }}>{item.label}</span>
            </div>
          ))}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee', fontSize: '10px', color: '#aaa' }}>
            Source : BRGM — Bureau de Recherches Géologiques et Minières
          </div>
        </div>
      )}

      <MapSearch
        mapRef={mapRef}
        domains={domains}
        onSelect={v => { setSelectedApp(v); if (!v) setPanelData(null) }}
        selectedApp={selectedApp}
        lang={lang}
      />

      {panelData && (
        <AppellationPanel
          data={panelData}
          navigate={navigate}
          lang={lang}
          onClose={() => { setPanelData(null); setSelectedApp(null) }}
        />
      )}

      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
