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
