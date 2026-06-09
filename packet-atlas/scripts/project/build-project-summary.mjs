import fs from 'node:fs'
import path from 'node:path'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const httpsPath = 'src/data/fixtures/https-basic.real.fixture.json'
const httpPath = 'src/data/fixtures/http-local.real.fixture.json'
const workflowPath = '../.github/workflows/quality.yml'
const output = 'reports/project-summary.md'

const workspaceGuide = [
  {
    label: 'Journey',
    where: 'src/features/packet-atlas/workspace/WorkspaceTabs.tsx',
    contains:
      'PathScopeFilter, LayerHighlightPanel, JourneyControls, GlobalJourneyMap, RouteTimeline, StageDeepDiveCards, RightPanelTabs',
    why: 'The clean baseline story of one request/response path.',
  },
  {
    label: 'Diagnostics',
    where: 'src/features/packet-atlas/workspace/WorkspaceTabs.tsx',
    contains:
      'ScenarioVariantPanel, FailureTraceNavigator, VariantFlowDiff, FailureVariantBuilder, NatStateTableView, StatefulFirewallView',
    why: 'Failure analysis without polluting the default journey view.',
  },
  {
    label: 'Protocols',
    where: 'src/features/packet-atlas/workspace/WorkspaceTabs.tsx',
    contains:
      'DNS / HTTP / IPv6 / Wi-Fi / TLS visibility / proxy / CDN panels plus protocol mechanics',
    why: 'Alternative protocol and environment lenses for the same journey.',
  },
  {
    label: 'Internals',
    where: 'src/features/packet-atlas/workspace/WorkspaceTabs.tsx',
    contains:
      'ObserverModePanel, DeviceVisibilityMatrix, DeviceCutawayView, PacketFieldExplorer, WiresharkFieldTree, PacketBytesHexPane',
    why: 'Microscope mode for device truth, fields and bytes.',
  },
  {
    label: 'Capture',
    where: 'src/features/packet-atlas/workspace/WorkspaceTabs.tsx',
    contains:
      'CaptureWorkspaceGuidePanel, HttpsHttpContrastPanel, real capture panels, CaptureAwareInspector, CinematicTraceMode',
    why: 'Bridge between the educational atlas and real packet evidence.',
  },
]

const qualityGates = [
  {
    name: 'Checkpoint bundle',
    command: 'npm run status:checkpoint',
    meaning: 'Generate project status + release readiness reports.',
  },
  {
    name: 'Standard verification',
    command: 'npm run verify',
    meaning:
      'Run lint, build, bundle budget, unit tests, project validation and capture/scenario quality gates.',
  },
  {
    name: 'Full verification',
    command: 'npm run verify:full',
    meaning: 'Standard verification plus Playwright E2E and visual regression.',
  },
  {
    name: 'Visual baseline refresh',
    command: 'npm run visual:update',
    meaning: 'Update local Playwright screenshots after UI changes.',
  },
  {
    name: 'Visual baseline CI parity',
    command: 'npm run visual:ci:test',
    meaning: 'Check snapshots in CI mode before pushing UI changes.',
  },
  {
    name: 'Capture contrast audit',
    command: 'npm run capture:contrast:audit',
    meaning: 'Protect the HTTPS vs HTTP teaching claim.',
  },
]

