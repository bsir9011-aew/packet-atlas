export type RealCaptureStageFramePlan = {
  stageId: string
  expectedFrameKind: string
  requiredLayers: string[]
}

export type RealCapturePlaceholder = {
  id: string
  kind: 'real-capture-placeholder'
  status: 'pending-real-capture' | 'attached'
  note: string
  stageFramePlan: RealCaptureStageFramePlan[]
  frames: unknown[]
}

export function getPendingRealCaptureStages(
  fixture: RealCapturePlaceholder,
): string[] {
  if (fixture.status !== 'pending-real-capture') return []
  return fixture.stageFramePlan.map((item) => item.stageId)
}

export function hasRealFrames(fixture: RealCapturePlaceholder): boolean {
  return Array.isArray(fixture.frames) && fixture.frames.length > 0
}
