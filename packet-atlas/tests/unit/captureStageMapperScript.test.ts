import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('capture stage mapper', () => {
  it('uses conservative mapping heuristics', () => {
    const path = 'scripts/captures/map-fixture-to-stages.mjs'
    expect(existsSync(path)).toBe(true)
    const script = readFileSync(path, 'utf8')
    expect(script).toContain('Suggestions are heuristics')
    expect(script).toContain('arp-gateway')
    expect(script).toContain('dns-query')
  })
})
