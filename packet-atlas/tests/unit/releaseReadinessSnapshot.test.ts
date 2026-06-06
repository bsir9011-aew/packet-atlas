import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('release readiness snapshot', () => {
  it('tracks the real-capture milestone honestly', () => {
    const script = 'scripts/release-readiness.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('No verified real capture fixture is attached yet.')
    expect(text).toContain('v6.0 real-capture milestone')
  })
})
