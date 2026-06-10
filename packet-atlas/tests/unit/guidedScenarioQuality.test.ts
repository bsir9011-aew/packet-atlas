import { describe, expect, it } from 'vitest'
import {
  buildGuidedScenarioPacks,
  evaluateGuidedScenarioQuality,
  renderGuidedScenarioQualityMarkdown,
} from '../../src/features/packet-atlas/guide/guidedScenarioPackModel'

describe('guided scenario quality', () => {
  it('accepts current guided scenario packs', () => {
    const report = evaluateGuidedScenarioQuality(buildGuidedScenarioPacks())

    expect(report.ok).toBe(true)
    expect(report.findings.every((finding) => finding.ok)).toBe(true)
  })

  it('renders scenario quality markdown', () => {
    const report = evaluateGuidedScenarioQuality(buildGuidedScenarioPacks())
    const markdown = renderGuidedScenarioQualityMarkdown(report)

    expect(markdown).toContain('Guided Scenario Quality Report')
    expect(markdown).toContain('READY')
    expect(markdown).toContain('✅')
  })
})
