export type GuidedScenarioMode = 'happy-path' | 'failure-path'

export type GuidedScenarioStep = {
  title: string
  story: string
  evidence: string[]
  doNotJumpTo: string
  notebook: string
}

export type GuidedScenarioPack = {
  id: string
  label: string
  mode: GuidedScenarioMode
  userSymptom: string
  firstQuestion: string
  goal: string
  steps: GuidedScenarioStep[]
  finalNotebookLine: string
}

export type GuidedScenarioQualityReport = {
  ok: boolean
  findings: { id: string; ok: boolean; message: string }[]
}

export function buildGuidedScenarioPacks(): GuidedScenarioPack[] {
  return [
    {
      id: 'https-happy-path',
      label: 'HTTPS happy path',
      mode: 'happy-path',
      userSymptom: 'The user enters a URL and the page loads successfully.',
      firstQuestion: 'What must happen before the user sees the page?',
      goal: 'Follow one complete browser journey without splitting it into separate lessons.',
      steps: [
        {
          title: 'Intent starts the journey',
          story: 'A human asks the browser for a resource; this is the start, not a packet yet.',
          evidence: ['URL entered', 'navigation starts'],
          doNotJumpTo: 'Do not start from TCP before explaining the user intent.',
          notebook: 'Intent is the human beginning of the web journey.',
        },
        {
          title: 'Name becomes destination',
          story: 'DNS gives the browser a destination it can use for the next layers.',
          evidence: ['DNS query', 'DNS answer'],
          doNotJumpTo: 'Do not debug the server before proving DNS worked.',
          notebook: 'DNS gives the journey a destination.',
        },
        {
          title: 'Transport and protection appear',
          story: 'TCP opens the conversation and TLS protects the later HTTP exchange.',
          evidence: ['TCP handshake', 'TLS handshake'],
          doNotJumpTo: 'Do not expect readable HTTP outside the TLS envelope.',
          notebook: 'TCP carries the conversation; TLS seals it.',
        },
        {
          title: 'Response becomes visible',
          story: 'The server responds and the browser turns returned data into visible content.',
          evidence: ['HTTP response evidence', 'rendered page'],
          doNotJumpTo: 'Do not stop at packet delivery; the human result is rendering.',
          notebook: 'The journey ends when the user can see the result.',
        },
      ],
      finalNotebookLine:
        'Happy path: intent -> DNS -> TCP -> TLS -> HTTP -> server work -> response -> render.',
    },
    {
      id: 'dns-failure',
      label: 'DNS failure',
      mode: 'failure-path',
      userSymptom: 'The browser cannot resolve the site name or says the site cannot be reached.',
      firstQuestion: 'Did the browser ever get a usable destination?',
      goal: 'Prove that the failure happens before TCP, TLS, HTTP or the application server matter.',
      steps: [
        {
          title: 'DNS question exists',
          story: 'The browser asks where the name should go.',
          evidence: ['DNS query'],
          doNotJumpTo: 'Do not open app logs before proving DNS works.',
          notebook: 'A DNS failure starts as a name-resolution problem.',
        },
        {
          title: 'DNS answer fails',
          story: 'NXDOMAIN, timeout or no usable answer stops the journey early.',
          evidence: ['NXDOMAIN', 'timeout', 'no usable DNS answer'],
          doNotJumpTo: 'Do not debug TLS when there is no destination.',
          notebook: 'No usable DNS answer means no transport path.',
        },
        {
          title: 'Later layers are absent',
          story: 'No TCP, TLS or HTTP is evidence that the journey stopped at DNS.',
          evidence: ['no TCP/443', 'no TLS', 'no HTTP'],
          doNotJumpTo: 'Do not blame the web server if the request never became a connection.',
          notebook: 'DNS failure is DNS evidence plus absence of later layers.',
        },
      ],
      finalNotebookLine:
        'DNS failure: DNS question exists, destination does not, so TCP/TLS/HTTP never start.',
    },
    {
      id: 'tcp-blocked',
      label: 'TCP blocked',
      mode: 'failure-path',
      userSymptom: 'The name resolves, but the connection hangs, resets or is refused.',
      firstQuestion: 'Did DNS work and did TCP open?',
      goal: 'Separate destination discovery from transport reachability.',
      steps: [
        {
          title: 'Destination is known',
          story: 'DNS can succeed while the transport path still fails.',
          evidence: ['DNS answer', 'target IP known'],
          doNotJumpTo: 'Do not treat every connection failure as DNS.',
          notebook: 'DNS success does not guarantee TCP reachability.',
        },
        {
          title: 'TCP does not open',
          story: 'The client tries to start a conversation, but the transport session fails.',
          evidence: ['SYN retries', 'RST', 'timeout', 'connection refused'],
          doNotJumpTo: 'Do not debug HTTP status without a TCP session.',
          notebook: 'TCP failure blocks TLS and HTTP before they exist.',
        },
      ],
      finalNotebookLine:
        'TCP blocked: destination known, but the transport conversation never opens.',
    },
    {
      id: 'tls-failure',
      label: 'TLS failure',
      mode: 'failure-path',
      userSymptom: 'The browser reports a certificate or secure connection problem.',
      firstQuestion: 'Did TCP open, and where did TLS fail?',
      goal: 'Show that TCP can work while the secure envelope fails before HTTP is useful.',
      steps: [
        {
          title: 'TCP exists',
          story: 'The machines can talk at transport level.',
          evidence: ['completed TCP handshake'],
          doNotJumpTo: 'Do not blame routing if TCP completed.',
          notebook: 'TLS failure begins after transport reachability is proven.',
        },
        {
          title: 'TLS breaks',
          story: 'The secure envelope cannot be established, so readable HTTP is unavailable.',
          evidence: ['TLS alert', 'certificate error', 'handshake failure'],
          doNotJumpTo: 'Do not expect an HTTP response if TLS did not complete.',
          notebook: 'TLS failure blocks the protected application conversation.',
        },
      ],
      finalNotebookLine:
        'TLS failure: TCP exists, but the secure envelope fails before trusted HTTP.',
    },
    {
      id: 'http-application-error',
      label: 'HTTP/application error',
      mode: 'failure-path',
      userSymptom: 'The page returns an error, wrong content or application failure.',
      firstQuestion: 'Did the request reach the application layer?',
      goal: 'Show that network and TLS may work while the application response still fails.',
      steps: [
        {
          title: 'Earlier layers worked',
          story: 'DNS, TCP and TLS can be healthy while the application still fails.',
          evidence: ['DNS answer', 'TCP session', 'TLS session'],
          doNotJumpTo: 'Do not blame DNS when application evidence exists.',
          notebook: 'Application errors happen after earlier layers carried the request.',
        },
        {
          title: 'Application evidence matters',
          story: 'Now the useful evidence is response status, logs, proxy behavior and app state.',
          evidence: ['HTTP status', 'proxy logs', 'app logs', 'server-side error'],
          doNotJumpTo: 'Do not stop at packet capture; application evidence may be server-side.',
          notebook: 'HTTP/application failure is a late-stage problem.',
        },
      ],
      finalNotebookLine:
        'HTTP/application error: the path may work while the application answer is wrong.',
    },
  ]
}

