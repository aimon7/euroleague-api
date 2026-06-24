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
import { EuroleagueApiError, EuroleagueValidationError } from "./errors";

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

  async getLiveFeed(feed: LiveFeed, params: { gameCode: number; season: number }): Promise<unknown> {
    return this.getUrl(
      buildUrl(`${this.hosts.live}/${feed}`, {
        gamecode: params.gameCode,
        seasoncode: seasonCode(this.competition, params.season)
      })
    );
  }

  async getUrl(url: string): Promise<unknown> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= this.retries) {
      try {
        return await this.fetchJson(url);
      } catch (error) {
        lastError = error;

        if (error instanceof EuroleagueApiError && error.status < 500) {
          throw error;
        }

        if (attempt === this.retries) {
          throw error;
        }

        attempt += 1;
      }
    }

    throw lastError;
  }

  private async fetchJson(url: string): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.#fetch(url, {
        headers: {
          accept: "application/json"
        },
        signal: controller.signal
      });

      const body = await response.text();

      if (!response.ok) {
        throw new EuroleagueApiError(
          `Euroleague API returned ${response.status} for ${url}`,
          response.status,
          url,
          body
        );
      }

      if (body.length === 0) {
        return undefined;
      }

      return JSON.parse(body) as unknown;
    } finally {
      clearTimeout(timeout);
    }
  }
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
