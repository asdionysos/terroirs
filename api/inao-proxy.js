export const config = { runtime: 'edge' }

const UPSTREAM = 'https://geoservices.inao.gouv.fr/geoserver/wfs'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const { searchParams } = new URL(req.url)
  const upstream = `${UPSTREAM}?${searchParams.toString()}`

  let res
  try {
    res = await fetch(upstream, {
      headers: { 'User-Agent': 'Terroirs/1.0' },
    })
  } catch (err) {
    return new Response(`Upstream fetch failed: ${err.message}`, {
      status: 502,
      headers: CORS,
    })
  }

  if (!res.ok) {
    return new Response(`INAO error: ${res.status}`, {
      status: res.status,
      headers: CORS,
    })
  }

  const contentType = res.headers.get('content-type') || 'application/xml'
  const body = await res.arrayBuffer()

  return new Response(body, {
    status: 200,
    headers: {
      ...CORS,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
