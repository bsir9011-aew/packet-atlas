export type ScenarioVariantSeverity = 'normal' | 'warning' | 'broken'

export type ScenarioVariant = {
  id: string
  title: string
  shortLabel: string
  severity: ScenarioVariantSeverity
  description: string
  affectedStageIds: string[]
  breakStageId?: string
  symptom: string
  userVisibleEffect: string
  networkObservable: string
  likelyRootCause: string
  diagnosticAngle: string
  packetStory: string
}

export const scenarioVariants: ScenarioVariant[] = [
  {
    id: 'happy-path',
    title: 'Baseline HTTPS flow',
    shortLabel: 'Happy path',
    severity: 'normal',
    description:
      'The frozen baseline: DNS works, gateway is reachable, TCP connects, TLS succeeds, HTTP returns 200.',
    affectedStageIds: [],
    symptom: 'The page loads successfully.',
    userVisibleEffect: 'User eventually sees the rendered page.',
    networkObservable:
      'You can observe DNS query/response, TCP handshake, TLS handshake, HTTP request/response and return traffic.',
    likelyRootCause: 'No failure. This is the reference trace.',
    diagnosticAngle:
      'Use this as the mental baseline before comparing failure variants.',
    packetStory:
      'Every layer gets its turn: name resolution, local delivery, routing, transport, security and application response.',
  },
  {
    id: 'dns-failure',
    title: 'DNS failure',
    shortLabel: 'DNS fails',
    severity: 'broken',
    description:
      'The client cannot resolve example.com, so the journey never reaches TCP/TLS/HTTP.',
    affectedStageIds: ['dns-query', 'dns-response'],
    breakStageId: 'dns-response',
    symptom: 'Browser reports a name resolution error or keeps waiting before any connection to the website.',
    userVisibleEffect:
      'The user typed a correct-looking URL, but the browser cannot find where the site lives.',
    networkObservable:
      'DNS query exists, but the response is missing, delayed, refused, NXDOMAIN or points to an unexpected address.',
    likelyRootCause:
      'Resolver unreachable, wrong DNS server, broken record, captive portal, filtering, or local DNS cache issue.',
    diagnosticAngle:
      'Look for UDP/TCP 53 traffic, resolver reachability and whether an answer for example.com returns.',
    packetStory:
      'The journey stops at the phonebook step: no address means no TCP call, no TLS locks and no HTTP letter.',
  },
  {
    id: 'no-arp-gateway',
    title: 'Gateway MAC not learned',
    shortLabel: 'ARP fails',
    severity: 'broken',
    description:
      'The host knows it must send traffic to the default gateway, but cannot learn the gateway MAC address.',
    affectedStageIds: ['arp-gateway', 'lan-frame'],
    breakStageId: 'arp-gateway',
    symptom: 'Everything outside the local host appears unreachable.',
    userVisibleEffect:
      'The browser waits or fails, but the real issue is below DNS/TCP/HTTP.',
    networkObservable:
      'Repeated ARP who-has requests with no useful reply, or wrong MAC information in the neighbor table.',
    likelyRootCause:
      'Gateway down, VLAN mismatch, cable/Wi‑Fi issue, wrong subnet mask, duplicate IP or local L2 filtering.',
    diagnosticAngle:
      'Check ARP/neighbor table, default gateway, switch/VLAN and whether local L2 delivery works.',
    packetStory:
      'The host has a destination plan, but cannot find the local door to leave the LAN.',
  },
  {
    id: 'tcp-blocked',
    title: 'TCP 443 blocked',
    shortLabel: 'TCP blocked',
    severity: 'broken',
    description:
      'DNS resolved correctly, but the TCP connection to HTTPS port 443 does not establish.',
    affectedStageIds: ['tcp-handshake', 'router-nat-dns'],
    breakStageId: 'tcp-handshake',
    symptom: 'Connection times out or is reset before TLS starts.',
    userVisibleEffect:
      'The browser may show connection timed out, refused or reset.',
    networkObservable:
      'SYN without SYN/ACK, RST reply, ICMP rejection, or firewall/NAT state denying the flow.',
    likelyRootCause:
      'Firewall rule, closed service, routing blackhole, NAT issue, upstream ACL or server not listening on 443.',
    diagnosticAngle:
      'Separate “name resolved” from “transport connected”. DNS success does not prove HTTPS reachability.',
    packetStory:
      'The address is known, but the phone call cannot be opened.',
  },
  {
    id: 'tls-failure',
    title: 'TLS handshake fails',
    shortLabel: 'TLS fails',
    severity: 'broken',
    description:
      'TCP connects, but the secure channel cannot be established.',
    affectedStageIds: ['tls-handshake', 'http-request'],
    breakStageId: 'tls-handshake',
    symptom: 'Browser reports certificate, protocol, handshake or secure connection error.',
    userVisibleEffect:
      'The user sees a security warning or the page refuses to load securely.',
    networkObservable:
      'ClientHello appears, then alert, reset, close_notify, missing server flight, or certificate-related failure.',
    likelyRootCause:
      'Certificate expired, wrong SNI, incompatible TLS version/cipher, middlebox interference, clock skew or proxy issue.',
    diagnosticAngle:
      'TCP success does not mean HTTPS success. TLS is its own negotiation above transport.',
    packetStory:
      'The phone call opened, but both sides failed to agree on locks and keys.',
  },
  {
    id: 'http-500',
    title: 'Application returns HTTP 500',
    shortLabel: 'HTTP 500',
    severity: 'warning',
    description:
      'DNS, TCP and TLS work, but the application or upstream dependency fails while preparing the response.',
    affectedStageIds: ['reverse-proxy', 'app-db', 'http-response'],
    breakStageId: 'app-db',
    symptom: 'The browser receives a server error page or API error response.',
    userVisibleEffect:
      'The site is reachable, but the requested content fails.',
    networkObservable:
      'Normal connection setup, successful TLS, HTTP request present at endpoint, response status is 500.',
    likelyRootCause:
      'Application exception, bad upstream, database error, deployment issue, reverse proxy upstream failure.',
    diagnosticAngle:
      'Do not debug DNS/TCP/TLS when the packet journey succeeded and the app returned an error.',
    packetStory:
      'The letter reached the office, but the department could not produce a valid answer.',
  },
]

export function getScenarioVariant(variantId: string): ScenarioVariant {
  return (
    scenarioVariants.find((variant) => variant.id === variantId) ??
    scenarioVariants[0]
  )
}

export function isStageAffectedByVariant(
  variantId: string,
  stageId: string,
): boolean {
  return getScenarioVariant(variantId).affectedStageIds.includes(stageId)
}
