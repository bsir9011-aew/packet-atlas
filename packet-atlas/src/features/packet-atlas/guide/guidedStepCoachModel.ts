import type { StageNarrativeMetadata } from '../narrative/stageNarrativeModel'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

export type GuidedStepCoach = {
  stageId: string
  phaseLabel: string
  beforeLabel: string
  nowLabel: string
  nextLabel: string
  plainEnglish: string
  whatToDoNow: string
  proofQuestion: string
  notebookLine: string
  dontLookAtYet: string
  nextActionLabel: string
}

function getStageIndex(scenario: JourneyScenario, stageId: string) {
  const index = scenario.stages.findIndex((candidate) => candidate.id === stageId)
  return index >= 0 ? index : 0
}

function getPreviousStage(scenario: JourneyScenario, stageId: string) {
  const index = getStageIndex(scenario, stageId)
  return scenario.stages[Math.max(0, index - 1)]
}

function getNextStage(scenario: JourneyScenario, stageId: string) {
  const index = getStageIndex(scenario, stageId)
  return scenario.stages[Math.min(scenario.stages.length - 1, index + 1)]
}

function getPhaseLabel(index: number, total: number) {
  if (index === 0) return 'Start'
  if (index === total - 1) return 'Finish'
  if (index < Math.ceil(total / 3)) return 'Prepare'
  if (index < Math.ceil((total * 2) / 3)) return 'Network path'
  return 'Return and render'
}

function getWhatToDoNow(index: number, total: number, stage: JourneyStage) {
  if (index === 0) {
    return 'Do not look for packets yet. First understand the user intent that starts the journey.'
  }

  if (index === total - 1) {
    return 'Close the loop: explain how the invisible journey becomes visible content for the user.'
  }

  if (stage.direction === 'request') {
    return 'Follow the request forward. Ask what must be true before the next layer can act.'
  }

  if (stage.direction === 'response') {
    return 'Follow the response back. Ask what changed and what evidence proves it returned.'
  }

  return 'Stay with this one step. Do not jump to later panels until this boundary is clear.'
}

export function buildGuidedStepCoach(
  scenario: JourneyScenario,
  stage: JourneyStage,
  narrative: StageNarrativeMetadata,
): GuidedStepCoach {
  const index = getStageIndex(scenario, stage.id)
  const previous = getPreviousStage(scenario, stage.id)
  const next = getNextStage(scenario, stage.id)
  const isLast = index === scenario.stages.length - 1

  return {
    stageId: stage.id,
    phaseLabel: getPhaseLabel(index, scenario.stages.length),
    beforeLabel: previous?.shortName ?? 'Start',
    nowLabel: stage.shortName,
    nextLabel: isLast ? 'End' : next.shortName,
    plainEnglish: narrative.whatHappensNow,
    whatToDoNow: getWhatToDoNow(index, scenario.stages.length, stage),
    proofQuestion: `What would prove this step exists? ${narrative.networkEvidence}`,
    notebookLine: `${stage.shortName}: ${narrative.whyItMatters}`,
    dontLookAtYet:
      'Do not inspect every panel at once. Read this step, say it simply, then press Next.',
    nextActionLabel: isLast ? 'Finish the journey' : `Next: ${next.shortName}`,
  }
}
