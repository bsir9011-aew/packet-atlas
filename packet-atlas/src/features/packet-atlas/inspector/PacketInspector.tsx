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
