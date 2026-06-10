import type { JourneyScenario } from '../schema/journeyScenarioSchema'

export type GuidedFinalRecap = {
  title: string
  simpleStory: string
  checkpoints: string[]
  notebookLine: string
  closingAction: string
}

export function buildGuidedFinalRecap(scenario: JourneyScenario): GuidedFinalRecap {
  return {
    title: `You completed one ${scenario.stages.length}-step data journey.`,
    simpleStory:
      'A human intention became DNS, transport, security, application work, a response and finally visible browser content.',
    checkpoints: [
      'Intent is not a packet yet.',
      'DNS decides where the journey can go.',
      'TCP must exist before TLS or HTTP can matter.',
      'TLS protects the readable HTTP conversation.',
      'The browser turns returned data into something the user can see.',
    ],
    notebookLine:
      'One web request is one story: human intent -> DNS -> TCP -> TLS -> HTTP -> server work -> response -> browser render.',
    closingAction:
      'Say the whole journey once in your own words, then leave Focus Mode and inspect details only if needed.',
  }
}
