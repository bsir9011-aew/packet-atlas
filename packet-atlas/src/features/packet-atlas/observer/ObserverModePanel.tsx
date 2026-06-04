import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { getObserverProfile, getObserverStageIds, observerProfiles, stageMatchesObserver } from './observerModel'

type Props = { scenario: JourneyScenario; stage: JourneyScenario['stages'][number] }
export function ObserverModePanel({ scenario, stage }: Props) {
  const selectedObserverId = useAtlasStore((s) => s.selectedObserverId)
  const setSelectedObserverId = useAtlasStore((s) => s.setSelectedObserverId)
  const setSelectedStageId = useAtlasStore((s) => s.setSelectedStageId)
  const observer = getObserverProfile(selectedObserverId)
  const visibleStageIds = getObserverStageIds(scenario, selectedObserverId)
  const currentVisible = stageMatchesObserver(stage, selectedObserverId)
  return <section className="observer-mode-panel">
    <div className="observer-mode__topline"><div><p className="observer-mode__eyebrow">Observer Mode</p><h2><span>{observer.icon}</span> {observer.label}</h2><p>{observer.mentalModel}</p></div><div className={currentVisible ? 'observer-mode__status' : 'observer-mode__status observer-mode__status--outside'}><strong>{visibleStageIds.length}/{scenario.stages.length}</strong><span>{currentVisible ? 'current stage visible' : 'current stage outside observer view'}</span></div></div>
    <div className="observer-switcher">{observerProfiles.map((item) => <button key={item.id} className={item.id === selectedObserverId ? 'observer-chip observer-chip--active' : 'observer-chip'} onClick={() => setSelectedObserverId(item.id)}><span>{item.icon}</span>{item.shortLabel}</button>)}</div>
    <div className="observer-mode__grid"><article className="observer-card observer-card--can"><strong>👁️ Can see</strong><ul>{observer.canSee.map(i => <li key={i}>{i}</li>)}</ul></article><article className="observer-card observer-card--cannot"><strong>🚫 Cannot assume</strong><ul>{observer.cannotAssume.map(i => <li key={i}>{i}</li>)}</ul></article><article className="observer-card"><strong>🧾 Typical evidence</strong><ul>{observer.typicalEvidence.map(i => <li key={i}>{i}</li>)}</ul></article></div>
    {!currentVisible ? <div className="observer-warning"><strong>⚠️ Active stage is outside this observer’s direct view.</strong><span>Different devices do not understand the whole journey.</span></div> : null}
    <div className="observer-visible-stages"><strong>Visible stages for this observer:</strong><div>{scenario.stages.filter(c => visibleStageIds.includes(c.id)).map(c => <button key={c.id} onClick={() => setSelectedStageId(c.id)}>{c.shortName}</button>)}</div></div>
  </section>
}
