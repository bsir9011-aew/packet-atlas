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
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  const nodes = useMemo<Node[]>(
    () =>
      scenario.stages.map((stage) => {
        const selected = stage.id === selectedStageId

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
              </div>
            ),
          },
          style: {
            width: 190,
            borderRadius: 16,
            border: selected ? '2px solid #7dd3fc' : '1px solid #334155',
            background: selected ? '#0f2a3a' : '#111827',
            color: '#e5e7eb',
            boxShadow: selected
              ? '0 0 0 4px rgba(125, 211, 252, 0.12)'
              : 'none',
          },
        }
      }),
    [scenario.stages, selectedStageId],
  )

  const edges = useMemo<Edge[]>(
    () =>
      scenario.stages.flatMap((stage) =>
        stage.relations.previousIds.map((previousId) => ({
          id: `${previousId}->${stage.id}`,
          source: previousId,
          target: stage.id,
          animated: stage.direction !== 'internal',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: {
            strokeWidth: 2,
          },
        })),
      ),
    [scenario.stages],
  )

  return (
    <div className="journey-map">
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