export function evaluateGuidedScenarioQuality(packs: GuidedScenarioPack[]): GuidedScenarioQualityReport {
  const findings = [
    {
      id: 'happy-path',
      ok: packs.some((pack) => pack.mode === 'happy-path'),
      message: 'Contains a happy path.',
    },
    {
      id: 'failure-paths',
      ok: packs.filter((pack) => pack.mode === 'failure-path').length >= 4,
      message: 'Contains DNS, TCP, TLS and application failure paths.',
    },
    {
      id: 'symptom-first',
      ok: packs.every((pack) => pack.userSymptom.length > 20),
      message: 'Every scenario starts with a user-visible symptom.',
    },
    {
      id: 'first-question',
      ok: packs.every((pack) => pack.firstQuestion.endsWith('?')),
      message: 'Every scenario has a first diagnostic question.',
    },
    {
      id: 'evidence',
      ok: packs.every((pack) => pack.steps.every((step) => step.evidence.length > 0)),
      message: 'Every step has evidence to look for.',
    },
    {
      id: 'guardrails',
      ok: packs.every((pack) => pack.steps.every((step) => step.doNotJumpTo.length > 12)),
      message: 'Every step has a do-not-jump guard.',
    },
  ]

  return {
    ok: findings.every((finding) => finding.ok),
    findings,
  }
}

export function renderGuidedScenarioPacksMarkdown(packs: GuidedScenarioPack[]): string {
  return [
    '# Packet Atlas Guided Scenario Packs',
    '',
    'Scenario packs are guided reading blueprints, not dashboard panels.',
    '',
    ...packs.flatMap((pack) => [
      `## ${pack.label}`,
      '',
      `**Mode:** ${pack.mode}`,
      '',
      `**User symptom:** ${pack.userSymptom}`,
      '',
      `**First question:** ${pack.firstQuestion}`,
      '',
      `**Goal:** ${pack.goal}`,
      '',
      ...pack.steps.flatMap((step, index) => [
        `### ${index + 1}. ${step.title}`,
        '',
        step.story,
        '',
        '**Evidence:**',
        '',
        ...step.evidence.map((item) => `- ${item}`),
        '',
        `**Do not jump to:** ${step.doNotJumpTo}`,
        '',
        `**Notebook:** ${step.notebook}`,
        '',
      ]),
      `**Final notebook line:** ${pack.finalNotebookLine}`,
      '',
    ]),
  ].join('\n')
}

export function renderGuidedScenarioQualityMarkdown(report: GuidedScenarioQualityReport): string {
  return [
    '# Guided Scenario Quality Report',
    '',
    `Status: ${report.ok ? 'READY' : 'NEEDS WORK'}`,
    '',
    ...report.findings.map((finding) => `- ${finding.ok ? '✅' : '❌'} ${finding.message}`),
    '',
  ].join('\n')
}
