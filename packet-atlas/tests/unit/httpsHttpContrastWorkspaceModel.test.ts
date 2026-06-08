import { describe, expect, it } from 'vitest'
import { buildHttpsHttpContrastWorkspaceSummary } from '../../src/features/packet-atlas/contrast-workspace/httpsHttpContrastWorkspaceModel'

describe('HTTPS vs HTTP contrast workspace model', () => {
  it('builds side-by-side rows for the two verified real fixtures', () => {
    const summary = buildHttpsHttpContrastWorkspaceSummary()

    expect(summary.title).toBe('HTTPS vs plaintext HTTP')
    expect(summary.status).toBe('verified')
    expect(summary.rows.map((row) => row.metric)).toContain('Readable HTTP')
    expect(summary.rows.map((row) => row.metric)).toContain('TLS wrapper')
    expect(summary.headline).toContain('HTTPS hides readable HTTP')
    expect(summary.operatorRule).toContain('Do not infer application content')
  })

  it('shows that HTTPS and plaintext HTTP differ in readable HTTP evidence', () => {
    const summary = buildHttpsHttpContrastWorkspaceSummary()
    const readable = summary.rows.find((row) => row.metric === 'Readable HTTP')

    expect(readable?.httpsValue).toContain('0')
    expect(readable?.httpValue).not.toBe(readable?.httpsValue)
    expect(readable?.explanation).toContain('Plain HTTP exposes')
  })
})
