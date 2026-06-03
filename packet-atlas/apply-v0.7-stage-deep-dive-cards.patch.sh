#!/usr/bin/env bash
set -euo pipefail

echo "🧭 Applying Packet Atlas v0.7 — Stage Deep Dive Cards..."

if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo "❌ Run this script from the inner app folder: /workspaces/packet-atlas/packet-atlas"
  echo "   I need to see package.json and src/features/packet-atlas here."
  exit 1
fi

mkdir -p patches/backups
mkdir -p src/features/packet-atlas/deep-dive
mkdir -p tests/unit

cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/PacketAtlasPage.v0.6.tsx 2>/dev/null || true
cp src/features/packet-atlas/packetAtlas.css patches/backups/packetAtlas.v0.6.css 2>/dev/null || true

cat > src/features/packet-atlas/deep-dive/StageDeepDiveCards.tsx <<'TSX'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
}

type WrapperLevel = {
  key: string
  title: string
  emoji: string
  description: string
  active: boolean
}

const lensNames = {
  human: 'Human',
  application: 'Application / HTTP',
  tls: 'TLS',
  transport: 'Transport',
  network: 'Network / IP',
  link: 'Link',
  physical: 'Physical',
} as const

function getWrapperLevels(stage: JourneyStage): WrapperLevel[] {
  const representations = stage.representations

  return [
    {
      key: 'human',
      emoji: '👤',
      title: 'Human intent',
      description: 'What the user thinks is happening.',
      active: Boolean(representations.human),
    },
    {
      key: 'http',
      emoji: '🌐',
      title: 'Application meaning',
      description: 'Request, response, page, app logic or DNS question.',
      active: Boolean(representations.http),
    },
    {
      key: 'tls',
      emoji: '🔐',
      title: 'Security wrapper',
      description: 'TLS negotiation or encrypted application data.',
      active: Boolean(representations.tls),
    },
    {
      key: 'tcp',
      emoji: '🚚',
      title: 'Transport wrapper',
      description: 'Ports, flow identity, connection state and stream behavior.',
      active: Boolean(representations.tcp),
    },
    {
      key: 'ip',
      emoji: '🧭',
      title: 'Network wrapper',
      description: 'Source/destination IP, routing, TTL and NAT view.',
      active: Boolean(representations.ip),
    },
    {
      key: 'ethernet',
      emoji: '🔌',
      title: 'Local delivery wrapper',
      description: 'MAC-to-MAC delivery on a local hop or segment.',
      active: Boolean(representations.ethernet),
    },
    {
      key: 'bits',
      emoji: '〰️',
      title: 'Signal view',
      description: 'A simplified view of bits or medium-dependent signaling.',
      active: Boolean(representations.bits ?? representations.signal),
    },
  ]
}

function getAddressStory(stage: JourneyStage) {
  const addresses = stage.addresses

  if (!addresses) {
    return [
      'This stage has no concrete packet addresses yet.',
      'That usually means you are still above the network stack or inside application logic.',
    ]
  }

  const lines: string[] = []

  if (addresses.srcIp || addresses.dstIp) {
    lines.push(
      `IP view: ${addresses.srcIp ?? '—'} → ${addresses.dstIp ?? '—'}`,
    )
  }

  if (addresses.srcPort || addresses.dstPort) {
    lines.push(
      `Transport view: port ${addresses.srcPort ?? '—'} → ${addresses.dstPort ?? '—'}`,
    )
  }

  if (addresses.srcMac || addresses.dstMac) {
    lines.push(
      `Link view: ${addresses.srcMac ?? '—'} → ${addresses.dstMac ?? '—'}`,
    )
  }

  if (addresses.natSrcIp || addresses.natSrcPort) {
    lines.push(
      `After NAT: ${addresses.natSrcIp ?? '—'}:${addresses.natSrcPort ?? '—'}`,
    )
  }

  return lines.length > 0 ? lines : ['No concrete address fields for this step.']
}

function getNeighborLabels(scenario: JourneyScenario, stage: JourneyStage) {
  const byId = new Map(scenario.stages.map((item) => [item.id, item.shortName]))

  const previous = stage.relations.previousIds.map((id) => byId.get(id) ?? id)
  const next = stage.relations.nextIds.map((id) => byId.get(id) ?? id)

  return { previous, next }
}

