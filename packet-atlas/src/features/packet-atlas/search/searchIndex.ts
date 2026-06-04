import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

export type StageSearchResult = {
  stageId: string
  label: string
  direction: JourneyStage['direction']
  deviceRole: JourneyStage['device']['role']
  layers: string[]
  haystack: string
}

function normalize(value: unknown) {
  return String(value ?? '').toLowerCase()
}

export function buildStageSearchIndex(scenario: JourneyScenario): StageSearchResult[] {
  return scenario.stages.map((stage) => {
    const addressValues = stage.addresses ? Object.values(stage.addresses) : []
    const copyValues = Object.values(stage.copy)
    const projectionValues = Object.values(stage.representations).flatMap((projection) =>
      projection ? Object.values(projection) : [],
    )

    const haystack = [
      stage.id,
      stage.shortName,
      stage.stageKind,
      stage.direction,
      stage.device.role,
      stage.device.nodeId,
      stage.payloadRef,
      ...stage.layerFocus,
      ...addressValues,
      ...copyValues,
      ...projectionValues,
    ]
      .map(normalize)
      .join(' ')

    return {
      stageId: stage.id,
      label: stage.shortName,
      direction: stage.direction,
      deviceRole: stage.device.role,
      layers: [...stage.layerFocus],
      haystack,
    }
  })
}

export function searchStages(
  index: StageSearchResult[],
  query: string,
  limit = 8,
): StageSearchResult[] {
  const normalized = normalize(query).trim()
  if (!normalized) return index.slice(0, limit)

  const terms = normalized.split(/\s+/).filter(Boolean)
  return index
    .filter((result) => terms.every((term) => result.haystack.includes(term)))
    .slice(0, limit)
}
