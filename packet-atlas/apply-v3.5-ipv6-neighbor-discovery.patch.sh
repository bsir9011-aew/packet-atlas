#!/usr/bin/env bash
set -euo pipefail

if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo "❌ Run this patch from /workspaces/packet-atlas/packet-atlas"
  exit 1
fi

echo "🌐 Applying Packet Atlas v3.5 — IPv6 Neighbor Discovery Variant..."
mkdir -p patches/backups src/features/packet-atlas/ipv6 tests/unit
[ -f src/features/packet-atlas/PacketAtlasPage.tsx ] && cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/PacketAtlasPage.before-v3.5.tsx
[ -f src/features/packet-atlas/packetAtlas.css ] && cp src/features/packet-atlas/packetAtlas.css patches/backups/packetAtlas.before-v3.5.css

cat > src/features/packet-atlas/ipv6/neighborDiscoveryModel.ts <<'TS'
export type NeighborMode = 'ipv4-arp' | 'ipv6-nd'

export type NeighborStep = {
  id: string
  title: string
  actor: string
  detail: string
  visibleScope: string
}

export const neighborDiscoveryFlows: Record<NeighborMode, NeighborStep[]> = {
  'ipv4-arp': [
    {
      id: 'arp-question',
      title: 'ARP request',
      actor: 'Client host',
      detail: 'Who has 192.168.1.1? Tell 192.168.1.10.',
      visibleScope: 'Broadcast on the local IPv4 LAN segment.',
    },
    {
      id: 'arp-answer',
      title: 'ARP reply',
      actor: 'Default gateway',
      detail: '192.168.1.1 is at 02:00:00:00:01:01.',
      visibleScope: 'Local link-layer only.',
    },
    {
      id: 'ethernet-next-hop',
      title: 'Ethernet next hop',
      actor: 'Client NIC',
      detail: 'Remote IP traffic is wrapped into a frame addressed to the gateway MAC.',
      visibleScope: 'Switch and local gateway see the frame metadata.',
    },
  ],
  'ipv6-nd': [
    {
      id: 'neighbor-solicitation',
      title: 'Neighbor Solicitation',
      actor: 'IPv6 host',
      detail: 'Who owns this IPv6 next-hop address? This uses ICMPv6, not ARP.',
      visibleScope: 'Solicited-node multicast on the local IPv6 link.',
    },
    {
      id: 'neighbor-advertisement',
      title: 'Neighbor Advertisement',
      actor: 'IPv6 neighbor / router',
      detail: 'The neighbor replies with its link-layer address.',
      visibleScope: 'Local IPv6 link-layer context.',
    },
    {
      id: 'ipv6-frame',
      title: 'Frame toward next hop',
      actor: 'Client NIC',
      detail: 'IPv6 packet is delivered to the next-hop MAC learned through Neighbor Discovery.',
      visibleScope: 'Local link only; not the whole Internet path.',
    },
  ],
}

export function getNeighborFlow(mode: NeighborMode) {
  return neighborDiscoveryFlows[mode]
}

export function getNeighborModeSummary(mode: NeighborMode) {
  if (mode === 'ipv4-arp') {
    return {
      title: 'IPv4 uses ARP in this atlas path',
      warning: 'ARP is local only. The client learns the gateway MAC, not the remote server MAC.',
      keyDifference: 'Broadcast ARP question on the local LAN.',
    }
  }

  return {
    title: 'IPv6 uses Neighbor Discovery, not ARP',
    warning: 'Do not say “IPv6 ARP”. Neighbor Discovery is ICMPv6-based.',
    keyDifference: 'Solicited-node multicast and Neighbor Solicitation/Advertisement.',
  }
}
TS

cat > src/features/packet-atlas/ipv6/Ipv6NeighborDiscoveryPanel.tsx <<'TSX'
import { useState } from 'react'
import { getNeighborFlow, getNeighborModeSummary, type NeighborMode } from './neighborDiscoveryModel'

const modes: Array<{ id: NeighborMode; label: string }> = [
  { id: 'ipv4-arp', label: 'IPv4 / ARP' },
  { id: 'ipv6-nd', label: 'IPv6 / Neighbor Discovery' },
]

