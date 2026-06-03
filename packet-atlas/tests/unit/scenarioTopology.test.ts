import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('scenario topology integrity', () => {
  it('points every stage at an existing topology node', () => {
    const topologyNodeIds = new Set(
      httpsExampleScenario.topology.nodes.map((node) => node.id),
    )

    for (const stage of httpsExampleScenario.stages) {
      expect(topologyNodeIds.has(stage.device.nodeId)).toBe(true)
    }
  })

  it('uses topology links with existing source and target nodes', () => {
    const topologyNodeIds = new Set(
      httpsExampleScenario.topology.nodes.map((node) => node.id),
    )

    for (const link of httpsExampleScenario.topology.links) {
      expect(topologyNodeIds.has(link.source)).toBe(true)
      expect(topologyNodeIds.has(link.target)).toBe(true)
    }
  })
})
