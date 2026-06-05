import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('visual regression harness', () => {
  it('has a dedicated Playwright visual config', () => {
    expect(existsSync('playwright.visual.config.ts')).toBe(true)
    expect(existsSync('tests/visual/packet-atlas.visual.spec.ts')).toBe(true)
    const config = readFileSync('playwright.visual.config.ts', 'utf8')
    expect(config).toContain('toHaveScreenshot')
  })
})
