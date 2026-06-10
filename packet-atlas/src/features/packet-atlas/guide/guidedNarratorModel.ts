import type { StageNarrativeMetadata } from '../narrative/stageNarrativeModel'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

export type GuidedNarratorLine = {
  stageId: string
  line: string
  pausePrompt: string
  handoff: string
}

function stageText(stage: JourneyStage) {
  return `${stage.id} ${stage.shortName} ${stage.stageKind} ${stage.direction}`.toLowerCase()
}

function nextShortName(scenario: JourneyScenario, stage: JourneyStage) {
  const index = scenario.stages.findIndex((candidate) => candidate.id === stage.id)
  if (index < 0 || index >= scenario.stages.length - 1) return 'recap'
  return scenario.stages[index + 1].shortName
}

function lineForStage(stage: JourneyStage, narrative: StageNarrativeMetadata) {
  const haystack = stageText(stage)

  if (haystack.includes('url') || haystack.includes('intent')) {
    return 'Start before the network: a human intention becomes something the browser can act on.'
  }

  if (haystack.includes('browser checks') || haystack.includes('cache')) {
    return 'The browser checks whether it can answer locally before it creates real network traffic.'
  }

  if (haystack.includes('dns query')) {
    return 'The name now leaves the browser path as a DNS question: where should this request go?'
  }

  if (haystack.includes('arp')) {
    return 'Before the packet leaves the local network, the machine needs a local next-hop address.'
  }

  if (haystack.includes('lan')) {
    return 'The request becomes a frame on the local network, ready to move toward the gateway.'
  }

  if (haystack.includes('router') || haystack.includes('nat')) {
    return 'The gateway forwards the journey outward and may rewrite addresses so the return path works.'
  }

  if (haystack.includes('dns response')) {
    return 'The DNS answer comes back with the destination needed before TCP can start.'
  }

  if (haystack.includes('tcp')) {
    return 'The client and server now build a transport session; HTTP still does not exist yet.'
  }

  if (haystack.includes('tls')) {
    return 'The secure envelope is negotiated, which protects the later HTTP conversation.'
  }

  if (haystack.includes('http get')) {
    return 'Inside the secure path, the browser finally asks for the web resource.'
  }

  if (haystack.includes('proxy')) {
    return 'The server-side front door receives the request and decides where it should go internally.'
  }

  if (haystack.includes('app') || haystack.includes('db')) {
    return 'The application and database do the work needed to build the answer.'
  }

  if (haystack.includes('http response')) {
    return 'The answer starts traveling back as application data carried by the established path.'
  }

  if (haystack.includes('render')) {
    return 'The technical journey turns back into human experience: a visible page.'
  }

  return narrative.whatHappensNow
}

export function buildGuidedNarratorLine(
  scenario: JourneyScenario,
  stage: JourneyStage,
  narrative: StageNarrativeMetadata,
): GuidedNarratorLine {
  const next = nextShortName(scenario, stage)
  const isFinal = next === 'recap'

  return {
    stageId: stage.id,
    line: lineForStage(stage, narrative),
    pausePrompt: `Pause: can you say why "${stage.shortName}" must happen before the next step?`,
    handoff: isFinal
      ? 'Then recap the whole journey in one sentence.'
      : `Then move to: ${next}.`,
  }
}
