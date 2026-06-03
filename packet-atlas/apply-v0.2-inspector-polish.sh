set -euo pipefail

echo "🧭 Applying Packet Atlas v0.2 — Inspector Polish..."

mkdir -p patches/backups

cp src/features/packet-atlas/inspector/PacketInspector.tsx patches/backups/PacketInspector.v0.1.tsx
cp src/features/packet-atlas/packetAtlas.css patches/backups/packetAtlas.v0.1.css

cat > src/features/packet-atlas/inspector/PacketInspector.tsx <<'TSX'
import type {
  JourneyStage,
  LayerLens,
} from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  stage: JourneyStage
}

const lenses: Array<{ id: LayerLens; label: string; icon: string }> = [
  { id: 'human', label: 'Human', icon: '👤' },
  { id: 'application', label: 'App/HTTP', icon: '🌐' },
  { id: 'tls', label: 'TLS', icon: '🔐' },
  { id: 'transport', label: 'TCP/UDP', icon: '🚚' },
  { id: 'network', label: 'IP', icon: '🧭' },
  { id: 'link', label: 'Ethernet', icon: '🔌' },
  { id: 'physical', label: 'Bits/Signal', icon: '〰️' },
]

const lensLabels: Record<LayerLens, string> = {
  human: 'Human view',
  application: 'Application / HTTP view',
  tls: 'TLS security view',
  transport: 'Transport view',
  network: 'Network / IP view',
  link: 'Link-layer view',
  physical: 'Physical signal view',
}

function getProjection(stage: JourneyStage, lens: LayerLens) {
  if (lens === 'human') return stage.representations.human
  if (lens === 'application') return stage.representations.http
  if (lens === 'tls') return stage.representations.tls
  if (lens === 'transport') return stage.representations.tcp
  if (lens === 'network') return stage.representations.ip
  if (lens === 'link') return stage.representations.ethernet
  return stage.representations.bits ?? stage.representations.signal
}

