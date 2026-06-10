import { buildAnimatedJourneyStepSummary } from '../cinematic/cinematicTraceModel'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { buildGuidedFinalRecap } from './guidedFinalRecapModel'
import { buildGuidedStoryScript } from './guidedStoryScriptModel'
import { buildGuidedVocabulary } from './guidedVocabularyModel'

export type GuidedJourneyScriptStep = {
  stepNumber: number
  totalSteps: number
  stageId: string
  shortName: string
  direction: string
  stageKind: string
  spokenLine: string
  mentalModel: string
  evidenceQuestion: string
  doNotJumpTo: string
  vocabulary: {
    term: string
    simpleMeaning: string
    doNotConfuseWith: string
  }[]
  notebookLine: string
  nextHandoff: string
}

export type GuidedJourneyScript = {
  title: string
  subtitle: string
  steps: GuidedJourneyScriptStep[]
  recap: {
    title: string
    simpleStory: string
    checkpoints: string[]
    notebookLine: string
    closingAction: string
  }
}

export function buildGuidedJourneyScript(scenario: JourneyScenario): GuidedJourneyScript {
  return {
    title: 'Packet Atlas Guided Journey Script',
    subtitle: 'One journey, many lenses — read one step, say it simply, then move next.',
    steps: scenario.stages.map((stage, index) => {
      const narrative = buildAnimatedJourneyStepSummary(scenario, stage)
      const story = buildGuidedStoryScript(scenario, stage, narrative)
      const vocabulary = buildGuidedVocabulary(stage)

      return {
        stepNumber: index + 1,
        totalSteps: scenario.stages.length,
        stageId: stage.id,
        shortName: stage.shortName,
        direction: stage.direction,
        stageKind: stage.stageKind,
        spokenLine: story.spokenLine,
        mentalModel: story.mentalModel,
        evidenceQuestion: story.evidenceQuestion,
        doNotJumpTo: story.avoidJumpingTo,
        vocabulary,
        notebookLine: `${stage.shortName}: ${story.mentalModel}`,
        nextHandoff: story.nextHandoff,
      }
    }),
    recap: buildGuidedFinalRecap(scenario),
  }
}

export function renderGuidedJourneyScriptMarkdown(script: GuidedJourneyScript): string {
  const lines = [
    `# ${script.title}`,
    '',
    script.subtitle,
    '',
    '## How to read this',
    '',
    'Read one step. Say it simply. Ask what evidence proves it. Then move next.',
    '',
    ...script.steps.flatMap((step) => [
      `## Step ${step.stepNumber}/${step.totalSteps}: ${step.shortName}`,
      '',
      `**Direction:** ${step.direction}`,
      '',
      `**Story:** ${step.spokenLine}`,
      '',
      `**Mental model:** ${step.mentalModel}`,
      '',
      `**Evidence question:** ${step.evidenceQuestion}`,
      '',
      `**Do not jump to:** ${step.doNotJumpTo}`,
      '',
      '**Vocabulary:**',
      '',
      ...step.vocabulary.flatMap((item) => [
        `- **${item.term}:** ${item.simpleMeaning}`,
        `  - Do not confuse with: ${item.doNotConfuseWith}`,
      ]),
      '',
      `**Notebook line:** ${step.notebookLine}`,
      '',
      `**Handoff:** ${step.nextHandoff}`,
      '',
    ]),
    '## Final recap',
    '',
    `**${script.recap.title}**`,
    '',
    script.recap.simpleStory,
    '',
    ...script.recap.checkpoints.map((checkpoint) => `- ${checkpoint}`),
    '',
    `**Final notebook line:** ${script.recap.notebookLine}`,
    '',
    script.recap.closingAction,
    '',
  ]

  return lines.join('\n')
}
