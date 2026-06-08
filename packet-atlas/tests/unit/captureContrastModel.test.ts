import { describe, expect, it } from 'vitest'
import { buildCaptureContrastSummary } from '../../src/features/packet-atlas/real-capture/captureContrastModel'

describe('capture contrast model', () => {
  it('proves the HTTPS vs plaintext HTTP visibility contrast', () => {
    const summary = buildCaptureContrastSummary()

    expect(summary.https.fixtureId).toBe('https-basic-real-fixture')
    expect(summary.httpLocal.fixtureId).toBe('http-local-real-fixture')

    expect(summary.https.tlsFrames).toBeGreaterThan(0)
    expect(summary.https.readableHttpFrames).toBe(0)

    expect(summary.httpLocal.tlsFrames).toBe(0)
    expect(summary.httpLocal.readableHttpFrames).toBeGreaterThan(0)
    expect(summary.httpLocal.tcp8080Frames).toBeGreaterThan(0)

    expect(summary.claims.contrastIsValid).toBe(true)
    expect(summary.teachingContrast).toContain('plaintext HTTP exposes')
  })
})
