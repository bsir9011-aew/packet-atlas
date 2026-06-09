import { describe, expect, it } from 'vitest'
import { buildBranchJourneyChoicesForStage } from '../../src/features/packet-atlas/branching/branchingJourneyModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

function byName(fragment: string) {
  const fragmentLower = fragment.toLowerCase()
  const stage = httpsExampleScenario.stages.find((item) =>
    `${item.id} ${item.shortName} ${item.stageKind}`.toLowerCase().includes(fragmentLower),
  )

  if (!stage) throw new Error(`Missing stage matching ${fragment}`)
  return stage
}

describe('branch classifier precision', () => {
  it('does not attach HTTP error to DNS response stages', () => {
    const dnsResponse = byName('dns response')
    const choices = buildBranchJourneyChoicesForStage(httpsExampleScenario, dnsResponse)

    expect(choices.some((choice) => choice.kind === 'dns-failure')).toBe(true)
    expect(choices.some((choice) => choice.kind === 'http-error')).toBe(false)
  })

  it('keeps HTTP error on HTTP/application stages', () => {
    const httpStage = byName('http')
    const choices = buildBranchJourneyChoicesForStage(httpsExampleScenario, httpStage)

    expect(choices.some((choice) => choice.kind === 'http-error')).toBe(true)
  })
})
