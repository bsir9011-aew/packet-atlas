import { JourneyScenarioSchema, type JourneyScenario } from '../schema/journeyScenarioSchema'
import { httpsExampleScenario } from './httpsExample'
import { sshConnectionScenario } from './sshConnectionScenario'

export type ScenarioStatus = 'ready' | 'draft' | 'invalid'
export type ScenarioManifestItem = { id: string; title: string; shortTitle: string; status: ScenarioStatus; protocolFamily: string; description: string; scenario: JourneyScenario }
function validateScenario(scenario: JourneyScenario): JourneyScenario { return JourneyScenarioSchema.parse(scenario) }
export const scenarioRegistry: ScenarioManifestItem[] = [
  { id:httpsExampleScenario.id, title:httpsExampleScenario.title, shortTitle:'HTTPS basic', status:'ready', protocolFamily:'HTTPS / TCP / TLS / DNS', description:'The baseline request/response journey for https://example.com.', scenario:validateScenario(httpsExampleScenario) },
  { id:sshConnectionScenario.id, title:sshConnectionScenario.title, shortTitle:'SSH session', status:'ready', protocolFamily:'SSH / TCP / DNS / ARP', description:'Remote shell connection journey over TCP/22 with SSH identity and authentication checkpoints.', scenario:validateScenario(sshConnectionScenario) },
]
export function getScenarioById(id: string): JourneyScenario { return scenarioRegistry.find((item) => item.id === id)?.scenario ?? scenarioRegistry[0].scenario }
export function getScenarioManifest(id: string): ScenarioManifestItem { return scenarioRegistry.find((item) => item.id === id) ?? scenarioRegistry[0] }
export function validateScenarioRegistry(): { total: number; ready: number; draft: number; invalid: number } { return { total:scenarioRegistry.length, ready:scenarioRegistry.filter(i=>i.status==='ready').length, draft:scenarioRegistry.filter(i=>i.status==='draft').length, invalid:scenarioRegistry.filter(i=>i.status==='invalid').length } }
