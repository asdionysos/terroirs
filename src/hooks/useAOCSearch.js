import { useState, useEffect } from 'react'

let cache = null

export function useAOCSearch() {
  const [items, setItems] = useState(cache)

  useEffect(() => {
    if (cache) { setItems(cache); return }
    fetch('/data/aoc-search.json')
      .then(r => r.json())
      .then(data => { cache = data; setItems(data) })
      .catch(() => setItems([]))
  }, [])

  return items || []
}
