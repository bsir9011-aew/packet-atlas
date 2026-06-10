import type { GuidedJourneyScript } from './guidedJourneyScriptModel'

export type GuidedStoryQualityFinding = {
  id: string
  ok: boolean
  message: string
}

export type GuidedStoryQualityReport = {
  ok: boolean
  findings: GuidedStoryQualityFinding[]
}

const dashboardWords = ['kpi', 'scoreboard', 'metric dashboard', 'performance chart', 'ranking']

function containsForbiddenDashboardLanguage(script: GuidedJourneyScript) {
  const haystack = JSON.stringify(script).toLowerCase()
  return dashboardWords.some((word) => haystack.includes(word))
}

export function evaluateGuidedStoryQuality(script: GuidedJourneyScript): GuidedStoryQualityReport {
  const findings: GuidedStoryQualityFinding[] = [
    { id: 'has-steps', ok: script.steps.length > 0, message: 'Script contains guided steps.' },
    {
      id: 'all-steps-have-story',
      ok: script.steps.every((step) => step.spokenLine.length >= 20),
      message: 'Every step has a readable story line.',
    },
    {
      id: 'all-steps-have-evidence-question',
      ok: script.steps.every((step) => step.evidenceQuestion.includes('What evidence')),
      message: 'Every step asks for proof/evidence.',
    },
    {
      id: 'all-steps-have-do-not-jump-guard',
      ok: script.steps.every((step) => step.doNotJumpTo.length >= 12),
      message: 'Every step warns against premature debugging.',
    },
    {
      id: 'all-steps-have-vocabulary',
      ok: script.steps.every((step) => step.vocabulary.length > 0),
      message: 'Every step has at least one vocabulary helper.',
    },
    {
      id: 'no-dashboard-language',
      ok: !containsForbiddenDashboardLanguage(script),
      message: 'Script avoids dashboard/metric framing.',
    },
    {
      id: 'has-final-recap',
      ok: script.recap.notebookLine.length >= 20,
      message: 'Script ends with a final notebook line.',
    },
  ]

  return { ok: findings.every((finding) => finding.ok), findings }
}

export function renderGuidedStoryQualityMarkdown(report: GuidedStoryQualityReport): string {
  return [
    '# Guided Story Quality Report',
    '',
    `Status: ${report.ok ? 'READY' : 'NEEDS WORK'}`,
    '',
    ...report.findings.map((finding) => `- ${finding.ok ? '✅' : '❌'} ${finding.message}`),
    '',
  ].join('\n')
}
