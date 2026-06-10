import { describe, expect, it } from 'vitest'
import { buildGuidedVocabulary } from '../../src/features/packet-atlas/guide/guidedVocabularyModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('guided vocabulary', () => {
  it('returns simple terms with do-not-confuse guidance', () => {
    const dns = httpsExampleScenario.stages.find((stage) =>
      `${stage.id} ${stage.shortName} ${stage.stageKind}`.toLowerCase().includes('dns'),
    )!

    const terms = buildGuidedVocabulary(dns)

    expect(terms.length).toBeGreaterThan(0)
    expect(terms[0].term).toBe('DNS')
    expect(terms[0].simpleMeaning).toContain('name')
    expect(terms[0].doNotConfuseWith).toContain('not')
  })

  it('falls back to a generic stage term', () => {
    const stage = httpsExampleScenario.stages[0]
    const terms = buildGuidedVocabulary(stage)

    expect(terms.length).toBeGreaterThan(0)
    expect(terms[0].simpleMeaning.length).toBeGreaterThan(10)
    expect(terms[0].doNotConfuseWith).toContain('not')
  })
})
