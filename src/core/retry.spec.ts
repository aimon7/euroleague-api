import { describe, expect, it } from "vitest";

import {
  EuroleagueApiError,
  EuroleagueNetworkError,
  EuroleagueParseError,
  EuroleagueSchemaError,
  EuroleagueTimeoutError,
  EuroleagueValidationError
} from "./errors";
import { computeRetryDelayMs, isRetryableError, parseRetryAfter, resolveRetryPolicy, type RetryPolicy } from "./retry";

const URL = "https://live.euroleague.net/api/Points";

function policy(overrides: Partial<RetryPolicy> = {}): RetryPolicy {
  return { baseDelayMs: 500, jitter: false, maxDelayMs: 10_000, retries: 3, ...overrides };
}

describe("resolveRetryPolicy", () => {
  it("defaults to no retries with jittered backoff", () => {
    expect(resolveRetryPolicy()).toEqual({ baseDelayMs: 500, jitter: true, maxDelayMs: 10_000, retries: 0 });
  });

  it("keeps the legacy top-level retries shorthand working", () => {
    expect(resolveRetryPolicy(undefined, 2).retries).toBe(2);
  });

  it("prefers retry.retries over the legacy shorthand", () => {
    expect(resolveRetryPolicy({ retries: 5 }, 2).retries).toBe(5);
  });
});

describe("isRetryableError", () => {
  it("treats 429 and 5xx responses as retryable", () => {
    expect(isRetryableError(new EuroleagueApiError("429", 429, URL, ""))).toBe(true);
    expect(isRetryableError(new EuroleagueApiError("500", 500, URL, ""))).toBe(true);
    expect(isRetryableError(new EuroleagueApiError("502", 502, URL, ""))).toBe(true);
    expect(isRetryableError(new EuroleagueApiError("503", 503, URL, ""))).toBe(true);
  });

  it("treats ordinary 4xx responses as non-retryable", () => {
    for (const status of [400, 401, 403, 404]) {
      expect(isRetryableError(new EuroleagueApiError(String(status), status, URL, ""))).toBe(false);
    }
  });

  it("treats network and timeout failures as retryable", () => {
    expect(isRetryableError(new EuroleagueNetworkError("net", URL))).toBe(true);
    expect(isRetryableError(new EuroleagueTimeoutError("timeout", URL))).toBe(true);
  });

  it("never retries validation, schema, or parse failures", () => {
    expect(isRetryableError(new EuroleagueValidationError("bad input"))).toBe(false);
    expect(isRetryableError(new EuroleagueSchemaError("bad shape", "Points", []))).toBe(false);
    expect(isRetryableError(new EuroleagueParseError("bad json", URL, 200, ""))).toBe(false);
    expect(isRetryableError(new Error("unknown"))).toBe(false);
  });
});

describe("computeRetryDelayMs", () => {
  it("grows exponentially without jitter", () => {
    const p = policy();

    expect(computeRetryDelayMs(0, undefined, p)).toBe(500);
    expect(computeRetryDelayMs(1, undefined, p)).toBe(1000);
    expect(computeRetryDelayMs(2, undefined, p)).toBe(2000);
    expect(computeRetryDelayMs(3, undefined, p)).toBe(4000);
  });

  it("caps the delay at maxDelayMs", () => {
    const p = policy({ maxDelayMs: 3000 });

    expect(computeRetryDelayMs(10, undefined, p)).toBe(3000);
  });

  it("keeps jittered delays within [delay / 2, delay]", () => {
    const p = policy({ jitter: true });

    expect(computeRetryDelayMs(1, undefined, p, () => 0)).toBe(500);
    expect(computeRetryDelayMs(1, undefined, p, () => 0.5)).toBe(750);
    expect(computeRetryDelayMs(1, undefined, p, () => 1)).toBe(1000);
  });

  it("honors Retry-After when it exceeds the computed backoff", () => {
    expect(computeRetryDelayMs(0, 5000, policy())).toBe(5000);
  });

  it("never waits less than the computed backoff even for a tiny Retry-After", () => {
    expect(computeRetryDelayMs(1, 100, policy())).toBe(1000);
  });

  it("caps Retry-After at maxDelayMs", () => {
    expect(computeRetryDelayMs(0, 60_000, policy())).toBe(10_000);
  });
});

describe("parseRetryAfter", () => {
  const now = Date.parse("2026-07-27T10:00:00.000Z");

  it("parses delta-seconds", () => {
    expect(parseRetryAfter("5", now)).toBe(5000);
    expect(parseRetryAfter(" 12 ", now)).toBe(12_000);
    expect(parseRetryAfter("0", now)).toBe(0);
  });

  it("parses an HTTP-date relative to now", () => {
    expect(parseRetryAfter("Mon, 27 Jul 2026 10:00:30 GMT", now)).toBe(30_000);
  });

  it("clamps HTTP-dates in the past to zero", () => {
    expect(parseRetryAfter("Mon, 27 Jul 2026 09:59:00 GMT", now)).toBe(0);
  });

  it("returns undefined for missing or malformed values", () => {
    expect(parseRetryAfter(null, now)).toBeUndefined();
    expect(parseRetryAfter("", now)).toBeUndefined();
    expect(parseRetryAfter("soon", now)).toBeUndefined();
    expect(parseRetryAfter("-5", now)).toBeUndefined();
  });
});
