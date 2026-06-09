import type { BranchJourneyChoice } from './branchingJourneyModel'

export type BranchDecisionExplanation = {
  headline: string
  boundary: string
  doNotAssume: string
  evidenceRule: string
}

export function explainBranchDecision(choice: BranchJourneyChoice): BranchDecisionExplanation {
  switch (choice.kind) {
    case 'dns-failure':
      return {
        headline: 'The journey may stop before a server connection exists.',
        boundary: 'DNS is before TCP, TLS and HTTP.',
        doNotAssume: 'Do not jump to application logs before proving name resolution works.',
        evidenceRule: 'Look for DNS errors/retries and absence of TCP/443, TLS and HTTP.',
      }
    case 'tcp-blocked':
      return {
        headline: 'The name may resolve, but the transport path cannot open.',
        boundary: 'TCP is before TLS and HTTP.',
        doNotAssume: 'Do not debug certificates or HTTP status codes before the handshake exists.',
        evidenceRule: 'Look for SYN retries, resets, missing replies or blocked destination ports.',
      }
    case 'tls-failure':
      return {
        headline: 'The transport path exists, but the secure tunnel fails.',
        boundary: 'TLS sits between TCP and HTTPS application meaning.',
        doNotAssume: 'Do not expect readable HTTP if the TLS handshake did not succeed.',
        evidenceRule: 'Look for ClientHello, TLS alerts, certificate problems or protocol mismatch.',
      }
    case 'http-error':
      return {
        headline: 'The network path may work, but the application response fails.',
        boundary: 'HTTP/application errors happen after DNS, TCP and usually TLS.',
        doNotAssume: 'Do not blame DNS or routing if the evidence shows a completed app-layer exchange.',
        evidenceRule: 'Look for HTTP status, proxy/app logs or encrypted-session proof plus server-side evidence.',
      }
  }
}
