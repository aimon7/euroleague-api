import type { z } from "zod";

import { assertSeasonRange, currentSeason, FIRST_SUPPORTED_SEASON, seasonCode } from "./config";
import { EuroleagueSchemaError, EuroleagueValidationError } from "./errors";
import type { HttpClient } from "./http-client";
import { normalizeApiRecord, type NormalizedRecord } from "./normalize";

export abstract class BaseResource {
  protected constructor(protected readonly http: HttpClient) {}

  protected parseArray<T>(schema: z.ZodType<T>, data: unknown, endpoint: string): T[] {
    const rows = extractRows(data);
    const parsedRows = rows.map((row) => schema.safeParse(row));
    const failed = parsedRows.find((result) => !result.success);

    if (failed && !failed.success) {
      throw new EuroleagueSchemaError(
        `Euroleague API response did not match the expected schema for ${endpoint}.`,
        endpoint,
        failed.error.issues
      );
    }

    return parsedRows.map((result) => {
      if (!result.success) {
        throw new EuroleagueSchemaError(
          `Euroleague API response did not match the expected schema for ${endpoint}.`,
          endpoint,
          result.error.issues
        );
      }

      return result.data;
    });
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
    assertValidSeasonRange(from, to);

    const output: T[] = [];

    for (let season = from; season <= to; season += 1) {
      output.push(...(await this.collectSeasonGames(season, loadGame)));
    }

    return output;
  }

  private async collectGameCodes<T>(
    season: number,
    codes: number[],
    loadGame: (season: number, gameCode: number) => Promise<T[]>
  ): Promise<T[]> {
    const output: T[] = [];

    for (const code of codes) {
      output.push(...(await loadGame(season, code)));
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
      output.push(...(await loadSeason(season)));
    }

    return output;
  }

  protected async collectAllSeasons<T>(loadSeason: (season: number) => Promise<T[]>): Promise<T[]> {
    return this.collectSeasonRange(FIRST_SUPPORTED_SEASON, currentSeason(), loadSeason);
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
