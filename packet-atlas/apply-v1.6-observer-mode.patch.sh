#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '🧭 Applying Packet Atlas v1.6 — Observer Mode...'
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo '❌ Run this script from the inner Packet Atlas app folder.'; exit 1
fi
mkdir -p patches/backups/v1.6 src/features/packet-atlas/observer
cp src/features/packet-atlas/store/atlasStore.ts patches/backups/v1.6/atlasStore.ts 2>/dev/null || true
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v1.6/PacketAtlasPage.tsx 2>/dev/null || true
cp src/features/packet-atlas/packetAtlas.css patches/backups/v1.6/packetAtlas.css 2>/dev/null || true
cat > src/features/packet-atlas/observer/observerModel.ts <<'TS'
import type { JourneyScenario, JourneyStage, LayerLens } from '../schema/journeyScenarioSchema'

export type ObserverId = 'user' | 'browser' | 'client-os' | 'switch' | 'router' | 'dns' | 'proxy' | 'app' | 'db'
export type ObserverProfile = { id: ObserverId; icon: string; label: string; shortLabel: string; stageRoles: JourneyStage['device']['role'][]; lenses: LayerLens[]; canSee: string[]; cannotAssume: string[]; typicalEvidence: string[]; mentalModel: string }
export const observerProfiles: ObserverProfile[] = [
  { id:'user', icon:'👤', label:'User', shortLabel:'User', stageRoles:['user'], lenses:['human'], canSee:['URL text','loading/waiting state','browser error page','rendered content'], cannotAssume:['DNS packets','TCP flags','TLS records','MAC addresses'], typicalEvidence:['screenshot','reported error text','time of symptom'], mentalModel:'The user sees destination and outcome, not the roads underneath.' },
  { id:'browser', icon:'🌐', label:'Browser', shortLabel:'Browser', stageRoles:['browser'], lenses:['human','application','tls'], canSee:['URL','HTTP request/response','certificate status','render lifecycle'], cannotAssume:['switch MAC table','router NAT internals','raw PHY signal'], typicalEvidence:['DevTools Network tab','browser console','certificate details'], mentalModel:'The browser speaks web semantics and asks the OS to move bytes.' },
  { id:'client-os', icon:'💻', label:'Client OS', shortLabel:'OS', stageRoles:['os','nic'], lenses:['transport','network','link'], canSee:['sockets','ports','routes','ARP/neighbor table','local interface state'], cannotAssume:['remote app logs','reverse proxy upstream state','database result'], typicalEvidence:['ip route','ip neigh','ss','tcpdump'], mentalModel:'The OS turns application wishes into network actions.' },
  { id:'switch', icon:'🔀', label:'LAN Switch', shortLabel:'Switch', stageRoles:['switch'], lenses:['link','physical'], canSee:['source MAC','destination MAC','ingress/egress port','VLAN/local segment'], cannotAssume:['HTTP path','TLS content','website URL','database result'], typicalEvidence:['MAC table','port counters','VLAN config'], mentalModel:'The switch moves frames between local doors.' },
  { id:'router', icon:'🧭', label:'Router / NAT / Firewall', shortLabel:'Router', stageRoles:['router','firewall'], lenses:['transport','network'], canSee:['IP addresses','ports','NAT mapping','routing decision'], cannotAssume:['plain HTTPS body','browser DOM','backend DB rows'], typicalEvidence:['routing table','NAT state','firewall logs','conntrack'], mentalModel:'The router forwards by address and may rewrite the return label.' },
  { id:'dns', icon:'📇', label:'DNS Resolver', shortLabel:'DNS', stageRoles:['dns'], lenses:['application','transport','network'], canSee:['queried name','record type','DNS answer'], cannotAssume:['whether TCP/TLS/HTTP later succeeds','page content'], typicalEvidence:['resolver logs','dig output','DNS response code'], mentalModel:'DNS is a phonebook: it gives an address, not the website.' },
  { id:'proxy', icon:'🚪', label:'Reverse Proxy', shortLabel:'Proxy', stageRoles:['proxy'], lenses:['application','tls','transport','network'], canSee:['client connection','TLS termination','HTTP after decrypt','upstream target','status code'], cannotAssume:['user screen','switch-only failures','DB internals unless logged'], typicalEvidence:['access log','error log','TLS config','upstream timing'], mentalModel:'The proxy is the front door routing traffic inside.' },
  { id:'app', icon:'⚙️', label:'Application Server', shortLabel:'App', stageRoles:['app'], lenses:['application'], canSee:['route handler','request context','business logic','dependency calls'], cannotAssume:['client ARP table','switch flooding','raw TLS handshake'], typicalEvidence:['application logs','trace id','exception stack'], mentalModel:'The app decides what answer should be produced.' },
  { id:'db', icon:'🗄️', label:'Database', shortLabel:'DB', stageRoles:['db'], lenses:['application'], canSee:['query text/plan','locks','rows touched','DB errors'], cannotAssume:['browser URL bar','DNS answer','TCP handshake'], typicalEvidence:['query log','slow query log','DB metrics'], mentalModel:'The DB sees data requests, not the whole Internet path.' },
]
export function getObserverProfile(id: string): ObserverProfile { return observerProfiles.find(o => o.id === id) ?? observerProfiles[0] }
export function stageMatchesObserver(stage: JourneyStage, observerId: string): boolean { const o=getObserverProfile(observerId); return o.stageRoles.includes(stage.device.role) || o.lenses.some(l => stage.layerFocus.includes(l)) }
export function getObserverStageIds(scenario: JourneyScenario, observerId: string): string[] { return scenario.stages.filter(s => stageMatchesObserver(s, observerId)).map(s => s.id) }
TS
cat > src/features/packet-atlas/observer/ObserverModePanel.tsx <<'TSX'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { getObserverProfile, getObserverStageIds, observerProfiles, stageMatchesObserver } from './observerModel'

