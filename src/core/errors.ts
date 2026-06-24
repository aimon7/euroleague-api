import type { ZodIssue } from "zod";

export class EuroleagueValidationError extends Error {
  override readonly name = "EuroleagueValidationError";

  constructor(message: string) {
    super(message);
  }
}

export class EuroleagueApiError extends Error {
  override readonly name = "EuroleagueApiError";

  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
    readonly body: string
  ) {
    super(message);
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
