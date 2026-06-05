import fs from 'node:fs'
import path from 'node:path'

const [, , input, outputArg] = process.argv

if (!input) {
  console.error('Usage: node scripts/captures/map-fixture-to-stages.mjs <fixture.json> [mapping-output.json]')
  process.exit(1)
}

if (!fs.existsSync(input)) {
  console.error(`Fixture not found: ${input}`)
  process.exit(1)
}

const fixture = JSON.parse(fs.readFileSync(input, 'utf8'))
const output = outputArg ?? input.replace(/\.json$/, '.mapping.json')

function includes(frame, layer) {
  return (frame.protocolStack ?? []).includes(layer)
}

function port(frame, name) {
  return String(frame.summary?.[name] ?? '')
}

function suggest(frame) {
  if (includes(frame, 'arp')) {
    return { stageId: 'arp-gateway', confidence: 'high', reason: 'ARP layer present.' }
  }

  if (includes(frame, 'dns')) {
    if (port(frame, 'dstPort') === '53') {
      return { stageId: 'dns-query', confidence: 'high', reason: 'DNS frame addressed to destination port 53.' }
    }
    if (port(frame, 'srcPort') === '53') {
      return { stageId: 'dns-response', confidence: 'high', reason: 'DNS frame sourced from port 53.' }
    }
    return { stageId: 'dns-query', confidence: 'medium', reason: 'DNS layer present but direction is unclear.' }
  }

  if (includes(frame, 'tls')) {
    return { stageId: 'tls-handshake', confidence: 'medium', reason: 'TLS layer present; inspect handshake type manually.' }
  }

  if (includes(frame, 'http')) {
    return { stageId: 'http-request', confidence: 'low', reason: 'HTTP layer present; confirm request/response direction manually.' }
  }

  if (includes(frame, 'tcp') && (port(frame, 'dstPort') === '443' || port(frame, 'srcPort') === '443')) {
    return { stageId: 'tcp-handshake', confidence: 'medium', reason: 'TCP/443 frame; inspect flags manually.' }
  }

  return { stageId: null, confidence: 'none', reason: 'No safe stage suggestion.' }
}

const mappings = (fixture.frames ?? []).map((frame) => ({
  frameNumber: frame.frameNumber,
  protocolStack: frame.protocolStack ?? [],
  summary: frame.summary ?? {},
  suggestion: suggest(frame),
}))

const result = {
  fixtureId: fixture.id ?? path.basename(input),
  generatedAt: new Date().toISOString(),
  warning: 'Suggestions are heuristics. Review every mapping before attaching it to a scenario.',
  mappings,
}

fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
console.log(`✅ capture stage mapping suggestions written: ${output}`)
console.log(`⚠️ review manually before using captureRef`)
