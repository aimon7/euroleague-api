import type { z } from "zod";

import { assertSeasonRange, currentSeason, FIRST_SUPPORTED_SEASON, seasonCode } from "./config";
import { EuroleagueSchemaError, EuroleagueValidationError } from "./errors";
import type { HttpClient } from "./http-client";
import { normalizeApiRecord, type NormalizedRecord } from "./normalize";
import { mapWithConcurrency } from "./pacing";

// Per-game fan-out (round/season/seasons helpers) keeps at most this many
// requests in flight. The HttpClient's live-feed pacer caps the actual request
// rate; this bound only limits overlap.
const GAME_FANOUT_CONCURRENCY = 4;

export abstract class BaseResource {
  protected constructor(protected readonly http: HttpClient) {}

  protected parseArray<T>(schema: z.ZodType<T>, data: unknown, endpoint: string): T[] {
    const parsed: T[] = [];

    for (const row of extractRows(data)) {
      const result = schema.safeParse(row);

      if (!result.success) {
        throw new EuroleagueSchemaError(
          `Euroleague API response did not match the expected schema for ${endpoint}.`,
          endpoint,
          result.error.issues
        );
      }

      parsed.push(result.data);
    }

    return parsed;
  }

  protected parseRecord<T>(schema: z.ZodType<T>, data: unknown, endpoint: string): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new EuroleagueSchemaError(
        `Euroleague API response did not match the expected schema for ${endpoint}.`,
        endpoint,
        result.error.issues
      );
    }

    return result.data;
  }

  protected normalizeRows(data: unknown): NormalizedRecord[] {
    return extractRows(data).map((row) => normalizeApiRecord(row as Record<string, unknown>));
  }

  protected async listGameCodes(season: number, round?: number): Promise<number[]> {
    const data = await this.http.getApi(
      "v2",
      `/seasons/${seasonCode(this.http.competition, season)}/games`,
      round === undefined ? undefined : { roundNumber: round }
    );

    return extractGameCodes(data);
  }

  protected async collectRoundGames<T>(
    season: number,
    round: number,
    loadGame: (season: number, gameCode: number) => Promise<T[]>
  ): Promise<T[]> {
    const codes = await this.listGameCodes(season, round);

    return this.collectGameCodes(season, codes, loadGame);
  }

  protected async collectSeasonGames<T>(
    season: number,
    loadGame: (season: number, gameCode: number) => Promise<T[]>
  ): Promise<T[]> {
    const codes = await this.listGameCodes(season);

    return this.collectGameCodes(season, codes, loadGame);
  }

  protected async collectSeasonsGames<T>(
    from: number,
    to: number,
    loadGame: (season: number, gameCode: number) => Promise<T[]>
  ): Promise<T[]> {
    return this.collectSeasonRange(from, to, (season) => this.collectSeasonGames(season, loadGame));
  }

  private async collectGameCodes<T>(
    season: number,
    codes: number[],
    loadGame: (season: number, gameCode: number) => Promise<T[]>
  ): Promise<T[]> {
    const feeds = await mapWithConcurrency(codes, GAME_FANOUT_CONCURRENCY, (code) => loadGame(season, code));
    const output: T[] = [];

    for (const feed of feeds) {
      appendAll(output, feed);
    }

    return output;
  }

  protected async collectSeasonRange<T>(
    from: number,
    to: number,
    loadSeason: (season: number) => Promise<T[]>
  ): Promise<T[]> {
    assertValidSeasonRange(from, to);

    const output: T[] = [];

    for (let season = from; season <= to; season += 1) {
      appendAll(output, await loadSeason(season));
    }

    return output;
  }

  protected async collectAllSeasons<T>(loadSeason: (season: number) => Promise<T[]>): Promise<T[]> {
    return this.collectSeasonRange(FIRST_SUPPORTED_SEASON, currentSeason(), loadSeason);
  }
}

// Append items one-by-one instead of `target.push(...items)`: spreading a whole
// season/range feed (shots, play-by-play, etc.) can exceed the JS argument-count
// limit and throw a RangeError for large feeds. Iteration order is preserved.
function appendAll<T>(target: T[], items: readonly T[]): void {
  for (const item of items) {
    target.push(item);
  }
}

function extractRows(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    throw new EuroleagueSchemaError("Euroleague API response did not contain an array payload.", "unknown", []);
  }

  const record = data as Record<string, unknown>;
  const rows = record.Rows ?? record.rows ?? record.data ?? record.Data ?? record.teams ?? record.players;

  if (!Array.isArray(rows)) {
    throw new EuroleagueSchemaError("Euroleague API response did not contain an array payload.", "unknown", []);
  }

  return rows;
}

function extractGameCodes(data: unknown): number[] {
  const codes: number[] = [];

  for (const row of extractRows(data)) {
    if (!row || typeof row !== "object") {
      continue;
    }

    const record = row as Record<string, unknown>;

    if (record.played === false || record.Played === false) {
      continue;
    }

    const rawCode = record.gameCode ?? record.GameCode ?? record.gamecode;
    const code = typeof rawCode === "string" ? Number(rawCode) : rawCode;

    if (typeof code === "number" && Number.isFinite(code)) {
      codes.push(code);
    }
  }

  return codes;
}

function assertValidSeasonRange(from: number, to: number): void {
  try {
    assertSeasonRange(from, to);
  } catch (error) {
    throw new EuroleagueValidationError(error instanceof Error ? error.message : "Invalid season range.");
  }
}
