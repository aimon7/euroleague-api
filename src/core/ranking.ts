import { EuroleagueValidationError } from "./errors";

/**
 * Ranks already-parsed rows by a (normalized) statistic key, descending. Used by
 * the players/teams leader boards: the upstream `/leaders` endpoint no longer
 * exists, so leaders are derived client-side from the v3 statistics list.
 *
 * Non-numeric or missing values sort last. Throws if `statistic` is absent from
 * the rows (best-effort: checks the first row), to surface caller typos.
 */
export function rankByStatistic<T extends Record<string, unknown>>(rows: T[], statistic: string): T[] {
  const sample = rows[0];

  if (sample && !(statistic in sample)) {
    throw new EuroleagueValidationError(
      `Unknown statistic "${statistic}". Available statistics: ${Object.keys(sample).join(", ")}.`
    );
  }

  return [...rows].sort((a, b) => statisticValue(b[statistic]) - statisticValue(a[statistic]));
}

function statisticValue(value: unknown): number {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}
