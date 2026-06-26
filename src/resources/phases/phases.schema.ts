import * as z from "zod";

import {
  OptionalApiBooleanSchema,
  OptionalApiNumberSchema,
  OptionalApiStringSchema,
  SeasonRefSchema
} from "../../core/api-objects";

export const PhaseTypeSchema = z
  .object({
    alias: OptionalApiStringSchema,
    code: z.string(),
    isGroupPhase: OptionalApiBooleanSchema,
    name: OptionalApiStringSchema
  })
  .catchall(z.unknown());

export const PhaseSchema = z
  .object({
    endDate: OptionalApiStringSchema,
    hasGames: OptionalApiBooleanSchema,
    hasPlayedGames: OptionalApiBooleanSchema,
    order: OptionalApiNumberSchema,
    phaseType: PhaseTypeSchema,
    season: SeasonRefSchema,
    startDate: OptionalApiStringSchema
  })
  .catchall(z.unknown());

export type PhaseType = z.infer<typeof PhaseTypeSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
