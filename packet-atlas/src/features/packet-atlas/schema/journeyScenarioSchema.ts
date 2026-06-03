import { z } from 'zod'

export const LayerLensSchema = z.enum([
  'human',
  'application',
  'tls',
  'transport',
  'network',
  'link',
  'physical',
])

export const DirectionSchema = z.enum(['request', 'response', 'internal'])

export const DeviceRoleSchema = z.enum([
  'user',
  'browser',
  'os',
  'nic',
  'switch',
  'router',
  'firewall',
  'dns',
  'proxy',
  'app',
  'db',
])

const ProjectionSchema = z.record(z.string(), z.unknown())

export const JourneyScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  assumptions: z.object({
    ipVersion: z.enum(['ipv4', 'ipv6']),
    dnsMode: z.enum(['udp53', 'tcp53', 'dot', 'doh', 'doq']),
    transportMode: z.enum(['tcp', 'quic']),
    tlsVersion: z.enum(['1.3', 'none']),
    httpMode: z.enum(['1.1', '2', '3']),
    connectionReuse: z.boolean(),
    cacheEnabled: z.boolean(),
    serviceWorkerEnabled: z.boolean(),
    echEnabled: z.boolean(),
    natEnabled: z.boolean(),
    accessMedium: z.enum(['ethernet', 'wifi']),
  }),
  topology: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        kind: z.string(),
      }),
    ),
    links: z.array(
      z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        label: z.string().optional(),
      }),
    ),
  }),
  payloads: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string(),
    }),
  ),
  stages: z.array(
    z.object({
      id: z.string(),
      shortName: z.string(),
      direction: DirectionSchema,
      stageKind: z.string(),
      layerFocus: z.array(LayerLensSchema),
      device: z.object({
        nodeId: z.string(),
        role: DeviceRoleSchema,
      }),
      payloadRef: z.string(),
      addresses: z
        .object({
          srcMac: z.string().optional(),
          dstMac: z.string().optional(),
          srcIp: z.string().optional(),
          dstIp: z.string().optional(),
          srcPort: z.number().optional(),
          dstPort: z.number().optional(),
          natSrcIp: z.string().optional(),
          natSrcPort: z.number().optional(),
        })
        .optional(),
      representations: z.object({
        human: ProjectionSchema.optional(),
        http: ProjectionSchema.optional(),
        tls: ProjectionSchema.optional(),
        tcp: ProjectionSchema.optional(),
        ip: ProjectionSchema.optional(),
        ethernet: ProjectionSchema.optional(),
        bits: ProjectionSchema.optional(),
        signal: ProjectionSchema.optional(),
      }),
      copy: z.object({
        whatUserSees: z.string(),
        whatReallyHappens: z.string(),
        whichLayerLooksAtIt: z.string(),
        samePayloadHereLooksLike: z.string(),
        easyToConfuse: z.string(),
        whyItMatters: z.string(),
        analogy: z.string(),
      }),
      relations: z.object({
        previousIds: z.array(z.string()),
        nextIds: z.array(z.string()),
      }),
      mapPosition: z.object({
        x: z.number(),
        y: z.number(),
        lane: z.enum(['request', 'response', 'internal']),
      }),
    }),
  ),
})

export type JourneyScenario = z.infer<typeof JourneyScenarioSchema>
export type JourneyStage = JourneyScenario['stages'][number]
export type LayerLens = z.infer<typeof LayerLensSchema>