function readJson(file) {
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function stackIncludes(frame, protocol) {
  return Array.isArray(frame.protocolStack) && frame.protocolStack.includes(protocol)
}

function frameText(frame) {
  return JSON.stringify(frame.fields ?? {})
}

function readableHttp(frame) {
  const raw = frameText(frame)
  return (
    stackIncludes(frame, 'http') ||
    raw.includes('http.request.method') ||
    raw.includes('http.response.code') ||
    raw.includes('GET / HTTP') ||
    raw.includes('HTTP/1.0 200')
  )
}

function portMatch(frame, port) {
  return frame.summary?.srcPort === port || frame.summary?.dstPort === port
}

function summarize(file, fixture) {
  const frames = fixture?.frames ?? []

  return {
    file,
    id: fixture?.id ?? 'missing',
    status: fixture?.status ?? 'missing',
    frames: frames.length,
    dns: frames.filter((frame) => stackIncludes(frame, 'dns')).length,
    tcp443: frames.filter((frame) => portMatch(frame, '443')).length,
    tcp8080: frames.filter((frame) => portMatch(frame, '8080')).length,
    tls: frames.filter((frame) => stackIncludes(frame, 'tls')).length,
    readableHttp: frames.filter(readableHttp).length,
    redacted: Boolean(fixture?.redaction),
  }
}

function countFiles(directory, matcher) {
  if (!fs.existsSync(directory)) return 0
  return fs.readdirSync(directory).filter(matcher).length
}

const manifests = fs
  .readdirSync('src/features/packet-atlas/scenarios')
  .filter((file) => file.endsWith('.manifest.v2.json'))
  .map((file) => readJson(path.join('src/features/packet-atlas/scenarios', file)))

const https = summarize(httpsPath, readJson(httpsPath))
const http = summarize(httpPath, readJson(httpPath))

const unitTests = countFiles('tests/unit', (file) => file.endsWith('.test.ts'))
const e2eSpecs = countFiles('tests/e2e', (file) => file.endsWith('.spec.ts'))
const visualSpecs = countFiles('tests/visual', (file) => file.endsWith('.spec.ts'))
const visualSnapshots = countFiles(
  'tests/visual/packet-atlas.visual.spec.ts-snapshots',
  (file) => file.endsWith('.png'),
)

const rootCi = fs.existsSync(workflowPath)
const storeText = fs.readFileSync('src/features/packet-atlas/store/atlasStore.ts', 'utf8')
const cinematicExists = fs.existsSync(
  'src/features/packet-atlas/cinematic/CinematicTraceMode.tsx',
)

const guidedStateIsMissing =
  !storeText.includes('visitedStageIds') &&
  !storeText.includes('currentStageId') &&
  !storeText.includes('journeyMode') &&
  !storeText.includes('playback')

const lines = [
  `# Packet Atlas ${pkg.version} — Project Status`,
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Snapshot',
  '',
  '| Area | Current state |',
  '|---|---|',
  `| Package version | ${pkg.version} |`,
  `| UI workspaces | ${workspaceGuide.length} product workspaces: ${workspaceGuide.map((item) => item.label).join(', ')} |`,
  `| Scenario manifests | ${manifests.length}: ${manifests.map((manifest) => manifest.shortTitle).join(', ')} |`,
  `| Verified real fixtures | ${[https, http].filter((item) => item.status === 'attached').length} attached fixtures |`,
  `| Test surface | ${unitTests} unit files, ${e2eSpecs} E2E spec, ${visualSpecs} visual spec, ${visualSnapshots} visual snapshots |`,
  `| Root CI workflow | ${rootCi ? 'present' : 'missing'} |`,
  '',
  '## What exists now',
  '',
  '- A scenario-driven React/Vite/TypeScript atlas focused on one frozen request/response journey.',
  '- Five product workspaces keep the atlas separated by lens instead of dumping every panel into one screen.',
  '- The Capture workspace includes both the HTTP vs HTTPS contrast workspace and the real-capture evidence path.',
  '- Atlas Orientation, Inventory, Guided Path and Explain This Screen reduce cognitive overload without turning the product into a course.',
  '',
  '## Where to look in the repo',
  '',
  '| Workspace | Primary file | What you will find | Why it matters |',
  '|---|---|---|---|',
  ...workspaceGuide.map(
    (item) => `| ${item.label} | \`${item.where}\` | ${item.contains} | ${item.why} |`,
  ),
  '',
  '## Real evidence',
  '',
  '| Fixture | Status | Frames | DNS | TCP/443 | TCP/8080 | TLS | Readable HTTP | Redacted |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
  `| ${https.id} | ${https.status} | ${https.frames} | ${https.dns} | ${https.tcp443} | ${https.tcp8080} | ${https.tls} | ${https.readableHttp} | ${https.redacted ? 'yes' : 'no'} |`,
  `| ${http.id} | ${http.status} | ${http.frames} | ${http.dns} | ${http.tcp443} | ${http.tcp8080} | ${http.tls} | ${http.readableHttp} | ${http.redacted ? 'yes' : 'no'} |`,
  '',
  'Teaching rule:',
  '',
  '```text',
  'HTTPS shows DNS/TCP/TLS evidence without readable HTTP.',
  'Plain HTTP shows readable request/response evidence on the wire.',
  '```',
  '',
  '## Quality gates',
  '',
  '| Gate | Command | Meaning |',
  '|---|---|---|',
  ...qualityGates.map(
    (item) => `| ${item.name} | \`${item.command}\` | ${item.meaning} |`,
  ),
  '',
  '## Current design truth',
  '',
  `- Guided-flow foundation already exists${cinematicExists ? ': JourneyControls + StageDeepDiveCards + CinematicTraceMode are present.' : '.'}`,
  guidedStateIsMissing
    ? '- The missing piece is orchestration: the atlas store still tracks selected stage/lens/variant/observer, but it does not yet own guided-flow state such as visited stage history, playback mode or branch choice.'
    : '- The atlas store already contains dedicated guided-flow state.',
  '- Cinematic trace currently lives as a secondary playback tool inside the Capture workspace, not as the main narrative layer of the product.',
  '- Visual regression currently covers Journey, Diagnostics and Capture. Protocols and Internals are not yet snapshot-covered.',
  '',
  '## Next recommended milestone',
  '',
  '**v7.8 — Animated Journey Mode promotion**',
  '',
  'Build on what the repo already has. Do not create a parallel second atlas.',
  '',
  '- Promote the current playback concept into a first-class guided mode.',
  '- Keep the existing workspace model intact.',
  '- Move guided state into the store.',
  '- Reuse existing stage copy and relations instead of inventing a disconnected narrative schema first.',
  '- Let the first branch candidate be DNS failure, but only after the main guided mode has a stable home.',
  '',
  '## Technical talk track',
  '',
  '> Packet Atlas is a scenario-driven React/Vite/TypeScript web app that models one frozen network/data journey as stage data, then lets the user inspect the same journey through multiple lenses: journey map, diagnostics, protocols, internals and real capture evidence. Its strongest proof is the HTTPS versus localhost HTTP contrast: HTTPS exposes DNS/TCP/TLS without readable HTTP, while plaintext HTTP exposes readable request/response frames directly.',
]

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, lines.join('\n') + '\n')

console.log(`📘 project summary written: ${output}`)
