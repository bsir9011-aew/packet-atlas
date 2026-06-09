import {
  buildBranchJourneyChoicesForStage,
  type BranchJourneyChoice,
} from '../branching/branchingJourneyModel'
import type { JourneyScenario, JourneyStage, LayerLens } from '../schema/journeyScenarioSchema'

export type StageNarrativeChoiceKind = 'next' | 'branch'

export type StageNarrativeChoice = {
  id: string
  label: string
  kind: StageNarrativeChoiceKind
  reason: string
}

export type StageNarrativeMetadata = {
  stageId: string
  stageKind: string
  stepLabel: string
  layerFocus: LayerLens[]
  deviceRole: JourneyStage['device']['role']
  whatHappensNow: string
  whyItMatters: string
  userVisibleOutcome: string
  networkEvidence: string
  diagnosticHint: string
  nextChoices: StageNarrativeChoice[]
  branchChoices: BranchJourneyChoice[]
}

export type StageNarrativeCoverage = {
  totalStages: number
  coveredStages: number
  stagesWithChoices: number
  stagesWithBranchChoices: number
  branchChoiceCount: number
  missingNarrative: string[]
}

function hasMeaningfulText(value: string | undefined) {
  return Boolean(value && value.trim().length >= 8)
}

export function getStageNarrativeIndex(
  scenario: JourneyScenario,
  stageId: string,
): number {
  const index = scenario.stages.findIndex((stage) => stage.id === stageId)
  return index >= 0 ? index : 0
}

export function resolveStageNarrativeChoices(
  scenario: JourneyScenario,
  stage: JourneyStage,
): StageNarrativeChoice[] {
  return stage.relations.nextIds
    .filter((id) => scenario.stages.some((candidate) => candidate.id === id))
    .map((id, choiceIndex) => {
      const target = scenario.stages.find((candidate) => candidate.id === id)

      return {
        id,
        label: target?.shortName ?? id,
        kind: choiceIndex === 0 ? 'next' : 'branch',
        reason:
          choiceIndex === 0
            ? 'Continue the main journey path.'
            : 'Explore an alternate or diagnostic path from this point.',
      }
    })
}

export function buildStageNarrativeMetadata(
  scenario: JourneyScenario,
  stage: JourneyStage,
): StageNarrativeMetadata {
  const index = getStageNarrativeIndex(scenario, stage.id)

  return {
    stageId: stage.id,
    stageKind: stage.stageKind,
    stepLabel: `Step ${index + 1} / ${scenario.stages.length}`,
    layerFocus: stage.layerFocus,
    deviceRole: stage.device.role,
    whatHappensNow: stage.copy.whatReallyHappens,
    whyItMatters: stage.copy.whyItMatters,
    userVisibleOutcome: stage.copy.whatUserSees,
    networkEvidence: stage.copy.samePayloadHereLooksLike,
    diagnosticHint: stage.copy.easyToConfuse,
    nextChoices: resolveStageNarrativeChoices(scenario, stage),
    branchChoices: buildBranchJourneyChoicesForStage(scenario, stage),
  }
}

export function validateStageNarrativeCoverage(
  scenario: JourneyScenario,
): StageNarrativeCoverage {
  const narratives = scenario.stages.map((stage) =>
    buildStageNarrativeMetadata(scenario, stage),
  )
  const missingNarrative = narratives
    .filter(
      (narrative) =>
        !(
          hasMeaningfulText(narrative.whatHappensNow) &&
          hasMeaningfulText(narrative.whyItMatters) &&
          hasMeaningfulText(narrative.userVisibleOutcome) &&
          hasMeaningfulText(narrative.networkEvidence) &&
          hasMeaningfulText(narrative.diagnosticHint)
        ),
    )
    .map((narrative) => narrative.stageId)

  return {
    totalStages: scenario.stages.length,
    coveredStages: scenario.stages.length - missingNarrative.length,
    stagesWithChoices: narratives.filter(
      (narrative) => narrative.nextChoices.length > 0,
    ).length,
    stagesWithBranchChoices: narratives.filter(
      (narrative) => narrative.branchChoices.length > 0,
    ).length,
    branchChoiceCount: narratives.reduce(
      (sum, narrative) => sum + narrative.branchChoices.length,
      0,
    ),
    missingNarrative,
  }
}
