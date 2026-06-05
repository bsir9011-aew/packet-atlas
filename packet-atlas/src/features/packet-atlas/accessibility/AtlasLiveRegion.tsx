import type { JourneyStage } from '../schema/journeyScenarioSchema'

export function AtlasLiveRegion({ stage }: { stage: JourneyStage }) {
  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      Active stage changed to {stage.shortName}. {stage.copy.whatReallyHappens}
    </div>
  )
}
