import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { getScenarioVariant, type ScenarioVariant } from '../variants/scenarioVariants'

export type FlowDiffRow = {
  stageId: string
  stageName: string
  baseline: string
  selectedVariant: string
  status: 'same' | 'changed' | 'breaks-here' | 'not-reached'
}

function stageBaselineText(stage: JourneyStage): string {
  return stage.copy.samePayloadHereLooksLike || stage.copy.whatReallyHappens
}

function getChangedText(stage: JourneyStage, variant: ScenarioVariant): string {
  if (variant.breakStageId === stage.id) {
    return `Break point: ${variant.symptom}`
  }

  if (variant.affectedStageIds.includes(stage.id)) {
    return `Affected: ${variant.packetStory}`
  }

  return stageBaselineText(stage)
}

export function buildFlowDiff(
  scenario: JourneyScenario,
  variantId: string,
): FlowDiffRow[] {
  const variant = getScenarioVariant(variantId)
  const breakIndex = variant.breakStageId
    ? scenario.stages.findIndex((stage) => stage.id === variant.breakStageId)
    : -1

  return scenario.stages.map((stage, index) => {
    const impacted = variant.affectedStageIds.includes(stage.id)
    const breaksHere = variant.breakStageId === stage.id
    const notReached = breakIndex >= 0 && index > breakIndex

    return {
      stageId: stage.id,
      stageName: stage.shortName,
      baseline: stageBaselineText(stage),
      selectedVariant: notReached
        ? 'Not reached after the earlier failure point.'
        : getChangedText(stage, variant),
      status: breaksHere
        ? 'breaks-here'
        : notReached
          ? 'not-reached'
          : impacted
            ? 'changed'
            : 'same',
    }
  })
}

export function getFlowDiffSummary(
  scenario: JourneyScenario,
  variantId: string,
) {
  const variant = getScenarioVariant(variantId)
  const rows = buildFlowDiff(scenario, variantId)

  return {
    variant,
    rows,
    changedCount: rows.filter((row) => row.status === 'changed').length,
    notReachedCount: rows.filter((row) => row.status === 'not-reached').length,
    breakStage:
      scenario.stages.find((stage) => stage.id === variant.breakStageId) ?? null,
  }
}
