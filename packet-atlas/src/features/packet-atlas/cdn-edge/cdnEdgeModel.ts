export type CdnEdgeMode = 'direct-origin' | 'cdn-cache-hit' | 'cdn-cache-miss' | 'edge-error'

export type CdnEdgeHop = {
  id: string
  title: string
  role: 'dns' | 'edge' | 'origin' | 'client'
  detail: string
  reached: boolean
}

export const cdnEdgeModes: Record<CdnEdgeMode, { title: string; summary: string; userMentalModel: string; truth: string; hops: CdnEdgeHop[] }> = {
  'direct-origin': {
    title: 'Direct origin path',
    summary: 'DNS points the client toward the origin-facing edge in the simple baseline model.',
    userMentalModel: 'The user thinks they connect to the website server.',
    truth: 'In this simple mode, the atlas behaves like a direct web edge/origin path.',
    hops: [
      { id: 'dns-origin', title: 'DNS answer', role: 'dns', detail: 'Resolver returns the web edge/origin address.', reached: true },
      { id: 'client-connect', title: 'Client connects', role: 'client', detail: 'Client opens TCP/TLS to that address.', reached: true },
      { id: 'origin-response', title: 'Origin response', role: 'origin', detail: 'Origin/app stack produces the response.', reached: true },
    ],
  },
  'cdn-cache-hit': {
    title: 'CDN cache hit',
    summary: 'DNS leads to a CDN edge, and the edge already has the object cached.',
    userMentalModel: 'The user thinks the origin server answered.',
    truth: 'The nearby edge can answer without contacting origin.',
    hops: [
      { id: 'dns-edge', title: 'DNS points to CDN edge', role: 'dns', detail: 'Client receives an edge address.', reached: true },
      { id: 'edge-cache-hit', title: 'Edge cache hit', role: 'edge', detail: 'Edge serves the cached response immediately.', reached: true },
      { id: 'origin-not-used', title: 'Origin not contacted', role: 'origin', detail: 'No origin fetch is needed for this object.', reached: false },
    ],
  },
  'cdn-cache-miss': {
    title: 'CDN cache miss with origin fetch',
    summary: 'The client connects to the CDN edge, but the edge must fetch the object from origin.',
    userMentalModel: 'The user sees one website load.',
    truth: 'Behind the edge, there is an extra edge→origin request before the response returns.',
    hops: [
      { id: 'dns-edge', title: 'DNS points to CDN edge', role: 'dns', detail: 'Client receives CDN edge address.', reached: true },
      { id: 'edge-miss', title: 'Edge cache miss', role: 'edge', detail: 'Edge does not have a fresh object.', reached: true },
      { id: 'origin-fetch', title: 'Origin fetch', role: 'origin', detail: 'Edge fetches from origin/app stack, then caches/returns response.', reached: true },
    ],
  },
  'edge-error': {
    title: 'CDN edge error',
    summary: 'The client reaches the CDN edge, but the edge cannot produce or fetch a valid response.',
    userMentalModel: 'The website is broken.',
    truth: 'The client path may be fine; the failure can sit at edge/origin boundary.',
    hops: [
      { id: 'dns-edge', title: 'DNS points to CDN edge', role: 'dns', detail: 'Client reaches edge address.', reached: true },
      { id: 'edge-failure', title: 'Edge returns error', role: 'edge', detail: 'Edge returns an error or cannot reach origin.', reached: true },
      { id: 'origin-uncertain', title: 'Origin status unclear', role: 'origin', detail: 'From the client alone, origin health may not be directly known.', reached: false },
    ],
  },
}

export function getCdnEdgeMode(mode: CdnEdgeMode) {
  return cdnEdgeModes[mode]
}

export function getReachedCdnHops(mode: CdnEdgeMode) {
  return cdnEdgeModes[mode].hops.filter((hop) => hop.reached)
}
