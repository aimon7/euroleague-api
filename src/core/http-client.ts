import {
  type ApiHosts,
  type ApiVersion,
  type Competition,
  competitionCode,
  type EuroleagueClientOptions,
  type LiveFeed,
  mergeHosts,
  seasonCode
} from "./config";
import {
  EuroleagueApiError,
  EuroleagueNetworkError,
  EuroleagueParseError,
  EuroleagueTimeoutError,
  EuroleagueValidationError
} from "./errors";
import { RequestPacer } from "./pacing";
import {
  computeRetryDelayMs,
  isRetryableError,
  parseRetryAfter,
  resolveRetryPolicy,
  type RetryPolicy,
  sleep
} from "./retry";
import { ensureInteger } from "./validation";

const BODY_SNIPPET_LIMIT = 200;
const DEFAULT_LIVE_FEED_INTERVAL_MS = 250;

type QueryValue = boolean | number | string | null | undefined;

export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export interface HttpClientOptions extends EuroleagueClientOptions {
  competition: Competition;
  /** Internal test hook for deterministic jitter. Defaults to `Math.random`. */
  random?: () => number;
}

export class HttpClient {
  readonly competition: Competition;
  readonly hosts: ApiHosts;
  readonly retries: number;
  readonly timeoutMs: number;

  readonly #fetch: typeof fetch;
  readonly #livePacer: RequestPacer;
  readonly #paceOrigins: ReadonlySet<string>;
  readonly #random: () => number;
  readonly #retry: RetryPolicy;

  constructor(options: HttpClientOptions) {
    this.competition = options.competition;
    this.hosts = mergeHosts(options.hosts);
    this.#retry = resolveRetryPolicy(options.retry, options.retries);
    this.retries = this.#retry.retries;
    this.timeoutMs = options.timeoutMs ?? 60_000;
    this.#fetch = options.fetch ?? globalThis.fetch;
    this.#random = options.random ?? Math.random;
    this.#livePacer = new RequestPacer(options.liveFeedIntervalMs ?? DEFAULT_LIVE_FEED_INTERVAL_MS);
    this.#paceOrigins = collectOrigins(this.hosts.live, this.hosts.wapi);

    if (!this.#fetch) {
      throw new EuroleagueValidationError("No fetch implementation is available.");
    }
  }

  async getApi(version: ApiVersion, path: string, query?: QueryParams): Promise<unknown> {
    const host = this.hosts[version];
    const basePath =
      version === "v1"
        ? `${host}${ensureLeadingSlash(path)}`
        : `${host}/competitions/${competitionCode(this.competition)}${ensureLeadingSlash(path)}`;

    return this.getUrl(buildUrl(basePath, query));
  }

  async getLiveFeed(
    feed: LiveFeed,
    params: { gameCode: number; season: number },
    extraQuery?: QueryParams
  ): Promise<unknown> {
    const gameCode = ensureInteger(params.gameCode, "gameCode");

    return this.getUrl(
      buildUrl(`${this.hosts.live}/${feed}`, {
        gamecode: gameCode,
        seasoncode: seasonCode(this.competition, params.season),
        ...extraQuery
      })
    );
  }

  async getUrl(url: string): Promise<unknown> {
    // Pace requests to the shared live-feed origin so fan-out helpers (and
    // consumer-driven bursts) do not trip upstream rate limits. Every attempt
    // is paced, so concurrent fan-out retries waking from backoff at the same
    // time cannot burst past the pacer either.
    const paced = this.#paceOrigins.has(originOf(url) ?? "");

    for (let attempt = 0; ; attempt += 1) {
      if (paced) {
        await this.#livePacer.acquire();
      }

      try {
        return await this.fetchJson(url);
      } catch (error) {
        if (attempt >= this.#retry.retries || !isRetryableError(error)) {
          throw error;
        }

        const delayMs = computeRetryDelayMs(attempt, retryAfterMsFrom(error), this.#retry, this.#random);

        if (delayMs > 0) {
          await sleep(delayMs);
        }
      }
    }
  }

  private async fetchJson(url: string): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    let body: string;

    try {
      response = await this.#fetch(url, {
        headers: {
          accept: "application/json"
        },
        signal: controller.signal
      });

      body = await response.text();
    } catch (error) {
      throw toTransportError(error, url, controller.signal.aborted);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new EuroleagueApiError(
        `Euroleague API returned ${response.status} for ${url}`,
        response.status,
        url,
        body,
        parseRetryAfter(response.headers.get("retry-after"))
      );
    }

    if (body.length === 0) {
      return undefined;
    }

    return parseJsonBody(body, url, response.status);
  }
}

function retryAfterMsFrom(error: unknown): number | undefined {
  return error instanceof EuroleagueApiError ? error.retryAfterMs : undefined;
}

function collectOrigins(...hosts: string[]): ReadonlySet<string> {
  const origins = new Set<string>();

  for (const host of hosts) {
    const origin = originOf(host);

    if (origin !== null) {
      origins.add(origin);
    }
  }

  return origins;
}

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function toTransportError(error: unknown, url: string, aborted: boolean): EuroleagueNetworkError {
  if (aborted || (error instanceof Error && error.name === "AbortError")) {
    return new EuroleagueTimeoutError(`Euroleague API request to ${url} timed out.`, url, { cause: error });
  }

  return new EuroleagueNetworkError(`Euroleague API request to ${url} failed.`, url, { cause: error });
}

function parseJsonBody(body: string, url: string, status: number): unknown {
  try {
    return JSON.parse(body) as unknown;
  } catch (error) {
    throw new EuroleagueParseError(
      `Euroleague API returned a non-JSON response (${status}) for ${url}`,
      url,
      status,
      bodySnippet(body),
      { cause: error }
    );
  }
}

function bodySnippet(body: string): string {
  const trimmed = body.trim();

  return trimmed.length > BODY_SNIPPET_LIMIT ? `${trimmed.slice(0, BODY_SNIPPET_LIMIT)}...` : trimmed;
}

function buildUrl(input: string, query?: QueryParams): string {
  const url = new URL(input);

  for (const [key, value] of Object.entries(query ?? {})) {
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item !== undefined && item !== null) {
        url.searchParams.append(key, String(item));
      }
    }
  }

  return url.toString();
}

function ensureLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}
