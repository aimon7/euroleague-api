import * as z from "zod";

import {
  OptionalApiBooleanSchema,
  OptionalApiNumberSchema,
  OptionalApiStringSchema,
  RegistrationSchema
} from "../../core/api-objects";
import { NormalizedRecordSchema, NormalizedRowSchema } from "../../core/schema";

export const BoxscoreSchema = NormalizedRecordSchema;

export const QuarterScoreSchema = NormalizedRowSchema;

export const PlayerBoxscoreSchema = NormalizedRowSchema;

export type Boxscore = z.infer<typeof BoxscoreSchema>;
export type QuarterScore = z.infer<typeof QuarterScoreSchema>;
export type PlayerBoxscore = z.infer<typeof PlayerBoxscoreSchema>;

// --- v2 JSON boxscore (A6: /seasons/{seasoncode}/games/{gameCode}/stats) ---

// Shared statistical line. Backs the per-team `team` (team-rebound) row, the
// `total` (full team) row, and the base of every player's `stats`.
const STAT_LINE_FIELDS = {
  accuracyAttempted: OptionalApiNumberSchema,
  accuracyMade: OptionalApiNumberSchema,
  assistances: OptionalApiNumberSchema,
  blocksAgainst: OptionalApiNumberSchema,
  blocksFavour: OptionalApiNumberSchema,
  defensiveRebounds: OptionalApiNumberSchema,
  fieldGoalsAttempted2: OptionalApiNumberSchema,
  fieldGoalsAttempted3: OptionalApiNumberSchema,
  fieldGoalsAttemptedTotal: OptionalApiNumberSchema,
  fieldGoalsMade2: OptionalApiNumberSchema,
  fieldGoalsMade3: OptionalApiNumberSchema,
  fieldGoalsMadeTotal: OptionalApiNumberSchema,
  foulsCommited: OptionalApiNumberSchema,
  foulsReceived: OptionalApiNumberSchema,
  freeThrowsAttempted: OptionalApiNumberSchema,
  freeThrowsMade: OptionalApiNumberSchema,
  offensiveRebounds: OptionalApiNumberSchema,
  plusMinus: OptionalApiNumberSchema,
  points: OptionalApiNumberSchema,
  steals: OptionalApiNumberSchema,
  timePlayed: OptionalApiNumberSchema,
  totalRebounds: OptionalApiNumberSchema,
  turnovers: OptionalApiNumberSchema,
  valuation: OptionalApiNumberSchema
} as const;

export const BoxscoreStatsLineSchema = z.object(STAT_LINE_FIELDS).catchall(z.unknown());

const BoxscoreStatsPlayerLineSchema = z
  .object({
    ...STAT_LINE_FIELDS,
    dorsal: OptionalApiNumberSchema,
    startFive: OptionalApiBooleanSchema,
    startFive2: OptionalApiBooleanSchema
  })
  .catchall(z.unknown());

export const BoxscoreStatsCoachSchema = z
  .object({
    code: OptionalApiStringSchema,
    name: OptionalApiStringSchema
  })
  .catchall(z.unknown());

export const BoxscoreStatsPlayerSchema = z
  .object({
    player: RegistrationSchema,
    stats: BoxscoreStatsPlayerLineSchema
  })
  .catchall(z.unknown());

export const BoxscoreStatsTeamSchema = z
  .object({
    coach: BoxscoreStatsCoachSchema.nullable().optional(),
    players: z.array(BoxscoreStatsPlayerSchema),
    team: BoxscoreStatsLineSchema,
    total: BoxscoreStatsLineSchema
  })
  .catchall(z.unknown());

export const BoxscoreStatsSchema = z
  .object({
    local: BoxscoreStatsTeamSchema,
    road: BoxscoreStatsTeamSchema
  })
  .catchall(z.unknown());

export type BoxscoreStatsLine = z.infer<typeof BoxscoreStatsLineSchema>;
export type BoxscoreStatsCoach = z.infer<typeof BoxscoreStatsCoachSchema>;
export type BoxscoreStatsPlayer = z.infer<typeof BoxscoreStatsPlayerSchema>;
export type BoxscoreStatsTeam = z.infer<typeof BoxscoreStatsTeamSchema>;
export type BoxscoreStats = z.infer<typeof BoxscoreStatsSchema>;
