import { buildRealFrameSemanticRows } from './realFrameSemanticsModel'

export type RealCaptureTimelineGroup = {
  id: string
  label: string
  frameNumbers: number[]
  frameCount: number
  categories: string[]
  dominantCategory: string
  direction: 'client-to-network' | 'network-to-client' | 'mixed'
  explanation: string
}

export type RealCaptureTimelineSummary = {
  groupCount: number
  frameCount: number
  groups: RealCaptureTimelineGroup[]
  story: string
}

function directionForSummary(summary: string): RealCaptureTimelineGroup['direction'] {
  if (summary.includes('192.168.') || summary.includes('10.0.0.10')) {
    if (summary.includes('→')) {
      const [left] = summary.split('→')
      if (left.includes('192.168.') || left.includes('10.0.0.10')) return 'client-to-network'
    }
  }

  if (summary.includes('→ 192.168.') || summary.includes('→ 10.0.0.10')) {
    return 'network-to-client'
  }

  return 'mixed'
}

function groupKey(category: string): string {
  if (category.startsWith('dns-')) return 'dns'
  if (category.startsWith('tcp-')) return 'tcp'
  if (category.startsWith('tls-')) return 'tls'
  return 'other'
}

const groupLabels: Record<string, string> = {
  dns: 'DNS lookup',
  tcp: 'TCP transport setup / maintenance',
  tls: 'TLS protection layer',
  other: 'Other frames',
}

const explanations: Record<string, string> = {
  dns: 'The client asks a resolver for the address of the host and receives an answer.',
  tcp: 'TCP creates and maintains a byte stream. Some frames are setup, some are ACKs or carriers.',
  tls: 'TLS wraps the HTTP conversation. The network sees TLS records, not readable HTTP.',
  other: 'Frames that do not fit the main DNS/TCP/TLS evidence path.',
}

export function buildRealCaptureTimelineSummary(): RealCaptureTimelineSummary {
  const rows = buildRealFrameSemanticRows()
  const buckets = new Map<string, typeof rows>()

  for (const row of rows) {
    const key = groupKey(row.category)
    const bucket = buckets.get(key) ?? []
    bucket.push(row)
    buckets.set(key, bucket)
  }

  const order = ['dns', 'tcp', 'tls', 'other']
  const groups = order
    .filter((key) => buckets.has(key))
    .map((key) => {
      const rowsInGroup = buckets.get(key) ?? []
      const categoryCounts = rowsInGroup.reduce<Record<string, number>>((acc, row) => {
        acc[row.category] = (acc[row.category] ?? 0) + 1
        return acc
      }, {})

      const dominantCategory =
        Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? key

      const directions = new Set(
        rowsInGroup.map((row) => directionForSummary(row.summary)),
      )

      const direction =
        directions.size === 1
          ? ([...directions][0] as RealCaptureTimelineGroup['direction'])
          : 'mixed'

      return {
        id: key,
        label: groupLabels[key] ?? key,
        frameNumbers: rowsInGroup.map((row) => row.frameNumber),
        frameCount: rowsInGroup.length,
        categories: Object.keys(categoryCounts),
        dominantCategory,
        direction,
        explanation: explanations[key] ?? 'Timeline group.',
      }
    })

  return {
    groupCount: groups.length,
    frameCount: rows.length,
    groups,
    story:
      'The real trace compresses into a small evidence timeline: name lookup, transport stream, then TLS-protected application bytes.',
  }
}
