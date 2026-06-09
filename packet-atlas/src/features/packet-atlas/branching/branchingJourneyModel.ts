import {
  buildDnsFailureBranchPath,
  type BranchDiagnosticStep,
} from './dnsFailureBranchModel'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

export type BranchJourneyChoiceKind =
  | 'dns-failure'
  | 'tcp-blocked'
  | 'tls-failure'
  | 'http-error'

export type BranchJourneyChoice = {
  id: string
  stageId: string
  kind: BranchJourneyChoiceKind
  label: string
  title: string
  whatChanges: string
  userSees: string
  networkEvidence: string
  nextDiagnosticStep: string
  diagnosticPath?: BranchDiagnosticStep[]
}

function stageHaystack(stage: JourneyStage) {
  return [
    stage.id,
    stage.shortName,
    stage.stageKind,
    stage.layerFocus.join(' '),
    stage.copy.whatReallyHappens,
    stage.copy.whichLayerLooksAtIt,
  ]
    .join(' ')
    .toLowerCase()
}

function makeBranchId(stage: JourneyStage, kind: BranchJourneyChoiceKind) {
  return `${stage.id}::${kind}`
}

function includesAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle))
}


function isDnsStage(stage: JourneyStage) {
  const value = stageHaystack(stage)
  return includesAny(value, ['dns', 'resolver', 'domain', 'name resolution'])
}

function isTcpStage(stage: JourneyStage) {
  const value = stageHaystack(stage)
  return includesAny(value, ['tcp', 'syn', 'transport', 'socket', 'port'])
}

function isTlsStage(stage: JourneyStage) {
  const value = stageHaystack(stage)
  return includesAny(value, ['tls', 'certificate', 'handshake', 'encrypted'])
}

function isHttpApplicationStage(stage: JourneyStage) {
  const stageKind = stage.stageKind.toLowerCase()
  const shortName = stage.shortName.toLowerCase()
  const id = stage.id.toLowerCase()
  const focus = stage.layerFocus.join(' ').toLowerCase()
  const haystack = stageHaystack(stage)

  const explicitHttp =
    stageKind.includes('http') ||
    shortName.includes('http') ||
    id.includes('http') ||
    focus.includes('http')

  const applicationBoundary =
    stageKind.includes('reverse') ||
    stageKind.includes('proxy') ||
    stageKind.includes('app') ||
    shortName.includes('reverse proxy') ||
    shortName.includes('app') ||
    id.includes('reverse-proxy') ||
    id.includes('app-db')

  const dnsOnly = isDnsStage(stage) && !explicitHttp && !applicationBoundary
  if (dnsOnly) return false

  return explicitHttp || applicationBoundary || includesAny(haystack, ['http request', 'http response', 'status code'])
}

export function buildBranchJourneyChoicesForStage(
  _scenario: JourneyScenario,
  stage: JourneyStage,
): BranchJourneyChoice[] {
  const choices: BranchJourneyChoice[] = []

  if (isDnsStage(stage)) {
    choices.push({
      id: makeBranchId(stage, 'dns-failure'),
      stageId: stage.id,
      kind: 'dns-failure',
      label: 'DNS failure',
      title: 'Branch: DNS fails before TCP starts',
      whatChanges:
        'The browser cannot translate the domain name into an IP address, so the journey stops before any server connection begins.',
      userSees:
        'The user sees a loading delay or a browser error such as DNS_PROBE_FINISHED_NXDOMAIN / name not resolved.',
      networkEvidence:
        'A capture should show DNS queries and failed/empty answers, but no TCP/443, no TLS and no HTTP for the target site.',
      nextDiagnosticStep:
        'Check resolver configuration, DNS response code, search suffixes, VPN/DNS filtering and whether the domain exists.',
      diagnosticPath: buildDnsFailureBranchPath(stage.id).steps,
    })
  }

  if (isTcpStage(stage)) {
    choices.push({
      id: makeBranchId(stage, 'tcp-blocked'),
      stageId: stage.id,
      kind: 'tcp-blocked',
      label: 'TCP blocked',
      title: 'Branch: TCP cannot establish a session',
      whatChanges:
        'Name resolution may already be done, but the SYN/SYN-ACK/ACK path does not complete, so TLS and HTTP cannot start.',
      userSees:
        'The page keeps loading and eventually times out, or the browser reports that the site cannot be reached.',
      networkEvidence:
        'A capture may show repeated SYN packets, resets or no reply from the destination port, with no TLS handshake afterward.',
      nextDiagnosticStep:
        'Check firewall rules, NAT state, routing, destination port availability and whether another middlebox is dropping traffic.',
    })
  }

  if (isTlsStage(stage)) {
    choices.push({
      id: makeBranchId(stage, 'tls-failure'),
      stageId: stage.id,
      kind: 'tls-failure',
      label: 'TLS failure',
      title: 'Branch: TLS handshake fails',
      whatChanges:
        'TCP exists, but the secure tunnel cannot be negotiated, so the browser never reaches a valid HTTPS exchange.',
      userSees:
        'The user may see a certificate warning, protocol error or connection security failure.',
      networkEvidence:
        'A capture can show TCP plus TLS ClientHello/alerts, but no readable HTTP request and no successful encrypted session.',
      nextDiagnosticStep:
        'Check certificate chain, SNI, protocol versions, cipher support, TLS alerts and proxy/TLS inspection behavior.',
    })
  }

  if (isHttpApplicationStage(stage)) {
    choices.push({
      id: makeBranchId(stage, 'http-error'),
      stageId: stage.id,
      kind: 'http-error',
      label: 'HTTP error',
      title: 'Branch: application responds with an error',
      whatChanges:
        'DNS, TCP and TLS may all work, but the application layer returns an error instead of the expected content.',
      userSees:
        'The user sees a server error page, empty response, redirect loop, 404/500-style error or broken application state.',
      networkEvidence:
        'In plaintext HTTP this may be visible directly. In HTTPS the packet capture proves the connection, but not the decrypted HTTP content.',
      nextDiagnosticStep:
        'Check server logs, reverse proxy status, HTTP status code, route mapping, application health and upstream dependencies.',
    })
  }

  return choices
}

export function buildBranchJourneyChoiceCatalog(
  scenario: JourneyScenario,
): BranchJourneyChoice[] {
  return scenario.stages.flatMap((stage) =>
    buildBranchJourneyChoicesForStage(scenario, stage),
  )
}

export function findBranchJourneyChoice(
  scenario: JourneyScenario,
  branchChoiceId: string | null,
): BranchJourneyChoice | null {
  if (!branchChoiceId) return null

  return (
    buildBranchJourneyChoiceCatalog(scenario).find(
      (choice) => choice.id === branchChoiceId,
    ) ?? null
  )
}
