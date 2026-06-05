import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('repository hygiene audit', () => {
  it('ships a conservative audit script', () => {
    expect(existsSync('scripts/atlas-hygiene-audit.mjs')).toBe(true)
    const script = readFileSync('scripts/atlas-hygiene-audit.mjs', 'utf8')
    expect(script).toContain('Packet Atlas hygiene audit')
    expect(script).toContain('Do not delete automatically')
  })
})
