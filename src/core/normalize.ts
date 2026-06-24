type NormalizedValue = boolean | number | string | null;

export type NormalizedRecord = Record<string, NormalizedValue>;

export type JsonValue = boolean | number | string | null | JsonValue[] | { [key: string]: JsonValue };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeApiRecord(input: Record<string, unknown>): NormalizedRecord {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [toCamelCase(key), normalizeValue(value)])
  ) as NormalizedRecord;
}

export function normalizeApiRecordDeep(input: Record<string, unknown>): Record<string, JsonValue> {
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [toCamelCase(key), normalizeValueDeep(value)]));
}

function normalizeValue(value: unknown): NormalizedValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return isNumericString(trimmed) ? Number(trimmed) : trimmed;
  }

  return JSON.stringify(value);
}

function normalizeValueDeep(value: unknown): JsonValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return isNumericString(trimmed) ? Number(trimmed) : trimmed;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValueDeep(item));
  }

  if (typeof value === "object") {
    return normalizeApiRecordDeep(value as Record<string, unknown>);
  }

  return String(value);
}

function toCamelCase(value: string): string {
  const words = value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();

      return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

function isNumericString(value: string): boolean {
  const trimmed = value.trim();

  return trimmed !== "" && Number.isFinite(Number(trimmed));
}
