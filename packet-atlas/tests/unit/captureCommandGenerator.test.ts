import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('capture command generator', () => {
  it('creates a reviewable command plan script', () => {
    const script = 'scripts/captures/print-capture-commands.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('curl --http1.1 --tlsv1.3')
    expect(text).toContain('tshark -i')
    expect(text).toContain('does not automatically capture traffic')
  })
})
