import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('HTTPS vs HTTP contrast audit script', () => {
  it('checks the real fixture contrast without touching UI', () => {
    const script = 'scripts/captures/https-http-contrast-audit.mjs'
    expect(existsSync(script)).toBe(true)

    const text = readFileSync(script, 'utf8')
    expect(text).toContain('HTTPS fixture should not expose readable HTTP frames')
    expect(text).toContain('HTTP local fixture should expose readable HTTP frames')
    expect(text).toContain('contrast audit ok')
  })
})
