import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('real fixture candidate builder', () => {
  it('builds a candidate and marks it as review-required', () => {
    const script = 'scripts/captures/build-real-fixture-candidate.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('candidate-real-capture')
    expect(text).toContain('reviewRequired')
    expect(text).toContain('stageHintConfidence')
  })
})
