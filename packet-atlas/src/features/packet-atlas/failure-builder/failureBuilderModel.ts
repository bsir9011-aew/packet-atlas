import type { JourneyScenario } from '../schema/journeyScenarioSchema'
export type DraftFailureKind = 'timeout' | 'blocked' | 'bad-response' | 'identity-failure' | 'local-resolution-failure'
export type DraftFailure = { title: string; kind: DraftFailureKind; breakStageId: string; affectedStageIds: string[]; symptom: string; rootCause: string; observable: string }
export type DraftFailureRow = { stageId: string; shortName: string; status: 'stable' | 'affected' | 'break' | 'cut-off' }
export function buildDraftFailureTrace(scenario: JourneyScenario, draft: DraftFailure): DraftFailureRow[] {
  const breakIndex = scenario.stages.findIndex((stage) => stage.id === draft.breakStageId)
  const affected = new Set(draft.affectedStageIds)
  return scenario.stages.map((stage, index) => {
    if (stage.id === draft.breakStageId) return { stageId: stage.id, shortName: stage.shortName, status: 'break' }
    if (breakIndex >= 0 && index > breakIndex) return { stageId: stage.id, shortName: stage.shortName, status: 'cut-off' }
    if (affected.has(stage.id)) return { stageId: stage.id, shortName: stage.shortName, status: 'affected' }
    return { stageId: stage.id, shortName: stage.shortName, status: 'stable' }
  })
}
export function exportDraftFailure(draft: DraftFailure): string { return JSON.stringify(draft, null, 2) }
