import type { GuidedScenarioPack, GuidedScenarioStep } from './guidedScenarioPackModel'

export type GuidedScenarioRuntimeCard = {
  scenarioId: string
  label: string
  mode: GuidedScenarioPack['mode']
  userSymptom: string
  firstQuestion: string
  stepCount: number
  nextReaderAction: string
}

export type GuidedScenarioRuntimeStep = {
  scenarioId: string
  stepNumber: number
  totalSteps: number
  title: string
  readThis: string
  askThis: string
  evidenceChecklist: string[]
  doNotJumpTo: string
  notebookLine: string
  nextAction: string
}

export type GuidedScenarioRuntime = {
  defaultScenarioId: string
  cards: GuidedScenarioRuntimeCard[]
}

function nextActionForStep(step: GuidedScenarioStep, index: number, total: number) {
  if (index >= total - 1) return 'Write the final notebook line and return to the scenario list.'

  return `When "${step.title}" is clear, move to step ${index + 2}.`
}

export function buildGuidedScenarioRuntime(packs: GuidedScenarioPack[]): GuidedScenarioRuntime {
  const defaultScenario = packs.find((pack) => pack.mode === 'happy-path') ?? packs[0]

  return {
    defaultScenarioId: defaultScenario?.id ?? '',
    cards: packs.map((pack) => ({
      scenarioId: pack.id,
      label: pack.label,
      mode: pack.mode,
      userSymptom: pack.userSymptom,
      firstQuestion: pack.firstQuestion,
      stepCount: pack.steps.length,
      nextReaderAction:
        pack.mode === 'happy-path'
          ? 'Follow the complete journey once before inspecting failure paths.'
          : 'Start from the user symptom, then prove where the journey stopped.',
    })),
  }
}

export function buildGuidedScenarioRuntimeSteps(
  pack: GuidedScenarioPack,
): GuidedScenarioRuntimeStep[] {
  return pack.steps.map((step, index) => ({
    scenarioId: pack.id,
    stepNumber: index + 1,
    totalSteps: pack.steps.length,
    title: step.title,
    readThis: step.story,
    askThis: index === 0 ? pack.firstQuestion : `What proves "${step.title}"?`,
    evidenceChecklist: step.evidence,
    doNotJumpTo: step.doNotJumpTo,
    notebookLine: step.notebook,
    nextAction: nextActionForStep(step, index, pack.steps.length),
  }))
}

export function findGuidedScenarioPack(
  packs: GuidedScenarioPack[],
  scenarioId: string,
): GuidedScenarioPack | undefined {
  return packs.find((pack) => pack.id === scenarioId)
}

export function renderGuidedScenarioRuntimeMarkdown(
  packs: GuidedScenarioPack[],
): string {
  const runtime = buildGuidedScenarioRuntime(packs)

  const lines = [
    '# Packet Atlas Guided Scenario Runtime',
    '',
    'This is the runtime reading contract for guided scenarios.',
    '',
    `Default scenario: ${runtime.defaultScenarioId}`,
    '',
    '## Scenario cards',
    '',
    ...runtime.cards.flatMap((card) => [
      `### ${card.label}`,
      '',
      `- Mode: ${card.mode}`,
      `- User symptom: ${card.userSymptom}`,
      `- First question: ${card.firstQuestion}`,
      `- Steps: ${card.stepCount}`,
      `- Reader action: ${card.nextReaderAction}`,
      '',
    ]),
    '## Runtime rule',
    '',
    'The learner should choose a scenario, read one step, check evidence, write one notebook line and move next.',
    '',
  ]

  return lines.join('\n')
}
