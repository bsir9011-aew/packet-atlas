import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('guided scenario selector component', () => {
  it('renders scenario selector from runtime models', () => {
    const text = readFileSync('src/features/packet-atlas/guide/GuidedScenarioSelector.tsx', 'utf8')

    expect(text).toContain('buildGuidedScenarioPacks')
    expect(text).toContain('buildGuidedScenarioRuntime')
    expect(text).toContain('buildGuidedScenarioRuntimeSteps')
    expect(text).toContain('Story path')
    expect(text).toContain('First question')
  })

  it('is integrated into Animated Journey Mode', () => {
    const text = readFileSync('src/features/packet-atlas/cinematic/CinematicTraceMode.tsx', 'utf8')

    expect(text).toContain('GuidedScenarioSelector')
    expect(text).toContain('<GuidedScenarioSelector />')
  })
})
