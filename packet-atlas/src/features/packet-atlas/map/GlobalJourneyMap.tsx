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

type Props = {
  scenario: JourneyScenario
}

const laneLabel: Record<string, string> = {
  request: '→ request',
  response: '← response',
  internal: '↔ internal',
}

export function GlobalJourneyMap({ scenario }: Props) {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  const lensMatchingStageIds = useMemo(
    () =>
      new Set(
        scenario.stages
          .filter((stage) => stage.layerFocus.includes(selectedLayerLens))
          .map((stage) => stage.id),
      ),
    [scenario.stages, selectedLayerLens],
  )

  const nodes = useMemo<Node[]>(
    () =>
      scenario.stages.map((stage) => {
        const selected = stage.id === selectedStageId
        const lensMatch = lensMatchingStageIds.has(stage.id)
        const dimmed = !selected && !lensMatch

        return {
          id: stage.id,
          position: {
            x: stage.mapPosition.x,
            y: stage.mapPosition.y,
          },
          data: {
            label: (
              <div className="stage-node stage-node--v06">
                <div className="stage-node__top">
                  <span>{laneLabel[stage.direction]}</span>
                  <span>{stage.device.role}</span>
                </div>
                <strong>{stage.shortName}</strong>
                <small>{stage.layerFocus.join(' / ')}</small>
                <em className="stage-node__lens-badge">
                  {lensMatch ? `${selectedLayerLens} lens` : 'outside lens'}
                </em>
              </div>
            ),
          },
          style: {
            width: 190,
            borderRadius: 16,
            border: selected
              ? '2px solid #7dd3fc'
              : lensMatch
                ? '1px solid #38bdf8'
                : '1px solid #334155',
            background: selected
              ? '#0f2a3a'
              : lensMatch
                ? '#082f49'
                : '#111827',
            color: '#e5e7eb',
            opacity: dimmed ? 0.38 : 1,
            boxShadow: selected
              ? '0 0 0 4px rgba(125, 211, 252, 0.12)'
              : lensMatch
                ? '0 0 0 3px rgba(56, 189, 248, 0.06)'
                : 'none',
            transition:
              'opacity 160ms ease, border-color 160ms ease, background 160ms ease, box-shadow 160ms ease',
          },
        }
      }),
    [scenario.stages, selectedStageId, selectedLayerLens, lensMatchingStageIds],
  )

  const edges = useMemo<Edge[]>(
    () =>
      scenario.stages.flatMap((stage) =>
        stage.relations.previousIds.map((previousId) => {
          const sourceInLens = lensMatchingStageIds.has(previousId)
          const targetInLens = lensMatchingStageIds.has(stage.id)
          const edgeInLens = sourceInLens || targetInLens

          return {
            id: `${previousId}->${stage.id}`,
            source: previousId,
            target: stage.id,
            animated: edgeInLens && stage.direction !== 'internal',
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            style: {
              stroke: edgeInLens ? '#38bdf8' : '#334155',
              strokeWidth: edgeInLens ? 2.8 : 1.5,
              opacity: edgeInLens ? 0.92 : 0.28,
            },
          }
        }),
      ),
    [scenario.stages, lensMatchingStageIds],
  )

  return (
    <div className="journey-map journey-map--v06">
      <div className="journey-map__lens-overlay">
        Highlighting: <b>{selectedLayerLens}</b>
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
