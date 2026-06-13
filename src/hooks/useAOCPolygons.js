import { useState, useEffect, useRef } from 'react'

// Cache mémoire pour éviter les re-fetch inutiles
const polygonCache = new Map()

// Fichier local généré depuis le Shapefile INAO (public/data/aoc.geojson)
const LOCAL_GEOJSON = '/data/aoc.geojson'

export function useAOCPolygons(enabled = true) {
  const [polygons, setPolygons] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const cacheKey = 'aoc_polygons'
    if (polygonCache.has(cacheKey)) {
      setPolygons(polygonCache.get(cacheKey))
      return
    }

    abortRef.current = new AbortController()
    setLoading(true)
    setError(null)

    fetch(LOCAL_GEOJSON, { signal: abortRef.current.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        polygonCache.set(cacheKey, data)
        setPolygons(data)
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError('Polygones AOC indisponibles — affichage en cercles')
          console.warn('[useAOCPolygons]', err)
        }
      })
      .finally(() => setLoading(false))

    return () => abortRef.current?.abort()
  }, [enabled])

  return { polygons, loading, error }
}
