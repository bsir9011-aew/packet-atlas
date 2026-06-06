import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('real candidate promotion gate', () => {
  it('requires candidate validation before promotion', () => {
    const script = 'scripts/captures/validate-real-candidate.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('candidate-real-capture')
    expect(text).toContain('--promote')
    expect(text).toContain('Missing required planned stage mappings')
  })
})
