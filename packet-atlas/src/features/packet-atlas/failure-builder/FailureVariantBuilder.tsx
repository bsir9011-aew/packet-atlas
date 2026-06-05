import { useState } from 'react'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import {
  buildDraftFailureTrace,
  exportDraftFailure,
  type DraftFailure,
  type DraftFailureKind,
} from './failureBuilderModel'

type Props = {
  scenario: JourneyScenario
}

const kinds: DraftFailureKind[] = [
  'timeout',
  'blocked',
  'bad-response',
  'identity-failure',
  'local-resolution-failure',
]

export function FailureVariantBuilder({ scenario }: Props) {
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const [expanded, setExpanded] = useState(false)
  const [breakStageId, setBreakStageId] = useState(
    scenario.stages[3]?.id ?? scenario.stages[0]?.id ?? '',
  )
  const [kind, setKind] = useState<DraftFailureKind>('blocked')
  const [affectedStageIds, setAffectedStageIds] = useState<string[]>(
    breakStageId ? [breakStageId] : [],
  )

  const draft: DraftFailure = {
    title: `Draft failure at ${breakStageId}`,
    kind,
    breakStageId,
    affectedStageIds,
    symptom: 'User-visible failure depends on the break point.',
    rootCause: 'Temporary local draft — not saved to scenario registry.',
    observable: 'Use this to preview where the flow would break.',
  }

  const rows = buildDraftFailureTrace(scenario, draft)

  const counts = {
    affected: rows.filter((row) => row.status === 'affected').length,
    cutOff: rows.filter((row) => row.status === 'cut-off').length,
  }

  function toggleAffectedStage(stageId: string) {
    setAffectedStageIds((current) =>
      current.includes(stageId)
        ? current.filter((id) => id !== stageId)
        : [...current, stageId],
    )
  }

  return (
    <section className="failure-builder-panel">
      <div className="panel-heading">
        <span>Failure Variant Builder</span>
        <small>temporary draft</small>
      </div>

      <div className="failure-builder__body">
        <div className="failure-builder__controls">
          <label>
            Break stage
            <select
              value={breakStageId}
              onChange={(event) => {
                const nextStageId = event.target.value
                setBreakStageId(nextStageId)
                setAffectedStageIds([nextStageId])
                setSelectedStageId(nextStageId)
              }}
            >
              {scenario.stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.shortName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Failure kind
            <select
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as DraftFailureKind)
              }
            >
              {kinds.map((failureKind) => (
                <option key={failureKind} value={failureKind}>
                  {failureKind}
                </option>
              ))}
            </select>
          </label>

          <button type="button" onClick={() => setExpanded((current) => !current)}>
            {expanded ? 'Hide draft JSON' : 'Show draft JSON'}
          </button>
        </div>

        <div className="failure-builder__summary">
          <span>{counts.affected} affected</span>
          <span>{counts.cutOff} cut off</span>
          <span>{breakStageId} breaks</span>
        </div>

        <div className="failure-builder__rail">
          {rows.map((row) => (
            <button
              key={row.stageId}
              type="button"
              className={`failure-builder__node failure-builder__node--${row.status}`}
              onClick={() => setSelectedStageId(row.stageId)}
            >
              <strong>{row.shortName}</strong>
              <small>{row.status}</small>
            </button>
          ))}
        </div>

        <div className="failure-builder__affected">
          <strong>Affected before break:</strong>
          <div>
            {scenario.stages.map((stage) => (
              <button
                key={stage.id}
                type="button"
                className={
                  affectedStageIds.includes(stage.id)
                    ? 'failure-builder__pill failure-builder__pill--active'
                    : 'failure-builder__pill'
                }
                onClick={() => toggleAffectedStage(stage.id)}
              >
                {stage.shortName}
              </button>
            ))}
          </div>
        </div>

        {expanded ? (
          <pre className="failure-builder__json">
            {exportDraftFailure(draft)}
          </pre>
        ) : null}
      </div>
    </section>
  )
}
