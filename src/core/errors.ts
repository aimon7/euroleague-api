import type { ZodIssue } from "zod";

export class EuroleagueValidationError extends Error {
  override readonly name = "EuroleagueValidationError";

  constructor(message: string) {
    super(message);
  }
}

export class EuroleagueApiError extends Error {
  override readonly name = "EuroleagueApiError";

  /**
   * Server-requested wait before retrying, in milliseconds, parsed from the
   * `Retry-After` response header (supports delta-seconds and HTTP-date).
   * `undefined` when the header is absent or malformed.
   */
  readonly retryAfterMs?: number | undefined;

  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
    readonly body: string,
    retryAfterMs?: number
  ) {
    super(message);
    this.retryAfterMs = retryAfterMs;
  }
}

export class EuroleagueSchemaError extends Error {
  override readonly name = "EuroleagueSchemaError";

  constructor(
    message: string,
    readonly endpoint: string,
    readonly issues: ZodIssue[]
  ) {
    super(message);
  }
}

export class EuroleagueParseError extends Error {
  override readonly name = "EuroleagueParseError";

  constructor(
    message: string,
    readonly url: string,
    readonly status: number,
    readonly bodySnippet: string,
    options?: ErrorOptions
  ) {
    super(message, options);
  }
}

export class EuroleagueNetworkError extends Error {
  override readonly name: string = "EuroleagueNetworkError";

  constructor(
    message: string,
    readonly url: string,
    options?: ErrorOptions
  ) {
    super(message, options);
  }
}

export class EuroleagueTimeoutError extends EuroleagueNetworkError {
  override readonly name = "EuroleagueTimeoutError";
}
