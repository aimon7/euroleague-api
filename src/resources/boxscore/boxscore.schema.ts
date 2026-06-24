import * as z from "zod";

import { NormalizedRecordSchema, NormalizedRowSchema } from "../../core/schema";

export const BoxscoreSchema = NormalizedRecordSchema;

export const QuarterScoreSchema = NormalizedRowSchema;

export const PlayerBoxscoreSchema = NormalizedRowSchema;

export type Boxscore = z.infer<typeof BoxscoreSchema>;
export type QuarterScore = z.infer<typeof QuarterScoreSchema>;
export type PlayerBoxscore = z.infer<typeof PlayerBoxscoreSchema>;
