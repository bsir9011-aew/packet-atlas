import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import type { GuidedScenarioPack, GuidedScenarioStep } from './guidedScenarioPackModel'

export type GuidedScenarioBridgeAnchor = {
  scenarioId: string
  scenarioLabel: string
  stepTitle: string
  stageId: string
  stageShortName: string
  reason: string
}

export type GuidedScenarioBridge = {
  scenarioId: string
  scenarioLabel: string
  mode: GuidedScenarioPack['mode']
  userSymptom: string
  firstQuestion: string
  anchors: GuidedScenarioBridgeAnchor[]
  unanchoredSteps: string[]
}

export type GuidedScenarioBridgeReadiness = {
  ok: boolean
  totalScenarios: number
  anchoredScenarios: number
  totalAnchors: number
  findings: {
    id: string
    ok: boolean
    message: string
  }[]
}

function stageHaystack(stage: JourneyStage) {
  return [
    stage.id,
    stage.shortName,
    stage.stageKind,
    stage.direction,
    ...stage.layerFocus,
  ]
    .join(' ')
    .toLowerCase()
}

function stepHaystack(step: GuidedScenarioStep) {
  return [
    step.title,
    step.story,
    step.doNotJumpTo,
    step.notebook,
    ...step.evidence,
  ]
    .join(' ')
    .toLowerCase()
}

function anchorKeywordsForStep(step: GuidedScenarioStep) {
  const text = stepHaystack(step)

  if (text.includes('dns') || text.includes('name') || text.includes('destination')) {
    return ['dns']
  }

  if (text.includes('tcp') || text.includes('transport') || text.includes('syn')) {
    return ['tcp', 'transport']
  }

  if (text.includes('tls') || text.includes('certificate') || text.includes('secure')) {
    return ['tls']
  }

  if (text.includes('http') || text.includes('application') || text.includes('server')) {
    return ['http', 'application']
  }

  if (text.includes('render') || text.includes('visible') || text.includes('browser')) {
    return ['render', 'browser', 'human']
  }

  if (text.includes('intent') || text.includes('human')) {
    return ['intent', 'human']
  }

  return ['stage']
}

function findAnchorStage(scenario: JourneyScenario, step: GuidedScenarioStep): JourneyStage | undefined {
  const keywords = anchorKeywordsForStep(step)

  return scenario.stages.find((stage) => {
    const haystack = stageHaystack(stage)
    return keywords.some((keyword) => haystack.includes(keyword))
  })
}

function bridgeReasonForStep(step: GuidedScenarioStep, stage: JourneyStage) {
  const keywords = anchorKeywordsForStep(step).join(', ')
  return `Matched guided step to journey stage by layer/story keywords: ${keywords}. Stage kind: ${stage.stageKind}.`
}

export function buildGuidedScenarioBridge(
  packs: GuidedScenarioPack[],
  scenario: JourneyScenario,
): GuidedScenarioBridge[] {
  return packs.map((pack) => {
    const anchors: GuidedScenarioBridgeAnchor[] = []
    const unanchoredSteps: string[] = []

    for (const step of pack.steps) {
      const stage = findAnchorStage(scenario, step)

      if (!stage) {
        unanchoredSteps.push(step.title)
        continue
      }

      anchors.push({
        scenarioId: pack.id,
        scenarioLabel: pack.label,
        stepTitle: step.title,
        stageId: stage.id,
        stageShortName: stage.shortName,
        reason: bridgeReasonForStep(step, stage),
      })
    }

    return {
      scenarioId: pack.id,
      scenarioLabel: pack.label,
      mode: pack.mode,
      userSymptom: pack.userSymptom,
      firstQuestion: pack.firstQuestion,
      anchors,
      unanchoredSteps,
    }
  })
}

export function evaluateGuidedScenarioBridgeReadiness(
  bridges: GuidedScenarioBridge[],
): GuidedScenarioBridgeReadiness {
  const totalScenarios = bridges.length
  const anchoredScenarios = bridges.filter((bridge) => bridge.anchors.length > 0).length
  const totalAnchors = bridges.reduce((sum, bridge) => sum + bridge.anchors.length, 0)
  const unanchoredCount = bridges.reduce(
    (sum, bridge) => sum + bridge.unanchoredSteps.length,
    0,
  )

  const findings = [
    {
      id: 'has-scenarios',
      ok: totalScenarios > 0,
      message: 'Bridge contains scenario packs.',
    },
    {
      id: 'all-scenarios-have-anchors',
      ok: anchoredScenarios === totalScenarios,
      message: 'Every scenario has at least one journey anchor.',
    },
    {
      id: 'has-multiple-anchors',
      ok: totalAnchors >= totalScenarios,
      message: 'Bridge has enough anchors to support guided UI navigation.',
    },
    {
      id: 'no-unanchored-steps',
      ok: unanchoredCount === 0,
      message: 'All scenario steps are anchored to existing journey stages.',
    },
  ]

  return {
    ok: findings.every((finding) => finding.ok),
    totalScenarios,
    anchoredScenarios,
    totalAnchors,
    findings,
  }
}

export function renderGuidedScenarioBridgeMarkdown(bridges: GuidedScenarioBridge[]): string {
  return [
    '# Guided Scenario Bridge',
    '',
    'This bridge maps guided scenario steps to existing Packet Atlas journey stages.',
    '',
    ...bridges.flatMap((bridge) => [
      `## ${bridge.scenarioLabel}`,
      '',
      `**Mode:** ${bridge.mode}`,
      '',
      `**User symptom:** ${bridge.userSymptom}`,
      '',
      `**First question:** ${bridge.firstQuestion}`,
      '',
      '### Anchors',
      '',
      ...bridge.anchors.map(
        (anchor) =>
          `- **${anchor.stepTitle}** -> \`${anchor.stageId}\` (${anchor.stageShortName}) — ${anchor.reason}`,
      ),
      ...(bridge.unanchoredSteps.length
        ? ['', '### Unanchored steps', '', ...bridge.unanchoredSteps.map((step) => `- ${step}`)]
        : []),
      '',
    ]),
  ].join('\n')
}

export function renderGuidedScenarioBridgeReadinessMarkdown(
  readiness: GuidedScenarioBridgeReadiness,
): string {
  return [
    '# Guided Scenario Bridge Readiness',
    '',
    `Status: ${readiness.ok ? 'READY' : 'NEEDS WORK'}`,
    '',
    `Scenarios: ${readiness.totalScenarios}`,
    '',
    `Anchored scenarios: ${readiness.anchoredScenarios}`,
    '',
    `Total anchors: ${readiness.totalAnchors}`,
    '',
    '## Findings',
    '',
    ...readiness.findings.map(
      (finding) => `- ${finding.ok ? '✅' : '❌'} ${finding.message}`,
    ),
    '',
  ].join('\n')
}
