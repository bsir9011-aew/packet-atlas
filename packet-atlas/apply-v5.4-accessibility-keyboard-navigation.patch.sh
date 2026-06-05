#!/usr/bin/env bash
set -euo pipefail
echo "⌨️ Applying Packet Atlas v5.4 — Accessibility & Keyboard Navigation..."
if [ ! -f package.json ] || [ ! -f src/features/packet-atlas/PacketAtlasPage.tsx ]; then echo "❌ Run this from /workspaces/packet-atlas/packet-atlas"; exit 1; fi
mkdir -p src/features/packet-atlas/accessibility tests/unit patches/backups
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/PacketAtlasPage.before-v5.4.tsx

cat > src/features/packet-atlas/accessibility/keyboardNavigationModel.ts <<'TS'
export type NavigationKey = 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | 'ArrowUp' | 'Home' | 'End'

export function getKeyboardTargetStageId(
  stageIds: string[],
  selectedStageId: string,
  key: NavigationKey,
): string {
  if (stageIds.length === 0) return selectedStageId

  const currentIndex = Math.max(0, stageIds.indexOf(selectedStageId))

  if (key === 'Home') return stageIds[0]
  if (key === 'End') return stageIds[stageIds.length - 1]
  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return stageIds[Math.min(stageIds.length - 1, currentIndex + 1)]
  }

  return stageIds[Math.max(0, currentIndex - 1)]
}

export function shouldIgnoreKeyboardNavigation(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return target.isContentEditable || ['input', 'textarea', 'select', 'button'].includes(tag)
}
TS

cat > src/features/packet-atlas/accessibility/useAtlasKeyboardNavigation.ts <<'TS'
import { useEffect } from 'react'
import { useAtlasStore } from '../store/atlasStore'
import {
  getKeyboardTargetStageId,
  shouldIgnoreKeyboardNavigation,
  type NavigationKey,
} from './keyboardNavigationModel'

const supportedKeys = new Set<NavigationKey>([
  'ArrowRight',
  'ArrowDown',
  'ArrowLeft',
  'ArrowUp',
  'Home',
  'End',
])

export function useAtlasKeyboardNavigation(
  stageIds: string[],
  selectedStageId: string,
) {
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!supportedKeys.has(event.key as NavigationKey)) return
      if (shouldIgnoreKeyboardNavigation(event.target)) return

      event.preventDefault()
      setSelectedStageId(
        getKeyboardTargetStageId(
          stageIds,
          selectedStageId,
          event.key as NavigationKey,
        ),
      )
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedStageId, setSelectedStageId, stageIds])
}
TS

cat > src/features/packet-atlas/accessibility/AtlasLiveRegion.tsx <<'TSX'
import type { JourneyStage } from '../schema/journeyScenarioSchema'

export function AtlasLiveRegion({ stage }: { stage: JourneyStage }) {
  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      Active stage changed to {stage.shortName}. {stage.copy.whatReallyHappens}
    </div>
  )
}
TSX

python3 <<'PY'
from pathlib import Path
import re

p = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
text = p.read_text()

for line, marker in [
    ("import { AtlasLiveRegion } from './accessibility/AtlasLiveRegion'\n", "import { AssumptionBar } from './layers/AssumptionBar'\n"),
    ("import { useAtlasKeyboardNavigation } from './accessibility/useAtlasKeyboardNavigation'\n", "import { AtlasLiveRegion } from './accessibility/AtlasLiveRegion'\n"),
]:
    if line not in text:
        if marker not in text:
            raise SystemExit(f'Could not find import marker: {marker.strip()}')
        text = text.replace(marker, line + marker, 1)

hook = "  useAtlasKeyboardNavigation(\n    activeScenario.stages.map((stage) => stage.id),\n    activeStage.id,\n  )\n"
if 'useAtlasKeyboardNavigation(' not in text.split('return (')[0]:
    marker = "    activeScenario.stages[0]\n"
    if marker not in text:
        raise SystemExit('Could not find activeStage marker')
    text = text.replace(marker, marker + "\n" + hook, 1)

if '<AtlasLiveRegion stage={activeStage} />' not in text:
    marker = "      <WorkspaceTabs scenario={activeScenario} stage={activeStage} />"
    if marker not in text:
        raise SystemExit('Could not find WorkspaceTabs marker')
    text = text.replace(marker, marker + "\n      <AtlasLiveRegion stage={activeStage} />", 1)

text = re.sub(r'Packet Atlas v\d+\.\d+', 'Packet Atlas v5.4', text, count=1)
p.write_text(text)
PY

CSS_FILE="src/features/packet-atlas/packetAtlas.css"
if [ -f "$CSS_FILE" ] && ! grep -q "\.sr-only" "$CSS_FILE"; then
cat >> "$CSS_FILE" <<'CSS'

/* === Packet Atlas v5.4 Accessibility === */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

button:focus-visible,
[role='tab']:focus-visible,
[tabindex]:focus-visible {
  outline: 3px solid #38bdf8;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
  }
}
CSS
fi

cat > tests/unit/keyboardNavigationModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { getKeyboardTargetStageId } from '../../src/features/packet-atlas/accessibility/keyboardNavigationModel'

describe('keyboard navigation model', () => {
  const stages = ['one', 'two', 'three']

  it('moves between stages and respects boundaries', () => {
    expect(getKeyboardTargetStageId(stages, 'one', 'ArrowRight')).toBe('two')
    expect(getKeyboardTargetStageId(stages, 'three', 'ArrowRight')).toBe('three')
    expect(getKeyboardTargetStageId(stages, 'two', 'ArrowLeft')).toBe('one')
    expect(getKeyboardTargetStageId(stages, 'two', 'Home')).toBe('one')
    expect(getKeyboardTargetStageId(stages, 'two', 'End')).toBe('three')
  })
})
TS

echo "✅ v5.4 applied. Use arrow keys/Home/End outside form controls."
echo "🧪 Run: npm run build && npm test && npm run e2e"
