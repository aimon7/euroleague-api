import * as z from "zod";

import { NormalizedRecordSchema } from "../../core/schema";

export const GameReportSchema = NormalizedRecordSchema;

export const GameStatsSchema = NormalizedRecordSchema;

export const GameTeamsComparisonSchema = NormalizedRecordSchema;

export type GameReport = z.infer<typeof GameReportSchema>;
export type GameStats = z.infer<typeof GameStatsSchema>;
export type GameTeamsComparison = z.infer<typeof GameTeamsComparisonSchema>;
