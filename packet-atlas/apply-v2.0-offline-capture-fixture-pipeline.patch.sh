#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '🧪 Applying Packet Atlas v2.0 — Offline Capture Fixture Pipeline...'
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then echo '❌ Run from inner app folder.'; exit 1; fi
mkdir -p patches/backups/v2.0 src/features/packet-atlas/captures data/captures/https-example scripts
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v2.0/PacketAtlasPage.tsx 2>/dev/null || true
cp src/features/packet-atlas/packetAtlas.css patches/backups/v2.0/packetAtlas.css 2>/dev/null || true
cp package.json patches/backups/v2.0/package.json 2>/dev/null || true
cat > data/captures/https-example/packet-fixtures.json <<'JSON'
{
  "scenarioId": "https-example-basic",
  "source": "synthetic-tshark-normalized-json",
  "note": "Educational normalized fixture. Replace with real tshark export later.",
  "frames": [
    { "stageId": "dns-query", "frameNumber": 3, "protocolStack": ["eth", "ip", "udp", "dns"], "summary": "DNS query example.com A", "fields": { "ip.src": "192.168.1.10", "ip.dst": "198.51.100.53", "udp.srcport": "53001", "udp.dstport": "53", "dns.qry.name": "example.com" } },
    { "stageId": "tcp-handshake", "frameNumber": 8, "protocolStack": ["eth", "ip", "tcp"], "summary": "TCP SYN to 203.0.113.10:443", "fields": { "ip.src": "192.168.1.10", "ip.dst": "203.0.113.10", "tcp.srcport": "51514", "tcp.dstport": "443", "tcp.flags.syn": "1" } },
    { "stageId": "tls-handshake", "frameNumber": 14, "protocolStack": ["eth", "ip", "tcp", "tls"], "summary": "TLS ClientHello with SNI example.com", "fields": { "tls.handshake.type": "client_hello", "tls.handshake.extensions_server_name": "example.com", "tcp.dstport": "443" } },
    { "stageId": "http-request", "frameNumber": 18, "protocolStack": ["eth", "ip", "tcp", "tls", "http"], "summary": "HTTP GET / inside protected channel", "fields": { "http.request.method": "GET", "http.host": "example.com", "http.request.uri": "/" } }
  ]
}
JSON
cat > src/features/packet-atlas/captures/captureFixtureModel.ts <<'TS'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
export type CaptureFrameFixture = { stageId: string; frameNumber: number; protocolStack: string[]; summary: string; fields: Record<string, string> }
export const captureFixtures: CaptureFrameFixture[] = [
  { stageId:'dns-query', frameNumber:3, protocolStack:['eth','ip','udp','dns'], summary:'DNS query example.com A', fields:{'ip.src':'192.168.1.10','ip.dst':'198.51.100.53','udp.srcport':'53001','udp.dstport':'53','dns.qry.name':'example.com'} },
  { stageId:'tcp-handshake', frameNumber:8, protocolStack:['eth','ip','tcp'], summary:'TCP SYN to 203.0.113.10:443', fields:{'ip.src':'192.168.1.10','ip.dst':'203.0.113.10','tcp.srcport':'51514','tcp.dstport':'443','tcp.flags.syn':'1'} },
  { stageId:'tls-handshake', frameNumber:14, protocolStack:['eth','ip','tcp','tls'], summary:'TLS ClientHello with SNI example.com', fields:{'tls.handshake.type':'client_hello','tls.handshake.extensions_server_name':'example.com','tcp.dstport':'443'} },
  { stageId:'http-request', frameNumber:18, protocolStack:['eth','ip','tcp','tls','http'], summary:'HTTP GET / inside protected channel', fields:{'http.request.method':'GET','http.host':'example.com','http.request.uri':'/'} },
]
export function getFixtureForStage(stageId: string): CaptureFrameFixture | null { return captureFixtures.find(f=>f.stageId===stageId) ?? null }
export function summarizeFixtureCoverage(scenario: JourneyScenario): { attached: number; missing: number; total: number } { const attached=scenario.stages.filter(s=>getFixtureForStage(s.id)).length; return {attached, missing:scenario.stages.length-attached, total:scenario.stages.length} }
export function isFixtureRelevantToStage(stage: JourneyStage): boolean { return Boolean(getFixtureForStage(stage.id)) }
TS
cat > src/features/packet-atlas/captures/CaptureFixturePanel.tsx <<'TSX'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { getFixtureForStage, summarizeFixtureCoverage } from './captureFixtureModel'
type Props = { scenario: JourneyScenario; stage: JourneyStage }
export function CaptureFixturePanel({ scenario, stage }: Props) {
  const fixture=getFixtureForStage(stage.id); const coverage=summarizeFixtureCoverage(scenario)
  return <section className="capture-fixture-panel"><div className="panel-heading"><span>Capture Fixture</span><small>{coverage.attached}/{coverage.total} stages attached</small></div><div className="capture-fixture__hero"><div><p className="capture-fixture__eyebrow">Offline pipeline</p><h3>{fixture ? `Frame ${fixture.frameNumber}: ${fixture.summary}` : 'No fixture attached to this stage yet'}</h3><p>Runtime stays lightweight. PCAP/PCAPNG should be converted offline with TShark into normalized JSON fixtures.</p></div><div className={fixture?'capture-fixture__badge':'capture-fixture__badge capture-fixture__badge--missing'}>{fixture?'fixture attached':'synthetic only'}</div></div>{fixture ? <><div className="capture-stack">{fixture.protocolStack.map(p=><span key={p}>{p}</span>)}</div><div className="capture-fields">{Object.entries(fixture.fields).map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div></> : <div className="capture-missing"><strong>🧪 Fixture missing</strong><p>This stage is still driven by the educational scenario model. Later, attach a normalized TShark frame.</p></div>}<details className="capture-pipeline-details"><summary>Suggested offline pipeline</summary><pre>{`editcap -r input.pcapng sliced.pcapng 1-30\ntshark -r sliced.pcapng -T json -x > tshark-export.json\nnode scripts/validate-capture-fixtures.mjs`}</pre></details></section>
}
TSX
cat > scripts/validate-capture-fixtures.mjs <<'JS'
import fs from 'node:fs'
import path from 'node:path'
const file = path.join(process.cwd(), 'data/captures/https-example/packet-fixtures.json')
const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
if (!raw.scenarioId || !Array.isArray(raw.frames)) throw new Error('Invalid fixture file: missing scenarioId or frames[]')
const seen = new Set()
for (const frame of raw.frames) {
  if (!frame.stageId) throw new Error('Frame missing stageId')
  if (typeof frame.frameNumber !== 'number') throw new Error(`Frame ${frame.stageId} missing numeric frameNumber`)
  if (!Array.isArray(frame.protocolStack) || frame.protocolStack.length === 0) throw new Error(`Frame ${frame.stageId} missing protocolStack`)
  if (!frame.fields || typeof frame.fields !== 'object') throw new Error(`Frame ${frame.stageId} missing fields`)
  seen.add(frame.stageId)
}
console.log(`✅ capture fixtures ok: ${raw.frames.length} frames for ${raw.scenarioId}`)
console.log(`📎 stages covered: ${Array.from(seen).join(', ')}`)
JS
python3 <<'PY'
from pathlib import Path
import json, re
pkg=Path('package.json'); data=json.loads(pkg.read_text()); data.setdefault('scripts',{})['capture:validate']='node scripts/validate-capture-fixtures.mjs'; pkg.write_text(json.dumps(data,indent=2)+'\n')
page=Path('src/features/packet-atlas/PacketAtlasPage.tsx'); text=page.read_text()
if "./captures/CaptureFixturePanel" not in text:
    lines=text.splitlines(); pos=max(i for i,l in enumerate(lines) if l.startswith('import '))+1; lines.insert(pos, "import { CaptureFixturePanel } from './captures/CaptureFixturePanel'"); text='\n'.join(lines)+'\n'
text=re.sub(r'Packet Atlas v[0-9.]+','Packet Atlas v2.0',text)
comp='<CaptureFixturePanel scenario={httpsExampleScenario} stage={activeStage} />'
if comp not in text:
    anchor='<WiresharkFieldTree stage={activeStage} />'
    text=text.replace(anchor, anchor+'\n          '+comp,1) if anchor in text else text.replace('<PacketFieldExplorer stage={activeStage} />','<PacketFieldExplorer stage={activeStage} />\n          '+comp,1)
page.write_text(text)
cssp=Path('src/features/packet-atlas/packetAtlas.css'); css=cssp.read_text()
if '/* === Packet Atlas v2.0 Capture Fixture Pipeline START === */' not in css:
    css += r'''
/* === Packet Atlas v2.0 Capture Fixture Pipeline START === */
.capture-fixture-panel{border:1px solid #1e293b;background:rgba(15,23,42,.76);border-radius:22px;overflow:hidden;margin-top:18px;box-shadow:0 18px 80px rgba(0,0,0,.22)}.capture-fixture__hero{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:16px;padding:16px;border-bottom:1px solid #1e293b;background:radial-gradient(circle at top left,rgba(34,197,94,.12),transparent 24rem),rgba(2,6,23,.38)}.capture-fixture__eyebrow{margin:0 0 6px;color:#38bdf8;font-size:.76rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.capture-fixture__hero h3{margin:0 0 8px}.capture-fixture__hero p{margin:0;color:#cbd5e1;line-height:1.45}.capture-fixture__badge{align-self:center;justify-self:end;border:1px solid rgba(34,197,94,.5);border-radius:999px;padding:10px 14px;color:#bbf7d0;font-weight:900;background:rgba(20,83,45,.18)}.capture-fixture__badge--missing{border-color:rgba(251,191,36,.55);color:#fde68a;background:rgba(113,63,18,.18)}.capture-stack{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px;border-bottom:1px solid #1e293b}.capture-stack span{border:1px solid #334155;border-radius:999px;padding:7px 10px;color:#bae6fd;font-weight:900;background:rgba(2,6,23,.55)}.capture-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;padding:14px 16px}.capture-fields div{border:1px solid #1e293b;border-radius:14px;padding:10px;background:rgba(2,6,23,.5);display:grid;gap:5px}.capture-fields span{color:#38bdf8;font-weight:900;font-size:.78rem}.capture-fields strong{color:#a7f3d0;overflow-wrap:anywhere}.capture-missing{padding:14px 16px;display:grid;gap:6px}.capture-missing p{margin:0;color:#cbd5e1}.capture-pipeline-details{margin:0 16px 16px;border:1px solid #1e293b;border-radius:16px;overflow:hidden}.capture-pipeline-details summary{cursor:pointer;padding:12px 14px;color:#bae6fd;font-weight:900;background:rgba(2,6,23,.55)}.capture-pipeline-details pre{margin:0;padding:14px;color:#a7f3d0;overflow-x:auto}@media(max-width:760px){.capture-fixture__hero{grid-template-columns:1fr}.capture-fixture__badge{justify-self:start}}
/* === Packet Atlas v2.0 Capture Fixture Pipeline END === */
'''
    cssp.write_text(css)
PY
cat > tests/unit/captureFixtureModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getFixtureForStage, summarizeFixtureCoverage } from '../../src/features/packet-atlas/captures/captureFixtureModel'
describe('capture fixture model', () => {
  it('attaches fixture to DNS query', () => { const fixture=getFixtureForStage('dns-query'); expect(fixture?.protocolStack).toContain('dns') })
  it('summarizes fixture coverage', () => { const summary=summarizeFixtureCoverage(httpsExampleScenario); expect(summary.attached).toBeGreaterThan(0); expect(summary.total).toBe(httpsExampleScenario.stages.length) })
})
TS
printf '%s\n' '✅ v2.0 applied — Offline Capture Fixture Pipeline.'
printf '%s\n' '🧪 Now run: npm run build && npm test && npm run capture:validate'
