import { describe, expect, it } from 'vitest'
import { buildGuidedJourneyScript } from '../../src/features/packet-atlas/guide/guidedJourneyScriptModel'
import {
  evaluateGuidedStoryQuality,
  renderGuidedStoryQualityMarkdown,
} from '../../src/features/packet-atlas/guide/guidedStoryQualityModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('guided story quality', () => {
  it('accepts the current guided journey script', () => {
    const script = buildGuidedJourneyScript(httpsExampleScenario)
    const report = evaluateGuidedStoryQuality(script)

    expect(report.ok).toBe(true)
    expect(report.findings.every((finding) => finding.ok)).toBe(true)
  })

  it('renders a small quality report', () => {
    const script = buildGuidedJourneyScript(httpsExampleScenario)
    const report = evaluateGuidedStoryQuality(script)
    const markdown = renderGuidedStoryQualityMarkdown(report)

    expect(markdown).toContain('Guided Story Quality Report')
    expect(markdown).toContain('READY')
    expect(markdown).toContain('✅')
  })
})
