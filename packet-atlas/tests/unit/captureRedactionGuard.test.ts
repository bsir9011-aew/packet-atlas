import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('capture redaction guard', () => {
  it('redacts common sensitive capture strings', () => {
    const script = 'scripts/captures/redact-fixture.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('XX:XX:XX:XX:XX:XX')
    expect(text).toContain('redacted@example.invalid')
    expect(text).toContain('privateIpv4')
  })
})
