import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function bbox(geometry) {
  if (!geometry) return null
  let w = Infinity, e = -Infinity, s = Infinity, n = -Infinity
  const walk = c => {
    if (typeof c[0] === 'number') {
      if (c[0] < w) w = c[0]; if (c[0] > e) e = c[0]
      if (c[1] < s) s = c[1]; if (c[1] > n) n = c[1]
    } else c.forEach(walk)
  }
  walk(geometry.coordinates)
  return [+w.toFixed(5), +s.toFixed(5), +e.toFixed(5), +n.toFixed(5)]
}

const src = join(__dirname, '../public/data/aoc.geojson')
const out = join(__dirname, '../public/data/aoc-search.json')

console.log('Reading aoc.geojson...')
const { features } = JSON.parse(readFileSync(src, 'utf8'))

const index = features
  .map(f => ({
    n: f.properties.app || f.properties.denom || '',
    c: f.properties.categorie || '',
    b: bbox(f.geometry),
  }))
  .filter(item => item.n)

writeFileSync(out, JSON.stringify(index))
const kb = (Buffer.byteLength(JSON.stringify(index)) / 1024).toFixed(1)
console.log(`${index.length} appellations → aoc-search.json (${kb} KB)`)
