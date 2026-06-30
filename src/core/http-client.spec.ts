import { describe, expect, it, vi } from "vitest";

import {
  EuroleagueApiError,
  EuroleagueNetworkError,
  EuroleagueParseError,
  EuroleagueTimeoutError,
  EuroleagueValidationError
} from "./errors";
import { HttpClient } from "./http-client";

const FEED_URL = "https://live.euroleague.net/api/Boxscore";

describe("HttpClient", () => {
  it("parses a JSON body for a 2xx response", async () => {
    const client = new HttpClient({ competition: "euroleague", fetch: jsonFetch({ ok: true }) });

    await expect(client.getUrl(FEED_URL)).resolves.toEqual({ ok: true });
  });

  it("returns undefined for an empty 2xx body", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("", { status: 200 }));
    const client = new HttpClient({ competition: "euroleague", fetch });

    await expect(client.getUrl(FEED_URL)).resolves.toBeUndefined();
  });

  it("throws a typed parse error for a non-JSON 2xx body and does not retry", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response("<html>down for maintenance</html>", { status: 200 }));
    const client = new HttpClient({ competition: "euroleague", fetch, retries: 3 });

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

  it("throws a typed timeout error and retries per the existing policy", async () => {
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
    const client = new HttpClient({ competition: "euroleague", fetch, retries: 2, timeoutMs: 5 });

    const error = await captureError(client.getUrl(FEED_URL));

    expect(error).toBeInstanceOf(EuroleagueTimeoutError);
    expect(error).toBeInstanceOf(EuroleagueNetworkError);
    if (error instanceof EuroleagueTimeoutError) {
      expect(error.url).toBe(FEED_URL);
      expect(error.cause).toBeInstanceOf(Error);
    }
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("throws a typed network error and retries per the existing policy", async () => {
    const cause = new TypeError("fetch failed");
    const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(cause);
    const client = new HttpClient({ competition: "euroleague", fetch, retries: 1 });

    const error = await captureError(client.getUrl(FEED_URL));

    expect(error).toBeInstanceOf(EuroleagueNetworkError);
    expect(error).not.toBeInstanceOf(EuroleagueTimeoutError);
    if (error instanceof EuroleagueNetworkError) {
      expect(error.cause).toBe(cause);
    }
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("retries 5xx responses but throws 4xx responses immediately", async () => {
    const serverFetch = statusFetch(503, "boom");
    const serverClient = new HttpClient({ competition: "euroleague", fetch: serverFetch, retries: 2 });

    await expect(serverClient.getUrl(FEED_URL)).rejects.toBeInstanceOf(EuroleagueApiError);
    expect(serverFetch).toHaveBeenCalledTimes(3);

    const clientFetch = statusFetch(404, "missing");
    const clientClient = new HttpClient({ competition: "euroleague", fetch: clientFetch, retries: 2 });

    await expect(clientClient.getUrl(FEED_URL)).rejects.toBeInstanceOf(EuroleagueApiError);
    expect(clientFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects a non-integer gameCode before calling the live feed", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const client = new HttpClient({ competition: "euroleague", fetch });

    await expect(client.getLiveFeed("Boxscore", { gameCode: 1.5, season: 2023 })).rejects.toBeInstanceOf(
      EuroleagueValidationError
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});

function jsonFetch(payload: unknown): typeof globalThis.fetch {
  return vi.fn<typeof globalThis.fetch>().mockResolvedValue(
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
