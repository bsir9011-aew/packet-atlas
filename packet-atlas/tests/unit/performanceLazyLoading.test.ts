import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('performance lazy loading repair', () => {
  it('lazy-loads the main PacketAtlasPage from App.tsx', () => {
    const app = readFileSync('src/App.tsx', 'utf8')
    expect(app).toContain('lazy(() =>')
    expect(app).toContain('PacketAtlasPage')
    expect(app).toContain('Suspense')
  })

  it('defines bundle:budget script', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(pkg.scripts['bundle:budget']).toBe('node scripts/bundle-budget.mjs')
  })
})
