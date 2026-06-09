export type BranchDiagnosticStep = {
  id: string
  label: string
  status: 'observed' | 'blocked' | 'not-started' | 'diagnostic'
  whatHappens: string
  userSees: string
  networkEvidence: string
  nextQuestion: string
}

export type DnsFailureBranchPath = {
  id: string
  label: string
  thesis: string
  stopReason: string
  steps: BranchDiagnosticStep[]
}

export function buildDnsFailureBranchPath(stageId: string): DnsFailureBranchPath {
  return {
    id: `${stageId}::dns-failure-path`,
    label: 'DNS failure path',
    thesis:
      'If DNS fails, the browser cannot turn the domain into an IP address, so the journey stops before TCP, TLS or HTTP.',
    stopReason:
      'The user experiences a website failure, but the server may never have been contacted.',
    steps: [
      {
        id: 'dns-query-attempted',
        label: '1. DNS query is attempted',
        status: 'observed',
        whatHappens:
          'The browser or operating system asks a resolver for the IP address of the requested domain.',
        userSees:
          'The user usually sees only a loading page. Nothing meaningful is rendered yet.',
        networkEvidence:
          'Capture can show DNS query packets from the client toward the resolver.',
        nextQuestion:
          'Did the resolver answer with a usable IP address?',
      },
      {
        id: 'dns-answer-missing',
        label: '2. DNS answer fails',
        status: 'blocked',
        whatHappens:
          'The resolver returns NXDOMAIN/SERVFAIL or does not answer before timeout.',
        userSees:
          'The browser eventually shows a name-resolution error or a generic site-not-reached message.',
        networkEvidence:
          'Capture may show DNS errors, retries or no useful answer for the domain.',
        nextQuestion:
          'Is the failure caused by typo, resolver config, VPN, filtering or upstream DNS?',
      },
      {
        id: 'tcp-never-starts',
        label: '3. TCP never starts',
        status: 'not-started',
        whatHappens:
          'Because there is no destination IP, the client cannot open a TCP session to the target service.',
        userSees:
          'The user still thinks the site is down, but no real connection to the web server exists.',
        networkEvidence:
          'There should be no TCP/443 SYN packets to the target site, no TLS handshake and no HTTP exchange.',
        nextQuestion:
          'Can we prove that TCP/443 is absent for this failed request?',
      },
      {
        id: 'diagnostic-conclusion',
        label: '4. Diagnostic conclusion',
        status: 'diagnostic',
        whatHappens:
          'The failure should be investigated at name resolution first, not at HTTP or application logs.',
        userSees:
          'The visible browser error is only a symptom; it does not prove that the web server failed.',
        networkEvidence:
          'The strongest evidence is DNS failure plus absence of later TCP/TLS/HTTP stages.',
        nextQuestion:
          'After DNS is fixed, does the normal journey continue to TCP and TLS?',
      },
    ],
  }
}

export function summarizeDnsFailureBranchPath(path: DnsFailureBranchPath) {
  return {
    totalSteps: path.steps.length,
    observed: path.steps.filter((step) => step.status === 'observed').length,
    blocked: path.steps.filter((step) => step.status === 'blocked').length,
    notStarted: path.steps.filter((step) => step.status === 'not-started').length,
    diagnostic: path.steps.filter((step) => step.status === 'diagnostic').length,
  }
}
