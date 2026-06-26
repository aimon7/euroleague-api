import * as z from "zod";

import { OptionalApiNumberSchema, OptionalApiStringSchema } from "../../core/api-objects";

export const RoundSchema = z
  .object({
    datesFormmated: OptionalApiStringSchema,
    index: OptionalApiNumberSchema,
    maxGameStartDate: OptionalApiStringSchema,
    minGameStartDate: OptionalApiStringSchema,
    name: z.string(),
    phaseTypeCode: OptionalApiStringSchema,
    round: z.number(),
    seasonCode: OptionalApiStringSchema
  })
  .catchall(z.unknown());

export type Round = z.infer<typeof RoundSchema>;
