import { describe, expect, it } from 'vitest'
import realFixture from '../../src/data/fixtures/https-basic.real.fixture.json'
import manifest from '../../src/features/packet-atlas/scenarios/httpsExample.manifest.v2.json'

describe('first verified real capture fixture', () => {
  it('is attached, redacted and referenced by the HTTPS manifest', () => {
    expect(realFixture.id).toBe('https-basic-real-fixture')
    expect(realFixture.kind).toBe('real-capture-fixture')
    expect(realFixture.status).toBe('attached')
    expect(realFixture.frames).toHaveLength(23)
    expect(Boolean(realFixture.redaction)).toBe(true)
    expect(manifest.fixtureIds).toContain('https-basic-real-fixture')
  })

  it('contains the expected DNS, TCP and TLS stage mappings', () => {
    const counts = realFixture.frames.reduce<Record<string, number>>((acc, frame) => {
      const stageId = frame.stageHint ?? 'unknown'
      acc[stageId] = (acc[stageId] ?? 0) + 1
      return acc
    }, {})

    expect(counts['dns-query']).toBe(2)
    expect(counts['dns-response']).toBe(2)
    expect(counts['tcp-handshake']).toBeGreaterThan(0)
    expect(counts['tls-handshake']).toBeGreaterThan(0)
  })
})
