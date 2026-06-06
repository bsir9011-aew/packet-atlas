import {
  JourneyScenarioSchema,
  type JourneyScenario,
} from '../schema/journeyScenarioSchema'
import type { ScenarioManifestV2 } from '../schema/scenarioManifestV2'
import { httpsExampleScenario } from './httpsExample'
import { sshConnectionScenario } from './sshConnectionScenario'
import {
  getScenarioManifestV2,
  scenarioManifestRegistry,
} from './scenarioManifestRegistry'

export type ScenarioStatus = ScenarioManifestV2['status']

export type ScenarioManifestItem = {
  id: string
  title: string
  shortTitle: string
  status: ScenarioStatus
  protocolFamily: string
  description: string
  scenario: JourneyScenario
  manifest: ScenarioManifestV2
}

function validateScenario(scenario: JourneyScenario): JourneyScenario {
  return JourneyScenarioSchema.parse(scenario)
}

function buildRegistryItem(
  scenario: JourneyScenario,
): ScenarioManifestItem {
  const validatedScenario = validateScenario(scenario)
  const manifest = getScenarioManifestV2(validatedScenario.id)

  if (manifest.id !== validatedScenario.id) {
    throw new Error(
      `Scenario/manifest id mismatch: ${validatedScenario.id} vs ${manifest.id}`,
    )
  }

  return {
    id: manifest.id,
    title: manifest.title,
    shortTitle: manifest.shortTitle,
    status: manifest.status,
    protocolFamily: manifest.protocolFamily,
    description: manifest.description,
    scenario: validatedScenario,
    manifest,
  }
}

export const scenarioRegistry: ScenarioManifestItem[] = [
  buildRegistryItem(httpsExampleScenario),
  buildRegistryItem(sshConnectionScenario),
]

export function getScenarioById(id: string): JourneyScenario {
  return (
    scenarioRegistry.find((item) => item.id === id)?.scenario ??
    scenarioRegistry[0].scenario
  )
}

export function getScenarioManifest(id: string): ScenarioManifestItem {
  return (
    scenarioRegistry.find((item) => item.id === id) ??
    scenarioRegistry[0]
  )
}

export function validateScenarioRegistry() {
  return {
    total: scenarioRegistry.length,
    manifests: scenarioManifestRegistry.length,
    ready: scenarioRegistry.filter((item) => item.status === 'ready').length,
    draft: scenarioRegistry.filter((item) => item.status === 'draft').length,
    invalid: scenarioRegistry.filter((item) => item.status === 'invalid').length,
  }
}
