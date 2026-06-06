import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('TShark export streaming', () => {
  it('writes tshark stdout directly to a file to avoid ENOBUFS', () => {
    const script = 'scripts/captures/tshark-export.mjs'
    expect(existsSync(script)).toBe(true)

    const text = readFileSync(script, 'utf8')
    expect(text).toContain('fs.openSync(output')
    expect(text).toContain("stdio: ['ignore', outFd, 'pipe']")
    expect(text).toContain('avoids spawnSync ENOBUFS')
  })
})
