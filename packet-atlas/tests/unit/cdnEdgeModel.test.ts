import { describe, expect, it } from 'vitest'
import { getCdnEdgeMode, getReachedCdnHops } from '../../src/features/packet-atlas/cdn-edge/cdnEdgeModel'

describe('cdn edge model', () => {
  it('distinguishes cache hit from cache miss', () => {
    expect(getCdnEdgeMode('cdn-cache-hit').hops.some((hop) => hop.id === 'origin-not-used' && !hop.reached)).toBe(true)
    expect(getCdnEdgeMode('cdn-cache-miss').hops.some((hop) => hop.id === 'origin-fetch' && hop.reached)).toBe(true)
    expect(getReachedCdnHops('edge-error').length).toBe(2)
  })
})
