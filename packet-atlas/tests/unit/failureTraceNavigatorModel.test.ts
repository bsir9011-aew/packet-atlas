import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import {
  getFailureNavigatorSummary,
  getNavigatorStageLabel,
} from '../../src/features/packet-atlas/failure/failureTraceNavigatorModel'

describe('failure trace navigator model', () => {
  it('keeps happy path without cut off stages', () => {
    const summary = getFailureNavigatorSummary(
      httpsExampleScenario,
      'happy-path',
    )

    expect(summary.isBaseline).toBe(true)
    expect(summary.notReachedCount).toBe(0)
    expect(summary.breakStageId).toBeNull()
  })

  it('finds break and cut off stages for ARP failure', () => {
    const summary = getFailureNavigatorSummary(
      httpsExampleScenario,
      'no-arp-gateway',
    )

    expect(summary.isBaseline).toBe(false)
    expect(summary.firstAffectedStageId).toBe('arp-gateway')
    expect(summary.breakStageId).toBe('arp-gateway')
    expect(summary.firstNotReachedStageId).toBe('lan-frame')
    expect(summary.notReachedCount).toBeGreaterThan(0)
  })

  it('labels diff rows for rail UI', () => {
    const summary = getFailureNavigatorSummary(
      httpsExampleScenario,
      'tls-failure',
    )
    const breakRow = summary.rows.find((row) => row.status === 'breaks-here')
    const sameRow = summary.rows.find((row) => row.status === 'same')

    expect(breakRow ? getNavigatorStageLabel(breakRow) : null).toBe('break')
    expect(sameRow ? getNavigatorStageLabel(sameRow) : null).toBe('stable')
  })
})
