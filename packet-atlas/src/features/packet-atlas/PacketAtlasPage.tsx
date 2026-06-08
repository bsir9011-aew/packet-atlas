import { useAtlasKeyboardNavigation } from './accessibility/useAtlasKeyboardNavigation'
import { AtlasLiveRegion } from './accessibility/AtlasLiveRegion'
import { AssumptionBar } from './layers/AssumptionBar'
import { ScenarioSelector } from './scenario-selector/ScenarioSelector'
import { getScenarioById } from './scenarios/scenarioRegistry'
import { SearchJumpPalette } from './search/SearchJumpPalette'
import { useAtlasStore } from './store/atlasStore'
import { WorkspaceTabs } from './workspace/WorkspaceTabs'
import './packetAtlas.css'

export function PacketAtlasPage() {
  const selectedScenarioId = useAtlasStore((state) => state.selectedScenarioId)
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const activeScenario = getScenarioById(selectedScenarioId)
  const activeStage =
    activeScenario.stages.find((stage) => stage.id === selectedStageId) ??
    activeScenario.stages[0]

  useAtlasKeyboardNavigation(
    activeScenario.stages.map((stage) => stage.id),
    activeStage.id,
  )

  return (
    <div className="atlas-shell atlas-shell--v41">
      <header className="atlas-header atlas-header--v41">
        <div>
          <p className="eyebrow">Packet Atlas v7.5</p>
          <h1>{activeScenario.title}</h1>
          <p>{activeScenario.description}</p>
        </div>

        <div className="header-badge">
          <span>🧭</span>
          <strong>One journey</strong>
          <small>organized workspaces</small>
        </div>
      </header>

      <div className="atlas-top-deck">
        <SearchJumpPalette />
        <AssumptionBar scenario={activeScenario} />
        <ScenarioSelector scenario={activeScenario} />
      </div>

      <WorkspaceTabs scenario={activeScenario} stage={activeStage} />
      <AtlasLiveRegion stage={activeStage} />
    </div>
  )
}
