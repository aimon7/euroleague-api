type NormalizedValue = boolean | number | string | null;

export type NormalizedRecord = Record<string, NormalizedValue>;

export function normalizeApiRecord(input: Record<string, unknown>): NormalizedRecord {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [toCamelCase(key), normalizeValue(value)])
  ) as NormalizedRecord;
}

function normalizeValue(value: unknown): NormalizedValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    if (typeof value === "string" && isNumericString(value)) {
      return Number(value);
    }

    return value;
  }

  return JSON.stringify(value);
}

function toCamelCase(value: string): string {
  const normalized = value
    .trim()
    .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "")
    .replace(/[_\s.-]+([a-zA-Z0-9])/g, (_, character: string) => character.toUpperCase());

  return normalized.charAt(0).toLowerCase() + normalized.slice(1);
}

function isNumericString(value: string): boolean {
  const trimmed = value.trim();

  return trimmed !== "" && Number.isFinite(Number(trimmed));
}
