import type { z } from "zod";

import { assertSeasonRange, currentSeason, FIRST_SUPPORTED_SEASON } from "./config";
import { EuroleagueSchemaError, EuroleagueValidationError } from "./errors";
import type { HttpClient } from "./http-client";

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
  const rows = record.Rows ?? record.rows ?? record.data ?? record.Data;

  if (!Array.isArray(rows)) {
    throw new EuroleagueSchemaError("Euroleague API response did not contain an array payload.", "unknown", []);
  }

  return rows;
}

function assertValidSeasonRange(from: number, to: number): void {
  try {
    assertSeasonRange(from, to);
  } catch (error) {
    throw new EuroleagueValidationError(error instanceof Error ? error.message : "Invalid season range.");
  }
}
