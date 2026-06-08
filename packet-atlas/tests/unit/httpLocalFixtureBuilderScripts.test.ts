import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('HTTP local fixture builder scripts', () => {
  it('classifies readable HTTP request and response frames', () => {
    const script = 'scripts/captures/build-http-local-candidate.mjs'
    expect(existsSync(script)).toBe(true)

    const text = readFileSync(script, 'utf8')
    expect(text).toContain('http-local-request')
    expect(text).toContain('http-local-response')
    expect(text).toContain('Plain HTTP request is readable on the wire')
  })

  it('validates localhost-only plaintext HTTP contrast evidence', () => {
    const script = 'scripts/captures/validate-http-local-candidate.mjs'
    expect(existsSync(script)).toBe(true)

    const text = readFileSync(script, 'utf8')
    expect(text).toContain('TLS frames must not exist')
    expect(text).toContain('readable HTTP 200 evidence')
    expect(text).toContain('valid-http-local-candidate')
  })
})
