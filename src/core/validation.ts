import { EuroleagueValidationError } from "./errors";

const SAFE_PATH_SEGMENT_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Validates that a caller-provided value belongs to a closed set of allowed
 * values before it is interpolated into a request URL path (or used as a feed
 * key). The TypeScript unions already guarantee this for typed callers, but a
 * caller bypassing the types (e.g. via `as any`) could otherwise inject path
 * traversal segments such as `../`. Returns the value for convenient inline use.
 */
export function ensureOneOf<T extends string>(value: T, allowed: readonly T[], label: string): T {
  if (!allowed.includes(value)) {
    throw new EuroleagueValidationError(
      `Expected ${label} to be one of: ${allowed.join(", ")}. Received: ${String(value)}`
    );
  }

  return value;
}

/**
 * Validates an open-ended caller-provided URL path segment. Use this for API
 * path params that cannot be represented as a closed allow-list.
 */
export function ensurePathSegment(value: string, label: string): string {
  if (typeof value !== "string" || !SAFE_PATH_SEGMENT_PATTERN.test(value)) {
    throw new EuroleagueValidationError(
      `Expected ${label} to be a non-empty path segment containing only letters, numbers, underscores, or hyphens. Received: ${String(
        value
      )}`
    );
  }

  return value;
}
