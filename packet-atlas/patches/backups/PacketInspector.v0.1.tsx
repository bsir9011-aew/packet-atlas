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

function getProjection(stage: JourneyStage, lens: LayerLens) {
  if (lens === 'human') return stage.representations.human
  if (lens === 'application') return stage.representations.http
  if (lens === 'tls') return stage.representations.tls
  if (lens === 'transport') return stage.representations.tcp
  if (lens === 'network') return stage.representations.ip
  if (lens === 'link') return stage.representations.ethernet
  return stage.representations.bits ?? stage.representations.signal
}

export function PacketInspector({ stage }: Props) {
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const setSelectedLayerLens = useAtlasStore((state) => state.setSelectedLayerLens)

  const projection = getProjection(stage, selectedLayerLens)

  return (
    <section className="packet-inspector">
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

      <div className="inspector-copy">
        <h3>{stage.copy.whichLayerLooksAtIt}</h3>
        <p>{stage.copy.whatReallyHappens}</p>
      </div>

      <div className="projection-box">
        <div className="projection-box__heading">Current projection</div>
        {projection ? (
          <pre>{JSON.stringify(projection, null, 2)}</pre>
        ) : (
          <p className="muted">
            This stage has no dedicated data for this lens yet.
          </p>
        )}
      </div>

      <div className="teaching-grid">
        <div>
          <strong>👁️ User sees</strong>
          <p>{stage.copy.whatUserSees}</p>
        </div>
        <div>
          <strong>🧩 Same payload here</strong>
          <p>{stage.copy.samePayloadHereLooksLike}</p>
        </div>
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
    </section>
  )
}
