import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('guided scenario reader component', () => {
  it('uses reader state and renders a single guided scenario step', () => {
    const text = readFileSync('src/features/packet-atlas/guide/GuidedScenarioSelector.tsx', 'utf8')

    expect(text).toContain('readerStepIndex')
    expect(text).toContain('currentStep')
    expect(text).toContain('guided-scenario-reader')
    expect(text).toContain('Evidence checklist')
    expect(text).toContain('Notebook line')
    expect(text).toContain('Next step')
  })

  it('resets reader step when scenario changes', () => {
    const text = readFileSync('src/features/packet-atlas/guide/GuidedScenarioSelector.tsx', 'utf8')

    expect(text).toContain('selectScenario')
    expect(text).toContain('setReaderStepIndex(0)')
  })
})
