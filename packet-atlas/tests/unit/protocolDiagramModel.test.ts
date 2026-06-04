import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getProtocolDiagram } from '../../src/features/packet-atlas/protocol-diagram/protocolDiagramModel'

describe('protocol mini diagrams', () => {
  it('builds a diagram with three steps for every stage', () => {
    for (const stage of httpsExampleScenario.stages) {
      const diagram = getProtocolDiagram(stage, httpsExampleScenario)

      expect(diagram.title.length).toBeGreaterThan(0)
      expect(diagram.subtitle.length).toBeGreaterThan(0)
      expect(diagram.steps.length).toBe(3)
      expect(diagram.keyTakeaways.length).toBeGreaterThanOrEqual(1)
      expect(diagram.addressFacts.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('explains TCP handshake with SYN, SYN/ACK and ACK', () => {
    const stage = httpsExampleScenario.stages.find(
      (candidate) => candidate.stageKind === 'tcp-handshake',
    )

    expect(stage).toBeTruthy()

    const diagram = getProtocolDiagram(stage!, httpsExampleScenario)
    const stepTitles = diagram.steps.map((step) => step.title)

    expect(stepTitles).toEqual(['SYN', 'SYN/ACK', 'ACK'])
  })
})
