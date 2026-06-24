import * as z from "zod";

import { NormalizedRecordSchema, NormalizedRowSchema } from "../../core/schema";

export const PlayByPlayEventSchema = NormalizedRowSchema;

export const PlayByPlayLineupSchema = NormalizedRecordSchema;

export type PlayByPlayEvent = z.infer<typeof PlayByPlayEventSchema>;
export type PlayByPlayLineup = z.infer<typeof PlayByPlayLineupSchema>;