type Props = { scenario: JourneyScenario; stage: JourneyScenario['stages'][number] }
export function ObserverModePanel({ scenario, stage }: Props) {
  const selectedObserverId = useAtlasStore((s) => s.selectedObserverId)
  const setSelectedObserverId = useAtlasStore((s) => s.setSelectedObserverId)
  const setSelectedStageId = useAtlasStore((s) => s.setSelectedStageId)
  const observer = getObserverProfile(selectedObserverId)
  const visibleStageIds = getObserverStageIds(scenario, selectedObserverId)
  const currentVisible = stageMatchesObserver(stage, selectedObserverId)
  return <section className="observer-mode-panel">
    <div className="observer-mode__topline"><div><p className="observer-mode__eyebrow">Observer Mode</p><h2><span>{observer.icon}</span> {observer.label}</h2><p>{observer.mentalModel}</p></div><div className={currentVisible ? 'observer-mode__status' : 'observer-mode__status observer-mode__status--outside'}><strong>{visibleStageIds.length}/{scenario.stages.length}</strong><span>{currentVisible ? 'current stage visible' : 'current stage outside observer view'}</span></div></div>
    <div className="observer-switcher">{observerProfiles.map((item) => <button key={item.id} className={item.id === selectedObserverId ? 'observer-chip observer-chip--active' : 'observer-chip'} onClick={() => setSelectedObserverId(item.id)}><span>{item.icon}</span>{item.shortLabel}</button>)}</div>
    <div className="observer-mode__grid"><article className="observer-card observer-card--can"><strong>👁️ Can see</strong><ul>{observer.canSee.map(i => <li key={i}>{i}</li>)}</ul></article><article className="observer-card observer-card--cannot"><strong>🚫 Cannot assume</strong><ul>{observer.cannotAssume.map(i => <li key={i}>{i}</li>)}</ul></article><article className="observer-card"><strong>🧾 Typical evidence</strong><ul>{observer.typicalEvidence.map(i => <li key={i}>{i}</li>)}</ul></article></div>
    {!currentVisible ? <div className="observer-warning"><strong>⚠️ Active stage is outside this observer’s direct view.</strong><span>Different devices do not understand the whole journey.</span></div> : null}
    <div className="observer-visible-stages"><strong>Visible stages for this observer:</strong><div>{scenario.stages.filter(c => visibleStageIds.includes(c.id)).map(c => <button key={c.id} onClick={() => setSelectedStageId(c.id)}>{c.shortName}</button>)}</div></div>
  </section>
}
TSX
python3 <<'PY'
from pathlib import Path
import re
store=Path('src/features/packet-atlas/store/atlasStore.ts'); text=store.read_text()
if 'selectedObserverId' not in text:
    text=text.replace('type AtlasState = {', "type AtlasState = {\n  selectedObserverId: string")
    text=text.replace('setSelectedVariantId: (variantId: string) => void','setSelectedVariantId: (variantId: string) => void\n  setSelectedObserverId: (observerId: string) => void')
    text=text.replace("selectedVariantId: 'happy-path',", "selectedVariantId: 'happy-path',\n  selectedObserverId: 'user',")
    text=text.replace('setSelectedVariantId: (variantId) => set({ selectedVariantId: variantId }),','setSelectedVariantId: (variantId) => set({ selectedVariantId: variantId }),\n  setSelectedObserverId: (observerId) => set({ selectedObserverId: observerId }),')
    store.write_text(text)
