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
import { ensureInteger } from "./validation";

const BODY_SNIPPET_LIMIT = 200;

type QueryValue = boolean | number | string | null | undefined;

export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export interface HttpClientOptions extends EuroleagueClientOptions {
  competition: Competition;
}

export class HttpClient {
  readonly competition: Competition;
  readonly hosts: ApiHosts;
  readonly retries: number;
  readonly timeoutMs: number;

  readonly #fetch: typeof fetch;

  constructor(options: HttpClientOptions) {
    this.competition = options.competition;
    this.hosts = mergeHosts(options.hosts);
    this.retries = options.retries ?? 0;
    this.timeoutMs = options.timeoutMs ?? 60_000;
    this.#fetch = options.fetch ?? globalThis.fetch;

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
    let attempt = 0;

    while (true) {
      try {
        return await this.fetchJson(url);
      } catch (error) {
        if (!isRetryable(error) || attempt === this.retries) {
          throw error;
        }

        attempt += 1;
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
      throw new EuroleagueApiError(`Euroleague API returned ${response.status} for ${url}`, response.status, url, body);
    }

    if (body.length === 0) {
      return undefined;
    }

    return parseJsonBody(body, url, response.status);
  }
}

function isRetryable(error: unknown): boolean {
  if (error instanceof EuroleagueApiError) {
    return error.status >= 500;
  }

  if (error instanceof EuroleagueParseError) {
    return false;
  }

  return true;
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
