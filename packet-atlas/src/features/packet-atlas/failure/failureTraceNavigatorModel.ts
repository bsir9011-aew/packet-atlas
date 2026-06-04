import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { getScenarioVariant } from '../variants/scenarioVariants'
import { buildFlowDiff, type FlowDiffRow } from '../diff/flowDiffModel'

export type FailureNavigatorSummary = {
  variantId: string
  isBaseline: boolean
  firstAffectedStageId: string | null
  breakStageId: string | null
  firstNotReachedStageId: string | null
  reachedCount: number
  notReachedCount: number
  affectedCount: number
  rows: FlowDiffRow[]
}

export function getFailureNavigatorSummary(
  scenario: JourneyScenario,
  variantId: string,
): FailureNavigatorSummary {
  const variant = getScenarioVariant(variantId)
  const rows = buildFlowDiff(scenario, variantId)

  const firstAffected = rows.find(
    (row) => row.status === 'changed' || row.status === 'breaks-here',
  )
  const breakRow = rows.find((row) => row.status === 'breaks-here')
  const firstNotReached = rows.find((row) => row.status === 'not-reached')

  const notReachedCount = rows.filter(
    (row) => row.status === 'not-reached',
  ).length

  return {
    variantId,
    isBaseline: variant.id === 'happy-path',
    firstAffectedStageId: firstAffected?.stageId ?? null,
    breakStageId: breakRow?.stageId ?? variant.breakStageId ?? null,
    firstNotReachedStageId: firstNotReached?.stageId ?? null,
    reachedCount: rows.length - notReachedCount,
    notReachedCount,
    affectedCount: rows.filter(
      (row) => row.status === 'changed' || row.status === 'breaks-here',
    ).length,
    rows,
  }
}

export function getNavigatorStageLabel(
  row: FlowDiffRow,
): 'stable' | 'changed' | 'break' | 'cut off' {
  if (row.status === 'breaks-here') return 'break'
  if (row.status === 'not-reached') return 'cut off'
  if (row.status === 'changed') return 'changed'
  return 'stable'
}
