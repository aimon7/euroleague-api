import * as z from "zod";

import {
  ClubRefSchema,
  CountrySchema,
  ImagesSchema,
  OptionalApiBooleanSchema,
  OptionalApiNumberSchema,
  OptionalApiStringSchema,
  SeasonRefSchema
} from "../../core/api-objects";
import { NormalizedRecordSchema } from "../../core/schema";

export const GameReportSchema = NormalizedRecordSchema;

export const GameStatsSchema = NormalizedRecordSchema;

export const GameTeamsComparisonSchema = NormalizedRecordSchema;

const GameGroupSchema = z
  .object({
    id: OptionalApiStringSchema,
    name: OptionalApiStringSchema,
    order: OptionalApiNumberSchema,
    rawName: OptionalApiStringSchema
  })
  .catchall(z.unknown());

const GamePhaseTypeSchema = z
  .object({
    alias: OptionalApiStringSchema,
    code: z.string(),
    isGroupPhase: OptionalApiBooleanSchema,
    name: OptionalApiStringSchema
  })
  .catchall(z.unknown());

const GamePartialsSchema = z
  .object({
    extraPeriods: z.record(z.string(), z.unknown()).nullable().optional(),
    partials1: OptionalApiNumberSchema,
    partials2: OptionalApiNumberSchema,
    partials3: OptionalApiNumberSchema,
    partials4: OptionalApiNumberSchema
  })
  .catchall(z.unknown());

const GameTeamSideSchema = z
  .object({
    club: ClubRefSchema,
    partials: GamePartialsSchema.nullable().optional(),
    score: OptionalApiNumberSchema,
    standingsScore: OptionalApiNumberSchema
  })
  .catchall(z.unknown());

const GameRefereeSchema = z
  .object({
    active: OptionalApiBooleanSchema,
    alias: OptionalApiStringSchema,
    code: z.string(),
    country: CountrySchema.nullable().optional(),
    images: ImagesSchema.nullable().optional(),
    name: OptionalApiStringSchema
  })
  .catchall(z.unknown());

const GameVenueSchema = z
  .object({
    active: OptionalApiBooleanSchema,
    address: OptionalApiStringSchema,
    capacity: OptionalApiNumberSchema,
    code: OptionalApiStringSchema,
    images: ImagesSchema.nullable().optional(),
    name: OptionalApiStringSchema,
    notes: OptionalApiStringSchema
  })
  .catchall(z.unknown());

export const GameInfoSchema = z
  .object({
    audience: OptionalApiNumberSchema,
    audienceConfirmed: OptionalApiBooleanSchema,
    confirmedDate: OptionalApiBooleanSchema,
    confirmedHour: OptionalApiBooleanSchema,
    date: OptionalApiStringSchema,
    gameCode: z.number(),
    gameStatus: OptionalApiStringSchema,
    group: GameGroupSchema.nullable().optional(),
    id: OptionalApiStringSchema,
    identifier: OptionalApiStringSchema,
    isNeutralVenue: OptionalApiBooleanSchema,
    local: GameTeamSideSchema,
    localDate: OptionalApiStringSchema,
    localTimeZone: OptionalApiNumberSchema,
    operationsCode: OptionalApiStringSchema,
    phaseType: GamePhaseTypeSchema.nullable().optional(),
    played: OptionalApiBooleanSchema,
    referee1: GameRefereeSchema.nullable().optional(),
    referee2: GameRefereeSchema.nullable().optional(),
    referee3: GameRefereeSchema.nullable().optional(),
    referee4: GameRefereeSchema.nullable().optional(),
    road: GameTeamSideSchema,
    round: OptionalApiNumberSchema,
    roundAlias: OptionalApiStringSchema,
    roundName: OptionalApiStringSchema,
    season: SeasonRefSchema,
    socialFeed: OptionalApiStringSchema,
    utcDate: OptionalApiStringSchema,
    venue: GameVenueSchema.nullable().optional(),
    winner: ClubRefSchema.nullable().optional()
  })
  .catchall(z.unknown());

export type GameReport = z.infer<typeof GameReportSchema>;
export type GameStats = z.infer<typeof GameStatsSchema>;
export type GameTeamsComparison = z.infer<typeof GameTeamsComparisonSchema>;
export type GameInfo = z.infer<typeof GameInfoSchema>;