function MiniFlowDiagram({
  previous,
  current,
  next,
}: {
  previous: string[]
  current: string
  next: string[]
}) {
  const before = previous.length > 0 ? previous.join(' / ') : 'Start'
  const after = next.length > 0 ? next.join(' / ') : 'End'

  return (
    <div className="mini-flow-diagram" aria-label="Mini stage flow">
      <div className="mini-flow-node mini-flow-node--muted">
        <span>Before</span>
        <strong>{before}</strong>
      </div>
      <div className="mini-flow-arrow">→</div>
      <div className="mini-flow-node mini-flow-node--active">
        <span>Now</span>
        <strong>{current}</strong>
      </div>
      <div className="mini-flow-arrow">→</div>
      <div className="mini-flow-node mini-flow-node--muted">
        <span>Next</span>
        <strong>{after}</strong>
      </div>
    </div>
  )
}

export function StageDeepDiveCards({ scenario, stage }: Props) {
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const setSelectedLayerLens = useAtlasStore((state) => state.setSelectedLayerLens)

  const deviceNode = scenario.topology.nodes.find(
    (node) => node.id === stage.device.nodeId,
  )
  const wrapperLevels = getWrapperLevels(stage)
  const addressStory = getAddressStory(stage)
  const { previous, next } = getNeighborLabels(scenario, stage)
  const isVisibleInLens = stage.layerFocus.includes(selectedLayerLens)

  return (
    <section className="stage-deep-dive">
      <div className="panel-heading">
        <span>Stage Deep Dive</span>
        <small>{stage.shortName}</small>
      </div>

      <div className="deep-dive-hero">
        <div>
          <p className="deep-dive-eyebrow">Learning focus</p>
          <h2>{stage.shortName}</h2>
          <p>{stage.copy.whatReallyHappens}</p>
        </div>
        <div
          className={
            isVisibleInLens
              ? 'lens-fit-badge lens-fit-badge--ok'
              : 'lens-fit-badge lens-fit-badge--warn'
          }
        >
          <span>{isVisibleInLens ? 'visible' : 'outside lens'}</span>
          <strong>{lensNames[selectedLayerLens]}</strong>
        </div>
      </div>

      {!isVisibleInLens && (
        <div className="deep-dive-warning">
          <strong>⚠️ Current stage is outside the active lens.</strong>
          <p>
            This is useful: it shows that not every layer understands every part
            of the journey. The active lens highlights where this layer actually
            participates.
          </p>
        </div>
      )}

      <MiniFlowDiagram
        previous={previous}
        current={stage.shortName}
        next={next}
      />

      <div className="deep-dive-grid">
        <article className="deep-card deep-card--primary">
          <strong>🧠 What is happening?</strong>
          <p>{stage.copy.whatReallyHappens}</p>
        </article>

        <article className="deep-card">
          <strong>👁️ What does the user see?</strong>
          <p>{stage.copy.whatUserSees}</p>
        </article>

        <article className="deep-card">
          <strong>🛰️ Who is looking?</strong>
          <p>
            {deviceNode?.label ?? stage.device.nodeId} watches this as a{' '}
            <b>{stage.device.role}</b> stage.
          </p>
        </article>

        <article className="deep-card">
          <strong>🧩 Same payload here</strong>
          <p>{stage.copy.samePayloadHereLooksLike}</p>
        </article>

        <article className="deep-card">
          <strong>⚠️ Easy trap</strong>
          <p>{stage.copy.easyToConfuse}</p>
        </article>

        <article className="deep-card">
          <strong>🎯 Why it matters</strong>
          <p>{stage.copy.whyItMatters}</p>
        </article>
      </div>

      <div className="wrapper-section">
        <div className="wrapper-section__heading">
          <strong>📦 Wrapping view</strong>
          <span>same journey, different layer wrappers</span>
        </div>

        <div className="wrapper-rail">
          {wrapperLevels.map((level) => (
            <button
              key={level.key}
              type="button"
              className={
                level.active
                  ? 'wrapper-step wrapper-step--active'
                  : 'wrapper-step'
              }
              onClick={() => {
                if (level.key === 'human') setSelectedLayerLens('human')
                if (level.key === 'http') setSelectedLayerLens('application')
                if (level.key === 'tls') setSelectedLayerLens('tls')
                if (level.key === 'tcp') setSelectedLayerLens('transport')
                if (level.key === 'ip') setSelectedLayerLens('network')
                if (level.key === 'ethernet') setSelectedLayerLens('link')
                if (level.key === 'bits') setSelectedLayerLens('physical')
              }}
            >
              <span>{level.emoji}</span>
              <strong>{level.title}</strong>
              <small>{level.description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="address-story">
        <div className="address-story__heading">📍 Address story</div>
        <ul>
          {addressStory.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="deep-analogy">
        <strong>🖼️ Memory image</strong>
        <p>{stage.copy.analogy}</p>
      </div>
    </section>
  )
}
TSX

python3 <<'PY'
from pathlib import Path
import re

page_path = Path("src/features/packet-atlas/PacketAtlasPage.tsx")
if not page_path.exists():
    raise SystemExit("❌ Missing src/features/packet-atlas/PacketAtlasPage.tsx")

text = page_path.read_text()

if "./deep-dive/StageDeepDiveCards" not in text:
    anchor = "import './packetAtlas.css'"
    if anchor not in text:
        raise SystemExit("❌ Could not find packetAtlas.css import anchor in PacketAtlasPage.tsx")
    text = text.replace(
        anchor,
        "import { StageDeepDiveCards } from './deep-dive/StageDeepDiveCards'\n" + anchor,
    )

text = re.sub(r"Packet Atlas v0\.\d+", "Packet Atlas v0.7", text)

if "<StageDeepDiveCards" not in text:
    route_timeline = "<RouteTimeline scenario={httpsExampleScenario} />"
    if route_timeline not in text:
        raise SystemExit("❌ Could not find RouteTimeline insertion point in PacketAtlasPage.tsx")
    text = text.replace(
        route_timeline,
        route_timeline + "\n          <StageDeepDiveCards scenario={httpsExampleScenario} stage={activeStage} />",
        1,
    )

if "activeStage" not in text:
    raise SystemExit("❌ PacketAtlasPage.tsx does not expose activeStage; patch cannot safely insert Deep Dive.")

page_path.write_text(text)
PY

python3 <<'PY'
from pathlib import Path

css_path = Path("src/features/packet-atlas/packetAtlas.css")
if not css_path.exists():
    raise SystemExit("❌ Missing src/features/packet-atlas/packetAtlas.css")

css = css_path.read_text()
marker_start = "/* === Packet Atlas v0.7 Stage Deep Dive START === */"
marker_end = "/* === Packet Atlas v0.7 Stage Deep Dive END === */"

if marker_start in css and marker_end in css:
    before = css.split(marker_start)[0].rstrip()
    after = css.split(marker_end, 1)[1].lstrip()
    css = before + "\n\n" + after

v07_css = r'''
/* === Packet Atlas v0.7 Stage Deep Dive START === */

.stage-deep-dive {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.76);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 18px 80px rgba(0, 0, 0, 0.28);
}

.deep-dive-hero {
  margin: 14px;
  border: 1px solid #1e293b;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), transparent 20rem),
    rgba(2, 6, 23, 0.56);
}

.deep-dive-eyebrow {
  margin: 0 0 6px;
  color: #38bdf8;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.deep-dive-hero h2 {
  margin: 0 0 8px;
  font-size: 1.35rem;
}

.deep-dive-hero p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.55;
}

.lens-fit-badge {
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 10px 12px;
  min-width: 155px;
  display: grid;
  gap: 3px;
  background: rgba(2, 6, 23, 0.65);
  text-align: right;
}

.lens-fit-badge span {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.68rem;
  color: #94a3b8;
  font-weight: 900;
}

.lens-fit-badge--ok {
  border-color: rgba(34, 197, 94, 0.55);
}

.lens-fit-badge--ok strong {
  color: #86efac;
}

.lens-fit-badge--warn {
  border-color: rgba(245, 158, 11, 0.6);
}

.lens-fit-badge--warn strong {
  color: #fcd34d;
}

.deep-dive-warning {
  margin: 0 14px 14px;
  border: 1px solid rgba(245, 158, 11, 0.5);
  background: rgba(120, 53, 15, 0.24);
  border-radius: 16px;
  padding: 12px 14px;
}

.deep-dive-warning strong {
  color: #fcd34d;
}

.deep-dive-warning p {
  margin: 6px 0 0;
  color: #fde68a;
  line-height: 1.45;
}

.mini-flow-diagram {
  margin: 0 14px 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.15fr) auto minmax(0, 1fr);
  gap: 10px;
  align-items: stretch;
}

.mini-flow-node {
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 12px;
  background: rgba(2, 6, 23, 0.54);
  min-width: 0;
}

.mini-flow-node span {
  display: block;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.68rem;
  font-weight: 900;
  margin-bottom: 5px;
}

.mini-flow-node strong {
  color: #e5e7eb;
  overflow-wrap: anywhere;
}

.mini-flow-node--active {
  border-color: #38bdf8;
  background: rgba(8, 47, 73, 0.68);
}

.mini-flow-arrow {
  align-self: center;
  color: #38bdf8;
  font-weight: 900;
}

.deep-dive-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 0 14px 14px;
}

.deep-card,
.wrapper-section,
.address-story,
.deep-analogy {
  border: 1px solid #1e293b;
  background: rgba(2, 6, 23, 0.52);
  border-radius: 16px;
}

.deep-card {
  padding: 12px;
}

.deep-card--primary {
  border-color: rgba(56, 189, 248, 0.45);
  background: rgba(8, 47, 73, 0.46);
}

.deep-card strong,
.deep-analogy strong {
  color: #f8fafc;
}

.deep-card p,
.deep-analogy p {
  color: #cbd5e1;
  line-height: 1.45;
  margin: 7px 0 0;
  font-size: 0.92rem;
}

.wrapper-section {
  margin: 0 14px 14px;
  overflow: hidden;
}

.wrapper-section__heading,
.address-story__heading {
  border-bottom: 1px solid #1e293b;
  padding: 12px 14px;
  background: rgba(15, 23, 42, 0.75);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.wrapper-section__heading strong,
.address-story__heading {
  color: #bae6fd;
  font-weight: 900;
}

.wrapper-section__heading span {
  color: #94a3b8;
  font-size: 0.82rem;
}

.wrapper-rail {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  padding: 12px;
}

.wrapper-step {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.52);
  color: #64748b;
  border-radius: 14px;
  padding: 10px;
  display: grid;
  gap: 5px;
  text-align: left;
  cursor: pointer;
  min-width: 0;
}

.wrapper-step:hover {
  border-color: #38bdf8;
}

.wrapper-step--active {
  color: #e5e7eb;
  border-color: rgba(56, 189, 248, 0.7);
  background: rgba(8, 47, 73, 0.5);
}

.wrapper-step span {
  font-size: 1.1rem;
}

.wrapper-step strong {
  font-size: 0.82rem;
  overflow-wrap: anywhere;
}

.wrapper-step small {
  color: #94a3b8;
  line-height: 1.35;
}

.address-story {
  margin: 0 14px 14px;
  overflow: hidden;
}

.address-story ul {
  margin: 0;
  padding: 12px 18px 14px 32px;
  color: #cbd5e1;
  line-height: 1.55;
}

.deep-analogy {
  margin: 0 14px 14px;
  padding: 13px 14px;
  background:
    radial-gradient(circle at top left, rgba(168, 85, 247, 0.13), transparent 18rem),
    rgba(2, 6, 23, 0.52);
}

@media (max-width: 1240px) {
  .wrapper-rail {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .deep-dive-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .deep-dive-hero {
    display: grid;
  }

  .lens-fit-badge {
    text-align: left;
  }

  .mini-flow-diagram {
    grid-template-columns: 1fr;
  }

  .mini-flow-arrow {
    display: none;
  }

  .wrapper-rail,
  .deep-dive-grid {
    grid-template-columns: 1fr;
  }
}

/* === Packet Atlas v0.7 Stage Deep Dive END === */
'''

css = css.rstrip() + "\n\n" + v07_css.lstrip()
css_path.write_text(css)
PY

cat > tests/unit/stageDeepDiveData.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('stage deep dive data', () => {
  it('has teaching copy for every stage', () => {
    for (const stage of httpsExampleScenario.stages) {
      expect(stage.copy.whatUserSees.length).toBeGreaterThan(0)
      expect(stage.copy.whatReallyHappens.length).toBeGreaterThan(0)
      expect(stage.copy.samePayloadHereLooksLike.length).toBeGreaterThan(0)
      expect(stage.copy.easyToConfuse.length).toBeGreaterThan(0)
      expect(stage.copy.whyItMatters.length).toBeGreaterThan(0)
      expect(stage.copy.analogy.length).toBeGreaterThan(0)
    }
  })

  it('keeps every stage attached to at least one layer lens', () => {
    for (const stage of httpsExampleScenario.stages) {
      expect(stage.layerFocus.length).toBeGreaterThan(0)
    }
  })
})
TS

echo "✅ v0.7 applied."
echo "🧪 Now run: npm run build && npm test"
