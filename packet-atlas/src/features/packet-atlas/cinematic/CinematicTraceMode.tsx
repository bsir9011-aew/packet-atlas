import { useEffect, useMemo } from 'react'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import {
  buildAnimatedJourneyStepSummary,
  getNextStageId,
  getPreviousStageId,
  getStageIndex,
  getTraceProgress,
  traceSpeedMs,
  type TraceSpeed,
} from './cinematicTraceModel'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
}

export function CinematicTraceMode({ scenario, stage }: Props) {
  const playing = useAtlasStore((state) => state.animatedJourneyPlaying)
  const speed = useAtlasStore((state) => state.animatedJourneySpeed)
  const visitedStageIds = useAtlasStore((state) => state.visitedStageIds)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const setPlaying = useAtlasStore((state) => state.setAnimatedJourneyPlaying)
  const setSpeed = useAtlasStore((state) => state.setAnimatedJourneySpeed)
  const resetAnimatedJourney = useAtlasStore((state) => state.resetAnimatedJourney)

  const index = useMemo(() => getStageIndex(scenario, stage.id), [scenario, stage.id])
  const progress = getTraceProgress(scenario, stage.id)
  const summary = buildAnimatedJourneyStepSummary(scenario, stage)
  const previousStageId = getPreviousStageId(scenario, stage.id)
  const nextStageId = getNextStageId(scenario, stage.id)
  const isFirst = previousStageId === stage.id
  const isLast = nextStageId === stage.id

  useEffect(() => {
    if (!playing) return

    const timer = window.setInterval(() => {
      const next = getNextStageId(scenario, stage.id)
      if (next === stage.id) {
        setPlaying(false)
        return
      }

      setSelectedStageId(next)
    }, traceSpeedMs[speed])

    return () => window.clearInterval(timer)
  }, [playing, scenario, stage.id, speed, setPlaying, setSelectedStageId])

  return (
    <section className="cinematic-trace-panel cinematic-trace-panel--promoted">
      <div className="panel-heading">
        <span>Animated Journey Mode</span>
        <small>{playing ? 'playing' : 'paused'}</small>
      </div>

      <div className="cinematic-trace__hero">
        <div>
          <p className="cinematic-trace__eyebrow">Guided flow</p>
          <h3>
            {summary.stepLabel} — {stage.shortName}
          </h3>
          <p>
            Move through one request/response journey as a story. The atlas
            changes one stage at a time instead of showing every detail at once.
          </p>
        </div>

        <div className="cinematic-trace__meter">
          <strong>{progress}%</strong>
          <span>
            {index + 1}/{scenario.stages.length}
          </span>
        </div>
      </div>

      <div className="cinematic-trace__bar" aria-label={`Animated journey progress ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="animated-journey__grid">
        <article>
          <strong>What happens now</strong>
          <p>{summary.whatHappensNow}</p>
        </article>
        <article>
          <strong>Why it matters</strong>
          <p>{summary.whyItMatters}</p>
        </article>
        <article>
          <strong>User-visible outcome</strong>
          <p>{summary.userVisibleOutcome}</p>
        </article>
        <article>
          <strong>Network evidence</strong>
          <p>{summary.networkEvidence}</p>
        </article>
      </div>

      <div className="animated-journey__hint">
        <strong>Diagnostic trap</strong>
        <p>{summary.diagnosticHint}</p>
      </div>

      <div className="cinematic-trace__controls">
        <button type="button" onClick={() => resetAnimatedJourney(scenario.stages[0]?.id ?? stage.id)}>
          Restart
        </button>
        <button
          type="button"
          disabled={isFirst}
          onClick={() => setSelectedStageId(previousStageId)}
        >
          Previous
        </button>
        <button
          type="button"
          className="cinematic-trace__play"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => setSelectedStageId(nextStageId)}
        >
          Next
        </button>
        <select
          value={speed}
          aria-label="Animated journey speed"
          onChange={(event) => setSpeed(event.target.value as TraceSpeed)}
        >
          <option value="slow">slow</option>
          <option value="normal">normal</option>
          <option value="fast">fast</option>
        </select>
      </div>

      <div className="animated-journey__choices">
        <strong>Next choices</strong>
        <div>
          {summary.nextChoices.length > 0 ? (
            summary.nextChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => setSelectedStageId(choice.id)}
                data-kind={choice.kind}
              >
                {choice.kind === 'branch' ? 'Branch: ' : 'Next: '}
                {choice.label}
              </button>
            ))
          ) : (
            <span>End of current journey.</span>
          )}
        </div>
      </div>

      <div className="cinematic-trace__rail" aria-label="Animated journey stages">
        {scenario.stages.map((item, idx) => {
          const visited = visitedStageIds.includes(item.id)
          const active = item.id === stage.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedStageId(item.id)}
              className={
                active
                  ? 'cinematic-dot cinematic-dot--active'
                  : visited
                    ? 'cinematic-dot cinematic-dot--visited'
                    : 'cinematic-dot'
              }
              title={item.shortName}
              aria-label={`Go to stage ${idx + 1}: ${item.shortName}`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>
    </section>
  )
}
