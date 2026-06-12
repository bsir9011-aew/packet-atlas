import { useAtlasKeyboardNavigation } from './accessibility/useAtlasKeyboardNavigation'
import { AtlasModeScreen } from './atlas/AtlasModeScreen'
import { PlayModeScreen } from './play/PlayModeScreen'
import { getScenarioById } from './scenarios/scenarioRegistry'
import { useAtlasStore } from './store/atlasStore'
import './packetAtlas.css'

export function PacketAtlasPage() {
  const selectedScenarioId = useAtlasStore((state) => state.selectedScenarioId)
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const presentationMode = useAtlasStore((state) => state.presentationMode)
  const activeScenario = getScenarioById(selectedScenarioId)
  const activeStage =
    activeScenario.stages.find((stage) => stage.id === selectedStageId) ??
    activeScenario.stages[0]

  useAtlasKeyboardNavigation(
    activeScenario.stages.map((stage) => stage.id),
    activeStage.id,
  )

  if (presentationMode === 'play') {
    return <PlayModeScreen scenario={activeScenario} stage={activeStage} />
  }

  return <AtlasModeScreen scenario={activeScenario} stage={activeStage} />
}
