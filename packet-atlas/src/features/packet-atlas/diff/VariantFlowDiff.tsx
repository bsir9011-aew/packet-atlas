import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { getFlowDiffSummary } from './flowDiffModel'

type Props = {
  scenario: JourneyScenario
}

const statusIcon = {
  same: '✅',
  changed: '⚠️',
  'breaks-here': '🛑',
  'not-reached': '⛔',
}

const statusLabel = {
  same: 'same as baseline',
  changed: 'changed by variant',
  'breaks-here': 'breaks here',
  'not-reached': 'not reached',
}

export function VariantFlowDiff({ scenario }: Props) {
  const selectedVariantId = useAtlasStore((state) => state.selectedVariantId)
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const { variant, rows, changedCount, notReachedCount, breakStage } =
    getFlowDiffSummary(scenario, selectedVariantId)

  return (
    <section className="variant-flow-diff">
      <div className="panel-heading">
        <span>Flow Diff & Failure Trace</span>
        <small>{variant.shortLabel}</small>
      </div>

      <div className="flow-diff__hero">
        <div>
          <p className="flow-diff__eyebrow">Baseline vs selected variant</p>
          <h3>{variant.title}</h3>
          <p>{variant.description}</p>
        </div>
        <div className="flow-diff__stats">
          <span>
            <b>{changedCount}</b>
            changed
          </span>
          <span>
            <b>{notReachedCount}</b>
            not reached
          </span>
          <span>
            <b>{breakStage?.shortName ?? '—'}</b>
            break stage
          </span>
        </div>
      </div>

      <div className="flow-diff__diagnosis">
        <article>
          <strong>👁️ Symptom</strong>
          <p>{variant.symptom}</p>
        </article>
        <article>
          <strong>🧯 Likely root cause</strong>
          <p>{variant.likelyRootCause}</p>
        </article>
        <article>
          <strong>📡 Packet story</strong>
          <p>{variant.packetStory}</p>
        </article>
      </div>

      <div className="flow-diff-table" role="table" aria-label="Flow diff table">
        <div className="flow-diff-table__head" role="row">
          <span>Stage</span>
          <span>Healthy baseline</span>
          <span>Selected variant</span>
          <span>Status</span>
        </div>

        {rows.map((row) => (
          <button
            key={row.stageId}
            className={[
              'flow-diff-row',
              `flow-diff-row--${row.status}`,
              row.stageId === selectedStageId ? 'flow-diff-row--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setSelectedStageId(row.stageId)}
          >
            <span>
              <b>{row.stageName}</b>
            </span>
            <span>{row.baseline}</span>
            <span>{row.selectedVariant}</span>
            <span>
              {statusIcon[row.status]} {statusLabel[row.status]}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
