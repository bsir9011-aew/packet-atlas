import type { JourneyStage, LayerLens } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { buildFieldFacts, type PacketFieldFact } from './fieldFacts'

type Props = {
  stage: JourneyStage
}

const lensMeta: Record<LayerLens, { label: string; icon: string }> = {
  human: { label: 'Human', icon: '👤' },
  application: { label: 'Application', icon: '🌐' },
  tls: { label: 'TLS', icon: '🔐' },
  transport: { label: 'Transport', icon: '🚚' },
  network: { label: 'Network/IP', icon: '🧭' },
  link: { label: 'Link', icon: '🔌' },
  physical: { label: 'Physical', icon: '〰️' },
}

function FieldCard({ field, isActiveLens }: { field: PacketFieldFact; isActiveLens: boolean }) {
  const meta = lensMeta[field.lens]

  return (
    <article className={isActiveLens ? 'field-card field-card--active' : 'field-card'}>
      <div className="field-card__topline">
        <span className="field-card__lens">
          {meta.icon} {meta.label}
        </span>
        {field.changesAt ? <span className="field-card__changes">changes at: {field.changesAt}</span> : null}
      </div>

      <h4>{field.name}</h4>
      <p className="field-card__value">{field.value}</p>

      <div className="field-card__grid">
        <div>
          <strong>👁️ Visible to</strong>
          <p>{field.visibleTo}</p>
        </div>
        <div>
          <strong>🧠 Read by</strong>
          <p>{field.readBy}</p>
        </div>
      </div>

      <div className="field-card__trap">
        <strong>⚠️ Watch out</strong>
        <p>{field.watchOut}</p>
      </div>
    </article>
  )
}

export function PacketFieldExplorer({ stage }: Props) {
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const fields = buildFieldFacts(stage)
  const activeFields = fields.filter((field) => field.lens === selectedLayerLens)
  const otherFields = fields.filter((field) => field.lens !== selectedLayerLens)

  return (
    <section className="packet-field-explorer">
      <div className="panel-heading">
        <span>Packet Field Explorer</span>
        <small>{stage.shortName}</small>
      </div>

      <div className="field-explorer-hero">
        <div>
          <p className="field-explorer-hero__eyebrow">Field-level view</p>
          <h3>What facts exist at this step?</h3>
          <p>
            Ten panel rozbija aktywny etap na konkretne pola i fakty: kto je widzi,
            kto je czyta, gdzie mogą się zmienić i czego nie wolno z nich wywnioskować.
          </p>
        </div>
        <div className="field-explorer-hero__badge">
          <strong>{fields.length}</strong>
          <span>facts</span>
        </div>
      </div>

      {activeFields.length > 0 ? (
        <div className="field-section">
          <div className="field-section__title">
            <span>🔦 Matching active lens</span>
            <small>{lensMeta[selectedLayerLens].label}</small>
          </div>
          <div className="field-card-grid">
            {activeFields.map((field) => (
              <FieldCard key={field.id} field={field} isActiveLens />
            ))}
          </div>
        </div>
      ) : (
        <div className="field-empty-lens">
          <strong>🔦 No fields for active lens here</strong>
          <p>
            Aktywna lupa <b>{lensMeta[selectedLayerLens].label}</b> nie ma osobnych pól w tym etapie.
            To też jest informacja: nie każda warstwa ma coś do czytania na każdym kroku.
          </p>
        </div>
      )}

      {otherFields.length > 0 ? (
        <details className="field-other-details" open={activeFields.length === 0}>
          <summary>Other fields visible in this stage</summary>
          <div className="field-card-grid">
            {otherFields.map((field) => (
              <FieldCard key={field.id} field={field} isActiveLens={false} />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  )
}
