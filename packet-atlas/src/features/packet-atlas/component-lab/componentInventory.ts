export type ComponentInventoryItem = {
  name: string
  area: 'journey' | 'diagnostics' | 'protocols' | 'internals' | 'capture' | 'shared'
  purpose: string
  stability: 'core' | 'experimental' | 'needs-review'
}

export const componentInventory: ComponentInventoryItem[] = [
  { name: 'GlobalJourneyMap', area: 'journey', purpose: 'Main semantic map of the request/response journey.', stability: 'core' },
  { name: 'RouteTimeline', area: 'journey', purpose: 'Linear stage navigation and stage selection.', stability: 'core' },
  { name: 'PacketInspector', area: 'journey', purpose: 'Layer-specific view of the active stage and payload projection.', stability: 'core' },
  { name: 'LayerHighlightMode', area: 'journey', purpose: 'Highlights where a selected layer participates in the journey.', stability: 'core' },
  { name: 'ScenarioVariantPanel', area: 'diagnostics', purpose: 'Switches happy path and failure variants.', stability: 'core' },
  { name: 'VariantFlowDiff', area: 'diagnostics', purpose: 'Compares baseline flow with a selected failure variant.', stability: 'core' },
  { name: 'WiresharkFieldTree', area: 'internals', purpose: 'Educational protocol field tree inspired by Wireshark.', stability: 'core' },
  { name: 'CaptureFixturePanel', area: 'capture', purpose: 'Shows whether selected stage is synthetic or capture-backed.', stability: 'experimental' },
  { name: 'SignalStripCanvas', area: 'protocols', purpose: 'Symbolic physical-layer signal visualization.', stability: 'experimental' },
]

export function groupInventoryByArea() {
  return componentInventory.reduce<Record<string, ComponentInventoryItem[]>>((groups, item) => {
    groups[item.area] ??= []
    groups[item.area].push(item)
    return groups
  }, {})
}
