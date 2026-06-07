import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import {
  getFixtureForStage,
  summarizeFixtureCoverage,
  summarizeRealCaptureFixture,
} from './captureFixtureModel'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
}

export function CaptureFixturePanel({ scenario, stage }: Props) {
  const fixture = getFixtureForStage(stage.id)
  const coverage = summarizeFixtureCoverage(scenario)
  const realSummary = summarizeRealCaptureFixture()

  return (
    <section className="capture-fixture-panel">
      <div className="panel-heading">
        <span>Capture Fixture</span>
        <small>
          {coverage.attached}/{coverage.total} stages attached
        </small>
      </div>

      <div className="capture-fixture__hero">
        <div>
          <p className="capture-fixture__eyebrow">
            {fixture?.isReal ? 'Verified real capture' : 'Offline pipeline'}
          </p>
          <h3>
            {fixture
              ? `Frame ${fixture.frameNumber}: ${fixture.summary}`
              : 'No fixture attached to this stage yet'}
          </h3>
          <p>
            Real PCAP/PCAPNG stays out of the browser. Packet Atlas uses a
            reviewed, redacted and normalized JSON fixture.
          </p>
        </div>
        <div
          className={
            fixture
              ? 'capture-fixture__badge'
              : 'capture-fixture__badge capture-fixture__badge--missing'
          }
        >
          {fixture?.isReal
            ? 'verified real'
            : fixture
              ? 'synthetic fixture'
              : 'synthetic only'}
        </div>
      </div>

      <div className="capture-fixture__hero">
        <div>
          <p className="capture-fixture__eyebrow">Real capture status</p>
          <h3>
            {realSummary.attached
              ? `${realSummary.frameCount} redacted frames attached`
              : 'No real capture attached yet'}
          </h3>
          <p>
            Fixture {realSummary.fixtureId} covers {realSummary.stageCount}{' '}
            mapped stage groups and is redacted: {realSummary.redacted ? 'yes' : 'no'}.
          </p>
        </div>
        <div className="capture-fixture__badge">
          {realSummary.status ?? 'unknown'}
        </div>
      </div>

      {fixture ? (
        <>
          <div className="capture-stack">
            {fixture.protocolStack.map((protocol) => (
              <span key={protocol}>{protocol}</span>
            ))}
          </div>

          <div className="capture-fields">
            {Object.entries(fixture.fields).map(([key, value]) => (
              <div key={key}>
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="capture-missing">
          <strong>🧪 Fixture missing</strong>
          <p>
            This stage is still driven by the educational scenario model. Later,
            attach a normalized TShark frame.
          </p>
        </div>
      )}

      <details className="capture-pipeline-details">
        <summary>Verified real capture pipeline</summary>
        <pre>{`capture:slice → capture:export → capture:normalize → capture:map
capture:candidate → capture:candidate:validate → capture:redact
capture:candidate:promote → capture:readiness:strict → v6:readiness`}</pre>
      </details>
    </section>
  )
}
