import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildStageSearchIndex, searchStages } from '../../src/features/packet-atlas/search/searchIndex'

describe('search index', () => {
  it('finds stages by protocol and port', () => {
    const index = buildStageSearchIndex(httpsExampleScenario)
    expect(searchStages(index, '443').length).toBeGreaterThan(0)
    expect(searchStages(index, 'DNS')[0].label.toLowerCase()).toContain('dns')
  })

  it('returns initial suggestions for an empty query', () => {
    const index = buildStageSearchIndex(httpsExampleScenario)
    expect(searchStages(index, '', 3)).toHaveLength(3)
  })
})
