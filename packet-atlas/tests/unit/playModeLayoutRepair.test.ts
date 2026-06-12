import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('play mode layout repair', () => {
  it('documents full-width current-stage Play Mode layout', () => {
    const file = 'docs/project/play-mode-layout-repair.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('full-width reading screen')
    expect(text).toContain('current stage title')
    expect(text).toContain('must not feel like a dashboard')
  })

  it('forces Play Mode hero out of the old split layout', () => {
    const css = readFileSync('src/features/packet-atlas/packetAtlas.css', 'utf8')

    expect(css).toContain('Play Mode Layout Repair')
    expect(css).toContain('.atlas-shell--focus .cinematic-trace__hero')
    expect(css).toContain('display: block !important')
    expect(css).toContain('.atlas-shell--focus .cinematic-trace__hero > aside')
    expect(css).toContain('display: none !important')
  })
})
