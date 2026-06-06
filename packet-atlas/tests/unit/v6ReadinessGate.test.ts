import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('v6 readiness gate', () => {
  it('requires real capture evidence before v6.0', () => {
    const script = 'scripts/v6-readiness-gate.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('real-fixture-attached')
    expect(text).toContain('privacy-reviewed')
    expect(text).toContain('pcap-profile-compatible')
  })
})
