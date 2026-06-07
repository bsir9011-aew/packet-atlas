import { describe, expect, it } from 'vitest'
import {
  buildRealFrameSemanticRows,
  buildRealFrameSemanticSummary,
  getTopRealFrameSemanticRows,
} from '../../src/features/packet-atlas/real-capture/realFrameSemanticsModel'

describe('real frame semantics model', () => {
  it('builds a semantic classification over the verified real capture', () => {
    const summary = buildRealFrameSemanticSummary()

    expect(summary.fixtureId).toBe('https-basic-real-fixture')
    expect(summary.status).toBe('attached')
    expect(summary.totalFrames).toBe(23)
    expect(summary.categoryCounts['dns-query']).toBe(2)
    expect(summary.categoryCounts['dns-response']).toBe(2)
    expect(Object.keys(summary.categoryCounts).some((key) => key.startsWith('tcp-'))).toBe(true)
    expect(Object.keys(summary.categoryCounts).some((key) => key.startsWith('tls-'))).toBe(true)
    expect(summary.refinedCount).toBeGreaterThan(0)
  })

  it('explains that stage hints and frame semantics are different views', () => {
    const rows = buildRealFrameSemanticRows()
    const topRows = getTopRealFrameSemanticRows(3)

    expect(rows).toHaveLength(23)
    expect(topRows).toHaveLength(3)
    expect(rows.some((row) => row.reason.includes('not every TCP/443 frame is a handshake'))).toBe(true)
  })
})
