import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('capture privacy audit', () => {
  it('detects common sensitive fixture patterns', () => {
    const script = 'scripts/captures/privacy-audit.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('public-ipv4')
    expect(text).toContain('mac-address')
    expect(text).toContain('long-token-like-string')
  })
})
