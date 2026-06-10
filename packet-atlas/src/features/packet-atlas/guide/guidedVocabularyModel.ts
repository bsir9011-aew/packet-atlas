import type { JourneyStage } from '../schema/journeyScenarioSchema'

export type GuidedVocabularyTerm = {
  term: string
  simpleMeaning: string
  doNotConfuseWith: string
}

function stageHaystack(stage: JourneyStage) {
  return `${stage.id} ${stage.shortName} ${stage.stageKind} ${stage.direction}`.toLowerCase()
}

export function buildGuidedVocabulary(stage: JourneyStage): GuidedVocabularyTerm[] {
  const text = stageHaystack(stage)
  const terms: GuidedVocabularyTerm[] = []

  if (text.includes('dns')) {
    terms.push({
      term: 'DNS',
      simpleMeaning: 'Turns a human-readable name into a destination the network can use.',
      doNotConfuseWith: 'DNS is not the web server and not the page content.',
    })
  }

  if (text.includes('tcp')) {
    terms.push({
      term: 'TCP',
      simpleMeaning: 'Creates a reliable transport conversation between two endpoints.',
      doNotConfuseWith: 'TCP is not encryption and not the HTTP request itself.',
    })
  }

  if (text.includes('tls')) {
    terms.push({
      term: 'TLS',
      simpleMeaning: 'Creates the encrypted envelope around the application conversation.',
      doNotConfuseWith: 'TLS is not DNS and not the HTML page.',
    })
  }

  if (text.includes('http')) {
    terms.push({
      term: 'HTTP',
      simpleMeaning: 'The application-level request and response for web resources.',
      doNotConfuseWith: 'HTTP is carried by TCP/TLS; it is not the physical network path.',
    })
  }

  if (text.includes('nat')) {
    terms.push({
      term: 'NAT',
      simpleMeaning: 'Rewrites addresses so private devices can communicate through a gateway.',
      doNotConfuseWith: 'NAT is not a firewall rule, even if both often live on the same device.',
    })
  }

  if (text.includes('proxy')) {
    terms.push({
      term: 'Proxy',
      simpleMeaning: 'A front door that receives traffic and forwards it to another service.',
      doNotConfuseWith: 'A proxy is not always the final application server.',
    })
  }

  if (text.includes('render')) {
    terms.push({
      term: 'Render',
      simpleMeaning: 'Turns returned data into visible content in the browser.',
      doNotConfuseWith: 'Rendering is not packet delivery; it happens after data comes back.',
    })
  }

  if (terms.length === 0) {
    terms.push({
      term: 'Stage',
      simpleMeaning: 'One readable boundary in the same end-to-end journey.',
      doNotConfuseWith: 'A stage is not a separate lesson or quiz module.',
    })
  }

  return terms.slice(0, 2)
}
