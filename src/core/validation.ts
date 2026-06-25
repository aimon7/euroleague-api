import { EuroleagueValidationError } from "./errors";

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
