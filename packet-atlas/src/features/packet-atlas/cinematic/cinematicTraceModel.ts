import type { JourneyScenario } from '../schema/journeyScenarioSchema'
export type TraceSpeed = 'slow' | 'normal' | 'fast'
export const traceSpeedMs: Record<TraceSpeed, number> = { slow: 1800, normal: 1000, fast: 450 }
export function getStageIndex(scenario: JourneyScenario, stageId: string): number { const index = scenario.stages.findIndex((stage)=>stage.id===stageId); return index >= 0 ? index : 0 }
export function getNextStageId(scenario: JourneyScenario, stageId: string): string { const index = getStageIndex(scenario, stageId); return scenario.stages[Math.min(index + 1, scenario.stages.length - 1)]?.id ?? stageId }
export function getPreviousStageId(scenario: JourneyScenario, stageId: string): string { const index = getStageIndex(scenario, stageId); return scenario.stages[Math.max(index - 1, 0)]?.id ?? stageId }
export function getTraceProgress(scenario: JourneyScenario, stageId: string): number { if (!scenario.stages.length) return 0; return Math.round(((getStageIndex(scenario, stageId)+1)/scenario.stages.length)*100) }
