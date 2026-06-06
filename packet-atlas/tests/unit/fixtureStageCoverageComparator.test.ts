import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('fixture stage coverage comparator', () => {
  it('compares mapped stage hints between fixture files', () => {
    const script = 'scripts/captures/compare-fixture-stage-coverage.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('Missing from candidate')
    expect(text).toContain('stageHint')
    expect(text).toContain('Candidate fixture does not exist yet')
  })
})
