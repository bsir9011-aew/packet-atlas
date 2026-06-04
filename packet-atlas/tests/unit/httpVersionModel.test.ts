import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getHttpStages, httpVersionProfiles } from '../../src/features/packet-atlas/http/httpVersionModel'

describe('HTTP version variants', () => {
  it('contains HTTP/1.1 and HTTP/2 profiles', () => {
    expect(httpVersionProfiles.map((profile)=>profile.id)).toEqual(['http11','http2'])
  })
  it('finds application stages in the baseline scenario', () => {
    expect(getHttpStages(httpsExampleScenario).length).toBeGreaterThan(0)
  })
})
