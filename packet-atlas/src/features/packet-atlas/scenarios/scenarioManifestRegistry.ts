import httpsManifestJson from './httpsExample.manifest.v2.json'
import sshManifestJson from './sshConnection.manifest.v2.json'
import {
  ScenarioManifestV2Schema,
  type ScenarioManifestV2,
} from '../schema/scenarioManifestV2'

export const scenarioManifestRegistry: ScenarioManifestV2[] = [
  ScenarioManifestV2Schema.parse(httpsManifestJson),
  ScenarioManifestV2Schema.parse(sshManifestJson),
]

export function getScenarioManifestV2(id: string): ScenarioManifestV2 {
  return (
    scenarioManifestRegistry.find((manifest) => manifest.id === id) ??
    scenarioManifestRegistry[0]
  )
}
