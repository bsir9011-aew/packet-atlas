import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('full stage play mode CSS', () => {
  it('turns Focus Mode into current-stage Play Mode', () => {
    const text = readFileSync('src/features/packet-atlas/packetAtlas.css', 'utf8')

    expect(text).toContain('Full Stage Play Mode')
    expect(text).toContain('PLAY MODE — EVERYTHING ON THIS SCREEN IS ABOUT THE CURRENT STAGE')
    expect(text).toContain('CURRENT STAGE STORY')
    expect(text).toContain('PLAY THIS STEP')
    expect(text).toContain('Read this stage. Say it simply. Press Next.')
  })

  it('hides dashboard leftovers in Play Mode', () => {
    const text = readFileSync('src/features/packet-atlas/packetAtlas.css', 'utf8')

    expect(text).toContain('.atlas-shell--focus .guided-scenario-selector')
    expect(text).toContain('.atlas-shell--focus .journey-inspector')
    expect(text).toContain('.atlas-shell--focus .stage-deep-dive')
    expect(text).toContain('display: none !important')
  })
})