page=Path('src/features/packet-atlas/PacketAtlasPage.tsx'); text=page.read_text()
if "./observer/ObserverModePanel" not in text:
    lines=text.splitlines(); pos=max(i for i,l in enumerate(lines) if l.startswith('import '))+1; lines.insert(pos, "import { ObserverModePanel } from './observer/ObserverModePanel'"); text='\n'.join(lines)+'\n'
text=re.sub(r'Packet Atlas v[0-9.]+','Packet Atlas v1.6',text)
comp='<ObserverModePanel scenario={httpsExampleScenario} stage={activeStage} />'
if comp not in text:
    anchor='<ScenarioVariantPanel scenario={httpsExampleScenario} />'
    text=text.replace(anchor, anchor+'\n\n      '+comp) if anchor in text else text.replace('<AssumptionBar scenario={httpsExampleScenario} />','<AssumptionBar scenario={httpsExampleScenario} />\n\n      '+comp)
page.write_text(text)
cssp=Path('src/features/packet-atlas/packetAtlas.css'); css=cssp.read_text()
if '/* === Packet Atlas v1.6 Observer Mode START === */' not in css:
    css += r'''
/* === Packet Atlas v1.6 Observer Mode START === */
.observer-mode-panel{border:1px solid #1e293b;background:rgba(15,23,42,.76);border-radius:22px;padding:16px;margin-bottom:18px;box-shadow:0 18px 80px rgba(0,0,0,.22)}
.observer-mode__topline{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:16px;align-items:start;margin-bottom:12px}.observer-mode__eyebrow{margin:0 0 5px;color:#38bdf8;font-weight:900;letter-spacing:.12em;text-transform:uppercase;font-size:.76rem}.observer-mode__topline h2{margin:0 0 8px}.observer-mode__topline p{margin:0;color:#cbd5e1;line-height:1.5}.observer-mode__status{border:1px solid rgba(34,197,94,.48);border-radius:18px;padding:12px;background:rgba(20,83,45,.18);display:grid;gap:4px}.observer-mode__status--outside{border-color:rgba(251,191,36,.55);background:rgba(113,63,18,.2)}.observer-mode__status strong{color:#f8fafc;font-size:1.2rem}.observer-mode__status span{color:#cbd5e1}.observer-switcher{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.observer-chip{border:1px solid #334155;background:rgba(2,6,23,.6);color:#e5e7eb;border-radius:999px;padding:8px 11px;cursor:pointer;font-weight:900;display:inline-flex;align-items:center;gap:7px}.observer-chip:hover,.observer-chip--active{border-color:#38bdf8;background:#082f49}.observer-mode__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}.observer-card{border:1px solid #1e293b;background:rgba(2,6,23,.52);border-radius:16px;padding:12px}.observer-card--can{border-color:rgba(34,197,94,.35)}.observer-card--cannot{border-color:rgba(248,113,113,.35)}.observer-card ul{margin:8px 0 0;padding-left:18px;color:#cbd5e1;line-height:1.45}.observer-warning{border:1px solid rgba(251,191,36,.6);background:rgba(113,63,18,.24);border-radius:16px;padding:12px;margin-bottom:12px;display:grid;gap:4px}.observer-visible-stages{border:1px solid #1e293b;border-radius:16px;padding:12px;background:rgba(2,6,23,.42)}.observer-visible-stages div{display:flex;flex-wrap:wrap;gap:8px;margin-top:9px}.observer-visible-stages button{border:1px solid #334155;background:rgba(15,23,42,.75);color:#bae6fd;border-radius:999px;padding:7px 10px;cursor:pointer;font-weight:900}.observer-visible-stages button:hover{border-color:#38bdf8}@media(max-width:950px){.observer-mode__topline,.observer-mode__grid{grid-template-columns:1fr}}
/* === Packet Atlas v1.6 Observer Mode END === */
'''
    cssp.write_text(css)
PY
cat > tests/unit/observerModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getObserverStageIds, stageMatchesObserver } from '../../src/features/packet-atlas/observer/observerModel'
describe('observer model', () => {
  it('shows user stages for the user observer', () => { const ids=getObserverStageIds(httpsExampleScenario,'user'); expect(ids).toContain('url-intent'); expect(ids).toContain('browser-render') })
  it('does not treat switches as HTTP observers', () => { const httpStage=httpsExampleScenario.stages.find(s=>s.id==='http-request')!; expect(stageMatchesObserver(httpStage,'switch')).toBe(false) })
})
TS
printf '%s\n' '✅ v1.6 applied — Observer Mode.'
printf '%s\n' '🧪 Now run: npm run build && npm test'
