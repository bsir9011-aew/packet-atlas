import { useMemo } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { getScenarioVariant } from '../variants/scenarioVariants'

type Props = {
  scenario: JourneyScenario
}

const laneLabel: Record<string, string> = {
  request: '→ request',
  response: '← response',
  internal: '↔ internal',
}

function getNodeBackground({
  selected,
  lensMatches,
  variantImpacted,
}: {
  selected: boolean
  lensMatches: boolean
  variantImpacted: boolean
}) {
  if (variantImpacted && selected) return '#3b1f12'
  if (variantImpacted) return '#2a170f'
  if (selected) return '#0f2a3a'
  if (lensMatches) return '#0b3448'
  return '#111827'
}

function getNodeBorder({
  selected,
  lensMatches,
  variantImpacted,
}: {
  selected: boolean
  lensMatches: boolean
  variantImpacted: boolean
}) {
  if (variantImpacted) return '2px solid #fb923c'
  if (selected) return '2px solid #7dd3fc'
  if (lensMatches) return '1px solid #38bdf8'
  return '1px solid #334155'
}

export function GlobalJourneyMap({ scenario }: Props) {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const selectedVariantId = useAtlasStore((state) => state.selectedVariantId)

  const activeVariant = getScenarioVariant(selectedVariantId)

  const nodes = useMemo<Node[]>(
    () =>
      scenario.stages.map((stage) => {
        const selected = stage.id === selectedStageId
        const lensMatches = stage.layerFocus.includes(selectedLayerLens)
        const variantImpacted = activeVariant.affectedStageIds.includes(stage.id)
        const isBreakStage = activeVariant.breakStageId === stage.id

        return {
          id: stage.id,
          position: {
            x: stage.mapPosition.x,
            y: stage.mapPosition.y,
          },
          data: {
            label: (
              <div className="stage-node">
                <div className="stage-node__top">
                  <span>{laneLabel[stage.direction]}</span>
                  <span>{stage.device.role}</span>
                </div>
                <strong>{stage.shortName}</strong>
                <small>{stage.layerFocus.join(' / ')}</small>
                <div className="stage-node__badges">
                  <em>{lensMatches ? `${selectedLayerLens} lens` : 'outside lens'}</em>
                  {variantImpacted ? (
                    <em className={isBreakStage ? 'stage-node__break' : 'stage-node__impact'}>
                      {isBreakStage ? 'break point' : 'variant impact'}
                    </em>
                  ) : null}
                </div>
              </div>
            ),
          },
          style: {
            width: 190,
            borderRadius: 16,
            border: getNodeBorder({ selected, lensMatches, variantImpacted }),
            background: getNodeBackground({ selected, lensMatches, variantImpacted }),
            color: '#e5e7eb',
            opacity: lensMatches || selected || variantImpacted ? 1 : 0.36,
            boxShadow:
              selected || variantImpacted
                ? variantImpacted
                  ? '0 0 0 4px rgba(251, 146, 60, 0.14)'
                  : '0 0 0 4px rgba(125, 211, 252, 0.12)'
                : 'none',
          },
        }
      }),
    [
      activeVariant.affectedStageIds,
      activeVariant.breakStageId,
      scenario.stages,
      selectedLayerLens,
      selectedStageId,
    ],
  )

  const stageById = useMemo(
    () => new Map(scenario.stages.map((stage) => [stage.id, stage])),
    [scenario.stages],
  )

  const edges = useMemo<Edge[]>(
    () =>
      scenario.stages.flatMap((stage) =>
        stage.relations.previousIds.map((previousId) => {
          const previousStage = stageById.get(previousId)
          const edgeMatchesLens =
            stage.layerFocus.includes(selectedLayerLens) ||
            previousStage?.layerFocus.includes(selectedLayerLens)
          const edgeVariantImpacted =
            activeVariant.affectedStageIds.includes(stage.id) ||
            activeVariant.affectedStageIds.includes(previousId)

          return {
            id: `${previousId}->${stage.id}`,
            source: previousId,
            target: stage.id,
            animated: edgeMatchesLens || edgeVariantImpacted,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            style: {
              strokeWidth: edgeVariantImpacted ? 3 : 2,
              stroke: edgeVariantImpacted
                ? '#fb923c'
                : edgeMatchesLens
                  ? '#38bdf8'
                  : '#334155',
              opacity: edgeMatchesLens || edgeVariantImpacted ? 1 : 0.28,
            },
          }
        }),
      ),
    [
      activeVariant.affectedStageIds,
      scenario.stages,
      selectedLayerLens,
      stageById,
    ],
  )

  return (
    <div className="journey-map journey-map--v12">
      <div className="map-overlay-labels">
        <span>
          Highlighting: <b>{selectedLayerLens}</b>
        </span>
        {activeVariant.id !== 'happy-path' ? (
          <span className="map-overlay-labels__variant">
            Variant: <b>{activeVariant.shortLabel}</b>
          </span>
        ) : null}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.35}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={(_, node) => setSelectedStageId(node.id)}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
