import { describe, expect, it } from 'vitest'
import {
  buildGuidedJourneyScript,
  renderGuidedJourneyScriptMarkdown,
} from '../../src/features/packet-atlas/guide/guidedJourneyScriptModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('guided journey script model', () => {
  it('builds one guided script step per journey stage', () => {
    const script = buildGuidedJourneyScript(httpsExampleScenario)

    expect(script.steps).toHaveLength(httpsExampleScenario.stages.length)
    expect(script.steps[0]?.stepNumber).toBe(1)
    expect(script.steps.at(-1)?.nextHandoff).toContain('recap')
    expect(script.recap.notebookLine).toContain('human intent')
  })

  it('renders guided journey script markdown', () => {
    const script = buildGuidedJourneyScript(httpsExampleScenario)
    const markdown = renderGuidedJourneyScriptMarkdown(script)

    expect(markdown).toContain('# Packet Atlas Guided Journey Script')
    expect(markdown).toContain('## Step 1/')
    expect(markdown).toContain('Evidence question')
    expect(markdown).toContain('Final recap')
  })
})