function stringifyValue(value: unknown) {
  if (value === undefined || value === null || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function ProjectionSummary({
  projection,
  lens,
}: {
  projection: Record<string, unknown> | undefined
  lens: LayerLens
}) {
  if (!projection) {
    return (
      <div className="projection-empty">
        <strong>{lensLabels[lens]}</strong>
        <p>
          Ten etap nie ma jeszcze osobnej projekcji dla tej lupy. To nie błąd —
          po prostu ta warstwa nie jest tutaj głównym bohaterem.
        </p>
      </div>
    )
  }

  return (
    <div className="projection-summary">
      <div className="projection-summary__title">
        <span>🔎</span>
        <strong>{lensLabels[lens]}</strong>
      </div>

      <div className="projection-summary__grid">
        {Object.entries(projection).map(([key, value]) => (
          <div key={key} className="projection-field">
            <span>{key}</span>
            <strong>{stringifyValue(value)}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddressPanel({ stage }: { stage: JourneyStage }) {
  const addresses = stage.addresses

  if (!addresses) {
    return (
      <section className="mini-panel">
        <div className="mini-panel__heading">📍 Addresses / ports</div>
        <p className="muted-tight">
          Ten etap nie ma jeszcze konkretnych adresów. To normalne dla etapów
          czysto aplikacyjnych albo ludzkich.
        </p>
      </section>
    )
  }

  const rows = [
    ['Source MAC', addresses.srcMac],
    ['Destination MAC', addresses.dstMac],
    ['Source IP', addresses.srcIp],
    ['Destination IP', addresses.dstIp],
    ['Source port', addresses.srcPort],
    ['Destination port', addresses.dstPort],
    ['NAT source IP', addresses.natSrcIp],
    ['NAT source port', addresses.natSrcPort],
  ] as const

  return (
    <section className="mini-panel">
      <div className="mini-panel__heading">📍 Addresses / ports</div>
      <div className="address-grid">
        {rows.map(([label, value]) => (
          <div key={label} className={value ? 'address-row' : 'address-row address-row--empty'}>
            <span>{label}</span>
            <strong>{stringifyValue(value)}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function VisibilityPanel({ stage }: { stage: JourneyStage }) {
  const cards = [
    {
      title: '👤 User',
      text: stage.copy.whatUserSees,
    },
    {
      title: '🧠 System reality',
      text: stage.copy.whatReallyHappens,
    },
    {
      title: '🔭 Active lens',
      text: stage.copy.whichLayerLooksAtIt,
    },
    {
      title: '🧩 Same payload',
      text: stage.copy.samePayloadHereLooksLike,
    },
  ]

  return (
    <section className="visibility-panel">
      {cards.map((card) => (
        <article key={card.title} className="visibility-card">
          <strong>{card.title}</strong>
          <p>{card.text}</p>
        </article>
      ))}
    </section>
  )
}

function StageMeta({ stage }: { stage: JourneyStage }) {
  return (
    <section className="stage-meta">
      <div>
        <span>Direction</span>
        <strong>{stage.direction}</strong>
      </div>
      <div>
        <span>Stage kind</span>
        <strong>{stage.stageKind}</strong>
      </div>
      <div>
        <span>Device role</span>
        <strong>{stage.device.role}</strong>
      </div>
      <div>
        <span>Payload ref</span>
        <strong>{stage.payloadRef}</strong>
      </div>
    </section>
  )
}

export function PacketInspector({ stage }: Props) {
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const setSelectedLayerLens = useAtlasStore((state) => state.setSelectedLayerLens)

  const projection = getProjection(stage, selectedLayerLens)

  return (
    <section className="packet-inspector packet-inspector--v02">
      <div className="panel-heading">
        <span>Packet Inspector</span>
        <small>{stage.shortName}</small>
      </div>

      <div className="lens-tabs" aria-label="Layer lens selector">
        {lenses.map((lens) => (
          <button
            key={lens.id}
            className={
              selectedLayerLens === lens.id
                ? 'lens-tab lens-tab--active'
                : 'lens-tab'
            }
            onClick={() => setSelectedLayerLens(lens.id)}
          >
            <span>{lens.icon}</span>
            {lens.label}
          </button>
        ))}
      </div>

      <div className="inspector-hero">
        <div>
          <p className="inspector-hero__eyebrow">Current stage</p>
          <h2>{stage.shortName}</h2>
          <p>{stage.copy.whatReallyHappens}</p>
        </div>
      </div>

      <StageMeta stage={stage} />

      <ProjectionSummary
        projection={projection as Record<string, unknown> | undefined}
        lens={selectedLayerLens}
      />

      <AddressPanel stage={stage} />

      <VisibilityPanel stage={stage} />

      <div className="teaching-grid teaching-grid--v02">
        <div>
          <strong>⚠️ Easy to confuse</strong>
          <p>{stage.copy.easyToConfuse}</p>
        </div>
        <div>
          <strong>🎯 Why it matters</strong>
          <p>{stage.copy.whyItMatters}</p>
        </div>
        <div className="teaching-grid__wide">
          <strong>🖼️ Analogy</strong>
          <p>{stage.copy.analogy}</p>
        </div>
      </div>

      <details className="raw-details">
        <summary>Raw projection JSON</summary>
        {projection ? (
          <pre>{JSON.stringify(projection, null, 2)}</pre>
        ) : (
          <p className="muted-tight">No raw projection for this lens.</p>
        )}
      </details>
    </section>
  )
}
TSX

python3 <<'PY'
from pathlib import Path

path = Path("src/features/packet-atlas/PacketAtlasPage.tsx")
text = path.read_text()
text = text.replace("Packet Atlas v0.1", "Packet Atlas v0.2")
path.write_text(text)

css_path = Path("src/features/packet-atlas/packetAtlas.css")
css = css_path.read_text()

marker_start = "/* === Packet Atlas v0.2 Inspector Polish START === */"
marker_end = "/* === Packet Atlas v0.2 Inspector Polish END === */"

if marker_start in css and marker_end in css:
    before = css.split(marker_start)[0].rstrip()
    after = css.split(marker_end, 1)[1].lstrip()
    css = before + "\n\n" + after

v02_css = r'''
/* === Packet Atlas v0.2 Inspector Polish START === */

.packet-inspector--v02 {
  overflow: hidden;
}

.inspector-hero {
  margin: 12px 16px;
  border: 1px solid #1e293b;
  border-radius: 18px;
  padding: 16px;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.13), transparent 18rem),
    rgba(2, 6, 23, 0.62);
}

.inspector-hero__eyebrow {
  margin: 0 0 4px;
  color: #38bdf8;
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.inspector-hero h2 {
  margin: 0 0 8px;
  font-size: 1.45rem;
}

.inspector-hero p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.55;
}

.stage-meta {
  margin: 0 16px 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.stage-meta div {
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 10px;
  background: rgba(2, 6, 23, 0.5);
  min-width: 0;
}

.stage-meta span {
  display: block;
  color: #94a3b8;
  font-size: 0.74rem;
  margin-bottom: 4px;
}

.stage-meta strong {
  display: block;
  color: #e5e7eb;
  overflow-wrap: anywhere;
  font-size: 0.88rem;
}

.projection-summary,
.projection-empty,
.mini-panel {
  margin: 12px 16px;
  border: 1px solid #1e293b;
  border-radius: 18px;
  background: rgba(2, 6, 23, 0.55);
  overflow: hidden;
}

.projection-summary__title,
.mini-panel__heading {
  padding: 12px 14px;
  border-bottom: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.8);
  color: #bae6fd;
  font-weight: 900;
  display: flex;
  gap: 8px;
  align-items: center;
}

.projection-summary__grid {
  display: grid;
  gap: 8px;
  padding: 12px;
}

.projection-field {
  display: grid;
  gap: 4px;
  border: 1px solid #1e293b;
  border-radius: 13px;
  padding: 10px;
  background: rgba(15, 23, 42, 0.62);
}

.projection-field span {
  color: #38bdf8;
  font-size: 0.76rem;
  font-weight: 800;
}

.projection-field strong {
  color: #a7f3d0;
  font-size: 0.88rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.projection-empty {
  padding: 14px;
}

.projection-empty strong {
  color: #bae6fd;
}

.projection-empty p {
  color: #cbd5e1;
  line-height: 1.5;
  margin: 8px 0 0;
}

.address-grid {
  display: grid;
  gap: 6px;
  padding: 12px;
}

.address-row {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid #1e293b;
}

.address-row span {
  color: #94a3b8;
  font-size: 0.78rem;
}

.address-row strong {
  color: #e5e7eb;
  overflow-wrap: anywhere;
  font-size: 0.86rem;
}

.address-row--empty {
  opacity: 0.45;
}

.visibility-panel {
  margin: 12px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.visibility-card {
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.62);
}

.visibility-card strong {
  color: #f8fafc;
}

.visibility-card p {
  margin: 7px 0 0;
  color: #cbd5e1;
  line-height: 1.45;
  font-size: 0.9rem;
}

.teaching-grid--v02 {
  margin-top: 12px;
}

.raw-details {
  margin: 14px 16px 0;
  border: 1px solid #1e293b;
  border-radius: 16px;
  background: #020617;
  overflow: hidden;
}

.raw-details summary {
  cursor: pointer;
  padding: 12px 14px;
  color: #bae6fd;
  font-weight: 900;
  background: rgba(15, 23, 42, 0.8);
}

.raw-details pre {
  max-width: 100%;
  overflow-x: auto;
  margin: 0;
  padding: 14px;
  color: #a7f3d0;
  font-size: 0.82rem;
  line-height: 1.45;
}

.muted-tight {
  margin: 0;
  padding: 12px;
  color: #94a3b8;
  line-height: 1.45;
}

@media (max-width: 540px) {
  .stage-meta,
  .visibility-panel {
    grid-template-columns: 1fr;
  }

  .address-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

/* === Packet Atlas v0.2 Inspector Polish END === */
'''

css = css.rstrip() + "\n\n" + v02_css.lstrip()
css_path.write_text(css)
PY

cat > tests/unit/scenarioIntegrity.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('scenario integrity', () => {
  it('uses existing payload references in every stage', () => {
    const payloadIds = new Set(
      httpsExampleScenario.payloads.map((payload) => payload.id),
    )

    for (const stage of httpsExampleScenario.stages) {
      expect(payloadIds.has(stage.payloadRef)).toBe(true)
    }
  })

  it('starts as request and ends as response', () => {
    expect(httpsExampleScenario.stages[0].direction).toBe('request')
    expect(
      httpsExampleScenario.stages[httpsExampleScenario.stages.length - 1]
        .direction,
    ).toBe('response')
  })
})
TS

echo "✅ v0.2 applied."
echo "🧪 Now run: npm run build && npm test"
