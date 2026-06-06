import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('capture evidence pack', () => {
  it('indexes operator evidence for real capture review', () => {
    const script = 'scripts/captures/build-evidence-pack.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('reports/evidence')
    expect(text).toContain('Privacy audit')
    expect(text).toContain('candidate validation')
  })
})