export function Ipv6NeighborDiscoveryPanel() {
  const [mode, setMode] = useState<NeighborMode>('ipv4-arp')
  const summary = getNeighborModeSummary(mode)
  const flow = getNeighborFlow(mode)

  return (
    <section className="ipv6-nd-panel" aria-label="IPv6 Neighbor Discovery variant">
      <div className="ipv6-nd-panel__heading">
        <div>
          <strong>🌐 IPv4 ARP vs IPv6 Neighbor Discovery</strong>
          <p>Same atlas question: how does the host learn the local next-hop link-layer address?</p>
        </div>
      </div>

      <div className="ipv6-nd-toggle">
        {modes.map((item) => (
          <button
            key={item.id}
            className={item.id === mode ? 'ipv6-nd-chip ipv6-nd-chip--active' : 'ipv6-nd-chip'}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="ipv6-nd-summary">
        <strong>{summary.title}</strong>
        <p>{summary.keyDifference}</p>
        <span>⚠️ {summary.warning}</span>
      </div>

      <div className="ipv6-nd-flow">
        {flow.map((step, index) => (
          <article key={step.id} className="ipv6-nd-step">
            <span className="ipv6-nd-step__index">{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
              <small>{step.actor} · {step.visibleScope}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
TSX

python3 <<'PY'
from pathlib import Path
import re
page = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
text = page.read_text()
text = re.sub(r'Packet Atlas v\d+\.\d+', 'Packet Atlas v3.5', text)
if "./ipv6/Ipv6NeighborDiscoveryPanel" not in text:
    text = text.replace("import './packetAtlas.css'", "import './packetAtlas.css'\nimport { Ipv6NeighborDiscoveryPanel } from './ipv6/Ipv6NeighborDiscoveryPanel'", 1)
if '<Ipv6NeighborDiscoveryPanel />' not in text:
    if '<PathScopeFilter />' in text:
        text = text.replace('<PathScopeFilter />', '<PathScopeFilter />\n\n      <Ipv6NeighborDiscoveryPanel />', 1)
    elif '<SearchJumpPalette />' in text:
        text = text.replace('<SearchJumpPalette />', '<SearchJumpPalette />\n\n      <Ipv6NeighborDiscoveryPanel />', 1)
    elif '</header>' in text:
        text = text.replace('</header>', '</header>\n\n      <Ipv6NeighborDiscoveryPanel />', 1)
page.write_text(text)

css_path = Path('src/features/packet-atlas/packetAtlas.css')
css = css_path.read_text()
if '/* === Packet Atlas v3.5 IPv6 ND START === */' not in css:
    css += r'''

/* === Packet Atlas v3.5 IPv6 ND START === */
.ipv6-nd-panel {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.74);
  border-radius: 20px;
  padding: 14px;
  margin-bottom: 14px;
}

.ipv6-nd-panel__heading p {
  color: #94a3b8;
  margin: 6px 0 0;
}

.ipv6-nd-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.ipv6-nd-chip {
  border: 1px solid #334155;
  background: #020617;
  color: #cbd5e1;
  border-radius: 999px;
  padding: 7px 11px;
  cursor: pointer;
}

.ipv6-nd-chip:hover,
.ipv6-nd-chip--active {
  border-color: #38bdf8;
  background: #082f49;
  color: #f8fafc;
}

.ipv6-nd-summary {
  border: 1px solid #334155;
  background: rgba(2, 6, 23, 0.5);
  border-radius: 16px;
  padding: 12px;
  display: grid;
  gap: 6px;
}

.ipv6-nd-summary p {
  color: #cbd5e1;
  margin: 0;
}

.ipv6-nd-summary span {
  color: #fde68a;
}

.ipv6-nd-flow {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.ipv6-nd-step {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 12px;
  background: rgba(2, 6, 23, 0.42);
}

.ipv6-nd-step__index {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #082f49;
  color: #bae6fd;
  font-weight: 900;
}

.ipv6-nd-step p {
  margin: 5px 0;
  color: #cbd5e1;
  line-height: 1.45;
}

.ipv6-nd-step small {
  color: #94a3b8;
}
/* === Packet Atlas v3.5 IPv6 ND END === */
'''
    css_path.write_text(css)
PY

cat > tests/unit/neighborDiscoveryModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { getNeighborFlow, getNeighborModeSummary } from '../../src/features/packet-atlas/ipv6/neighborDiscoveryModel'

describe('neighbor discovery model', () => {
  it('keeps IPv4 ARP and IPv6 ND distinct', () => {
    expect(getNeighborFlow('ipv4-arp')[0].title).toContain('ARP')
    expect(getNeighborFlow('ipv6-nd')[0].title).toContain('Neighbor Solicitation')
  })

  it('warns that IPv6 does not use ARP', () => {
    expect(getNeighborModeSummary('ipv6-nd').warning.toLowerCase()).toContain('not')
    expect(getNeighborModeSummary('ipv6-nd').warning).toContain('ARP')
  })
})
TS

echo "✅ v3.5 applied — IPv6 Neighbor Discovery Variant."
echo "🧪 Now run: npm run build && npm test"
