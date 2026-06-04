import fs from 'node:fs'
import path from 'node:path'
const file = path.join(process.cwd(), 'data/captures/https-example/packet-fixtures.json')
const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
if (!raw.scenarioId || !Array.isArray(raw.frames)) throw new Error('Invalid fixture file: missing scenarioId or frames[]')
const seen = new Set()
for (const frame of raw.frames) {
  if (!frame.stageId) throw new Error('Frame missing stageId')
  if (typeof frame.frameNumber !== 'number') throw new Error(`Frame ${frame.stageId} missing numeric frameNumber`)
  if (!Array.isArray(frame.protocolStack) || frame.protocolStack.length === 0) throw new Error(`Frame ${frame.stageId} missing protocolStack`)
  if (!frame.fields || typeof frame.fields !== 'object') throw new Error(`Frame ${frame.stageId} missing fields`)
  seen.add(frame.stageId)
}
console.log(`✅ capture fixtures ok: ${raw.frames.length} frames for ${raw.scenarioId}`)
console.log(`📎 stages covered: ${Array.from(seen).join(', ')}`)
