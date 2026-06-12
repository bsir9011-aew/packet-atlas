import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('full stage play mode docs', () => {
  it('documents Play Mode as current-stage full screen', () => {
    const file = 'docs/project/full-stage-play-mode-pack.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('Focus Mode is now treated as **Play Mode**')
    expect(text).toContain('whole screen should refer to the current journey stage')
    expect(text).toContain('Atlas Mode = browse and inspect')
    expect(text).toContain('Play Mode = read current stage and press Next')
  })
})
