#!/usr/bin/env bash
set -euo pipefail

echo "〰️ Applying Packet Atlas v4.5 — Symbolic PHY Signal Strip..."

if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo "❌ Run this from the app root: /workspaces/packet-atlas/packet-atlas"
  exit 1
fi

mkdir -p src/features/packet-atlas/physical tests/unit

cat > src/features/packet-atlas/physical/SignalStripCanvas.tsx <<'TSX'
import { useEffect, useRef } from 'react'
import type { JourneyStage } from '../schema/journeyScenarioSchema'

type MediumMode = 'electrical' | 'optical' | 'radio'

type Props = {
  stage: JourneyStage
  medium?: MediumMode
}

function drawSignal(canvas: HTMLCanvasElement, stage: JourneyStage, medium: MediumMode) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const ratio = window.devicePixelRatio || 1
  const width = canvas.clientWidth * ratio
  const height = canvas.clientHeight * ratio

  canvas.width = width
  canvas.height = height

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, width, height)

  const centerY = height / 2
  const amplitude = medium === 'radio' ? height * 0.22 : medium === 'optical' ? height * 0.16 : height * 0.12
  const visible = stage.layerFocus.includes('physical')
  const cycles = visible ? 10 : 4

  ctx.globalAlpha = visible ? 1 : 0.35
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2 * ratio
  ctx.beginPath()

  for (let x = 0; x <= width; x += 4 * ratio) {
    const t = x / width
    const y = centerY + Math.sin(t * Math.PI * 2 * cycles) * amplitude + Math.sin(t * Math.PI * cycles) * amplitude * 0.25
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.fillStyle = '#e5e7eb'
  ctx.font = `${12 * ratio}px system-ui`
  ctx.fillText(`${medium} signal · symbolic PHY view`, 16 * ratio, 24 * ratio)
  ctx.fillStyle = visible ? '#86efac' : '#facc15'
  ctx.fillText(
    visible ? `Active physical representation for: ${stage.shortName}` : `Current stage is not primarily physical: ${stage.shortName}`,
    16 * ratio,
    height - 18 * ratio,
  )
}

export function SignalStripCanvas({ stage, medium = 'electrical' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawSignal(canvas, stage, medium)
    const resize = () => drawSignal(canvas, stage, medium)
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [stage, medium])

  return (
    <section className="signal-strip-panel">
      <div className="panel-heading">
        <span>Symbolic PHY Signal Strip</span>
        <small>{medium}</small>
      </div>
      <div className="signal-strip-panel__body">
        <canvas ref={canvasRef} className="signal-strip-canvas" aria-label="Symbolic physical layer signal visualization" />
        <p>This is a simplified visual cue: frames become medium-dependent signals. It is not a PHY-grade analyzer trace.</p>
      </div>
    </section>
  )
}
TSX

cat > src/features/packet-atlas/physical/signalStripModel.ts <<'TS'
import type { JourneyStage } from '../schema/journeyScenarioSchema'

export function isPhysicalStage(stage: JourneyStage) {
  return stage.layerFocus.includes('physical')
}

export function getSignalStripSummary(stage: JourneyStage) {
  return isPhysicalStage(stage)
    ? `${stage.shortName} has a physical-layer representation.`
    : `${stage.shortName} is above or outside the physical-layer focus.`
}
TS

python3 <<'PY'
from pathlib import Path

page = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
if not page.exists():
    raise SystemExit('PacketAtlasPage.tsx not found; cannot integrate SignalStripCanvas safely.')

text = page.read_text()

if "SignalStripCanvas" not in text:
    marker = "import './packetAtlas.css'"
    if marker in text:
        text = text.replace(marker, "import { SignalStripCanvas } from './physical/SignalStripCanvas'\n" + marker)
    else:
        text = "import { SignalStripCanvas } from './physical/SignalStripCanvas'\n" + text

if "<SignalStripCanvas" not in text:
    insert = "\n          <SignalStripCanvas stage={activeStage} />\n"
    if "</main>" in text:
        text = text.replace("</main>", insert + "        </main>", 1)
    else:
        raise SystemExit('Could not find </main> to insert SignalStripCanvas.')

for old in ['Packet Atlas v4.4', 'Packet Atlas v4.3', 'Packet Atlas v4.2', 'Packet Atlas v4.1', 'Packet Atlas v4.0']:
    text = text.replace(old, 'Packet Atlas v4.5')

page.write_text(text)
PY

CSS_FILE="src/features/packet-atlas/packetAtlas.css"
if [ -f "$CSS_FILE" ] && ! grep -q "signal-strip-panel" "$CSS_FILE"; then
cat >> "$CSS_FILE" <<'CSS'

/* === Packet Atlas v4.5 Symbolic PHY Signal Strip === */

.signal-strip-panel {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.76);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 18px 80px rgba(0, 0, 0, 0.28);
}

.signal-strip-panel__body {
  padding: 14px;
}

.signal-strip-canvas {
  width: 100%;
  height: 150px;
  display: block;
  border: 1px solid #1e293b;
  border-radius: 16px;
  background: #020617;
}

.signal-strip-panel__body p {
  margin: 10px 0 0;
  color: #94a3b8;
  line-height: 1.45;
}
CSS
fi

cat > tests/unit/signalStripModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getSignalStripSummary, isPhysicalStage } from '../../src/features/packet-atlas/physical/signalStripModel'

describe('symbolic PHY signal strip model', () => {
  it('detects physical stages', () => {
    const lanFrame = httpsExampleScenario.stages.find((stage) => stage.id === 'lan-frame')
    const urlIntent = httpsExampleScenario.stages.find((stage) => stage.id === 'url-intent')

    expect(lanFrame).toBeTruthy()
    expect(urlIntent).toBeTruthy()
    expect(isPhysicalStage(lanFrame!)).toBe(true)
    expect(isPhysicalStage(urlIntent!)).toBe(false)
    expect(getSignalStripSummary(lanFrame!)).toContain('physical-layer')
  })
})
TS

echo "✅ v4.5 applied — Symbolic PHY Signal Strip."
echo "🧪 Run: npm run build && npm test"
