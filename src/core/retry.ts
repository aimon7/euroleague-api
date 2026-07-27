import { EuroleagueApiError, EuroleagueNetworkError } from "./errors";

/**
 * Retry configuration accepted via `EuroleagueClientOptions.retry`.
 *
 * `retries` counts **additional attempts after the initial request** (the
 * existing `EuroleagueClientOptions.retries` semantics): `retries: 2` issues at
 * most 3 requests. When both `retry.retries` and the top-level `retries`
 * shorthand are provided, `retry.retries` wins.
 */
export interface RetryOptions {
  /** First backoff delay in milliseconds (default 500). */
  baseDelayMs?: number;
  /** Apply equal jitter, keeping each delay within `[delay / 2, delay]` (default true). */
  jitter?: boolean;
  /** Upper bound for any single delay, including `Retry-After` (default 10 000). */
  maxDelayMs?: number;
  /** Additional attempts after the initial request (default 0). */
  retries?: number;
}

export type RetryPolicy = Required<RetryOptions>;

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  baseDelayMs: 500,
  jitter: true,
  maxDelayMs: 10_000,
  retries: 0
};

export function resolveRetryPolicy(retry?: RetryOptions, legacyRetries?: number): RetryPolicy {
  return {
    baseDelayMs: retry?.baseDelayMs ?? DEFAULT_RETRY_POLICY.baseDelayMs,
    jitter: retry?.jitter ?? DEFAULT_RETRY_POLICY.jitter,
    maxDelayMs: retry?.maxDelayMs ?? DEFAULT_RETRY_POLICY.maxDelayMs,
    retries: retry?.retries ?? legacyRetries ?? DEFAULT_RETRY_POLICY.retries
  };
}

/**
 * Only transient failures are retryable: HTTP 429, HTTP 5xx, and transport
 * failures (network/timeout). Deterministic failures — ordinary 4xx, JSON
 * parse, schema, and input validation errors — are never retried.
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof EuroleagueApiError) {
    return error.status === 429 || error.status >= 500;
  }

  return error instanceof EuroleagueNetworkError;
}

/**
 * Delay before the retry that follows the failed attempt `attempt` (0-based).
 *
 * The base delay grows exponentially (`baseDelayMs * 2^attempt`) and is capped
 * at `maxDelayMs`. With `jitter` enabled the delay is drawn uniformly from
 * `[delay / 2, delay]` (equal jitter). A server-provided `Retry-After` raises
 * the delay (never lowers it below the computed backoff) and is capped at
 * `maxDelayMs` as well.
 */
export function computeRetryDelayMs(
  attempt: number,
  retryAfterMs: number | undefined,
  policy: RetryPolicy,
  random: () => number = Math.random
): number {
  const capped = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** attempt);
  const backoff = policy.jitter ? capped / 2 + random() * (capped / 2) : capped;

  if (retryAfterMs === undefined) {
    return backoff;
  }

  return Math.min(policy.maxDelayMs, Math.max(retryAfterMs, backoff));
}

/**
 * Parses a `Retry-After` response header value into milliseconds.
 * Supports delta-seconds (`"5"`) and HTTP-date values; returns `undefined`
 * for missing or malformed input so callers fall back to plain backoff.
 */
export function parseRetryAfter(header: string | null, now: number = Date.now()): number | undefined {
  if (header === null) {
    return undefined;
  }

  const value = header.trim();

  if (/^\d+$/.test(value)) {
    return Number(value) * 1000;
  }

  // A bare negative number is malformed delta-seconds, not an HTTP-date
  // (Date.parse would otherwise interpret it as a year).
  if (/^-\d+$/.test(value)) {
    return undefined;
  }

  const date = Date.parse(value);

  if (Number.isNaN(date)) {
    return undefined;
  }

  return Math.max(0, date - now);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
