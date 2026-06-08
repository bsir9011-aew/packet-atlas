import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('contrast workspace audit script', () => {
  it('guards the v7 contrast workspace contract without UI changes', () => {
    const script = 'scripts/captures/contrast-workspace-audit.mjs'
    expect(existsSync(script)).toBe(true)

    const text = readFileSync(script, 'utf8')
    expect(text).toContain('https-basic-real-fixture')
    expect(text).toContain('http-local-real-fixture')
    expect(text).toContain('Readable HTTP')
    expect(text).toContain('contrast workspace audit ok')
  })
})
