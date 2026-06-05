import type { JourneyStage } from '../schema/journeyScenarioSchema'

export function isPhysicalStage(stage: JourneyStage) {
  return stage.layerFocus.includes('physical')
}

export function getSignalStripSummary(stage: JourneyStage) {
  return isPhysicalStage(stage)
    ? `${stage.shortName} has a physical-layer representation.`
    : `${stage.shortName} is above or outside the physical-layer focus.`
}
