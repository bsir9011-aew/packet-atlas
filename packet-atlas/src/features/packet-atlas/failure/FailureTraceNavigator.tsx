import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { getScenarioVariant } from '../variants/scenarioVariants'
import { useAtlasStore } from '../store/atlasStore'
import {
  getFailureNavigatorSummary,
  getNavigatorStageLabel,
} from './failureTraceNavigatorModel'

type Props = {
  scenario: JourneyScenario
}

const statusIcon = {
  same: '✅',
  changed: '⚠️',
  'breaks-here': '🛑',
  'not-reached': '⛔',
}

function getRailClass(status: string, active: boolean) {
  return [
    'failure-rail-stage',
    `failure-rail-stage--${status}`,
    active ? 'failure-rail-stage--active' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function FailureTraceNavigator({ scenario }: Props) {
  const selectedVariantId = useAtlasStore((state) => state.selectedVariantId)
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const setSelectedVariantId = useAtlasStore(
    (state) => state.setSelectedVariantId,
  )

  const variant = getScenarioVariant(selectedVariantId)
  const summary = getFailureNavigatorSummary(scenario, selectedVariantId)

  const jumpTo = (stageId: string | null) => {
    if (stageId) setSelectedStageId(stageId)
  }

  return (
    <section className="failure-trace-navigator">
      <div className="panel-heading">
        <span>Failure Trace Navigator</span>
        <small>{variant.shortLabel}</small>
      </div>

      <div className="failure-navigator__top">
        <div>
          <p className="failure-navigator__eyebrow">
            {summary.isBaseline ? 'Baseline route' : 'Failure route'}
          </p>
          <h3>{variant.title}</h3>
          <p>{variant.packetStory}</p>
        </div>

        <div className="failure-navigator__stats">
          <span>
            <b>{summary.reachedCount}</b>
            reached
          </span>
          <span>
            <b>{summary.affectedCount}</b>
            affected
          </span>
          <span>
            <b>{summary.notReachedCount}</b>
            cut off
          </span>
        </div>
      </div>

      <div className="failure-navigator__actions">
        <button onClick={() => jumpTo(summary.firstAffectedStageId)} disabled={!summary.firstAffectedStageId}>
          ⚠️ First affected
        </button>
        <button onClick={() => jumpTo(summary.breakStageId)} disabled={!summary.breakStageId}>
          🛑 Break point
        </button>
        <button onClick={() => jumpTo(summary.firstNotReachedStageId)} disabled={!summary.firstNotReachedStageId}>
          ⛔ First cut off
        </button>
        <button onClick={() => setSelectedVariantId('happy-path')} disabled={summary.isBaseline}>
          ✅ Compare to happy path
        </button>
      </div>

      <div className="failure-rail" aria-label="Failure route stage rail">
        {summary.rows.map((row, index) => {
          const active = row.stageId === selectedStageId
          const label = getNavigatorStageLabel(row)

          return (
            <button
              key={row.stageId}
              className={getRailClass(row.status, active)}
              onClick={() => setSelectedStageId(row.stageId)}
              title={`${row.stageName}: ${label}`}
            >
              <span className="failure-rail-stage__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="failure-rail-stage__main">
                <b>
                  {statusIcon[row.status]} {row.stageName}
                </b>
                <small>{label}</small>
              </span>
            </button>
          )
        })}
      </div>

      {!summary.isBaseline ? (
        <div className="failure-navigator__explain">
          <article>
            <strong>👁️ User symptom</strong>
            <p>{variant.userVisibleEffect}</p>
          </article>
          <article>
            <strong>📡 Network observable</strong>
            <p>{variant.networkObservable}</p>
          </article>
          <article>
            <strong>🧪 Diagnostic angle</strong>
            <p>{variant.diagnosticAngle}</p>
          </article>
        </div>
      ) : null}
    </section>
  )
}
