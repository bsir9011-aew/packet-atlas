import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import {
  getSignalStripSummary,
  isPhysicalStage,
} from '../../src/features/packet-atlas/physical/signalStripModel'

describe('symbolic PHY signal strip model', () => {
  it('detects physical stages', () => {
    const lanFrame = httpsExampleScenario.stages.find(
      (stage) => stage.id === 'lan-frame',
    )
    const urlIntent = httpsExampleScenario.stages.find(
      (stage) => stage.id === 'url-intent',
    )

    expect(lanFrame).toBeTruthy()
    expect(urlIntent).toBeTruthy()
    expect(isPhysicalStage(lanFrame!)).toBe(true)
    expect(isPhysicalStage(urlIntent!)).toBe(false)
    expect(getSignalStripSummary(lanFrame!)).toContain('physical-layer')
  })
})
