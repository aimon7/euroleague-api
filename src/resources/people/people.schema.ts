import * as z from "zod";

import {
  ClubRefSchema,
  ImagesSchema,
  OptionalApiBooleanSchema,
  OptionalApiNumberSchema,
  OptionalApiStringSchema,
  PersonSchema,
  SeasonRefSchema
} from "../../core/api-objects";

export const PersonProfileSchema = PersonSchema;

export const PersonRegistrationSchema = z
  .object({
    active: OptionalApiBooleanSchema,
    club: ClubRefSchema,
    dorsal: OptionalApiStringSchema,
    dorsalRaw: OptionalApiStringSchema,
    endDate: OptionalApiStringSchema,
    externalId: OptionalApiNumberSchema,
    images: ImagesSchema.nullable().optional(),
    lastTeam: OptionalApiStringSchema,
    order: OptionalApiNumberSchema,
    person: PersonSchema,
    position: OptionalApiNumberSchema,
    positionName: OptionalApiStringSchema,
    season: SeasonRefSchema,
    startDate: OptionalApiStringSchema,
    type: z.string(),
    typeName: OptionalApiStringSchema
  })
  .catchall(z.unknown());

const PhaseTypeSchema = z
  .object({
    alias: OptionalApiStringSchema,
    code: z.string(),
    isGroupPhase: OptionalApiBooleanSchema,
    name: z.string()
  })
  .catchall(z.unknown());

const GameGroupSchema = z
  .object({
    id: OptionalApiStringSchema,
    name: z.string(),
    order: OptionalApiNumberSchema,
    rawName: OptionalApiStringSchema
  })
  .catchall(z.unknown());

const GameClubSideSchema = z
  .object({
    club: ClubRefSchema,
    score: OptionalApiNumberSchema,
    standingsScore: OptionalApiNumberSchema
  })
  .catchall(z.unknown());

export const PersonGameSchema = z
  .object({
    confirmedDate: OptionalApiBooleanSchema,
    confirmedHour: OptionalApiBooleanSchema,
    date: OptionalApiStringSchema,
    gameCode: z.number(),
    gameStatus: OptionalApiStringSchema,
    group: GameGroupSchema.nullable().optional(),
    isNeutralVenue: OptionalApiBooleanSchema,
    local: GameClubSideSchema,
    localDate: OptionalApiStringSchema,
    localTimeZone: OptionalApiNumberSchema,
    phaseType: PhaseTypeSchema.nullable().optional(),
    played: OptionalApiBooleanSchema,
    road: GameClubSideSchema,
    round: OptionalApiNumberSchema,
    roundAlias: OptionalApiStringSchema,
    roundName: OptionalApiStringSchema,
    season: SeasonRefSchema,
    utcDate: OptionalApiStringSchema,
    winner: ClubRefSchema.nullable().optional()
  })
  .catchall(z.unknown());

export const PersonStatsLineSchema = z
  .object({
    accuracyAttempted: OptionalApiNumberSchema,
    accuracyMade: OptionalApiNumberSchema,
    assistances: OptionalApiNumberSchema,
    blocksAgainst: OptionalApiNumberSchema,
    blocksFavour: OptionalApiNumberSchema,
    defensiveRebounds: OptionalApiNumberSchema,
    dorsal: OptionalApiNumberSchema,
    fieldGoalsAttempted2: OptionalApiNumberSchema,
    fieldGoalsAttempted3: OptionalApiNumberSchema,
    fieldGoalsAttemptedTotal: OptionalApiNumberSchema,
    fieldGoalsMade2: OptionalApiNumberSchema,
    fieldGoalsMade3: OptionalApiNumberSchema,
    fieldGoalsMadeTotal: OptionalApiNumberSchema,
    foulsCommited: OptionalApiNumberSchema,
    foulsReceived: OptionalApiNumberSchema,
    freeThrowShootingPercentage: OptionalApiStringSchema,
    freeThrowsAttempted: OptionalApiNumberSchema,
    freeThrowsMade: OptionalApiNumberSchema,
    gamesPlayed: OptionalApiNumberSchema,
    gamesStarted: OptionalApiNumberSchema,
    offensiveRebounds: OptionalApiNumberSchema,
    plusMinus: OptionalApiNumberSchema,
    points: OptionalApiNumberSchema,
    startFive: OptionalApiBooleanSchema,
    startFive2: OptionalApiBooleanSchema,
    steals: OptionalApiNumberSchema,
    threePointShootingPercentage: OptionalApiStringSchema,
    timePlayed: OptionalApiNumberSchema,
    totalGamesStarted: OptionalApiNumberSchema,
    totalRebounds: OptionalApiNumberSchema,
    turnovers: OptionalApiNumberSchema,
    twoPointShootingPercentage: OptionalApiStringSchema,
    valuation: OptionalApiNumberSchema
  })
  .catchall(z.unknown());

export const PersonGameStatSchema = z
  .object({
    game: PersonGameSchema,
    playerClubCode: OptionalApiStringSchema,
    stats: PersonStatsLineSchema
  })
  .catchall(z.unknown());

export const PersonStatsSchema = z
  .object({
    accumulated: PersonStatsLineSchema,
    averagePerGame: PersonStatsLineSchema,
    games: z.array(PersonGameStatSchema)
  })
  .catchall(z.unknown());

export const PersonRecordSchema = z
  .object({
    clubCode: z.string(),
    played: z.number(),
    seasonAlias: OptionalApiStringSchema,
    seasonClubName: OptionalApiStringSchema,
    seasonCode: z.string(),
    won: z.number()
  })
  .catchall(z.unknown());

export type PersonProfile = z.infer<typeof PersonProfileSchema>;
export type PersonRegistration = z.infer<typeof PersonRegistrationSchema>;
export type PersonGame = z.infer<typeof PersonGameSchema>;
export type PersonStatsLine = z.infer<typeof PersonStatsLineSchema>;
export type PersonGameStat = z.infer<typeof PersonGameStatSchema>;
export type PersonStats = z.infer<typeof PersonStatsSchema>;
export type PersonRecord = z.infer<typeof PersonRecordSchema>;
