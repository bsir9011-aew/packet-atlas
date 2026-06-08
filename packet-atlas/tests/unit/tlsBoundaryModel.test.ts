import { describe, expect, it } from 'vitest'
import { buildTlsBoundarySummary } from '../../src/features/packet-atlas/real-capture/tlsBoundaryModel'

describe('TLS boundary model', () => {
  it('separates visible network evidence from hidden HTTP meaning', () => {
    const summary = buildTlsBoundarySummary()

    expect(summary.mode).toBe('https-over-tls')
    expect(summary.networkCanSee.map((item) => item.label)).toContain('TLS records')
    expect(summary.networkCannotAssume.map((item) => item.label)).toContain('HTTP method/path')
    expect(summary.keyBoundary).toContain('readable HTTP')
    expect(summary.verifiedByCapture).toContain('Readable HTTP frames: 0')
  })
})
