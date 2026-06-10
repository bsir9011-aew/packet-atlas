import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('guided scenario bridge docs', () => {
  it('documents scenario-to-stage bridge without UI dashboards', () => {
    const file = 'docs/project/guided-scenario-bridge-pack.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('Scenario-to-stage bridge')
    expect(text).toContain('story:bridge')
    expect(text).toContain('No dashboard')
    expect(text).toContain('existing journey stage')
  })
})
