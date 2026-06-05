import { z } from 'zod'

export const ScenarioManifestV2Schema = z.object({
  schemaVersion: z.literal(2),
  id: z.string().min(1),
  title: z.string().min(1),
  scenarioModule: z.string().min(1),
  capabilities: z.array(
    z.enum([
      'journey',
      'diagnostics',
      'protocols',
      'internals',
      'capture',
    ]),
  ),
  fixtureIds: z.array(z.string()).default([]),
  qualityProfile: z.object({
    requiresScenarioLint: z.boolean(),
    requiresCaptureCrossValidation: z.boolean(),
    supportsRealCapture: z.boolean(),
  }),
})

export type ScenarioManifestV2 = z.infer<typeof ScenarioManifestV2Schema>
