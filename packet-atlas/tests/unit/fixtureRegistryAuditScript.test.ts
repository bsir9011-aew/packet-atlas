import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('fixture registry audit script', () => {
  it('checks tracked fixtures and local-only artifact patterns', () => {
    const script = 'scripts/captures/fixture-registry-audit.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('https-basic.real.fixture.json')
    expect(text).toContain('real fixture must contain redaction metadata')
    expect(text).toContain('fixture registry ok')
  })
})
