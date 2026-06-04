import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getStagesForPathScope } from '../../src/features/packet-atlas/path-scope/pathScopeModel'

describe('path scope model', () => {
  it('filters request and response stages', () => {
    expect(getStagesForPathScope(httpsExampleScenario, 'request').every((stage) => stage.direction === 'request')).toBe(true)
    expect(getStagesForPathScope(httpsExampleScenario, 'response').every((stage) => stage.direction === 'response')).toBe(true)
  })

  it('finds local LAN stages', () => {
    const lanStages = getStagesForPathScope(httpsExampleScenario, 'local-lan').map((stage) => stage.id)
    expect(lanStages.some((id) => id.includes('arp') || id.includes('lan'))).toBe(true)
  })
})
