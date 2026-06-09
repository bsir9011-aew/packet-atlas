import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import {
  buildStageNarrativeMetadata,
  type StageNarrativeMetadata,
} from '../narrative/stageNarrativeModel'

export type TraceSpeed = 'slow' | 'normal' | 'fast'

export const traceSpeedMs: Record<TraceSpeed, number> = {
  slow: 9000,
  normal: 6000,
  fast: 3500,
}

export function getStageIndex(scenario: JourneyScenario, stageId: string): number {
  const index = scenario.stages.findIndex((stage) => stage.id === stageId)
  return index >= 0 ? index : 0
}

export function getNextStageId(scenario: JourneyScenario, stageId: string): string {
  const stage = scenario.stages.find((item) => item.id === stageId)
  const relationNext = stage?.relations.nextIds[0]
  if (relationNext && scenario.stages.some((item) => item.id === relationNext)) {
    return relationNext
  }

  const index = getStageIndex(scenario, stageId)
  return scenario.stages[Math.min(index + 1, scenario.stages.length - 1)]?.id ?? stageId
}

export function getPreviousStageId(scenario: JourneyScenario, stageId: string): string {
  const stage = scenario.stages.find((item) => item.id === stageId)
  const relationPrevious = stage?.relations.previousIds[0]
  if (
    relationPrevious &&
    scenario.stages.some((item) => item.id === relationPrevious)
  ) {
    return relationPrevious
  }

  const index = getStageIndex(scenario, stageId)
  return scenario.stages[Math.max(index - 1, 0)]?.id ?? stageId
}

export function getTraceProgress(scenario: JourneyScenario, stageId: string): number {
  if (!scenario.stages.length) return 0
  return Math.round(((getStageIndex(scenario, stageId) + 1) / scenario.stages.length) * 100)
}

export type AnimatedJourneyStepSummary = StageNarrativeMetadata

export function buildAnimatedJourneyStepSummary(
  scenario: JourneyScenario,
  stage: JourneyStage,
): AnimatedJourneyStepSummary {
  return buildStageNarrativeMetadata(scenario, stage)
}
