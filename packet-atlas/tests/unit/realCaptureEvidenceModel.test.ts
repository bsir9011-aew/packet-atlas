import { describe, expect, it } from 'vitest'
import {
  buildRealCaptureEvidenceCards,
  buildRealCaptureEvidenceSummary,
} from '../../src/features/packet-atlas/real-capture/realCaptureEvidenceModel'

describe('real capture evidence model', () => {
  it('summarizes the verified HTTPS real capture', () => {
    const summary = buildRealCaptureEvidenceSummary()

    expect(summary.fixtureId).toBe('https-basic-real-fixture')
    expect(summary.status).toBe('attached')
    expect(summary.frameCount).toBe(23)
    expect(summary.dnsFrames).toBe(4)
    expect(summary.tcp443Frames).toBe(19)
    expect(summary.tlsFrames).toBe(8)
    expect(summary.readableHttpFrames).toBe(0)
    expect(summary.redactionApplied).toBe(true)
    expect(summary.keyClaim).toContain('protected inside TLS')
  })

  it('builds evidence cards for the UI panel', () => {
    const cards = buildRealCaptureEvidenceCards()

    expect(cards.map((card) => card.label)).toContain('HTTP readable')
    expect(cards.find((card) => card.label === 'Redaction')?.value).toBe('applied')
  })
})
