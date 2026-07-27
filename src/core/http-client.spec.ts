import { afterEach, describe, expect, it, vi } from "vitest";

import {
  EuroleagueApiError,
  EuroleagueNetworkError,
  EuroleagueParseError,
  EuroleagueTimeoutError,
  EuroleagueValidationError
} from "./errors";
import { HttpClient, type HttpClientOptions } from "./http-client";

const FEED_URL = "https://live.euroleague.net/api/Boxscore";

function createClient(overrides: Partial<HttpClientOptions> & Pick<HttpClientOptions, "fetch">): HttpClient {
  return new HttpClient({ competition: "euroleague", liveFeedIntervalMs: 0, ...overrides });
}

describe("HttpClient", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("parses a JSON body for a 2xx response", async () => {
    const client = createClient({ fetch: jsonFetch({ ok: true }) });

    await expect(client.getUrl(FEED_URL)).resolves.toEqual({ ok: true });
  });

  it("returns undefined for an empty 2xx body", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("", { status: 200 }));
    const client = createClient({ fetch });

    await expect(client.getUrl(FEED_URL)).resolves.toBeUndefined();
  });

  it("throws a typed parse error for a non-JSON 2xx body and does not retry", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response("<html>down for maintenance</html>", { status: 200 }));
    const client = createClient({ fetch, retries: 3 });

    const error = await captureError(client.getUrl(FEED_URL));

    expect(error).toBeInstanceOf(EuroleagueParseError);
    if (error instanceof EuroleagueParseError) {
      expect(error.url).toBe(FEED_URL);
      expect(error.status).toBe(200);
      expect(error.bodySnippet).toContain("down for maintenance");
      expect(error.cause).toBeInstanceOf(SyntaxError);
    }
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("throws a typed timeout error, retrying each attempt with a fresh timeout", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const abortError = new Error("The operation was aborted.");
            abortError.name = "AbortError";
            reject(abortError);
          });
        })
    );
    const client = createClient({ fetch, retries: 2, timeoutMs: 5 });

    const pending = captureError(client.getUrl(FEED_URL));
    await vi.runAllTimersAsync();
    const error = await pending;

    expect(error).toBeInstanceOf(EuroleagueTimeoutError);
    expect(error).toBeInstanceOf(EuroleagueNetworkError);
    if (error instanceof EuroleagueTimeoutError) {
      expect(error.url).toBe(FEED_URL);
      expect(error.cause).toBeInstanceOf(Error);
    }
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("retries a transient network error after a backoff delay, not immediately", async () => {
    vi.useFakeTimers();
    const cause = new TypeError("fetch failed");
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockRejectedValueOnce(cause)
      .mockResolvedValue(new Response("{}", { status: 200 }));
    const client = createClient({ fetch, retry: { baseDelayMs: 500, jitter: false, retries: 1 } });

    const pending = client.getUrl(FEED_URL);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(499);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    await expect(pending).resolves.toEqual({});
  });

  it("wraps a persistent network failure in a typed error with its cause", async () => {
    vi.useFakeTimers();
    const cause = new TypeError("fetch failed");
    const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(cause);
    const client = createClient({ fetch, retries: 1, retry: { jitter: false } });

    const pending = captureError(client.getUrl(FEED_URL));
    await vi.runAllTimersAsync();
    const error = await pending;

    expect(error).toBeInstanceOf(EuroleagueNetworkError);
    expect(error).not.toBeInstanceOf(EuroleagueTimeoutError);
    if (error instanceof EuroleagueNetworkError) {
      expect(error.cause).toBe(cause);
    }
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("retries 5xx responses with exponential backoff and no sleep after the final attempt", async () => {
    vi.useFakeTimers();
    const fetch = statusFetch(503, "boom");
    const client = createClient({ fetch, retry: { baseDelayMs: 500, jitter: false, retries: 2 } });

    const pending = captureError(client.getUrl(FEED_URL));
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);

    // First retry after 500ms.
    await vi.advanceTimersByTimeAsync(500);
    expect(fetch).toHaveBeenCalledTimes(2);

    // Second retry after 1000ms more (exponential).
    await vi.advanceTimersByTimeAsync(999);
    expect(fetch).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(3);

    // Final attempt failed: the promise settles without any pending sleep.
    await expect(pending).resolves.toBeInstanceOf(EuroleagueApiError);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([500, 502, 503])("treats %d as retryable", async (status) => {
    vi.useFakeTimers();
    const fetch = statusFetch(status, "boom");
    const client = createClient({ fetch, retry: { baseDelayMs: 1, jitter: false, retries: 1 } });

    const pending = captureError(client.getUrl(FEED_URL));
    await vi.runAllTimersAsync();

    await expect(pending).resolves.toBeInstanceOf(EuroleagueApiError);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([400, 401, 403, 404])("throws %d immediately without retrying", async (status) => {
    const fetch = statusFetch(status, "nope");
    const client = createClient({ fetch, retries: 2 });

    await expect(client.getUrl(FEED_URL)).rejects.toBeInstanceOf(EuroleagueApiError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retries a 429 and honors Retry-After delta-seconds", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response("slow down", { headers: { "retry-after": "5" }, status: 429 }))
      .mockResolvedValue(new Response("{}", { status: 200 }));
    const client = createClient({ fetch, retry: { baseDelayMs: 500, jitter: false, retries: 1 } });

    const pending = client.getUrl(FEED_URL);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(4999);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    await expect(pending).resolves.toEqual({});
  });

  it("honors an HTTP-date Retry-After", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T10:00:00.000Z"));
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(
        new Response("slow down", { headers: { "retry-after": "Mon, 27 Jul 2026 10:00:03 GMT" }, status: 429 })
      )
      .mockResolvedValue(new Response("{}", { status: 200 }));
    const client = createClient({ fetch, retry: { baseDelayMs: 500, jitter: false, retries: 1 } });

    const pending = client.getUrl(FEED_URL);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(2999);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    await expect(pending).resolves.toEqual({});
  });

  it("falls back to plain backoff for a malformed Retry-After", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response("slow down", { headers: { "retry-after": "soon" }, status: 429 }))
      .mockResolvedValue(new Response("{}", { status: 200 }));
    const client = createClient({ fetch, retry: { baseDelayMs: 500, jitter: false, retries: 1 } });

    const pending = client.getUrl(FEED_URL);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(499);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    await expect(pending).resolves.toEqual({});
  });

  it("exposes retryAfterMs on the thrown EuroleagueApiError", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response("slow down", { headers: { "retry-after": "7" }, status: 429 }));
    const client = createClient({ fetch });

    const error = await captureError(client.getUrl(FEED_URL));

    expect(error).toBeInstanceOf(EuroleagueApiError);
    if (error instanceof EuroleagueApiError) {
      expect(error.status).toBe(429);
      expect(error.retryAfterMs).toBe(7000);
    }
  });

  it("applies jitter within [delay / 2, delay] using the injected random source", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response("boom", { status: 503 }))
      .mockResolvedValue(new Response("{}", { status: 200 }));
    // random() = 0.5 -> delay = 250 + 0.5 * 250 = 375ms for a 500ms base.
    const client = createClient({ fetch, random: () => 0.5, retry: { baseDelayMs: 500, jitter: true, retries: 1 } });

    const pending = client.getUrl(FEED_URL);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(374);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    await expect(pending).resolves.toEqual({});
  });

  it("caps backoff at maxDelayMs", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response("boom", { status: 503 }))
      .mockResolvedValueOnce(new Response("boom", { status: 503 }))
      .mockResolvedValue(new Response("{}", { status: 200 }));
    const client = createClient({ fetch, retry: { baseDelayMs: 4000, jitter: false, maxDelayMs: 5000, retries: 2 } });

    const pending = client.getUrl(FEED_URL);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(4000);
    expect(fetch).toHaveBeenCalledTimes(2);

    // Uncapped exponential would be 8000ms; the cap holds it at 5000ms.
    await vi.advanceTimersByTimeAsync(4999);
    expect(fetch).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(3);
    await expect(pending).resolves.toEqual({});
  });

  it("makes a single attempt when retries is 0 (default)", async () => {
    const fetch = statusFetch(503, "boom");
    const client = createClient({ fetch });

    await expect(client.getUrl(FEED_URL)).rejects.toBeInstanceOf(EuroleagueApiError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("keeps the legacy retries option meaning additional attempts", async () => {
    vi.useFakeTimers();
    const fetch = statusFetch(503, "boom");
    const client = createClient({ fetch, retries: 2, retry: { baseDelayMs: 1, jitter: false } });

    const pending = captureError(client.getUrl(FEED_URL));
    await vi.runAllTimersAsync();

    await expect(pending).resolves.toBeInstanceOf(EuroleagueApiError);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("paces consecutive live-feed requests by liveFeedIntervalMs", async () => {
    vi.useFakeTimers();
    const fetch = jsonFetch({});
    const client = new HttpClient({ competition: "euroleague", fetch, liveFeedIntervalMs: 250 });

    const first = client.getUrl(FEED_URL);
    const second = client.getUrl("https://live.euroleague.net/wapi/Team");

    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(249);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    await expect(first).resolves.toEqual({});
    await expect(second).resolves.toEqual({});
  });

  it("paces retry attempts against the live feed even when backoff is zero", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response("boom", { status: 503 }))
      .mockResolvedValue(new Response("{}", { status: 200 }));
    const client = new HttpClient({
      competition: "euroleague",
      fetch,
      liveFeedIntervalMs: 250,
      retry: { baseDelayMs: 0, jitter: false, retries: 1 }
    });

    const pending = client.getUrl(FEED_URL);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);

    // No backoff delay, but the retry still may not burst past the pacer.
    await vi.advanceTimersByTimeAsync(249);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    await expect(pending).resolves.toEqual({});
  });

  it("does not pace standard API requests", async () => {
    vi.useFakeTimers();
    const fetch = jsonFetch({});
    const client = new HttpClient({ competition: "euroleague", fetch, liveFeedIntervalMs: 250 });

    const first = client.getApi("v3", "/players");
    const second = client.getApi("v2", "/seasons");

    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(2);
    await first;
    await second;
  });

  it("rejects a non-integer gameCode before calling the live feed", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const client = createClient({ fetch });

    await expect(client.getLiveFeed("Boxscore", { gameCode: 1.5, season: 2023 })).rejects.toBeInstanceOf(
      EuroleagueValidationError
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});

function jsonFetch(payload: unknown): typeof globalThis.fetch {
  return vi.fn<typeof globalThis.fetch>().mockImplementation(
    async () =>
      new Response(JSON.stringify(payload), {
        headers: { "content-type": "application/json" },
        status: 200
      })
  );
}

function statusFetch(status: number, body: string): typeof globalThis.fetch {
  return vi.fn<typeof globalThis.fetch>().mockImplementation(async () => new Response(body, { status }));
}

async function captureError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }

  throw new Error("Expected the promise to reject.");
}
