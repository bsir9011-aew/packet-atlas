import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
describe('unified quality gate', () => {
  it('defines the Packet Atlas verification script', () => {
    expect(existsSync('scripts/verify-packet-atlas.mjs')).toBe(true)
    const script = readFileSync('scripts/verify-packet-atlas.mjs', 'utf8')
    expect(script).toContain('PACKET ATLAS VERIFICATION')
    expect(script).toContain('Scenario quality')
    expect(script).toContain('Capture fixtures')
  })
})
