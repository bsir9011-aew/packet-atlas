import { AtlasLiveRegion } from '../accessibility/AtlasLiveRegion'
import { AssumptionBar } from '../layers/AssumptionBar'
import { ScenarioSelector } from '../scenario-selector/ScenarioSelector'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { SearchJumpPalette } from '../search/SearchJumpPalette'
import { useAtlasStore } from '../store/atlasStore'
import { WorkspaceTabs } from '../workspace/WorkspaceTabs'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
}

export function AtlasModeScreen({ scenario, stage }: Props) {
  const setPresentationMode = useAtlasStore((state) => state.setPresentationMode)

  return (
    <div className="atlas-shell atlas-shell--v41 atlas-shell--atlas">
      <header className="atlas-header atlas-header--v41">
        <div>
          <p className="eyebrow">Packet Atlas v14.4</p>
          <h1>{scenario.title}</h1>
          <p>{scenario.description}</p>
        </div>

        <div className="atlas-header__actions">
          <button
            type="button"
            className="atlas-mode-switch"
            onClick={() => setPresentationMode('play')}
          >
            <span>🎬</span>
            <strong>Play Mode</strong>
            <small>one stage, full screen</small>
          </button>

          <div className="header-badge">
            <span>🧭</span>
            <strong>Atlas Mode</strong>
            <small>explore many lenses</small>
          </div>
        </div>
      </header>

      <div className="atlas-top-deck">
        <SearchJumpPalette />
        <AssumptionBar scenario={scenario} />
        <ScenarioSelector scenario={scenario} />
      </div>

      <WorkspaceTabs scenario={scenario} stage={stage} />
      <AtlasLiveRegion stage={stage} />
    </div>
  )
}
