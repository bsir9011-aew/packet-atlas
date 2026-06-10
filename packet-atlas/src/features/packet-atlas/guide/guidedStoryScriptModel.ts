import type { StageNarrativeMetadata } from '../narrative/stageNarrativeModel'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

export type GuidedStoryScript = {
  stageId: string
  spokenLine: string
  mentalModel: string
  evidenceQuestion: string
  avoidJumpingTo: string
  nextHandoff: string
}

function normalizeStage(stage: JourneyStage) {
  return `${stage.id} ${stage.shortName} ${stage.stageKind} ${stage.direction}`.toLowerCase()
}

function getStageIndex(scenario: JourneyScenario, stageId: string) {
  const index = scenario.stages.findIndex((candidate) => candidate.id === stageId)
  return index >= 0 ? index : 0
}

function getNextShortName(scenario: JourneyScenario, stageId: string) {
  const index = getStageIndex(scenario, stageId)
  if (index >= scenario.stages.length - 1) return 'final recap'
  return scenario.stages[index + 1].shortName
}

function storyLine(stage: JourneyStage, narrative: StageNarrativeMetadata) {
  const text = normalizeStage(stage)

  if (text.includes('url') || text.includes('intent')) {
    return 'A human intention becomes a browser task, but it is not a network packet yet.'
  }

  if (text.includes('browser') && (text.includes('check') || text.includes('cache'))) {
    return 'The browser checks what it already knows before it asks the network for help.'
  }

  if (text.includes('dns query')) {
    return 'The browser needs a destination, so the journey becomes a DNS question.'
  }

  if (text.includes('dns response')) {
    return 'The DNS answer gives the browser a usable destination for the next transport step.'
  }

  if (text.includes('arp')) {
    return 'The device finds the local next hop so the packet can leave the machine.'
  }

  if (text.includes('lan')) {
    return 'The packet becomes a local network frame on its way toward the gateway.'
  }

  if (text.includes('router') || text.includes('nat')) {
    return 'The gateway moves the journey outward and keeps enough state for the answer to return.'
  }

  if (text.includes('tcp')) {
    return 'The machines build a transport session; only now can higher protocols safely ride on it.'
  }

  if (text.includes('tls')) {
    return 'TLS builds the protected envelope, which hides readable HTTP from observers.'
  }

  if (text.includes('http get')) {
    return 'Inside the protected path, the browser finally asks the server for the resource.'
  }

  if (text.includes('proxy')) {
    return 'The server-side front door receives the request and routes it to the right internal place.'
  }

  if (text.includes('app') || text.includes('db')) {
    return 'The application and data layer produce the answer the user is waiting for.'
  }

  if (text.includes('http response')) {
    return 'The response begins the return trip back through the already established path.'
  }

  if (text.includes('render')) {
    return 'The browser turns returned data into visible content, closing the human loop.'
  }

  return narrative.whatHappensNow
}

function mentalModel(stage: JourneyStage) {
  const text = normalizeStage(stage)

  if (text.includes('dns')) return 'DNS is the address book step: no usable answer means no web connection.'
  if (text.includes('tcp')) return 'TCP is the conversation setup: it must exist before TLS or HTTP matters.'
  if (text.includes('tls')) return 'TLS is the sealed envelope: you can see the envelope, not the readable letter.'
  if (text.includes('http')) return 'HTTP is the application request/response carried inside the network path.'
  if (text.includes('router') || text.includes('nat')) {
    return 'Routing/NAT is the road system and return-ticket logic between networks.'
  }
  if (text.includes('render')) return 'Rendering is where invisible network work becomes visible human output.'

  return 'Each stage is one boundary in the same journey, not a separate topic.'
}

function avoidJumpingTo(stage: JourneyStage) {
  const text = normalizeStage(stage)

  if (text.includes('dns')) return 'Do not debug the server before proving the name resolved.'
  if (text.includes('tcp')) return 'Do not debug TLS or HTTP before proving the transport session exists.'
  if (text.includes('tls')) return 'Do not expect readable HTTP before the secure envelope is established.'
  if (text.includes('http')) return 'Do not blame DNS if the request already reached the application layer.'

  return 'Do not inspect every panel yet. Finish this step first.'
}

export function buildGuidedStoryScript(
  scenario: JourneyScenario,
  stage: JourneyStage,
  narrative: StageNarrativeMetadata,
): GuidedStoryScript {
  const next = getNextShortName(scenario, stage.id)

  return {
    stageId: stage.id,
    spokenLine: storyLine(stage, narrative),
    mentalModel: mentalModel(stage),
    evidenceQuestion: `What evidence would prove this step? ${narrative.networkEvidence}`,
    avoidJumpingTo: avoidJumpingTo(stage),
    nextHandoff:
      next === 'final recap'
        ? 'Now recap the whole journey in one sentence.'
        : `When this makes sense, go to: ${next}.`,
  }
}
